import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);

  // When you visit "/"
  if (url.pathname === "/") {
    try {
      const file = await Deno.readTextFile("./test.html");
      return new Response(file, {
        headers: { "content-type": "text/html" },
      });
    } catch {
      return new Response("test.html not found", { status: 404 });
    }
  }

  return new Response("404 - Not Found", { status: 404 });
});
