import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

const PASSWORD = "gaming123"; // Set your game password here

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname === "/" ? "/login.html" : url.pathname;

  // Allow PageCrypt login page
  if (pathname === "/login.html") {
    try {
      const file = await Deno.readFile(`.${pathname}`);
      return new Response(file, {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    } catch {
      return new Response("Login page not found", { status: 404 });
    }
  }

  // Protect game folders
  if (pathname.startsWith("/games/")) {
    const submittedPass = url.searchParams.get("pass");
    if (submittedPass !== PASSWORD) {
      return Response.redirect(new URL("/login.html", req.url));
    }

    try {
      const file = await Deno.readFile(`.${pathname}`);
      let contentType = "text/html";
      if (pathname.endsWith(".js")) contentType = "application/javascript";
      if (pathname.endsWith(".css")) contentType = "text/css";
      if (pathname.endsWith(".png")) contentType = "image/png";
      if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) contentType = "image/jpeg";

      return new Response(file, { status: 200, headers: { "content-type": contentType } });
    } catch {
      return Response.redirect(new URL("/login.html", req.url));
    }
  }

  // Redirect all other URLs to PageCrypt login
  return Response.redirect(new URL("/login.html", req.url));
});
