import { serve } from "https://deno.land/std/http/server.ts";

serve(() => {
  return new Response("Deno is working ✅");
});
