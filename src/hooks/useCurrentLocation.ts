"use client";

import { useCallback, useState } from "react";

export interface LocatedPoint {
  lat: number;
  lng: number;
  /** 取得した時刻（ミリ秒）。同じ座標でも再度地図を中心に戻せるようにする。 */
  requestedAt: number;
}

export interface UseCurrentLocationOptions {
  /** 現在地を取得できたときに呼ばれる。地図の中心移動などに使う。 */
  onLocated?: (point: LocatedPoint) => void;
}

export interface UseCurrentLocationResult {
  position: LocatedPoint | null;
  isLocating: boolean;
  error: string | null;
  locate: () => void;
  clearError: () => void;
}

function toMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "位置情報の利用が許可されていません。ブラウザの設定をご確認ください。";
    case error.POSITION_UNAVAILABLE:
      return "現在地を特定できませんでした。電波状況の良い場所で再度お試しください。";
    case error.TIMEOUT:
      return "現在地の取得がタイムアウトしました。もう一度お試しください。";
    default:
      return "現在地の取得に失敗しました。";
  }
}

/** ブラウザの Geolocation API で現在地を取得する。 */
export function useCurrentLocation({
  onLocated,
}: UseCurrentLocationOptions = {}): UseCurrentLocationResult {
  const [position, setPosition] = useState<LocatedPoint | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("このブラウザは位置情報の取得に対応していません。");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const point: LocatedPoint = {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
          requestedAt: Date.now(),
        };

        setPosition(point);
        setIsLocating(false);
        onLocated?.(point);
      },
      (geolocationError) => {
        setError(toMessage(geolocationError));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }, [onLocated]);

  const clearError = useCallback(() => setError(null), []);

  return { position, isLocating, error, locate, clearError };
}
