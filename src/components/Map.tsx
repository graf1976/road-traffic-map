"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  APILoadingStatus,
  APIProvider,
  AdvancedMarker,
  ColorScheme,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useApiLoadingStatus,
  useMap,
  type MapEvent,
} from "@vis.gl/react-google-maps";

import { RegulationInfoContent } from "@/components/RegulationInfoContent";
import {
  RegulationLayer,
  type RegulationHit,
} from "@/components/RegulationLayer";
import { TrafficLayer } from "@/components/TrafficLayer";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  hasGoogleMapsApiKey,
} from "@/lib/env";
import type {
  LatLng,
  MapBounds,
  RegulationFeature,
  RegulationSelection,
} from "@/types/regulation";

/** 地図の初期表示位置（東京）。 */
export const DEFAULT_CENTER: LatLng = { lat: 35.6812, lng: 139.7671 };
export const DEFAULT_ZOOM = 9;

/** 地図の中心を移動させる指示。requestedAt により同じ座標でも再実行できる。 */
export interface MapFocus {
  lat: number;
  lng: number;
  zoom: number;
  requestedAt: number;
}

interface RoadMapProps {
  features: RegulationFeature[];
  /** 表示中の InfoWindow（親コンポーネントが保持する）。 */
  selection: RegulationSelection | null;
  onHover: (hit: RegulationHit | null) => void;
  onSelect: (hit: RegulationHit) => void;
  onCloseInfoWindow: () => void;
  focus: MapFocus | null;
  /** 現在地（取得済みの場合のみピンを表示する）。 */
  userPosition: LatLng | null;
  /** 地図の移動・拡大縮小が落ち着いたときに、表示範囲を知らせる。 */
  onBoundsChange?: (bounds: MapBounds) => void;
}

/** focus が更新されたら地図の中心とズームを移動する。 */
function MapFocusController({ focus }: { focus: MapFocus | null }) {
  const map = useMap();
  const appliedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !focus || appliedAt.current === focus.requestedAt) return;

    appliedAt.current = focus.requestedAt;
    map.panTo({ lat: focus.lat, lng: focus.lng });
    map.setZoom(focus.zoom);
  }, [map, focus]);

  return null;
}

/** API キーが無効な場合などにエラーを表示する。 */
function ApiStatusOverlay() {
  const status = useApiLoadingStatus();

  if (
    status !== APILoadingStatus.FAILED &&
    status !== APILoadingStatus.AUTH_FAILURE
  ) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 p-6 text-center">
      <div className="max-w-md rounded-lg bg-white p-5 text-sm text-slate-700 shadow-lg">
        <p className="font-bold text-slate-900">
          Google Maps を読み込めませんでした
        </p>
        <p className="mt-2 leading-relaxed">
          API キーが正しいか、Maps JavaScript API が有効化されているか、
          リファラー制限の設定をご確認ください。
        </p>
      </div>
    </div>
  );
}

/** APIキー未設定時の案内表示。 */
function MissingApiKeyNotice() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md rounded-lg border border-slate-300 bg-white p-6 text-sm text-slate-700 shadow-sm">
        <p className="font-bold text-slate-900">
          Google Maps API キーが設定されていません
        </p>
        <p className="mt-2 leading-relaxed">
          プロジェクト直下の <code>.env.local</code> に
          <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>
          を設定し、開発サーバーを再起動してください。詳しくは README.md をご覧ください。
        </p>
      </div>
    </div>
  );
}

/**
 * 渋滞（Traffic Layer）と通行止め・規制情報（GeoJSON）を重ねた地図。
 * InfoWindow の表示対象は親から渡される selection で決まる。
 */
export function RoadMap({
  features,
  selection,
  onHover,
  onSelect,
  onCloseInfoWindow,
  focus,
  userPosition,
  onBoundsChange,
}: RoadMapProps) {
  const selectedFeature = useMemo(
    () =>
      selection
        ? (features.find((item) => item.properties.id === selection.featureId) ??
          null)
        : null,
    [features, selection],
  );

  const handleMapClick = useCallback(() => {
    onCloseInfoWindow();
  }, [onCloseInfoWindow]);

  // 移動中は何度も発火させず、操作が落ち着いた時点の範囲だけを伝える。
  const handleIdle = useCallback(
    (event: MapEvent) => {
      const bounds = event.map.getBounds()?.toJSON();
      if (bounds) onBoundsChange?.(bounds);
    },
    [onBoundsChange],
  );

  if (!hasGoogleMapsApiKey) {
    return <MissingApiKeyNotice />;
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="ja" region="JP">
      <div className="relative h-full w-full">
        <GoogleMap
          className="h-full w-full"
          mapId={GOOGLE_MAPS_MAP_ID}
          colorScheme={ColorScheme.LIGHT}
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          fullscreenControl={false}
          mapTypeControl={false}
          streetViewControl={false}
          onClick={handleMapClick}
          onIdle={handleIdle}
        >
          <TrafficLayer />
          <RegulationLayer
            features={features}
            activeId={selection?.featureId ?? null}
            onHover={onHover}
            onSelect={onSelect}
          />
          <MapFocusController focus={focus} />

          {userPosition && (
            <AdvancedMarker position={userPosition} title="現在地">
              <Pin
                background="#2563eb"
                borderColor="#1d4ed8"
                glyphColor="#ffffff"
              />
            </AdvancedMarker>
          )}

          {selection && selectedFeature && (
            <InfoWindow
              position={selection.position}
              onCloseClick={onCloseInfoWindow}
              shouldFocus={false}
            >
              <RegulationInfoContent feature={selectedFeature} />
            </InfoWindow>
          )}
        </GoogleMap>
        <ApiStatusOverlay />
      </div>
    </APIProvider>
  );
}
