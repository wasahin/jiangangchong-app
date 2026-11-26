import { createFileRoute } from "@tanstack/react-router";
import Page from "@/features/status";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "金刚宠 | 洗护进度" },
      { name: "description", content: "实时查看您爱宠的洗护进度。" },
      { property: "og:title", content: "金刚宠 | 洗护进度" },
      { property: "og:description", content: "实时查看您爱宠的洗护进度。" },
    ],
  }),
  component: Page,
});
