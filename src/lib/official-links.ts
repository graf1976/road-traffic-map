import type { LatLng, MapBounds } from "@/types/regulation";

export interface OfficialLink {
  label: string;
  url: string;
}

export interface RoadInfoRegion {
  id: string;
  /** 画面に出す地域名。 */
  name: string;
  /** その地域の道路を管理する事業者などへのリンク。 */
  links: OfficialLink[];
  bounds: MapBounds;
}

/** 全国どこでも案内できるリンク。 */
export const NATIONWIDE_LINKS: OfficialLink[] = [
  {
    label: "日本道路交通情報センター（JARTIC）",
    url: "https://www.jartic.or.jp/",
  },
  {
    label: "国土交通省 道路情報提供システム",
    url: "https://www.road-info-prvs.mlit.go.jp/",
  },
];

const NEXCO_EAST: OfficialLink = {
  label: "NEXCO東日本 交通情報",
  url: "https://www.e-nexco.co.jp/road_info/",
};
const NEXCO_CENTRAL: OfficialLink = {
  label: "NEXCO中日本 交通情報",
  url: "https://www.c-nexco.co.jp/traffic/",
};
const NEXCO_WEST: OfficialLink = {
  label: "NEXCO西日本 交通情報",
  url: "https://www.w-nexco.co.jp/road_info/",
};

/**
 * 地方ごとの案内先。範囲は都道府県のおおよその広がりで、
 * 隣り合う地方は少し重なる（重なった場所は中心が近いほうを選ぶ）。
 */
export const ROAD_INFO_REGIONS: readonly RoadInfoRegion[] = [
  {
    id: "hokkaido",
    name: "北海道",
    bounds: { north: 45.7, south: 41.3, west: 139.2, east: 146.0 },
    links: [
      {
        label: "北海道地区 道路情報",
        url: "https://info-road.hdb.hkd.mlit.go.jp/",
      },
      NEXCO_EAST,
    ],
  },
  {
    id: "tohoku",
    name: "東北",
    bounds: { north: 41.6, south: 36.7, west: 139.0, east: 142.2 },
    links: [NEXCO_EAST],
  },
  {
    id: "kanto",
    name: "関東",
    bounds: { north: 37.2, south: 34.8, west: 138.3, east: 141.0 },
    links: [
      NEXCO_EAST,
      { label: "首都高速 交通情報", url: "https://www.shutoko.jp/traffic/" },
    ],
  },
  {
    id: "hokuriku",
    name: "北陸",
    bounds: { north: 38.6, south: 36.2, west: 136.5, east: 139.8 },
    links: [NEXCO_EAST, NEXCO_CENTRAL],
  },
  {
    id: "chubu",
    name: "中部",
    bounds: { north: 37.0, south: 34.2, west: 136.0, east: 139.2 },
    links: [
      NEXCO_CENTRAL,
      {
        label: "名古屋高速道路公社",
        url: "https://www.nagoya-expressway.or.jp/",
      },
    ],
  },
  {
    id: "kinki",
    name: "近畿",
    bounds: { north: 35.8, south: 33.4, west: 134.2, east: 136.5 },
    links: [
      NEXCO_WEST,
      { label: "阪神高速道路", url: "https://www.hanshin-exp.co.jp/" },
    ],
  },
  {
    id: "chugoku",
    name: "中国",
    bounds: { north: 35.8, south: 33.7, west: 130.8, east: 134.5 },
    links: [
      NEXCO_WEST,
      { label: "本四高速", url: "https://www.jb-honshi.co.jp/" },
    ],
  },
  {
    id: "shikoku",
    name: "四国",
    bounds: { north: 34.6, south: 32.6, west: 132.0, east: 134.9 },
    links: [
      NEXCO_WEST,
      { label: "本四高速", url: "https://www.jb-honshi.co.jp/" },
    ],
  },
  {
    id: "kyushu",
    name: "九州",
    bounds: { north: 34.0, south: 30.9, west: 128.2, east: 132.2 },
    links: [NEXCO_WEST],
  },
  {
    id: "okinawa",
    name: "沖縄",
    bounds: { north: 27.9, south: 24.0, west: 122.8, east: 131.4 },
    links: [NEXCO_WEST],
  },
] as const;

function contains(bounds: MapBounds, point: LatLng): boolean {
  return (
    point.lat <= bounds.north &&
    point.lat >= bounds.south &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

/** 範囲の中心からの距離（近さの比較にだけ使うので度のままで十分）。 */
function distanceFromCenter(bounds: MapBounds, point: LatLng): number {
  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;
  return (point.lat - centerLat) ** 2 + (point.lng - centerLng) ** 2;
}

/**
 * 地図が写している位置から、案内する地方を決める。
 * どの地方にも入らない場合は null（全国共通のリンクだけを出す）。
 */
export function findRegion(point: LatLng | null): RoadInfoRegion | null {
  if (!point) return null;

  const candidates = ROAD_INFO_REGIONS.filter((region) =>
    contains(region.bounds, point),
  );
  if (candidates.length === 0) return null;

  // 地方の境目は重なっているため、中心が近いほうを採用する。
  return candidates.reduce((nearest, region) =>
    distanceFromCenter(region.bounds, point) <
    distanceFromCenter(nearest.bounds, point)
      ? region
      : nearest,
  );
}

/** 表示範囲の中心。 */
export function centerOf(bounds: MapBounds | null): LatLng | null {
  if (!bounds) return null;

  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };
}
