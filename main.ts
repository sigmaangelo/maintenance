import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { getCookies, setCookie } from "https://deno.land/std@0.200.0/http/cookie.ts";

const PASSWORD = "gaming123";

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname === "/" ? "/login.html" : url.pathname;

  const cookies = getCookies(req.headers);

  // If user submits password on login.html
  if (pathname === "/login.html" && req.method === "POST") {
    const formData = await req.formData();
    const pass = formData.get("pass");

    if (pass === PASSWORD) {
      // Set session cookie
      const headers = new Headers();
      setCookie(headers, {
        name: "game_session",
        value: "valid",
        httpOnly: true,
        maxAge: 3600, // 1 hour
        path: "/",
      });
      return Response.redirect(new URL("/games/slope/index.html", req.url), { headers });
    } else {
      return Response.redirect(new URL("/login.html", req.url));
    }
  }

  // Allow PageCrypt login page GET
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
    if (cookies.game_session !== "valid") {
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

  return Response.redirect(new URL("/login.html", req.url));
});
