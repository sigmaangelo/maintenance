import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);

    // Root → login
    if (pathname === "/") {
      return serveFile(req, "./login.html");
    }

    // Always allow login
    if (pathname === "/login.html") {
      return serveFile(req, "./login.html");
    }

    // Protect menu
    if (pathname === "/menu.html") {
      const referer = req.headers.get("referer") || "";

      if (!referer.includes("/login.html")) {
        return Response.redirect("/login.html", 302);
      }

      return serveFile(req, "./menu.html");
    }

    // Handle /games/
    if (pathname.startsWith("/games")) {
      const referer = req.headers.get("referer") || "";

      if (!referer.includes("/menu.html")) {
        return new Response("403 Forbidden", { status: 403 });
      }

      // If folder, auto add index.html
      if (pathname.endsWith("/")) {
        pathname += "index.html";
      }

      // If no extension, assume folder
      else if (!pathname.includes(".")) {
        pathname += "/index.html";
      }

      const filePath = `.${pathname}`;

      try {
        return await serveFile(req, filePath);
      } catch {
        return new Response("404 - Game not found", { status: 404 });
      }
    }

    return new Response("404 - Not Found", { status: 404 });

  } catch (err) {
    console.error("CRASH:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
