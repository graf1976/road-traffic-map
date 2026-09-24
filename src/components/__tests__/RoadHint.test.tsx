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
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("管理者が分かる道路ではリンクを出す", () => {
    render(
      <RoadHint
        name="伊勢湾岸自動車道"
        operator={findRoadOperator("伊勢湾岸自動車道")}
      />,
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("https://www.c-nexco.co.jp/traffic/");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
