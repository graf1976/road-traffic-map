/**
 * モック規制データの線形（GeoJSON LineString）を実際の道路に沿って生成する。
 *
 *   node scripts/generate-mock-geometry.mjs
 *
 * OSRM（OpenStreetMap ベースの経路探索）で 2 地点間の経路を取得し、
 * 目的の道路名に一致する区間だけを抜き出して src/lib/mock-regulations.ts を書き出す。
 * 手書きの座標だと地図上の道路からずれてしまうため、生成で担保する。
 *
 * 実行は任意（生成結果はリポジトリにコミット済み）。データを変えたいときだけ使う。
 */
import { writeFile } from "node:fs/promises";

const OSRM = "https://router.project-osrm.org/route/v1/driving";

/** 1 区間あたりの最大座標数。多すぎると描画が重くなる。 */
const MAX_POINTS = 90;

/**
 * 生成したい規制情報。start/end は道路の近くの地点、road は OSM 上の道路名。
 * 経路のうち road に一致する区間だけを線として採用する。
 */
const SPECS = [
  {
    id: "reg-tomei-tokyo-ebina",
    road: "東名高速道路",
    roadName: "東名高速道路（下り）",
    section: "東京IC〜海老名JCT",
    status: "lane_closed",
    description:
      "集中工事にともない、東京ICから海老名JCTまでの区間で終日車線規制を実施しています。所要時間が通常より30分程度長くなる見込みです。",
    link: "https://www.c-nexco.co.jp/traffic/",
    updatedAt: "2026-09-23T06:00:00+09:00",
    start: [139.6297, 35.6206],
    end: [139.3902, 35.4527],
  },
  {
    id: "reg-chuo-hachioji-otsuki",
    road: "中央自動車道",
    roadName: "中央自動車道（上り）",
    section: "八王子JCT〜大月IC",
    status: "construction",
    description:
      "舗装補修工事のため、夜間（21時〜翌5時）に八王子JCTから大月ICまでの区間を対面通行に切り替えています。日中は通常どおり通行できます。",
    link: "https://www.c-nexco.co.jp/road_info/",
    updatedAt: "2026-09-23T05:45:00+09:00",
    start: [139.3352, 35.6558],
    end: [138.9403, 35.6062],
  },
  {
    id: "reg-kanetsu-nerima-higashimatsuyama",
    road: "関越自動車道",
    roadName: "関越自動車道（下り）",
    section: "練馬IC〜東松山IC",
    status: "closed",
    description:
      "多重事故の処理のため、練馬ICから東松山ICまでの区間で通行止めを実施しています。解除見込みは未定です。国道254号へ迂回してください。",
    link: "https://www.e-nexco.co.jp/road_info/",
    updatedAt: "2026-09-23T07:20:00+09:00",
    start: [139.6185, 35.7555],
    end: [139.4155, 36.0165],
  },
  {
    id: "reg-route1-yokohama",
    road: "横浜新道",
    roadName: "国道1号（横浜新道）",
    section: "常盤台〜戸塚料金所",
    status: "closed",
    description:
      "路面陥没の発生により、常盤台から戸塚料金所までの上下線で通行止めを実施しています。復旧作業は本日夕方まで続く見込みです。",
    link: "https://www.ktr.mlit.go.jp/kisha/",
    updatedAt: "2026-09-23T08:05:00+09:00",
    start: [139.6175, 35.4658],
    end: [139.5343, 35.3952],
  },
  {
    id: "reg-higashimeihan",
    road: "東名阪自動車道",
    roadName: "東名阪自動車道（上り）",
    section: "名古屋西JCT〜亀山IC",
    status: "lane_closed",
    description:
      "事故処理のため、名古屋西JCTから亀山ICまでの区間で片側1車線を規制しています。約4kmの渋滞が発生しています。",
    link: "https://www.c-nexco.co.jp/traffic/",
    updatedAt: "2026-09-23T07:50:00+09:00",
    start: [136.8347, 35.1899],
    end: [136.4517, 34.8617],
  },
  {
    id: "reg-meishin-kyoto-ritto",
    road: "名神高速道路",
    roadName: "名神高速道路（上り）",
    section: "京都南IC〜栗東IC",
    status: "construction",
    description:
      "橋梁点検作業のため、京都南ICから栗東ICまでの区間で車線規制を実施しています。9月25日までの予定です。",
    link: "https://www.c-nexco.co.jp/road_info/",
    updatedAt: "2026-09-23T04:30:00+09:00",
    start: [135.7405, 34.9457],
    end: [136.0027, 35.0062],
  },
  {
    id: "reg-tohoku-sendai",
    road: "東北自動車道",
    roadName: "東北自動車道（下り）",
    section: "仙台宮城IC〜古川IC",
    status: "chain_required",
    description:
      "降雪の影響により、仙台宮城ICから古川ICまでの区間でチェーン規制を実施しています。冬用タイヤの装着をお願いします。",
    link: "https://www.e-nexco.co.jp/road_info/",
    updatedAt: "2026-09-23T03:10:00+09:00",
    start: [140.8175, 38.2695],
    end: [140.9008, 38.5793],
  },
  {
    id: "reg-kyushu-fukuoka-tosu",
    road: "九州自動車道",
    roadName: "九州自動車道（上り）",
    section: "福岡IC〜鳥栖JCT",
    status: "lane_closed",
    description:
      "路面補修のため、福岡ICから鳥栖JCTまでの区間で車線規制を行っています。通行止めではありませんが速度規制にご注意ください。",
    link: "https://www.w-nexco.co.jp/road_info/",
    updatedAt: "2026-09-23T06:40:00+09:00",
    start: [130.4744, 33.6086],
    end: [130.5286, 33.4046],
  },
];

