import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

serve((req) => {
  try {
    const url = new URL(req.url);

    // ROOT -> login
    if (url.pathname === "/") {
      return serveFile(req, "./login.html");
    }

    // login allowed always
    if (url.pathname === "/login.html") {
      return serveFile(req, "./login.html");
    }

    // BLOCK direct menu access
    if (url.pathname === "/menu.html") {
      const referer = req.headers.get("referer") ?? "";

      if (!referer.includes("/login.html")) {
        return Response.redirect("/login.html", 302);
      }

      return serveFile(req, "./menu.html");
    }

    // BLOCK direct games access
    if (url.pathname.startsWith("/games/")) {
      const referer = req.headers.get("referer") ?? "";

      if (!referer.includes("/menu.html")) {
        return new Response("403 Forbidden", { status: 403 });
      }

      return serveFile(req, `.${url.pathname}`);
    }

    return new Response("404 - Not Found", { status: 404 });

  } catch (err) {
    // This prevents "initial server error"
    console.error(err);
    return new Response("500 Server Error", { status: 500 });
  }
});
