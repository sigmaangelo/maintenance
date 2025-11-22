import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

serve((req) => {
  const url = new URL(req.url);

  // ROOT → login.html
  if (url.pathname === "/") {
    return serveFile(req, "./login.html");
  }

  // login
  if (url.pathname === "/login.html") {
    return serveFile(req, "./login.html");
  }

  // menu (BLOCK direct access)
  if (url.pathname === "/menu.html") {
    const referer = req.headers.get("referer") || "";

    if (!referer.includes("/login.html")) {
      return Response.redirect("/login.html", 302);
    }

    return serveFile(req, "./menu.html");
  }

  // games (only allowed via iframe/cloak)
  if (url.pathname.startsWith("/games/")) {
    const referer = req.headers.get("referer") || "";

    if (!referer.includes("/menu.html")) {
      return new Response("403 Forbidden", { status: 403 });
    }

    return serveFile(req, `.${url.pathname}`);
  }

  return new Response("404 - Not Found", { status: 404 });
});
