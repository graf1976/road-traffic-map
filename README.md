# 全国道路状況マップ

全国主要道路の**渋滞状況**（Google Maps Traffic Layer）と**通行止め・規制情報**（GeoJSON）を
1 つの地図上で確認できる Next.js アプリケーションです。

## 主な機能

| 機能 | 概要 |
| --- | --- |
| 渋滞情報 | Google Maps の Traffic Layer を常時表示（緑=順調／オレンジ=混雑／赤=渋滞） |
| 通行止め・規制情報 | 提供元から取得した GeoJSON(LineString) を黒い線で描画（未設定なら非表示） |
| ポップアップ | 黒い線のホバー／クリックで InfoWindow を表示（詳細説明＋詳細ページへのリンク） |
| 規制情報一覧 | サイドパネル（モバイルはボトムシート）に一覧表示。項目を選ぶと該当区間へ地図が移動 |
| 表示範囲との連動 | 一覧は既定で**地図に写っている範囲の規制だけ**を表示。地図を動かすと件数が変わる（「地図の範囲のみ」のチェックを外すと全件表示） |
| 種別フィルタ | 通行止め／工事中／車線規制／チェーン規制で絞り込み。地図と一覧が連動 |
| 現在地取得 | 地図上の現在地ボタン（とヘッダーのボタン）から現在地へ移動＋ピンを表示 |
| 自動更新 | 更新なし（手動）／1 分／5 分／10 分 から選択。次回更新までの残り秒数も表示 |
| 凡例 | 地図上に色の意味を常時表示 |
| エラー表示 | 位置情報の失敗・API 取得失敗・API キー未設定・描画エラーをそれぞれ画面上で案内 |
| ホーム画面に追加 | Web アプリマニフェストとサービスワーカーを備え、スマートフォンのホーム画面にアプリとして追加できる |

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Google Maps API キーの設定（必須）

プロジェクト直下の `.env.local` を開き、`YOUR_API_KEY_HERE` を実際のキーに置き換えてください。

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=取得したAPIキー
# 任意。未設定の場合は検証用の DEMO_MAP_ID が使われます。
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
# 任意。未設定の場合はモックデータを返します。
REGULATION_SOURCE_URL=
```

- [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) で
  **Maps JavaScript API** を有効化したうえでキーを発行してください。
- キーはブラウザに公開されるため、必ず **HTTP リファラー制限** を設定してください。
- 現在地ピン（Advanced Marker）は Map ID を必要とします。本番では
  [Map ID](https://developers.google.com/maps/documentation/get-map-id) を作成して
  `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` に設定することを推奨します。

> API キーが未設定のままでも起動はでき、地図の代わりに設定方法の案内が表示されます。

### 3. 開発コマンド

```bash
npm run dev          # 開発サーバー（http://localhost:3000）
npm test             # テスト（Vitest）
npm run test:watch   # テストの監視実行
npm run lint         # ESLint
npm run build        # 本番ビルド
```

## Vercel へのデプロイ

1. 本リポジトリを GitHub にプッシュします。
2. Vercel で **New Project** から該当リポジトリをインポートします。
3. **Settings → Environment Variables** に以下を登録します。
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`（必須）
   - `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`（任意）
   - `REGULATION_SOURCE_URL`（任意）
4. Deploy を実行します。`.env.local` はリポジトリに含まれないため、
   環境変数の登録を忘れるとデプロイ後に地図が表示されません。

## CI

`.github/workflows/ci.yml` で、push / pull request のたびに
`npm run lint` → `npm test` → `npm run build` を実行します。
ビルドは API キーが無くても通る構成です。

## ディレクトリ構成

