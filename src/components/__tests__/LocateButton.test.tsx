// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocateButton } from "@/components/LocateButton";

afterEach(() => {
  cleanup();
});

describe("LocateButton", () => {
  it("押すと現在地の取得を要求する", () => {
    const onLocate = vi.fn();
    render(
      <LocateButton onLocate={onLocate} isLocating={false} hasPosition={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "現在地を表示" }));

    expect(onLocate).toHaveBeenCalledTimes(1);
  });

  it("取得中は押せない", () => {
    const onLocate = vi.fn();
    render(
      <LocateButton onLocate={onLocate} isLocating hasPosition={false} />,
    );

    const button = screen.getByRole("button", {
      name: "現在地を表示",
    }) as HTMLButtonElement;
    fireEvent.click(button);

    expect(button.disabled).toBe(true);
    expect(onLocate).not.toHaveBeenCalled();
  });

  it("現在地を取得済みなら色を変えて示す", () => {
    const { rerender } = render(
      <LocateButton onLocate={vi.fn()} isLocating={false} hasPosition={false} />,
    );
    const before = screen.getByRole("button", { name: "現在地を表示" }).className;

    rerender(
      <LocateButton onLocate={vi.fn()} isLocating={false} hasPosition />,
    );
    const after = screen.getByRole("button", { name: "現在地を表示" }).className;

    expect(before).toContain("text-slate-700");
    expect(after).toContain("text-blue-600");
  });
});
