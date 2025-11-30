import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PASSWORD = "1234";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const cookies = req.headers.get("cookie") || "";
  const authenticated = cookies.includes("auth=1");

  console.log("Request:", path);

  // 🔒 BLOCK games.html unless logged in
  if (path === "/games.html" && !authenticated) {
    return new Response("403 Forbidden", { status: 403 });
  }

  // 🔒 BLOCK all /games/ folders unless logged in
  if (path.startsWith("/games/") && !authenticated) {
    return new Response("403 Forbidden", { status: 403 });
  }

  // 🔐 LOGIN ENDPOINT
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

  // 📄 SERVE FILES
  const filePath = path.endsWith("/") ? `.${path}index.html` : `.${path}`;

  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, {
      headers: { "content-type": getType(filePath) },
    });
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});

// MIME helper
function getType(path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg")) return "image/jpeg";
  return "text/plain";
}
