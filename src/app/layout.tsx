import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '金刚宠 | 宠物洗护进度看板',
  description: '专业宠物美容护理服务，实时追踪洗护进度',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="bg-neumo-light min-h-screen pb-20">
        {children}
      </body>
    </html>
  );
}