```
src/
├── app/
│   ├── api/regulations/route.ts   規制情報を返す API（GeoJSON）
│   ├── apple-icon.png             iOS のホーム画面用アイコン
│   ├── error.tsx                  ページ内エラーのフォールバック
│   ├── global-error.tsx           ルートレイアウトごと失敗した場合の表示
│   ├── globals.css
│   ├── icon.svg                   ファビコン
│   ├── layout.tsx
│   ├── manifest.ts                Web アプリマニフェスト（ホーム画面追加用）
│   └── page.tsx                   ヘッダー・フィルタ・一覧・地図の組み立て
├── components/
│   ├── Legend.tsx                 凡例
│   ├── LocateButton.tsx           地図上の現在地ボタン
│   ├── Map.tsx                    地図本体（APIProvider / Traffic / 規制 / InfoWindow）
│   ├── RegulationInfoContent.tsx  InfoWindow の中身
│   ├── RegulationLayer.tsx        規制情報のポリライン描画
│   ├── RegulationList.tsx         規制情報一覧パネル
│   ├── ServiceWorkerRegistration.tsx  サービスワーカーの登録
│   ├── StatusFilter.tsx           種別フィルタ
│   └── TrafficLayer.tsx           渋滞レイヤー
├── hooks/
│   ├── useCountdown.ts            次回更新までのカウントダウン
│   ├── useCurrentLocation.ts      Geolocation API
│   └── useRegulations.ts          SWR による取得・自動更新
├── lib/
│   ├── env.ts                     環境変数の読み取り
│   ├── geo.ts                     GeoJSON 座標の変換
│   ├── mock-regulations.ts        ダミーの規制データ
│   ├── regulation-filter.ts       種別ごとの集計・絞り込み
│   ├── regulation-normalize.ts    外部データの正規化
│   ├── regulation-source.ts       取得元の切り替え・キャッシュ・フォールバック
│   └── regulation-ui.ts           ステータスの配色・日時整形
└── types/
    └── regulation.ts              GeoJSON / 規制情報の型定義
```

## API

`GET /api/regulations` は GeoJSON の `FeatureCollection` を返します。

```json
{
  "type": "FeatureCollection",
  "generatedAt": "2026-09-21T08:00:00.000Z",
  "source": "mock",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[139.76, 35.67], [139.77, 35.69]] },
      "properties": {
        "id": "reg-shutoko-c1",
        "roadName": "首都高速都心環状線",
        "section": "霞が関出入口〜神田橋JCT",
        "status": "closed",
        "description": "車両火災の影響により…",
        "link": "https://www.shutoko.jp/traffic/",
        "updatedAt": "2026-09-21T07:20:00+09:00"
      }
    }
  ]
}
```

`source` は `mock`（ダミーデータ）／`live`（実データ）／`fallback`（実データ取得に失敗して
代替表示中）のいずれかで、画面上部のバッジに反映されます。

## 表示データについて（重要）

| 画面の要素 | データ | 既定の状態 |
| --- | --- | --- |
| 道路の色（緑・オレンジ・赤） | **Google のリアルタイム渋滞情報** | 常に実データ |
| 黒い線（通行止め・規制） | 提供元から取得した実データ | **提供元が未設定なら表示しない** |

規制情報は、提供元（`REGULATION_SOURCE_URL`）が設定されていない場合は**何も表示しません**。
実際には通れる道路を「通行止め」と誤認させないためです。画面には「規制情報は未接続」と表示され、
渋滞状況（道路の色）だけがリアルタイムで表示されます。

取得に失敗した場合も、見本データで穴埋めはしません。直前に取得できた内容があればそれを、
無ければ「規制情報を取得できませんでした」と表示します。

### 見本データ（開発用）

動作確認のために、実在する道路に沿った見本データ 8 件を同梱しています。
`REGULATION_USE_SAMPLE=true` を設定したときだけ表示され、画面には
「見本データ（開発用）」と明示されます。**公開環境では設定しないでください。**

### データの取得方式

このアプリは提供元を**定期的に取得（ポーリング）**します。常時接続は不要です。

- 「今すぐ更新」ボタンを押したとき
- 自動更新（1分／5分／10分）で選んだ間隔ごと
- サーバー側では 60 秒間キャッシュし、提供元への問い合わせが増えすぎないようにしています

### 提供元の候補

全国の通行止め情報を座標付き・機械可読な形式で返す、登録不要の無料 API は執筆時点で
見つかっていません。実用化の選択肢は次のとおりです。

