import { createFileRoute } from "@tanstack/react-router";

const ctx = (request: Request) => ({ request, env: process.env as Record<string, string | undefined> });

export const Route = createFileRoute("/api/public/rooms")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const m: Record<string, any> = await import("@/server/legacy/rooms");
        return m.onRequestGet ? m.onRequestGet(ctx(request)) : new Response("Method Not Allowed", { status: 405 });
      },
      POST: async ({ request }) => {
        const m: Record<string, any> = await import("@/server/legacy/rooms");
        return m.onRequestPost ? m.onRequestPost(ctx(request)) : new Response("Method Not Allowed", { status: 405 });
      },
      PUT: async ({ request }) => {
        const m: Record<string, any> = await import("@/server/legacy/rooms");
        return m.onRequestPut ? m.onRequestPut(ctx(request)) : new Response("Method Not Allowed", { status: 405 });
      },
    },
  },
});
