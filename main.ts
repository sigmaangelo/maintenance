import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

const PASSWORD = "1234"; // change this to your password
const COOKIE_NAME = "auth";
const COOKIE_VALUE = "1";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    let path = url.pathname;

    // Public root and index
    if (path === "/" || path === "/index.html") {
      return serveFile(req, "./index.html");
    }

    // LOGIN endpoint (POST). sets cookie on valid password.
    if (path === "/login" && req.method === "POST") {
      const form = await req.formData();
      const pw = String(form.get("password") ?? "");
      if (pw === PASSWORD) {
        return new Response("OK", {
          status: 200,
          headers: {
            // set cookie for entire site
            "Set-Cookie": `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Max-Age=86400; HttpOnly`,
          },
        });
      } else {
        return new Response("Forbidden", { status: 401 });
      }
    }

    // Check cookie helper
    const cookiesHeader = req.headers.get("cookie") ?? "";
    const isAuthed = cookiesHeader.split(";").map(s => s.trim()).some(s => s === `${COOKIE_NAME}=${COOKIE_VALUE}`);

    // Protect /games.html and /games/*
    if (path === "/games.html" || path.startsWith("/games/")) {
      if (!isAuthed) {
        return new Response("403 Forbidden", { status: 403 });
      }
    }

    // Serve games.html only if reachable (but already protected above)
    if (path === "/games.html") {
      return serveFile(req, "./games.html");
    }

    // Serve files inside /games/ (auto folders)
    if (path.startsWith("/games/")) {
      // auto-resolve folders to index.html: /games/slope/ => ./games/slope/index.html
      if (path.endsWith("/")) path = path + "index.html";
      // path like /games/slope -> treat as folder
      else if (!path.includes(".")) path = path + "/index.html";

      const filePath = "." + path;
      try {
        return await serveFile(req, filePath);
      } catch {
        return new Response("404 Not Found", { status: 404 });
      }
    }

    // Anything else: try to serve static file if exists
    try {
      return await serveFile(req, `.${path}`);
    } catch {
      return new Response("404 Not Found", { status: 404 });
    }

  } catch (err) {
    console.error("Server error:", err);
    return new Response("500 Server Error", { status: 500 });
  }
});
