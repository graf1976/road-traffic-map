"use client";

import { useEffect, useRef, useState } from "react";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import {
  INSTALL_GUIDES,
  detectInstallEnvironment,
  type InstallGuide,
} from "@/lib/install-guide";

/** 手順の説明（ブラウザ標準の画面を出せないときに使う）。 */
function InstallGuideDialog({
  guide,
  onClose,
}: {
  guide: InstallGuide;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        className="w-full max-w-md rounded-xl bg-white p-5 text-slate-800 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="install-guide-title" className="text-base font-bold text-slate-900">
          {guide.title}
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

/**
 * 「ホーム画面に追加」ボタン。
 *
 * - Chrome がインストールを許可していれば、標準のインストール画面をその場で出す
 * - 出せない環境（アプリ内ブラウザ・iPhone など）では、その環境での手順を案内する
 * - すでにホーム画面から起動しているときは表示しない
 */
export function InstallButton() {
  const { canPrompt, isInstalled, install } = useInstallPrompt();
  const [guide, setGuide] = useState<InstallGuide | null>(null);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (canPrompt) {
      const outcome = await install();
      if (outcome !== "unavailable") return;
    }

    setGuide(INSTALL_GUIDES[detectInstallEnvironment(navigator.userAgent)]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v6m-3-3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        ホーム画面に追加
      </button>

      {guide && <InstallGuideDialog guide={guide} onClose={() => setGuide(null)} />}
    </>
  );
}
