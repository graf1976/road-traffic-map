// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountdown } from "@/hooks/useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("自動更新が無効なときは null を返す", () => {
    const { result } = renderHook(() => useCountdown(0, new Date()));

    expect(result.current).toBeNull();
  });

  it("更新時刻が無いときは null を返す", () => {
    const { result } = renderHook(() => useCountdown(60_000, null));

    expect(result.current).toBeNull();
  });

  it("1 秒ごとに残り秒数が減る", () => {
    const lastUpdatedAt = new Date();
    const { result } = renderHook(() => useCountdown(60_000, lastUpdatedAt));

    expect(result.current).toBe(60);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current).toBe(57);
  });

  it("間隔を過ぎても負の値にはならない", () => {
    const lastUpdatedAt = new Date();
    const { result } = renderHook(() => useCountdown(60_000, lastUpdatedAt));

    act(() => {
      vi.advanceTimersByTime(90_000);
    });

    expect(result.current).toBe(0);
  });

  it("アンマウント時にタイマーを解除する", () => {
    const clearSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = renderHook(() => useCountdown(60_000, new Date()));

    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});
