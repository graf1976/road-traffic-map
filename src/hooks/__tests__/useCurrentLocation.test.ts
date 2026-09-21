// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCurrentLocation } from "@/hooks/useCurrentLocation";

type SuccessCallback = (position: GeolocationPosition) => void;
type ErrorCallback = (error: GeolocationPositionError) => void;

function stubGeolocation(
  implementation: (success: SuccessCallback, failure: ErrorCallback) => void,
) {
  const getCurrentPosition = vi.fn(
    (success: SuccessCallback, failure: ErrorCallback) => {
      implementation(success, failure);
    },
  );

  vi.stubGlobal("navigator", {
    ...window.navigator,
    geolocation: { getCurrentPosition },
  });

  return getCurrentPosition;
}

/** GeolocationPositionError の code 定数を持つ簡易オブジェクトを作る。 */
function makeGeolocationError(code: number): GeolocationPositionError {
  return {
    code,
    message: "",
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCurrentLocation", () => {
  it("取得に成功すると座標を保持し、onLocated を呼ぶ", () => {
    stubGeolocation((success) => {
      success({
        coords: { latitude: 35.6812, longitude: 139.7671 },
      } as GeolocationPosition);
    });

    const onLocated = vi.fn();
    const { result } = renderHook(() => useCurrentLocation({ onLocated }));

    act(() => {
      result.current.locate();
    });

    expect(result.current.position?.lat).toBe(35.6812);
    expect(result.current.position?.lng).toBe(139.7671);
    expect(result.current.isLocating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(onLocated).toHaveBeenCalledTimes(1);
  });

  it("権限が拒否された場合は案内メッセージを出す", () => {
    stubGeolocation((_success, failure) => {
      failure(makeGeolocationError(1));
    });

    const { result } = renderHook(() => useCurrentLocation());

    act(() => {
      result.current.locate();
    });

    expect(result.current.error).toContain("許可されていません");
    expect(result.current.position).toBeNull();
    expect(result.current.isLocating).toBe(false);
  });

  it("タイムアウトと位置不明でメッセージを出し分ける", () => {
    stubGeolocation((_success, failure) => {
      failure(makeGeolocationError(3));
    });
    const { result: timeoutResult } = renderHook(() => useCurrentLocation());

    act(() => {
      timeoutResult.current.locate();
    });
    expect(timeoutResult.current.error).toContain("タイムアウト");

    stubGeolocation((_success, failure) => {
      failure(makeGeolocationError(2));
    });
    const { result: unavailableResult } = renderHook(() => useCurrentLocation());

    act(() => {
      unavailableResult.current.locate();
    });
    expect(unavailableResult.current.error).toContain("特定できませんでした");
  });

  it("Geolocation 非対応のブラウザではその旨を伝える", () => {
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() => useCurrentLocation());

    act(() => {
      result.current.locate();
    });

    expect(result.current.error).toContain("対応していません");
  });

  it("clearError でメッセージを消せる", () => {
    stubGeolocation((_success, failure) => {
      failure(makeGeolocationError(1));
    });

    const { result } = renderHook(() => useCurrentLocation());

    act(() => {
      result.current.locate();
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
});
