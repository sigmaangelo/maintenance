import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

serve((req) => {
  const url = new URL(req.url);

  // ROOT -> login.html
  if (url.pathname === "/") {
    return serveFile(req, "./login.html");
  }

  // login
  if (url.pathname === "/login.html") {
    return serveFile(req, "./login.html");
  }

  // menu
  if (url.pathname === "/menu.html") {
    return serveFile(req, "./menu.html");
  }

  // serve any game files
  if (url.pathname.startsWith("/games/")) {
    return serveFile(req, `.${url.pathname}`);
  }

  return new Response("404 - Not Found", { status: 404 });
});
