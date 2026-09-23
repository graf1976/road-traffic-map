import type { MetadataRoute } from "next";

/**
 * Web アプリマニフェスト。
 * これがあると Android の Chrome で「ホーム画面に追加」「アプリをインストール」
 * が選べるようになり、ホーム画面のアイコンから単独のアプリのように起動できる。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "全国道路状況マップ",
    short_name: "道路状況マップ",
    description:
      "全国主要道路の渋滞状況と通行止め・規制情報を一つの地図でまとめて確認できるアプリです。",
    lang: "ja",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#0f172a",
    categories: ["navigation", "travel", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
