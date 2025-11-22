import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const ua = req.headers.get("user-agent") || "";

  // Block folder access
  if (!path.includes(".")) {
    return new Response("404 Not Found", { status: 404 });
  }

  // If accessing games directly in browser tab — block it
  if (path.startsWith("/games")) {
    const inIframe = req.headers.get("sec-fetch-dest") === "iframe";

    // If NOT inside iframe = lock out
    if (!inIframe) {
      return Response.redirect(`${url.origin}/menu.html`, 302);
    }
  }

  try {
    const file = await Deno.readFile(`.${path}`);

    const type =
      path.endsWith(".html") ? "text/html" :
      path.endsWith(".js")   ? "application/javascript" :
      path.endsWith(".css")  ? "text/css" :
      path.endsWith(".png")  ? "image/png" :
      path.endsWith(".jpg")  ? "image/jpeg" :
      "application/octet-stream";

    return new Response(file, {
      headers: { "content-type": type },
    });

  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});
