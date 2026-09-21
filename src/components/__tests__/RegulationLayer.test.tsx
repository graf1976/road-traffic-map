// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RegulationLayer } from "@/components/RegulationLayer";
import type { RegulationFeature, RegulationStatus } from "@/types/regulation";

/** Polyline に渡された props を記録するためのモック。 */
const { polylineProps } = vi.hoisted(() => ({
  polylineProps: [] as Record<string, unknown>[],
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  Polyline: (props: Record<string, unknown>) => {
    polylineProps.push(props);
    return null;
  },
}));

function makeFeature(
  id: string,
  status: RegulationStatus = "closed",
): RegulationFeature {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.0, 35.0],
        [139.5, 35.5],
        [140.0, 36.0],
      ],
    },
    properties: {
      id,
      roadName: "テスト道路",
      section: "A〜B",
      status,
      description: "説明",
      link: "https://example.com",
      updatedAt: "2026-09-21T00:00:00Z",
    },
  };
}

/** Google Maps のクリックイベントを模したオブジェクト。 */
function mapMouseEvent(lat: number, lng: number) {
  return { latLng: { toJSON: () => ({ lat, lng }) } };
}

beforeEach(() => {
  polylineProps.length = 0;
});

afterEach(() => {
  cleanup();
});

describe("RegulationLayer", () => {
  it("1 件につき縁取りと本線の 2 本を描画する", () => {
    render(
      <RegulationLayer
        features={[makeFeature("a"), makeFeature("b")]}
        activeId={null}
        onHover={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(polylineProps).toHaveLength(4);
    expect(polylineProps[0].clickable).toBe(false);
    expect(polylineProps[0].strokeColor).toBe("#ffffff");
    expect(polylineProps[1].clickable).toBe(true);
    expect(polylineProps[1].strokeColor).toBe("#000000");
  });

  it("GeoJSON の [経度, 緯度] を地図用の座標へ変換して渡す", () => {
    render(
      <RegulationLayer
        features={[makeFeature("a")]}
        activeId={null}
        onHover={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(polylineProps[1].path).toEqual([
      { lat: 35.0, lng: 139.0 },
      { lat: 35.5, lng: 139.5 },
      { lat: 36.0, lng: 140.0 },
    ]);
  });

  it("選択中の規制は線を太く描画する", () => {
    render(
      <RegulationLayer
        features={[makeFeature("a")]}
        activeId="a"
        onHover={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    const activeWeight = polylineProps[1].strokeWeight;

    cleanup();
    polylineProps.length = 0;

    render(
      <RegulationLayer
        features={[makeFeature("a")]}
        activeId={null}
        onHover={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(activeWeight).toBeGreaterThan(Number(polylineProps[1].strokeWeight));
  });

  it("ホバーすると座標付きで onHover に通知する", () => {
    const onHover = vi.fn();
    render(
      <RegulationLayer
        features={[makeFeature("a")]}
        activeId={null}
        onHover={onHover}
        onSelect={vi.fn()}
      />,
    );

    const onMouseOver = polylineProps[1].onMouseOver as (event: unknown) => void;
    onMouseOver(mapMouseEvent(35.4, 139.4));

    expect(onHover).toHaveBeenCalledWith({
      featureId: "a",
      position: { lat: 35.4, lng: 139.4 },
    });
  });

  it("ホバーが外れると null を通知する", () => {
    const onHover = vi.fn();
    render(
      <RegulationLayer
        features={[makeFeature("a")]}
        activeId={null}
        onHover={onHover}
        onSelect={vi.fn()}
      />,
    );

    (polylineProps[1].onMouseOut as () => void)();

    expect(onHover).toHaveBeenCalledWith(null);
  });

  it("クリックすると onSelect に通知する", () => {
    const onSelect = vi.fn();
    render(
      <RegulationLayer
        features={[makeFeature("a")]}
        activeId={null}
        onHover={vi.fn()}
        onSelect={onSelect}
      />,
    );

    const onClick = polylineProps[1].onClick as (event: unknown) => void;
    onClick(mapMouseEvent(35.1, 139.1));

    expect(onSelect).toHaveBeenCalledWith({
      featureId: "a",
      position: { lat: 35.1, lng: 139.1 },
    });
  });

  it("座標を取得できないイベントでは区間の中間点を使う", () => {
    const onSelect = vi.fn();
    render(
      <RegulationLayer
        features={[makeFeature("a")]}
        activeId={null}
        onHover={vi.fn()}
        onSelect={onSelect}
      />,
    );

    (polylineProps[1].onClick as (event: unknown) => void)({ latLng: null });

    expect(onSelect).toHaveBeenCalledWith({
      featureId: "a",
      position: { lat: 35.5, lng: 139.5 },
    });
  });
});
