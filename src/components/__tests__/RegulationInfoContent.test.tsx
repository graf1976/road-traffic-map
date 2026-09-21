// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RegulationInfoContent } from "@/components/RegulationInfoContent";
import type { RegulationFeature } from "@/types/regulation";

function makeFeature(
  overrides: Partial<RegulationFeature["properties"]> = {},
): RegulationFeature {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.76, 35.68],
        [139.78, 35.69],
      ],
    },
    properties: {
      id: "reg-1",
      roadName: "首都高速都心環状線",
      section: "霞が関出入口〜神田橋JCT",
      status: "closed",
      description: "車両火災の影響により全面通行止めです。",
      link: "https://example.com/detail",
      updatedAt: "2026-09-21T07:20:00+09:00",
      ...overrides,
    },
  };
}

afterEach(() => {
  cleanup();
});

describe("RegulationInfoContent", () => {
  it("道路名・区間・説明・種別を表示する", () => {
    render(<RegulationInfoContent feature={makeFeature()} />);

    expect(screen.getByText("首都高速都心環状線")).toBeTruthy();
    expect(screen.getByText("霞が関出入口〜神田橋JCT")).toBeTruthy();
    expect(screen.getByText("車両火災の影響により全面通行止めです。")).toBeTruthy();
    expect(screen.getByText("通行止め")).toBeTruthy();
  });

  it("詳細リンクを別タブで安全に開く", () => {
    render(<RegulationInfoContent feature={makeFeature()} />);

    const link = screen.getByRole("link") as HTMLAnchorElement;

    expect(link.href).toBe("https://example.com/detail");
    expect(link.target).toBe("_blank");
    expect(link.rel).toBe("noopener noreferrer");
  });

  it("リンクが無い場合はリンクを表示しない", () => {
    render(<RegulationInfoContent feature={makeFeature({ link: "" })} />);

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("区間が空のときは区間行を出さない", () => {
    render(<RegulationInfoContent feature={makeFeature({ section: "" })} />);

    expect(screen.queryByText("霞が関出入口〜神田橋JCT")).toBeNull();
  });

  it("更新日時を読みやすい形式で表示する", () => {
    render(<RegulationInfoContent feature={makeFeature()} />);

    expect(screen.getByText(/情報更新: 09\/21/)).toBeTruthy();
  });
});
