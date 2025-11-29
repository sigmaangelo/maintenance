import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const referer = req.headers.get("referer") ?? "";

    console.log("REQ", path, "REF", referer);

    // Public root (cloak button)
    if (path === "/" || path === "/index.html") {
      return serveFile(req, "./index.html");
    }

    // home only allowed from blank cloaked page
    if (path === "/games.html") {
      if (!referer.includes("about:blank")) {
        return new Response("403 Forbidden", { status: 403 });
      }
      return serveFile(req, "./games.html");
    }

    // protect /games/*
    if (path.startsWith("/games/")) {
      if (!referer.includes("/games.html")) {
        return new Response("403 Forbidden", { status: 403 });
      }
      return serveFile(req, "." + path);
    }

    return new Response("404 Not Found", { status: 404 });

  } catch (err) {
    console.error(err);
    return new Response("500 Server Error", { status: 500 });
  }
});
