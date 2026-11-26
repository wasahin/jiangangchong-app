import { createFileRoute } from "@tanstack/react-router";
import Page from "@/features/staff";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "金刚宠 | 员工后台" },
      { name: "description", content: "金刚宠店员管理预约、更新洗护进度与安排房间。" },
      { property: "og:title", content: "金刚宠 | 员工后台" },
      { property: "og:description", content: "金刚宠店员管理预约、更新洗护进度与安排房间。" },
    ],
  }),
  component: Page,
});
