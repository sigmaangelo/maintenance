import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

const ALLOWED_HOST = "https://sigmaangelo-maintenance-61.deno.dev/"; // change if needed
const SECRET = "12345"; // your secret token/password

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // ---- 1. BLOCK hotlinking / external access ----
  const referer = req.headers.get("referer") || "";
  const origin = req.headers.get("origin") || "";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  let path = `.${url.pathname}`;

  if (path === "./") {
    path = "./.hidden.html";
  }

  try {
    return await serveFile(req, path);
  } catch {
    return new Response("404 - File Not Found", { status: 404 });
  }
});

  if (
    !referer.includes(ALLOWED_HOST) &&
    !origin.includes(ALLOWED_HOST) &&
    !url.searchParams.has("token")
  ) {
    return new Response("403 Forbidden", { status: 403 });
  }

  // ---- 2. Token protection ----
  const token = url.searchParams.get("token");
  if (token !== SECRET) {
    return new Response("Access denied", { status: 403 });
  }

  // ---- 3. Serve the files ----
  const response = await serveDir(req, {
    fsRoot: ".",
    showDirListing: false,
    enableCors: false,
  });

  // ---- 4. Anti-iframe + Security headers ----
  const headers = new Headers(response.headers);
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set(
    "Content-Security-Policy",
    `frame-ancestors 'self' https://${ALLOWED_HOST}`
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "same-origin");

  return new Response(response.body, {
    headers,
    status: response.status,
  });
});
