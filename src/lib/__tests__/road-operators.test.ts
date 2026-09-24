import { describe, expect, it } from "vitest";

import { findRoadOperator } from "@/lib/road-operators";

describe("findRoadOperator", () => {
  const cases: ReadonlyArray<[string, string]> = [
    ["伊勢湾岸自動車道", "NEXCO中日本 交通情報"],
    ["東名高速道路", "NEXCO中日本 交通情報"],
    ["中央自動車道", "NEXCO中日本 交通情報"],
    ["東北自動車道", "NEXCO東日本 交通情報"],
    ["関越自動車道", "NEXCO東日本 交通情報"],
    ["名神高速道路", "NEXCO西日本 交通情報"],
    ["九州自動車道", "NEXCO西日本 交通情報"],
    ["首都高速都心環状線", "首都高速 交通情報"],
    ["阪神高速11号池田線", "阪神高速道路"],
    ["名古屋高速3号大高線", "名古屋高速道路公社"],
    ["瀬戸中央自動車道", "本四高速"],
    ["国道1号", "国土交通省 道路情報提供システム"],
  ];

  for (const [roadName, expected] of cases) {
    it(`${roadName} は「${expected}」を案内する`, () => {
      expect(findRoadOperator(roadName)?.label).toBe(expected);
    });
  }

  it("管理者が分からない道路では null を返す", () => {
    expect(findRoadOperator("市道中央線")).toBeNull();
    expect(findRoadOperator("")).toBeNull();
    expect(findRoadOperator(null)).toBeNull();
  });

  it("案内先はすべて https", () => {
    for (const [roadName] of cases) {
      expect(findRoadOperator(roadName)?.url).toMatch(/^https:\/\//);
    }
  });
});