async function fetchRoute(spec) {
  const coords = `${spec.start.join(",")};${spec.end.join(",")}`;
  const url = `${OSRM}/${coords}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url, { headers: { "User-Agent": "road-traffic-map/1.0" } });

  if (!response.ok) throw new Error(`OSRM ${response.status} (${spec.id})`);

  const payload = await response.json();
  if (payload.code !== "Ok") throw new Error(`OSRM ${payload.code} (${spec.id})`);

  return payload.routes[0];
}

/** 目的の道路名に一致するステップの座標だけをつなげる。 */
function extractRoadGeometry(route, roadPattern) {
  const coordinates = [];
  let matchedDistance = 0;

  for (const leg of route.legs) {
    for (const step of leg.steps) {
      if (!step.name || !step.name.includes(roadPattern)) continue;

      matchedDistance += step.distance;
      for (const position of step.geometry.coordinates) {
        const last = coordinates.at(-1);
        if (!last || last[0] !== position[0] || last[1] !== position[1]) {
          coordinates.push(position);
        }
      }
    }
  }

  return { coordinates, matchedDistance };
}

/** 形状を保ったまま点数を間引く。 */
function thin(coordinates, max) {
  if (coordinates.length <= max) return coordinates;

  const step = (coordinates.length - 1) / (max - 1);
  const result = [];
  for (let i = 0; i < max; i += 1) {
    result.push(coordinates[Math.round(i * step)]);
  }
  return result;
}

const round = (position) => [
  Number(position[0].toFixed(5)),
  Number(position[1].toFixed(5)),
];

function renderFile(features) {
  const body = features
    .map(
      (feature) => `  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
${feature.coordinates.map(([lng, lat]) => `        [${lng}, ${lat}],`).join("\n")}
      ],
    },
    properties: {
      id: ${JSON.stringify(feature.id)},
      roadName: ${JSON.stringify(feature.roadName)},
      section: ${JSON.stringify(feature.section)},
      status: ${JSON.stringify(feature.status)},
      description: ${JSON.stringify(feature.description)},
      link: ${JSON.stringify(feature.link)},
      updatedAt: ${JSON.stringify(feature.updatedAt)},
    },
  },`,
    )
    .join("\n");

  return `import type { RegulationFeature } from "@/types/regulation";

/**
 * 通行止め・規制情報のモックデータ。
 *
 * 本番では国土交通省などが公開するオープンデータ（GeoJSON）を取得する想定だが、
 * ここでは外部APIへ接続せずに日本国内の主要路線を模したダミーデータを返す。
 * 座標は [経度, 緯度] の順（GeoJSON 仕様）。
 *
 * このファイルは scripts/generate-mock-geometry.mjs が生成している。
 * 線形は OpenStreetMap（OSRM 経由）の実際の道路形状に沿っているため、
 * 地図上の道路とずれない。手で座標を書き換えず、スクリプトを実行し直すこと。
 */
export const MOCK_REGULATION_FEATURES: RegulationFeature[] = [
${body}
];
`;
}

async function main() {
  const features = [];

  for (const spec of SPECS) {
    const route = await fetchRoute(spec);
    const { coordinates, matchedDistance } = extractRoadGeometry(route, spec.road);

    if (coordinates.length < 2) {
      const names = {};
      for (const leg of route.legs)
        for (const step of leg.steps) {
          const key = step.name || "(名称なし)";
          names[key] = (names[key] ?? 0) + step.distance;
        }
      const top = Object.entries(names)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, distance]) => `${name}:${(distance / 1000).toFixed(1)}km`)
        .join("  ");
      throw new Error(
        `${spec.id}: 「${spec.road}」に一致する区間がありません。経路上の道路: ${top}`,
      );
    }

    features.push({ ...spec, coordinates: thin(coordinates, MAX_POINTS).map(round) });
    console.log(
      `${spec.id}: ${spec.road} ${(matchedDistance / 1000).toFixed(1)}km / ${coordinates.length}点 → ${Math.min(coordinates.length, MAX_POINTS)}点`,
    );

    // 公開デモサーバーに連続で負荷をかけない。
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  await writeFile("src/lib/mock-regulations.ts", renderFile(features), "utf8");
  console.log(`\n${features.length}件を src/lib/mock-regulations.ts に書き出しました。`);
}

await main();
