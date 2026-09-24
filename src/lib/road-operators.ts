/**
 * 道路名から、その道路を管理している会社・機関を判定する。
 *
 * 渋滞や規制の詳しい情報はその管理者が公開しているため、
 * 地図で指した道路に応じて案内先を切り替えるために使う。
 */
export interface RoadOperator {
  id: string;
  label: string;
  url: string;
}

const NEXCO_EAST: RoadOperator = {
  id: "nexco-east",
  label: "NEXCO東日本 交通情報",
  url: "https://www.e-nexco.co.jp/road_info/",
};
const NEXCO_CENTRAL: RoadOperator = {
  id: "nexco-central",
  label: "NEXCO中日本 交通情報",
  url: "https://www.c-nexco.co.jp/traffic/",
};
const NEXCO_WEST: RoadOperator = {
  id: "nexco-west",
  label: "NEXCO西日本 交通情報",
  url: "https://www.w-nexco.co.jp/road_info/",
};
const SHUTOKO: RoadOperator = {
  id: "shutoko",
  label: "首都高速 交通情報",
  url: "https://www.shutoko.jp/traffic/",
};
const HANSHIN: RoadOperator = {
  id: "hanshin",
  label: "阪神高速道路",
  url: "https://www.hanshin-exp.co.jp/",
};
const NAGOYA: RoadOperator = {
  id: "nagoya",
  label: "名古屋高速道路公社",
  url: "https://www.nagoya-expressway.or.jp/",
};
const HONSHI: RoadOperator = {
  id: "honshi",
  label: "本四高速",
  url: "https://www.jb-honshi.co.jp/",
};
const MLIT: RoadOperator = {
  id: "mlit",
  label: "国土交通省 道路情報提供システム",
  url: "https://www.road-info-prvs.mlit.go.jp/",
};

/**
 * 道路名の並び順に意味がある（前のものから順に判定する）。
 * 高速道路は路線ごとに管理会社が決まっているため、路線名で引き当てる。
 */
const RULES: ReadonlyArray<{ pattern: RegExp; operator: RoadOperator }> = [
  // 都市高速
  { pattern: /首都高速/, operator: SHUTOKO },
  { pattern: /阪神高速/, operator: HANSHIN },
  { pattern: /名古屋高速/, operator: NAGOYA },

  // 本州四国連絡高速道路
  {
    pattern: /瀬戸中央自動車道|神戸淡路鳴門自動車道|西瀬戸自動車道|瀬戸内しまなみ海道/,
    operator: HONSHI,
  },

  // NEXCO東日本
  {
    pattern:
      /東北自動車道|東北中央自動車道|秋田自動車道|八戸自動車道|青森自動車道|釜石自動車道|磐越自動車道|日本海東北自動車道|関越自動車道|上信越自動車道|常磐自動車道|東関東自動車道|北関東自動車道|館山自動車道|京葉道路|東京外環自動車道|道央自動車道|道東自動車道|札樽自動車道|深川留萌自動車道|安房峠道路/,
    operator: NEXCO_EAST,
  },

  // NEXCO中日本
  {
    pattern:
      /東名高速道路|新東名高速道路|中央自動車道|長野自動車道|北陸自動車道|東海北陸自動車道|伊勢湾岸自動車道|東海環状自動車道|東名阪自動車道|中部横断自動車道|伊勢自動車道|紀勢自動車道|名古屋第二環状自動車道|小田原厚木道路|西湘バイパス|第三京浜道路|横浜新道|中部縦貫自動車道/,
    operator: NEXCO_CENTRAL,
  },

  // NEXCO西日本
  {
    pattern:
      /名神高速道路|新名神高速道路|中国自動車道|山陽自動車道|九州自動車道|東九州自動車道|西九州自動車道|長崎自動車道|大分自動車道|宮崎自動車道|沖縄自動車道|阪和自動車道|近畿自動車道|西名阪自動車道|京奈和自動車道|舞鶴若狭自動車道|山陰自動車道|米子自動車道|松江自動車道|浜田自動車道|高松自動車道|松山自動車道|徳島自動車道|高知自動車道|播磨自動車道|第二神明道路|関門橋|関門トンネル/,
    operator: NEXCO_WEST,
  },

  // 直轄国道（番号付きの国道）
  { pattern: /国道\d+号/, operator: MLIT },
];

/** 道路名から管理者を返す。判定できない場合は null。 */
export function findRoadOperator(roadName: string | null): RoadOperator | null {
  if (!roadName) return null;

  const rule = RULES.find(({ pattern }) => pattern.test(roadName));
  return rule ? rule.operator : null;
}
