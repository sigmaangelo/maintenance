import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const referer = req.headers.get("referer") ?? "";

    // Public root
    if (path === "/" || path === "/index.html") {
      return serveFile(req, "./index.html");
    }

    // Only accessible if coming from index
    if (path === "/cloak.html") {
      if (!referer.includes("/index.html")) {
        return new Response("403 Forbidden", { status: 403 });
      }
      return serveFile(req, "./cloak.html");
    }

    // Only accessible after entering password (from cloak)
    if (path === "/home.html") {
      if (!referer.includes("/cloak.html")) {
        return new Response("403 Forbidden", { status: 403 });
      }
      return serveFile(req, "./home.html");
    }

    // Only accessible from home
    if (path === "/games.html") {
      if (!referer.includes("/home.html")) {
        return new Response("403 Forbidden", { status: 403 });
      }
      return serveFile(req, "./games.html");
    }

    // Games folder — only accessible from games.html
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
