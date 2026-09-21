import { NextResponse } from "next/server";

import { loadRegulations } from "@/lib/regulation-source";
import type { RegulationCollection } from "@/types/regulation";

/** 自動更新のたびに最新の内容を返すため、キャッシュを無効化する。 */
export const dynamic = "force-dynamic";

/**
 * 通行止め・規制情報を GeoJSON（FeatureCollection）で返す API。
 *
 * 既定ではモックデータを返し、環境変数 `REGULATION_SOURCE_URL` を設定すると
 * 実際のオープンデータを取得して同じ形式へ正規化して返す。
 */
export async function GET(): Promise<NextResponse<RegulationCollection>> {
  const { features, source } = await loadRegulations();

  const collection: RegulationCollection = {
    type: "FeatureCollection",
    generatedAt: new Date().toISOString(),
    source,
    features,
  };

  return NextResponse.json(collection, {
    headers: { "Cache-Control": "no-store" },
  });
}
