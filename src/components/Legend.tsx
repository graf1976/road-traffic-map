interface LegendItem {
  color: string;
  label: string;
}

/** 渋滞状況の色（Google のリアルタイム情報）。常に表示する。 */
const TRAFFIC_ITEMS: ReadonlyArray<LegendItem> = [
  { color: "#34a853", label: "順調" },
  { color: "#fbbc04", label: "混雑" },
  { color: "#ea4335", label: "渋滞" },
];

/** 通行止め・規制の黒線。実際に描かれているときだけ載せる。 */
const REGULATION_ITEM: LegendItem = {
  color: "#000000",
  label: "通行止め・規制",
};

interface LegendProps {
  /**
   * 地図に規制の黒線を描いているか。
   * 描いていないのに凡例へ載せると、情報があるように見えてしまうため分ける。
   */
  hasRegulations?: boolean;
}

/** 地図上に重ねて表示する凡例。 */
export function Legend({ hasRegulations = false }: LegendProps) {
  const items = hasRegulations
    ? [...TRAFFIC_ITEMS, REGULATION_ITEM]
    : TRAFFIC_ITEMS;

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg bg-white/95 px-3 py-2 shadow-md ring-1 ring-slate-200 lg:bottom-3 lg:top-auto">
      <p className="mb-1 text-[11px] font-bold text-slate-700 sm:text-xs">凡例</p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 sm:block sm:space-y-1">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-1.5 text-[11px] text-slate-700 sm:text-xs"
          >
            <span
              aria-hidden
              className="inline-block h-1 w-5 rounded-full sm:w-6"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
