// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OfficialLinks } from "@/components/OfficialLinks";

afterEach(() => {
  cleanup();
});

describe("OfficialLinks", () => {
  it("表示中の地域名を見出しに出す", () => {
    render(<OfficialLinks center={{ lat: 35.68, lng: 139.77 }} />);

    expect(screen.getByText("関東の規制情報を公式サイトで見る")).toBeTruthy();
  });

  it("地域に応じた案内先を出す", () => {
    render(<OfficialLinks center={{ lat: 34.69, lng: 135.5 }} />);

    expect(screen.getByText("近畿の規制情報を公式サイトで見る")).toBeTruthy();
    expect(screen.getByRole("link", { name: /NEXCO西日本/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /阪神高速/ })).toBeTruthy();
  });

  it("地域が分からなくても全国共通の案内先は出す", () => {
    render(<OfficialLinks center={null} />);

    expect(screen.getByText("規制情報を公式サイトで見る")).toBeTruthy();
    expect(screen.getByRole("link", { name: /JARTIC/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /道路情報提供システム/ })).toBeTruthy();
  });

  it("外部リンクは新しいタブで安全に開く", () => {
    render(<OfficialLinks center={{ lat: 43.06, lng: 141.35 }} />);

    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.getAttribute("href")).toMatch(/^https:\/\//);
    }
  });
});
