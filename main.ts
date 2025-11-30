import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PASSWORD = "1234";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Check secure cookie
  const authorized = req.headers.get("cookie")?.includes("auth=true");

  // Protected pages
  if (path === "/games.html" || path.startsWith("/games/")) {
    if (!authorized) {
      return new Response("403 Forbidden", { status: 403 });
    }
  }

  // Login endpoint
  if (path === "/login" && req.method === "POST") {
    const body = await req.json();
    if (body.password === PASSWORD) {
      return new Response("OK", {
        status: 200,
        headers: {
          "Set-Cookie": "auth=true; Path=/; HttpOnly; SameSite=Strict"
        }
      });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Serve static files
  try {
    const filePath = path === "/" ? "/index.html" : path;
    const data = await Deno.readFile("." + filePath);
    return new Response(data);
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});
