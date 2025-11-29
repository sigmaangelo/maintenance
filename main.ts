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
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PASSWORD = "1234"; // CHANGE THIS

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const cookies = req.headers.get("cookie") || "";
  const authenticated = cookies.includes("auth=1");

  console.log("Request:", path);

  // ---------------------------
  // 1️⃣ PROTECT ALL /games PATHS INCLUDING /games/ ITSELF
  // ---------------------------
  if ((path === "/games" || path.startsWith("/games/")) && !authenticated) {
    return new Response("403 - Forbidden", { status: 403 });
  }

  // ---------------------------
  // 2️⃣ HANDLE PASSWORD LOGIN
  // ---------------------------
  if (path === "/login" && req.method === "POST") {
    const form = await req.formData();
    const password = form.get("password");

    if (password === PASSWORD) {
      return new Response("OK", {
        headers: {
          "Set-Cookie": "auth=1; HttpOnly; Path=/",
        },
      });
    }

    return new Response("WRONG", { status: 401 });
  }

  // ---------------------------
  // 3️⃣ SERVE FILES
  // ---------------------------
  const filePath = path.endsWith("/") ? `.${path}index.html` : `.${path}`;

  try {
    const file = await Deno.readFile(filePath);
    const contentType = getType(filePath);

    return new Response(file, {
      headers: { "content-type": contentType },
    });
  } catch {
    return new Response("404 not found", { status: 404 });
  }
});

// ---------------------------
// 4️⃣ HELPER: content-type
// ---------------------------
function getType(path: string) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return "text/plain";
}
