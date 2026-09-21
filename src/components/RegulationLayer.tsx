"use client";

import { Fragment, useCallback } from "react";
import { Polyline } from "@vis.gl/react-google-maps";

import { midpoint, toPath } from "@/lib/geo";
import type { LatLng, RegulationFeature } from "@/types/regulation";

export interface RegulationHit {
  featureId: string;
  position: LatLng;
}

interface RegulationLayerProps {
  features: RegulationFeature[];
  /** ポップアップを表示中の規制ID。線を強調するために使う。 */
  activeId: string | null;
  onHover: (hit: RegulationHit | null) => void;
  onSelect: (hit: RegulationHit) => void;
}

const REGULATION_COLOR = "#000000";
const CASING_COLOR = "#ffffff";

function eventPosition(
  event: google.maps.MapMouseEvent,
  feature: RegulationFeature,
): LatLng {
  return event.latLng?.toJSON() ?? midpoint(feature);
}

/**
 * 規制情報（GeoJSON の LineString）を地図上に黒い線として描画する。
 * ホバー／クリックで親コンポーネントに通知し、InfoWindow を表示させる。
 */
export function RegulationLayer({
  features,
  activeId,
  onHover,
  onSelect,
}: RegulationLayerProps) {
  const handleMouseOver = useCallback(
    (feature: RegulationFeature) => (event: google.maps.MapMouseEvent) => {
      onHover({
        featureId: feature.properties.id,
        position: eventPosition(event, feature),
      });
    },
    [onHover],
  );

  const handleMouseOut = useCallback(() => onHover(null), [onHover]);

  const handleClick = useCallback(
    (feature: RegulationFeature) => (event: google.maps.MapMouseEvent) => {
      onSelect({
        featureId: feature.properties.id,
        position: eventPosition(event, feature),
      });
    },
    [onSelect],
  );

  return (
    <>
      {features.map((feature) => {
        const path = toPath(feature);
        const isActive = feature.properties.id === activeId;

        return (
          <Fragment key={feature.properties.id}>
            {/* 渋滞レイヤーの上でも線が見えるように白い縁取りを敷く */}
            <Polyline
              path={path}
              clickable={false}
              strokeColor={CASING_COLOR}
              strokeOpacity={0.9}
              strokeWeight={isActive ? 12 : 9}
              zIndex={10}
            />
            <Polyline
              path={path}
              clickable
              strokeColor={REGULATION_COLOR}
              strokeOpacity={1}
              strokeWeight={isActive ? 8 : 5}
              zIndex={11}
              onMouseOver={handleMouseOver(feature)}
              onMouseOut={handleMouseOut}
              onClick={handleClick(feature)}
            />
          </Fragment>
        );
      })}
    </>
  );
}
