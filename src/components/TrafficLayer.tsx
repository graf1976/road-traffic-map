"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

/**
 * Google Maps 標準の交通状況レイヤー（緑=順調／オレンジ=混雑／赤=渋滞）を地図に重ねる。
 * 描画のみを行うため DOM は出力しない。
 */
export function TrafficLayer(): null {
  const map = useMap();
  const mapsLibrary = useMapsLibrary("maps");

  useEffect(() => {
    if (!map || !mapsLibrary) return;

    const trafficLayer = new mapsLibrary.TrafficLayer({ autoRefresh: true });
    trafficLayer.setMap(map);

    return () => {
      trafficLayer.setMap(null);
    };
  }, [map, mapsLibrary]);

  return null;
}
