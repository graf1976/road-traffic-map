function readPublicEnv(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed;
}

/**
 * Google Maps JavaScript API のキー。
 * `NEXT_PUBLIC_` 接頭辞のため、ビルド時にクライアントへ埋め込まれる。
 */
export const GOOGLE_MAPS_API_KEY: string = readPublicEnv(
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
);

/**
 * Advanced Marker（現在地ピン）の表示に必要な Map ID。
 * 未設定の場合は Google が提供する検証用の DEMO_MAP_ID を使う。
 */
export const GOOGLE_MAPS_MAP_ID: string =
  readPublicEnv(process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID) || "DEMO_MAP_ID";

/** プレースホルダーのままの場合はキー未設定として扱う。 */
export const hasGoogleMapsApiKey: boolean =
  GOOGLE_MAPS_API_KEY.length > 0 && GOOGLE_MAPS_API_KEY !== "YOUR_API_KEY_HERE";
