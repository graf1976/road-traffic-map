"use client";

/**
 * ルートレイアウトごと失敗した場合の最終的なフォールバック。
 * html/body を自前で描画する必要がある。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f1f5f9",
          color: "#0f172a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: "28rem",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <h1 style={{ fontSize: "1rem", margin: 0 }}>
            アプリケーションを表示できませんでした
          </h1>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
            時間をおいて再度お試しください。
            {error.digest ? `（エラーID: ${error.digest}）` : ""}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