| 選択肢 | 範囲 | 座標 | 費用・条件 |
| --- | --- | --- | --- |
| 自治体・都道府県のオープンデータ API（例: 静岡市「しずみち info」） | 地域限定 | あり | 無料・正規 |
| [JARTIC](https://www.jartic.or.jp/service/opendata/) などの事業者向けデータ提供 | 全国 | あり | 申請・契約が必要 |
| [国土交通省 道路情報提供システム](https://www.road-info-prvs.mlit.go.jp/) | 全国 | **なし**（HTML のみ） | 地図への描画には座標の付与が別途必要 |
| [国土交通省 xROAD / 交通量 API](https://www.mlit.go.jp/report/press/road01_hh_001930.html) | 直轄国道 | あり | 無料（規制ではなく交通量） |

いずれも形式が異なるため、[`regulation-normalize.ts`](src/lib/regulation-normalize.ts) の
変換処理に合わせて調整してください。表記ゆれの対応表を足すだけで済む場合もあります。

## 実データへの差し替え

`REGULATION_SOURCE_URL` に GeoJSON を返すエンドポイント（国土交通省などのオープンデータ）を
設定すると、フロントエンドを変更せずに実データへ切り替わります。
[`src/lib/regulation-source.ts`](src/lib/regulation-source.ts) が次を担当します。

1. 未設定なら [`mock-regulations.ts`](src/lib/mock-regulations.ts) のダミーデータを返す
2. 60 秒間のプロセス内キャッシュ（自動更新で上流APIを叩きすぎないため）
3. 8 秒でタイムアウトする `fetch`
4. 失敗時は直近のキャッシュ、無ければモックデータへフォールバック（`source: "fallback"`）

レスポンスは [`regulation-normalize.ts`](src/lib/regulation-normalize.ts) で正規化します。

- `status` の表記ゆれ（`通行止め` / `road_closed` など）を内部区分へ変換。
  判別できない場合は安全側に倒して `closed`（通行止め）として扱います。
- `roadName` / `road_name`、`updatedAt` / `updated_at` などの命名ゆれを吸収
- `MultiLineString` は先頭の線を採用、2 点未満・範囲外の座標は除外
- `http(s)` 以外のリンク（`javascript:` など）は表示しない

区分の対応表は `STATUS_ALIASES` に追記するだけで拡張できます。

## メンテナンス用スクリプト

```bash
node scripts/generate-mock-geometry.mjs   # サンプル規制データの線形を生成
node scripts/generate-icons.mjs           # ホーム画面用アイコンを生成
```

規制区間の線は、手書きの座標だと地図上の道路からずれてしまうため、
OpenStreetMap ベースの経路探索（OSRM）で取得した**実際の道路形状**から生成しています。
生成結果は `src/lib/mock-regulations.ts` にコミット済みなので、通常は実行不要です。

## テスト

```bash
npm test
```

Vitest で以下を検証しています（`src/**/__tests__`）。

- `regulation-normalize` … 表記ゆれの変換、壊れたデータの除去、安全でないリンクの除去
- `regulation-source` … モック／実データ／キャッシュ／フォールバックの切り替え
- `regulation-filter` … 種別ごとの集計、絞り込み、表示範囲との重なり判定
- `regulation-ui` … 日時の整形とステータス配色の網羅
- `geo` … GeoJSON 座標（[経度, 緯度]）から地図用座標への変換
- `api/regulations` … レスポンス形式とキャッシュ制御ヘッダー
- `useCountdown` … 自動更新までのカウントダウンとタイマー解除
- `useCurrentLocation` … 取得成功・権限拒否・タイムアウト・非対応ブラウザ
- `RegulationList` … 一覧の描画・選択・空表示
- `StatusFilter` … チェック状態とトグルの通知
- `RegulationInfoContent` … ポップアップの表示内容とリンクの安全性
- `RegulationLayer` … 黒線の描画、座標変換、ホバー／クリックの通知
- `TrafficLayer` … 渋滞レイヤーの追加とアンマウント時の解除
- `Map` … API キー未設定時の案内、InfoWindow と現在地ピンの表示制御、表示範囲の通知

Google Maps に依存するコンポーネントは `@vis.gl/react-google-maps` をモックしているため、
API キーが無い環境（CI を含む）でも検証できます。

日時の整形は実行環境のタイムゾーンに依存するため、テストでは `Asia/Tokyo` に固定しています
（`vitest.config.mts`）。

## 技術スタック

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)
- SWR（データ取得・自動更新）
- Vitest / Testing Library
