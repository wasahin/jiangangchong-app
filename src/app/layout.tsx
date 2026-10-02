import type { Metadata } from 'next';
import './globals.css';
import { DarkModeToggle } from '@/components/DarkModeToggle';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Noto+Serif+SC:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-neumo-light min-h-screen pb-20">
        <DarkModeToggle />

        {children}
      </body>
    </html>
  );
}