import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PASSWORD = "1234";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const cookies = req.headers.get("cookie") || "";
  const authenticated = cookies.includes("auth=1");

  // Protect all games
  if ((path === "/games" || path.startsWith("/games/")) && !authenticated) {
    return new Response("403 Forbidden", { status: 403 });
  }

  // Handle login
  if (path === "/login" && req.method === "POST") {
    const fd = await req.formData();
    const pass = fd.get("password");

    if (pass === PASSWORD) {
      return new Response("OK", {
        headers: { "Set-Cookie": "auth=1; Path=/;" }
      });
    }
    return new Response("WRONG", { status: 401 });
  }

  // Serve files
  let filePath = path === "/" ? "./index.html" :
                 path.endsWith("/") ? `.${path}index.html` :
                 `.${path}`;

  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, {
      headers: { "content-type": getType(filePath) }
    });
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});

function getType(path: string) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  return "text/plain";
}
