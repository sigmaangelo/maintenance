import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

const PASSWORD = "1234";

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // ----------------------
  // LOGIN ENDPOINT
  // ----------------------
  if (url.pathname === "/login" && req.method === "POST") {
    const form = await req.formData();
    const pass = form.get("password");

    if (pass !== PASSWORD) {
      return new Response("Bad password", { status: 403 });
    }

    // VALID LOGIN — set cookie
    return new Response("OK", {
      status: 200,
      headers: {
        "Set-Cookie":
          "auth=1; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict;",
      },
    });
  }

  // ----------------------
  // PROTECT /games/*
  // ----------------------
  if (url.pathname.startsWith("/games")) {
    const cookies = req.headers.get("cookie") || "";
    const cookieAllowed = cookies.includes("auth=1");

    if (!cookieAllowed) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // serve files (including index.html)
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
  });
});
