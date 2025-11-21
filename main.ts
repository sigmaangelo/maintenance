import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// ⚠️ CHANGE TO YOUR REAL DOMAIN
const ALLOWED_HOST = "sigmaangelo-maintenance-61.deno.dev";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Only allow your domain
  const host = req.headers.get("host") || "";
  if (!host.includes(ALLOWED_HOST)) {
    return new Response("Forbidden", { status: 403 });
  }

  // Block folder access (/anything/)
  if (path.endsWith("/")) {
    return new Response("Forbidden", { status: 403 });
  }

  // Block file extensions
  if (
    path.endsWith(".html") ||
    path.endsWith(".js") ||
    path.endsWith(".css") ||
    path.endsWith(".json") ||
    path.startsWith("/.")
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  // Convert /test -> test.html
  const filePath =
    path === "/" ? "./index.html" : `./${path.slice(1)}.html`;

  try {
    const file = await Deno.readFile(filePath);

    return new Response(file, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch {
    return new Response("404 - Not Found", { status: 404 });
  }
});
