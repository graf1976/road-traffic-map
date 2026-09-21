/** 規制情報の種別（国土交通省オープンデータの区分を想定した簡易版）。 */
export type RegulationStatus =
  | "closed"
  | "construction"
  | "lane_closed"
  | "chain_required";

/** 画面に表示する順序。フィルタや一覧の並びに使う。 */
export const REGULATION_STATUSES: readonly RegulationStatus[] = [
  "closed",
  "construction",
  "lane_closed",
  "chain_required",
] as const;

/** 地図上の凡例やポップアップに表示する日本語ラベル。 */
export const REGULATION_STATUS_LABEL: Record<RegulationStatus, string> = {
  closed: "通行止め",
  construction: "工事中",
  lane_closed: "車線規制",
  chain_required: "チェーン規制",
};

/** データの取得元。UI で「モック表示中」などを案内するために使う。 */
export type RegulationSourceKind = "mock" | "live" | "fallback";

/** GeoJSON の座標は [経度, 緯度] の順。 */
export type Position = [longitude: number, latitude: number];

export interface LineStringGeometry {
  type: "LineString";
  coordinates: Position[];
}

export interface RegulationProperties {
  /** 規制を一意に識別するID。 */
  id: string;
  /** 道路名（例: 東名高速道路）。 */
  roadName: string;
  /** 規制区間（例: 東京IC〜海老名JCT）。 */
  section: string;
  status: RegulationStatus;
  /** 規制内容の詳細説明。InfoWindow に表示する。 */
  description: string;
  /** 詳細ページへのリンク。 */
  link: string;
  /** 情報の更新日時（ISO 8601）。 */
  updatedAt: string;
}

export interface RegulationFeature {
  type: "Feature";
  geometry: LineStringGeometry;
  properties: RegulationProperties;
}

export interface RegulationCollection {
  type: "FeatureCollection";
  /** レスポンス生成時刻（ISO 8601）。自動更新の確認に使用する。 */
  generatedAt: string;
  /** データの取得元。 */
  source: RegulationSourceKind;
  features: RegulationFeature[];
}

/** 緯度経度のリテラル（google.maps.LatLngLiteral と互換）。 */
export interface LatLng {
  lat: number;
  lng: number;
}

/** InfoWindow の表示対象。クリックで開いた場合は pinned=true。 */
export interface RegulationSelection {
  featureId: string;
  position: LatLng;
  pinned: boolean;
}
