// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InstallButton } from "@/components/InstallButton";

/** Chrome の beforeinstallprompt を模したイベント。 */
function firePrompt(outcome: "accepted" | "dismissed") {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string; platform: string }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome, platform: "web" });

  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("InstallButton", () => {
  it("インストールできるときは、ボタンから標準のインストール画面を出す", async () => {
    render(<InstallButton />);
    const event = firePrompt("accepted");

    fireEvent.click(screen.getByRole("button", { name: /ホーム画面に追加/ }));

    await waitFor(() => {
      expect(event.prompt).toHaveBeenCalled();
    });
    // 追加し終えたらボタンを消す。
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /ホーム画面に追加/ })).toBeNull();
    });
  });

  it("標準の画面を出せない環境では、手順を案内する", () => {
    vi.stubGlobal("navigator", {
      ...window.navigator,
      userAgent:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36 Line/14.10.0",
    });
    render(<InstallButton />);

    fireEvent.click(screen.getByRole("button", { name: /ホーム画面に追加/ }));

    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("アプリ内のブラウザ");
    expect(dialog.textContent).toContain("Chromeで開く");
  });

  it("案内は「閉じる」や Esc キーで閉じられる", () => {
    render(<InstallButton />);

    fireEvent.click(screen.getByRole("button", { name: /ホーム画面に追加/ }));
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /ホーム画面に追加/ }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ホーム画面から起動しているときはボタンを出さない", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(display-mode: standalone)",
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    render(<InstallButton />);

    expect(screen.queryByRole("button", { name: /ホーム画面に追加/ })).toBeNull();
  });
});
