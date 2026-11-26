import { createFileRoute } from "@tanstack/react-router";
import Page from "@/features/yellowwhite";

export const Route = createFileRoute("/yellowwhite")({
  head: () => ({
    meta: [
      { title: "金刚宠 | 黄白主题看板" },
      { name: "description", content: "金刚宠洗护进度看板（黄白主题）。" },
      { property: "og:title", content: "金刚宠 | 黄白主题看板" },
      { property: "og:description", content: "金刚宠洗护进度看板（黄白主题）。" },
    ],
  }),
  component: Page,
});
