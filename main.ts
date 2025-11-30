import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// ===============================
// CONFIG
// ===============================
const PASSWORD = "1234"; // change this

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Read cookie
  const cookieHeader = req.headers.get("cookie") || "";
  const authenticated = cookieHeader.includes("auth=1");

  console.log("REQUEST:", path, "| AUTH:", authenticated);

  // ===============================
  // LOGIN HANDLER
  // ===============================
  if (path === "/login" && req.method === "POST") {
    const form = await req.formData();
    const input = form.get("password");

    if (input === PASSWORD) {
      return new Response("OK", {
        headers: {
          "Set-Cookie": "auth=1; Path=/; HttpOnly; SameSite=Lax",
        },
      });
    }

    return new Response("WRONG", { status: 401 });
  }

  // ===============================
  // PROTECTION RULES ONLY
  // (No hotlink / no origin restrictions)
  // ===============================

  // Protect index.html
  if (path === "/" || path === "/index.html") {
    if (!authenticated) return new Response("403 Forbidden", { status: 403 });
  }

  // Protect games and /games/
  if (
    path === "/games.html" ||
    path === "/games" ||
    path.startsWith("/games/")
  ) {
    if (!authenticated) return new Response("403 Forbidden", { status: 403 });
  }

  // Protect /tools/
  if (path.startsWith("/tools/")) {
    if (!authenticated) return new Response("403 Forbidden", { status: 403 });
  }

  // ===============================
  // FILE SERVER
  // ===============================
  let filePath = "." + (path === "/" ? "/index.html" : path);

  if (filePath.endsWith("/")) filePath += "index.html";

  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, {
      headers: { "content-type": getType(filePath) },
    });
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});

// ===============================
// MIME TYPES
// ===============================
function getType(path: string): string {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".wasm")) return "application/wasm";
  return "text/plain";
}
