// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";

import { RegulationList } from "@/components/RegulationList";
import type { RegulationFeature, RegulationStatus } from "@/types/regulation";

function makeFeature(
  id: string,
  roadName: string,
  status: RegulationStatus,
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
      id,
      roadName,
      section: `${roadName}の区間`,
      status,
      description: `${roadName}の詳細説明`,
      link: "https://example.com",
      updatedAt: "2026-09-21T07:20:00+09:00",
    },
  };
}

const features = [
  makeFeature("a", "首都高速都心環状線", "closed"),
  makeFeature("b", "東名高速道路", "lane_closed"),
];

afterEach(() => {
  cleanup();
});

describe("RegulationList", () => {
  it("件数と各項目を表示する", () => {
    render(
      <RegulationList
        features={features}
        selectedId={null}
        isLoading={false}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("2件")).toBeTruthy();
    expect(screen.getByText("首都高速都心環状線")).toBeTruthy();
    expect(screen.getByText("東名高速道路")).toBeTruthy();
    expect(screen.getByText("車線規制")).toBeTruthy();
  });

  it("項目を選ぶと該当の Feature を通知する", () => {
    const onSelect = vi.fn();
    render(
      <RegulationList
        features={features}
        selectedId={null}
        isLoading={false}
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("東名高速道路"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].properties.id).toBe("b");
  });

  it("選択中の項目に aria-current を付ける", () => {
    render(
      <RegulationList
        features={features}
        selectedId="a"
        isLoading={false}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const selected = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-current") === "true");

    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toContain("首都高速都心環状線");
  });

  it("該当が無い場合は空の案内を表示する", () => {
    render(
      <RegulationList
        features={[]}
        selectedId={null}
        isLoading={false}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("該当する規制情報はありません。")).toBeTruthy();
  });

  it("閉じるボタンで onClose を呼ぶ", () => {
    const onClose = vi.fn();
    render(
      <RegulationList
        features={features}
        selectedId={null}
        isLoading={false}
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("閉じる"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
