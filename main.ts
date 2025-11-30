// ===========================
// 🔒 ANTI-RIPPER PROTECTION
// ===========================
(function () {
    if (location.protocol === "file:") {
        document.body.innerHTML = "";
        alert("This site cannot be run locally.");
        return;
    }

    const allowed = ["yourdomain.com", "www.yourdomain.com"];

    if (!allowed.includes(location.hostname)) {
        document.body.innerHTML = "";
        console.clear();
        alert("Unauthorized copy detected.");
        return;
    }

    document.addEventListener("contextmenu", e => e.preventDefault());

    document.addEventListener("keydown", e => {
        if (
            e.key === "F12" ||
            (e.ctrlKey && e.key.toLowerCase() === "u") ||
            (e.ctrlKey && e.key.toLowerCase() === "s") ||
            (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")
        ) {
            e.preventDefault();
        }
    });
})();

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// ----------------------------
// CONFIG
// ----------------------------
const PASSWORD = "1234"; // change this

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Read cookie
  const cookies = req.headers.get("cookie") || "";
  const authenticated = cookies.includes("auth=1");

  console.log("Request:", path, "Auth:", authenticated);

  // -------------------------------------
  // PROTECT ALL GAME PATHS & games.html
  // -------------------------------------
  if (
    path === "/games.html" ||
    path === "/games" ||
    path.startsWith("/games/")
  ) {
    if (!authenticated) {
      return new Response("403 Forbidden", { status: 403 });
    }
  }

  // -------------------------------------
  // LOGIN ENDPOINT (sets auth cookie)
  // -------------------------------------
  if (path === "/login" && req.method === "POST") {
    const form = await req.formData();
    const input = form.get("password");

    if (input === PASSWORD) {
      return new Response("OK", {
        headers: {
          "Set-Cookie": "auth=1; Path=/; HttpOnly",
        },
      });
    }

    return new Response("WRONG", { status: 401 });
  }

  // -------------------------------------
  // SERVE FILES
  // -------------------------------------
  let filePath = "." + (path === "/" ? "/index.html" : path);

  // If ends with "/", serve index.html inside that folder
  if (filePath.endsWith("/")) {
    filePath += "index.html";
  }

  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, {
      headers: {
        "content-type": getType(filePath),
      },
    });
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});

// -------------------------------------
// MIME TYPES
// -------------------------------------
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
