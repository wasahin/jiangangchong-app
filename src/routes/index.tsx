import { createFileRoute } from "@tanstack/react-router";
import CustomerPage from "@/features/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "金刚宠 | 宠物洗护预约与寄养" },
      { name: "description", content: "金刚宠专业宠物洗护、美容与寄养，在线预约并实时查看房态。" },
      { property: "og:title", content: "金刚宠 | 宠物洗护预约与寄养" },
      { property: "og:description", content: "金刚宠专业宠物洗护、美容与寄养，在线预约并实时查看房态。" },
    ],
  }),
  component: CustomerPage,
});
