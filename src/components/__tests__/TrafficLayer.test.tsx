// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TrafficLayer } from "@/components/TrafficLayer";

const state = vi.hoisted(() => ({
  map: { id: "map" } as object | null,
  setMap: vi.fn(),
  constructorArgs: [] as unknown[],
  library: null as { TrafficLayer: new (options?: unknown) => object } | null,
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  useMap: () => state.map,
  useMapsLibrary: () => state.library,
}));

beforeEach(() => {
  state.map = { id: "map" };
  state.setMap = vi.fn();
  state.constructorArgs = [];
  state.library = {
    TrafficLayer: class {
      constructor(options?: unknown) {
        state.constructorArgs.push(options);
      }
      setMap = state.setMap;
    },
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("TrafficLayer", () => {
  it("地図に交通状況レイヤーを重ねる", () => {
    render(<TrafficLayer />);

    expect(state.constructorArgs).toEqual([{ autoRefresh: true }]);
    expect(state.setMap).toHaveBeenCalledWith(state.map);
  });

  it("アンマウント時にレイヤーを取り外す", () => {
    const { unmount } = render(<TrafficLayer />);
    unmount();

    expect(state.setMap).toHaveBeenLastCalledWith(null);
  });

  it("refreshKey が変わるとレイヤーを作り直して渋滞状況を取り直す", () => {
    const { rerender } = render(<TrafficLayer refreshKey={1} />);
    expect(state.constructorArgs).toHaveLength(1);

    rerender(<TrafficLayer refreshKey={2} />);

    // 古いレイヤーを外し、新しいレイヤーを作って地図に載せ直す。
    expect(state.constructorArgs).toHaveLength(2);
    expect(state.setMap).toHaveBeenCalledWith(null);
    expect(state.setMap).toHaveBeenLastCalledWith(state.map);
  });

  it("refreshKey が同じなら作り直さない", () => {
    const { rerender } = render(<TrafficLayer refreshKey={1} />);
    rerender(<TrafficLayer refreshKey={1} />);

    expect(state.constructorArgs).toHaveLength(1);
  });

  it("地図やライブラリが未準備なら何もしない", () => {
    state.map = null;
    render(<TrafficLayer />);

    expect(state.setMap).not.toHaveBeenCalled();
  });
});
