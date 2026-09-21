import { describe, expect, it } from "vitest";

import {
  STATUS_BADGE_CLASS,
  STATUS_BAR_COLOR,
  formatDateTime,
} from "@/lib/regulation-ui";
import { REGULATION_STATUSES } from "@/types/regulation";

describe("formatDateTime", () => {
  it("ISO 8601 の日時を MM/DD HH:mm 形式にする", () => {
    expect(formatDateTime("2026-09-21T07:20:00+09:00")).toBe("09/21 07:20");
  });

  it("解釈できない値は原文のまま返す", () => {
    expect(formatDateTime("未定")).toBe("未定");
  });
});

describe("ステータスの配色", () => {
  it("すべての種別に配色が定義されている", () => {
    for (const status of REGULATION_STATUSES) {
      expect(STATUS_BADGE_CLASS[status]).toBeTruthy();
      expect(STATUS_BAR_COLOR[status]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
