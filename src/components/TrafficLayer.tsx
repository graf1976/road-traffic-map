"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

interface TrafficLayerProps {
  /**
   * 値が変わるとレイヤーを作り直し、渋滞状況を取り直す。
   * 「今すぐ更新」を押したときに、道路の色もその場で新しくするために使う。
   */
  refreshKey?: number;
}

/**
 * Google Maps 標準の交通状況レイヤー（緑=順調／オレンジ=混雑／赤=渋滞）を地図に重ねる。
 * 描画のみを行うため DOM は出力しない。
 */
export function TrafficLayer({ refreshKey = 0 }: TrafficLayerProps): null {
  const map = useMap();
  const mapsLibrary = useMapsLibrary("maps");

  useEffect(() => {
    if (!map || !mapsLibrary) return;

    const trafficLayer = new mapsLibrary.TrafficLayer({ autoRefresh: true });
    trafficLayer.setMap(map);

    return () => {
      trafficLayer.setMap(null);
    };
    // refreshKey が変わったら作り直す（＝渋滞状況を取り直す）。
  }, [map, mapsLibrary, refreshKey]);

  return null;
}
