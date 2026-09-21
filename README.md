# 全国道路状況マップ

全国主要道路の**渋滞状況**（Google Maps Traffic Layer）と**通行止め・規制情報**（GeoJSON）を
1 つの地図上で確認できる Next.js アプリケーションです。

## 主な機能

| 機能 | 概要 |
| --- | --- |
| 渋滞情報 | Google Maps の Traffic Layer を常時表示（緑=順調／オレンジ=混雑／赤=渋滞） |
| 通行止め・規制情報 | API が返す GeoJSON(LineString) を黒い線で描画 |
| ポップアップ | 黒い線のホバー／クリックで InfoWindow を表示（詳細説明＋詳細ページへのリンク） |
| 規制情報一覧 | サイドパネル（モバイルはボトムシート）に一覧表示。項目を選ぶと該当区間へ地図が移動 |
| 種別フィルタ | 通行止め／工事中／車線規制／チェーン規制で絞り込み。地図と一覧が連動 |
| 現在地取得 | Geolocation API で現在地を取得し、地図の中心を移動＋ピンを表示 |
| 自動更新 | 更新なし（手動）／1 分／5 分／10 分 から選択。次回更新までの残り秒数も表示 |
| 凡例 | 地図上に色の意味を常時表示 |
| エラー表示 | 位置情報の失敗・API 取得失敗・API キー未設定・描画エラーをそれぞれ画面上で案内 |

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
│   ├── error.tsx                  ページ内エラーのフォールバック
│   ├── global-error.tsx           ルートレイアウトごと失敗した場合の表示
│   ├── globals.css
│   ├── icon.svg                   ファビコン
│   ├── layout.tsx
│   └── page.tsx                   ヘッダー・フィルタ・一覧・地図の組み立て
├── components/
│   ├── Legend.tsx                 凡例
│   ├── Map.tsx                    地図本体（APIProvider / Traffic / 規制 / InfoWindow）
│   ├── RegulationInfoContent.tsx  InfoWindow の中身
│   ├── RegulationLayer.tsx        規制情報のポリライン描画
│   ├── RegulationList.tsx         規制情報一覧パネル
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

## テスト

```bash
npm test
```

Vitest で以下を検証しています（`src/**/__tests__`）。

- `regulation-normalize` … 表記ゆれの変換、壊れたデータの除去、安全でないリンクの除去
- `regulation-source` … モック／実データ／キャッシュ／フォールバックの切り替え
- `regulation-filter` … 種別ごとの集計と絞り込み
- `regulation-ui` … 日時の整形とステータス配色の網羅
- `geo` … GeoJSON 座標（[経度, 緯度]）から地図用座標への変換
- `api/regulations` … レスポンス形式とキャッシュ制御ヘッダー
- `useCountdown` … 自動更新までのカウントダウンとタイマー解除
- `useCurrentLocation` … 取得成功・権限拒否・タイムアウト・非対応ブラウザ
- `RegulationList` … 一覧の描画・選択・空表示
- `StatusFilter` … チェック状態とトグルの通知
- `RegulationInfoContent` … ポップアップの表示内容とリンクの安全性

日時の整形は実行環境のタイムゾーンに依存するため、テストでは `Asia/Tokyo` に固定しています
（`vitest.config.mts`）。

## 技術スタック

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)
- SWR（データ取得・自動更新）
- Vitest / Testing Library
