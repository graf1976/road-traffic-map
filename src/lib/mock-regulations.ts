import type { RegulationFeature } from "@/types/regulation";

/**
 * 通行止め・規制情報のモックデータ。
 *
 * 本番では国土交通省などが公開するオープンデータ（GeoJSON）を取得する想定だが、
 * ここでは外部APIへ接続せずに日本国内の主要路線を模したダミーデータを返す。
 * 座標は [経度, 緯度] の順（GeoJSON 仕様）。
 */
export const MOCK_REGULATION_FEATURES: RegulationFeature[] = [
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.7601, 35.6764],
        [139.7688, 35.6789],
        [139.7745, 35.6834],
        [139.7773, 35.6903],
      ],
    },
    properties: {
      id: "reg-shutoko-c1",
      roadName: "首都高速都心環状線",
      section: "霞が関出入口〜神田橋JCT",
      status: "closed",
      description:
        "車両火災の影響により、霞が関出入口から神田橋JCTまでの区間で全面通行止めとなっています。復旧時刻は未定です。周辺の一般道も混雑しています。",
      link: "https://www.shutoko.jp/traffic/",
      updatedAt: "2026-09-21T07:20:00+09:00",
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.6607, 35.6284],
        [139.5702, 35.5459],
        [139.4682, 35.4941],
        [139.3902, 35.4527],
      ],
    },
    properties: {
      id: "reg-tomei-tokyo-ebina",
      roadName: "東名高速道路（下り）",
      section: "東京IC〜海老名JCT",
      status: "lane_closed",
      description:
        "集中工事にともない、東京ICから海老名JCTまでの区間で終日車線規制を実施しています。所要時間が通常より30分程度長くなる見込みです。",
      link: "https://www.c-nexco.co.jp/traffic/",
      updatedAt: "2026-09-21T06:00:00+09:00",
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.3352, 35.6558],
        [139.1913, 35.6403],
        [139.0425, 35.6135],
        [138.9403, 35.6062],
      ],
    },
    properties: {
      id: "reg-chuo-hachioji-otsuki",
      roadName: "中央自動車道（上り）",
      section: "八王子JCT〜大月IC",
      status: "construction",
      description:
        "舗装補修工事のため、夜間（21時〜翌5時）に八王子JCTから大月ICまでの区間を対面通行に切り替えています。日中は通常どおり通行できます。",
      link: "https://www.c-nexco.co.jp/road_info/",
      updatedAt: "2026-09-21T05:45:00+09:00",
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.6225, 35.4657],
        [139.6013, 35.4436],
        [139.5793, 35.4203],
        [139.5442, 35.3993],
      ],
    },
    properties: {
      id: "reg-route1-yokohama",
      roadName: "国道1号",
      section: "横浜駅西口〜戸塚区役所前",
      status: "closed",
      description:
        "路面陥没の発生により、横浜駅西口から戸塚区役所前までの上下線で通行止めを実施しています。復旧作業は本日夕方まで続く見込みです。",
      link: "https://www.ktr.mlit.go.jp/kisha/",
      updatedAt: "2026-09-21T08:05:00+09:00",
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [136.8813, 35.1785],
        [136.9226, 35.1612],
        [136.9681, 35.1503],
        [137.0148, 35.1417],
      ],
    },
    properties: {
      id: "reg-nagoya-expwy",
      roadName: "名古屋高速3号大高線",
      section: "山王JCT〜大高IC",
      status: "lane_closed",
      description:
        "事故処理のため、山王JCTから大高ICまでの区間で片側1車線を規制しています。約4kmの渋滞が発生しています。",
      link: "https://www.nagoya-expressway.or.jp/traffic/",
      updatedAt: "2026-09-21T07:50:00+09:00",
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [135.5023, 34.6937],
        [135.4762, 34.7095],
        [135.4384, 34.7211],
        [135.3966, 34.7307],
      ],
    },
    properties: {
      id: "reg-hanshin-11",
      roadName: "阪神高速11号池田線",
      section: "梅田出入口〜豊中南出入口",
      status: "construction",
      description:
        "橋梁点検作業のため、梅田出入口から豊中南出入口までの区間を9月25日まで通行止めとしています。迂回路として国道176号をご利用ください。",
      link: "https://www.hanshin-exp.co.jp/drivers/traffic/",
      updatedAt: "2026-09-21T04:30:00+09:00",
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [140.8694, 38.2688],
        [140.8452, 38.3617],
        [140.8231, 38.4452],
        [140.8115, 38.5312],
      ],
    },
    properties: {
      id: "reg-tohoku-sendai",
      roadName: "東北自動車道（下り）",
      section: "仙台宮城IC〜古川IC",
      status: "chain_required",
      description:
        "降雪の影響により、仙台宮城ICから古川ICまでの区間でチェーン規制を実施しています。冬用タイヤの装着をお願いします。",
      link: "https://www.e-nexco.co.jp/road_info/",
      updatedAt: "2026-09-21T03:10:00+09:00",
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [130.4017, 33.5903],
        [130.4322, 33.6084],
        [130.4671, 33.6251],
        [130.5013, 33.6418],
      ],
    },
    properties: {
      id: "reg-fukuoka-urban",
      roadName: "福岡高速1号香椎線",
      section: "呉服町出入口〜香椎浜出入口",
      status: "lane_closed",
      description:
        "路面補修のため、呉服町出入口から香椎浜出入口までの区間で車線規制を行っています。通行止めではありませんが速度規制にご注意ください。",
      link: "https://www.fukuoka-npe.co.jp/traffic/",
      updatedAt: "2026-09-21T06:40:00+09:00",
    },
  },
];
