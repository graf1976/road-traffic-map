// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StatusFilter } from "@/components/StatusFilter";
import {
  REGULATION_STATUSES,
  type RegulationStatus,
} from "@/types/regulation";

const counts: Record<RegulationStatus, number> = {
  closed: 3,
  construction: 2,
  lane_closed: 1,
  chain_required: 0,
};

afterEach(() => {
  cleanup();
});

describe("StatusFilter", () => {
  it("すべての種別と件数を表示する", () => {
    render(
      <StatusFilter
        selected={new Set(REGULATION_STATUSES)}
        counts={counts}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
      />,
    );

    expect(screen.getByText("通行止め")).toBeTruthy();
    expect(screen.getByText("工事中")).toBeTruthy();
    expect(screen.getByText("車線規制")).toBeTruthy();
    expect(screen.getByText("チェーン規制")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("チェックの状態が選択内容と一致する", () => {
    render(
      <StatusFilter
        selected={new Set<RegulationStatus>(["closed"])}
        counts={counts}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const checked = checkboxes.filter((checkbox) => checkbox.checked);

    expect(checkboxes).toHaveLength(REGULATION_STATUSES.length);
    expect(checked).toHaveLength(1);
  });

  it("種別をクリックすると onToggle に種別が渡る", () => {
    const onToggle = vi.fn();
    render(
      <StatusFilter
        selected={new Set(REGULATION_STATUSES)}
        counts={counts}
        onToggle={onToggle}
        onSelectAll={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("工事中"));

    expect(onToggle).toHaveBeenCalledWith("construction");
  });

  it("すべて選択済みのときは「すべて表示」を押せない", () => {
    const { rerender } = render(
      <StatusFilter
        selected={new Set(REGULATION_STATUSES)}
        counts={counts}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "すべて表示" });
    expect((button as HTMLButtonElement).disabled).toBe(true);

    const onSelectAll = vi.fn();
    rerender(
      <StatusFilter
        selected={new Set<RegulationStatus>(["closed"])}
        counts={counts}
        onToggle={vi.fn()}
        onSelectAll={onSelectAll}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "すべて表示" }));
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });
});
