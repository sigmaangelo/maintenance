import { serve } from "https://deno.land/std/http/server.ts";

const PASSWORD = "1234";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const cookies = req.headers.get("cookie") || "";
  const authenticated = cookies.includes("auth=1");

  console.log("Request:", path);

  // Protect games
  if (path.startsWith("/games") && !authenticated) {
    return new Response("403 Forbidden", { status: 403 });
  }

  // Login (POST)
  if (path === "/login" && req.method === "POST") {
    const form = await req.formData();
    const pwd = form.get("password");
    if (pwd === PASSWORD) {
      return new Response("OK", {
        headers: {
          "Set-Cookie": "auth=1; HttpOnly; Path=/"
        }
      });
    }
    return new Response("WRONG", { status: 401 });
  }

  // Serve files
  const filePath = path.endsWith("/") ? `.${path}index.html` : `.${path}`;
  try {
    const data = await Deno.readFile(filePath);
    const type = getType(filePath);
    return new Response(data, { headers: { "content-type": type } });
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});

function getType(path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  return "text/plain";
}
