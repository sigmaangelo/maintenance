import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // ROOT -> login
    if (pathname === "/") {
      return serveFile(req, "./login.html");
    }

    // Allow login always
    if (pathname === "/login.html") {
      return serveFile(req, "./login.html");
    }

    // 🔐 BLOCK direct menu access
    if (pathname === "/menu.html") {
      const referer = req.headers.get("referer") ?? "";

      if (!referer.includes("/login.html")) {
        return Response.redirect("/login.html", 302);
      }

      return serveFile(req, "./menu.html");
    }

    // ✅ FOLDER SUPPORT (/games/slope/ → /games/slope/index.html)
    if (pathname.startsWith("/games/")) {
      const referer = req.headers.get("referer") ?? "";

      if (!referer.includes("/menu.html")) {
        return new Response("403 Forbidden", { status: 403 });
      }

      // If ending with / → add index.html
      if (pathname.endsWith("/")) {
        pathname += "index.html";
      }

      return serveFile(req, `.${pathname}`);
    }

    return new Response("404 - Not Found", { status: 404 });

  } catch (err) {
    console.error(err);
    return new Response("500 Server Error", { status: 500 });
  }
});
