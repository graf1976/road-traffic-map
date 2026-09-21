"use client";

import { useEffect } from "react";

/**
 * ページ内で予期しないエラーが発生したときの表示。
 * 「再読み込み」で再マウントを試みる。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[road-traffic-map] 画面の描画でエラーが発生しました:", error);
  }, [error]);

  return (
    <main className="flex h-dvh items-center justify-center bg-slate-100 p-6">
      <div
        role="alert"
        className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm"
      >
        <h1 className="text-base font-bold text-slate-900">
          画面の表示中にエラーが発生しました
        </h1>
        <p className="mt-2 leading-relaxed">
          一時的な問題の可能性があります。再読み込みしても解決しない場合は、
          通信環境と Google Maps API キーの設定をご確認ください。
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-slate-400">
            エラーID: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          再読み込み
        </button>
      </div>
    </main>
  );
}
