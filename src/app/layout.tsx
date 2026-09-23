import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

import "./globals.css";

export const metadata: Metadata = {
  title: "全国道路状況マップ",
  description:
    "全国主要道路の渋滞状況と通行止め・規制情報を一つの地図でまとめて確認できるアプリです。",
  applicationName: "全国道路状況マップ",
  appleWebApp: {
    capable: true,
    title: "道路状況マップ",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="h-full">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
