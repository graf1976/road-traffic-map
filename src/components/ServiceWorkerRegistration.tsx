"use client";

import { useEffect } from "react";

/**
 * サービスワーカーを登録する。
 *
 * ホーム画面へ追加（インストール）できるようにするために必要。
 * 開発中は Fast Refresh の邪魔になるため、本番ビルドでのみ登録する。
 */
export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.warn("[road-traffic-map] サービスワーカーの登録に失敗しました:", error);
      });
    };

    // 初回表示の速度を落とさないよう、読み込み完了後に登録する。
    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
