import { serve } from "https://deno.land/std/http/server.ts";

const PASSWORD = "gaming123";

const allowedGames = [
  "/games/slope/index.html",
  "/games/ovo/index.html",
  "/games/bitplanes/index.html",
];

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const pass = url.searchParams.get("pass");

  // BLOCK direct access to games
  if (path.startsWith("/games/")) {
    if (pass !== PASSWORD || !allowedGames.includes(path)) {
      return Response.redirect("/login.html", 302);
    }

    try {
      const file = await Deno.readFile(`.${path}`);
      return new Response(file, {
        headers: { "content-type": "text/html" },
      });
    } catch {
      return new Response("Game not found", { status: 404 });
    }
  }

  // Serve normal files
  try {
    const file = await Deno.readFile(`.${path === "/" ? "/login.html" : path}`);
    const contentType =
      path.endsWith(".css") ? "text/css" :
      path.endsWith(".js")  ? "application/javascript" :
      "text/html";

    return new Response(file, {
      headers: { "content-type": contentType },
    });
  } catch {
    return Response.redirect("/login.html", 302);
  }
});
