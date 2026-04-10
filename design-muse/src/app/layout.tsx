import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DesignMuse - AI设计灵感工具",
  description: "帮助设计师快速找到创新的设计方向和灵感",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
