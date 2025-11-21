import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

const PASSWORD = "your-secret-password";

serve(async (req) => {
  const url = new URL(req.url);

  // Allow login page
  if (url.pathname === "/login.html" || url.pathname === "/") {
    return fetch(req);
  }

  // Check password
  const submittedPass = url.searchParams.get("pass");
  if (submittedPass !== PASSWORD) {
    return Response.redirect(new URL("/login.html", req.url));
  }

  // Serve game file
  try {
    return await fetch(new URL("." + url.pathname, import.meta.url));
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
});
