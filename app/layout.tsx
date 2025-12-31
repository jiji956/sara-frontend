import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- PWA 核心配置 (身份植入) ---
export const metadata: Metadata = {
  title: "SARA_OS",
  description: "Elite AI Governance System",
  manifest: "/manifest.json", // 指向刚才创建的档案
  icons: {
    apple: "/icon-512.png", // 苹果设备的图标
  },
};

// --- 视觉锁定 (禁止缩放，全屏黑色) ---
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
