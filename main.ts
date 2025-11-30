import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PASSWORD = "1234";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const cookies = req.headers.get("cookie") || "";
  const authenticated = cookies.includes("auth=1");

  // ---------------------------------------
  // PUBLIC FILES
  // ---------------------------------------
  const publicPaths = [
    "/cloak.html",
    "/login.html",
    "/login",
  ];
  if (publicPaths.includes(path) || path.startsWith("/tools/")) {
    // always public
  }

  // ---------------------------------------
  // PROTECT GAMES
  // ---------------------------------------
  if (
    path === "/games.html" ||
    path === "/games" ||
    path.startsWith("/games/")
  ) {
    if (!authenticated) {
      return new Response("403 Forbidden", { status: 403 });
    }
  }

  // ---------------------------------------
  // SPECIAL: PROTECT index.html FROM DOWNLOADS
  // ---------------------------------------
  if (path === "/" || path === "/index.html") {
    const ua = req.headers.get("user-agent") || "";
    const accept = req.headers.get("accept") || "";

    // allow REAL browsers to view normally
    const looksBrowser =
      ua.includes("Chrome") ||
      ua.includes("Firefox") ||
      ua.includes("Safari") ||
      ua.includes("Edge");

    const looksDownloader =
      accept.includes("application/octet-stream") ||
      accept.includes("text/plain") ||
      accept === "*/*";

    const paramDownload = url.searchParams.get("download") === "1";

    if (!looksBrowser || looksDownloader || paramDownload) {
      return new Response("403 Forbidden", { status: 403 });
    }
  }

  // ---------------------------------------
  // LOGIN ENDPOINT
  // ---------------------------------------
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

  // ---------------------------------------
  // FILE SERVER
  // ---------------------------------------
  let filePath = "." + (path === "/" ? "/index.html" : path);

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

// MIME types
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
