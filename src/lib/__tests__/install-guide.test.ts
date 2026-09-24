import { describe, expect, it } from "vitest";

import { INSTALL_GUIDES, detectInstallEnvironment } from "@/lib/install-guide";

const UA = {
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  line: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36 Line/14.10.0",
  androidWebView:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0.0.0 Mobile Safari/537.36",
  samsung:
    "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36",
  windowsChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
};

describe("detectInstallEnvironment", () => {
  it("Android の Chrome を見分ける", () => {
    expect(detectInstallEnvironment(UA.androidChrome)).toBe("android-chrome");
  });

  it("iPhone を見分ける", () => {
    expect(detectInstallEnvironment(UA.iphone)).toBe("ios-safari");
  });

  it("LINE やアプリ内ブラウザを見分ける（ホーム画面に追加できないため）", () => {
    expect(detectInstallEnvironment(UA.line)).toBe("in-app-browser");
    expect(detectInstallEnvironment(UA.androidWebView)).toBe("in-app-browser");
  });

  it("Chrome 以外のブラウザやパソコンは一般的な案内にする", () => {
    expect(detectInstallEnvironment(UA.samsung)).toBe("other");
    expect(detectInstallEnvironment(UA.windowsChrome)).toBe("other");
  });
});

describe("INSTALL_GUIDES", () => {
  it("Android では「アプリをインストール」の表記も案内する", () => {
    const text = INSTALL_GUIDES["android-chrome"].steps.join("");

    expect(text).toContain("アプリをインストール");
    expect(text).toContain("ホーム画面に追加");
  });

  it("アプリ内ブラウザでは Chrome で開き直すよう案内する", () => {
    expect(INSTALL_GUIDES["in-app-browser"].steps.join("")).toContain("Chromeで開く");
  });
});
