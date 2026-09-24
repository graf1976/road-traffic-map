/**
 * ホーム画面に追加する方法は、使っているブラウザによって違う。
 * 利用者の環境を見分けて、その環境での手順を案内する。
 */
export type InstallEnvironment =
  | "android-chrome"
  | "ios-safari"
  | "in-app-browser"
  | "other";

export interface InstallGuide {
  title: string;
  steps: string[];
}

/** LINE・Instagram・Facebook などのアプリ内ブラウザ。ホーム画面に追加できない。 */
const IN_APP_BROWSER = /\bLine\/|FBAN|FBAV|Instagram|; wv\)|MicroMessenger|KAKAOTALK/i;

export function detectInstallEnvironment(userAgent: string): InstallEnvironment {
  if (IN_APP_BROWSER.test(userAgent)) return "in-app-browser";

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  if (isIOS) return "ios-safari";

  const isAndroidChrome =
    /Android/i.test(userAgent) &&
    /Chrome\//i.test(userAgent) &&
    !/EdgA|OPR|SamsungBrowser/i.test(userAgent);
  if (isAndroidChrome) return "android-chrome";

  return "other";
}

export const INSTALL_GUIDES: Record<InstallEnvironment, InstallGuide> = {
  "android-chrome": {
    title: "Android（Chrome）でホーム画面に追加する",
    steps: [
      "画面右上の「⋮」（縦に3つの点）をタップします。",
      "「アプリをインストール」をタップします。見当たらない場合は「ホーム画面に追加」を探してください（メニューを下にスクロールすると出てくることがあります）。",
      "確認画面で「インストール」（または「追加」）をタップします。",
      "ホーム画面に「道路状況マップ」のアイコンができます。",
    ],
  },
  "ios-safari": {
    title: "iPhone（Safari）でホーム画面に追加する",
    steps: [
      "画面下の共有ボタン（四角から上向きの矢印）をタップします。",
      "「ホーム画面に追加」をタップします。",
      "右上の「追加」をタップします。",
    ],
  },
  "in-app-browser": {
    title: "いまはアプリ内のブラウザで開いています",
    steps: [
      "LINE や Gmail などから開くと、ホーム画面に追加できないブラウザで表示されます。",
      "画面右上（または右下）のメニューから「ブラウザで開く」「Chromeで開く」を選びます。",
      "Chrome で開き直したら、もう一度「ホーム画面に追加」ボタンを押してください。",
    ],
  },
  other: {
    title: "ホーム画面に追加する",
    steps: [
      "Android の方は Chrome で、iPhone の方は Safari でこのページを開いてください。",
      "ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選びます。",
    ],
  },
};
