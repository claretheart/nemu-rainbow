// Cloudflare Pages(*.pages.dev)は、動画や音声の「部分読み込み(Range)」に応えない。
// iPhone/Safari は部分読み込みに応えないサーバーの動画を再生しないので、メディアだけここで応える。
// 対象は /hero /bgm /voice の下だけ(各フォルダの [[path]].js から呼ぶ)。ファイルは最大でも数MB。
export async function serveWithRange({ request, env }) {
  if (request.method !== "GET" && request.method !== "HEAD") return env.ASSETS.fetch(request);

  const range = request.headers.get("Range");
  const headers = new Headers(request.headers);
  headers.delete("Range");
  const res = await env.ASSETS.fetch(new Request(request.url, { method: "GET", headers }));
  if (res.status !== 200) return res;

  const out = new Headers(res.headers);
  out.set("Accept-Ranges", "bytes");
  if (request.method === "HEAD") return new Response(null, { status: 200, headers: out });
  if (!range) return new Response(res.body, { status: 200, headers: out });

  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start, end;
  if (m && (m[1] !== "" || m[2] !== "")) {
    if (m[1] === "") {
      // 末尾から n バイト
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
  }
  if (start === undefined || start > end || start >= size) {
    out.set("Content-Range", `bytes */${size}`);
    out.delete("Content-Length");
    return new Response(null, { status: 416, headers: out });
  }

  out.set("Content-Range", `bytes ${start}-${end}/${size}`);
  out.set("Content-Length", String(end - start + 1));
  out.delete("Content-Encoding");
  return new Response(buf.slice(start, end + 1), { status: 206, headers: out });
}
