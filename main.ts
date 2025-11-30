import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PASSWORD = "1234";

// ----------------------------------
// PROTECT INDEX.HTML FROM RIPPERS
// ----------------------------------
function isRipper(req: Request) {
  const referer = req.headers.get("referer") || "";
  const origin = req.headers.get("origin") || "";

  // Someone running file:// or opened directly
  if (origin === "" && !referer.includes("http")) return true;

  // Allowed legit domain
  const allowed = [
    "https://maintenance.deno.dev",
  ];

  // Not from allowed origin = rip attempt
  if (!allowed.includes(origin)) return true;

  return false;
}

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const cookies = req.headers.get("cookie") || "";
  const authenticated = cookies.includes("auth=1");

  console.log("Request:", path, "Auth:", authenticated);

  // -----------------------------------------
  // BLOCK RIPPER ACCESS TO INDEX.HTML
  // -----------------------------------------
  if (path === "/" || path === "/index.html") {
    if (isRipper(req)) {
      return new Response("403 Forbidden", { status: 403 });
    }
  }

  // -----------------------------------------
  // PROTECT /games and /games.html
  // -----------------------------------------
  if (
    path === "/games.html" ||
    path === "/games" ||
    path.startsWith("/games/")
  ) {
    if (!authenticated) {
      return new Response("403 Forbidden", { status: 403 });
    }
  }

  // -----------------------------------------
  // LOGIN SETS AUTH COOKIE
  // -----------------------------------------
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

  // -----------------------------------------
  // SERVE FILES
  // -----------------------------------------
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

// -----------------------------------------
// MIME TYPES
// -----------------------------------------
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
