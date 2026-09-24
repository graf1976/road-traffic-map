// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Legend } from "@/components/Legend";

afterEach(() => {
  cleanup();
});

describe("Legend", () => {
  it("渋滞状況の色は常に載せる", () => {
    render(<Legend />);

    expect(screen.getByText("順調")).toBeTruthy();
    expect(screen.getByText("混雑")).toBeTruthy();
    expect(screen.getByText("渋滞")).toBeTruthy();
  });

  it("規制の線を描いていないときは凡例にも載せない", () => {
    render(<Legend hasRegulations={false} />);

    expect(screen.queryByText("通行止め・規制")).toBeNull();
  });

  it("規制の線を描いているときだけ凡例に載せる", () => {
    render(<Legend hasRegulations />);

    expect(screen.getByText("通行止め・規制")).toBeTruthy();
  });
});
