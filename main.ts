Deno.serve(async (req) => {
  const url = new URL(req.url)

  // When someone visits your site root "/"
  if (url.pathname === "/") {
    try {
      const file = await Deno.readTextFile(".test.html")

      return new Response(file, {
        headers: { "content-type": "text/html" },
      })
    } catch {
      return new Response("File not found", { status: 404 })
    }
  }

  // Everything else is blocked
  return new Response("Forbidden", { status: 403 })
})
