"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/** Chrome がインストール可能と判断したときに送ってくるイベント。 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STANDALONE_QUERY = "(display-mode: standalone)";

function subscribeStandalone(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};

  const query = window.matchMedia(STANDALONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** ホーム画面のアイコンから起動しているか。 */
function isRunningStandalone(): boolean {
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const displayStandalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia(STANDALONE_QUERY).matches;

  return iosStandalone || displayStandalone;
}

export interface UseInstallPromptResult {
  /** ブラウザ標準のインストール画面をこちらから出せるか。 */
  canPrompt: boolean;
  /** すでにホーム画面から起動している、または追加し終えたか。 */
  isInstalled: boolean;
  /** インストール画面を出す。出せなければ "unavailable"。 */
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

/**
 * ホーム画面への追加（PWA のインストール）を扱う。
 *
 * Chrome はインストールできるページで beforeinstallprompt を送ってくるので、
 * それを取っておき、ボタンを押したときに標準のインストール画面を出す。
 * メニューから項目を探してもらう必要がなくなる。
 */
export function useInstallPrompt(): UseInstallPromptResult {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installedNow, setInstalledNow] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    isRunningStandalone,
    () => false,
  );

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      // 既定のミニバーを出さず、こちらのボタンから出す。
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalledNow(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return "unavailable" as const;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    // 一度使ったイベントは再利用できない。
    setPromptEvent(null);
    if (outcome === "accepted") setInstalledNow(true);
    return outcome;
  }, [promptEvent]);

  return {
    canPrompt: promptEvent !== null,
    isInstalled: installedNow || isStandalone,
    install,
  };
}
