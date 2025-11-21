import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

Deno.serve((req) =>
  serveDir(req, {
    fsRoot: ".",
    showDirListing: true, // Optional: shows folder list if no index.html
    enableCors: true,     // Helps when you embed with iframe
  })
);
