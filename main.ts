import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const dest = req.headers.get("sec-fetch-dest");
  const referer = req.headers.get("referer");

  if (path.startsWith("/games")) {
    if (dest !== "iframe" || !referer?.includes("/menu.html")) {
      return Response.redirect(`${url.origin}/menu.html`, 302);
    }
  }

  if (!path.includes(".")) {
    return new Response("404 Not Found", { status: 404 });
  }

  try {
    const file = await Deno.readFile(`.${path}`);

    const type = path.endsWith(".html") ? "text/html"
      : path.endsWith(".js") ? "application/javascript"
      : path.endsWith(".css") ? "text/css"
      : path.endsWith(".png") ? "image/png"
      : path.endsWith(".jpg") ? "image/jpeg"
      : "application/octet-stream";

    return new Response(file, { headers: { "content-type": type } });

  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});
