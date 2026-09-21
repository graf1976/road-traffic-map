"use client";

import { useEffect, useState } from "react";

/**
 * 次回の自動更新までの残り秒数を 1 秒ごとに計算する。
 *
 * @param intervalMs 自動更新間隔（ミリ秒）。0 の場合はカウントダウンしない。
 * @param lastUpdatedAt 直近の更新時刻。
 * @returns 残り秒数。自動更新が無効な場合は null。
 */
export function useCountdown(
  intervalMs: number,
  lastUpdatedAt: Date | null,
): number | null {
  const [now, setNow] = useState<number>(() => Date.now());
  const isEnabled = intervalMs > 0 && lastUpdatedAt !== null;

  useEffect(() => {
    if (!isEnabled) return;

    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [isEnabled, intervalMs, lastUpdatedAt]);

  if (!isEnabled || !lastUpdatedAt) return null;

  const elapsed = now - lastUpdatedAt.getTime();
  const remaining = Math.ceil((intervalMs - elapsed) / 1000);

  // 1 秒周期のため、更新直後に上限を超えた値にならないよう丸める。
  return Math.min(Math.ceil(intervalMs / 1000), Math.max(0, remaining));
}
