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
