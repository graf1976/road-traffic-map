// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RoadHint } from "@/components/RoadHint";
import { findRoadOperator } from "@/lib/road-operators";

afterEach(() => {
  cleanup();
});

describe("RoadHint", () => {
  it("道路名を表示する", () => {
    render(<RoadHint name="伊勢湾岸自動車道" operator={null} />);

    expect(screen.getByText("伊勢湾岸自動車道")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /交通情報/ })).toBeNull();
  });

  it("管理者が分かる道路ではリンクを出す", () => {
    render(
      <RoadHint
        name="伊勢湾岸自動車道"
        operator={findRoadOperator("伊勢湾岸自動車道")}
      />,
    );

    const link = screen.getByRole("link", { name: /NEXCO中日本/ });
    expect(link.getAttribute("href")).toBe("https://www.c-nexco.co.jp/traffic/");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("道路名の出典として OpenStreetMap を表示し、ライセンスの案内へリンクする", () => {
    render(<RoadHint name="東名高速道路" operator={null} />);

    expect(screen.getByText(/contributors/)).toBeTruthy();
    const link = screen.getByRole("link", { name: "OpenStreetMap" });
    expect(link.getAttribute("href")).toBe("https://www.openstreetmap.org/copyright");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
