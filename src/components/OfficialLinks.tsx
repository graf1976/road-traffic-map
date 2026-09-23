"use client";

import { NATIONWIDE_LINKS, findRegion } from "@/lib/official-links";
import type { LatLng } from "@/types/regulation";

interface OfficialLinksProps {
  /** 地図が写している位置。地方の判定に使う。 */
  center: LatLng | null;
}

function ExternalLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {label}
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">（新しいタブで開きます）</span>
    </a>
  );
}

/**
 * 表示中の地域に応じた、公式の道路情報サイトへの案内。
 *
 * このアプリは規制情報を転載していないため、最新で正確な通行止め・規制は
 * 管理者が公開している公式サイトで確認してもらう。
 */
export function OfficialLinks({ center }: OfficialLinksProps) {
  const region = findRegion(center);

  return (
    <section
      aria-label="公式の道路情報"
      className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3"
    >
      <h2 className="text-xs font-bold text-slate-700">
        {region
          ? `${region.name}の規制情報を公式サイトで見る`
          : "規制情報を公式サイトで見る"}
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        最新の通行止め・規制は、道路を管理している機関の公式サイトでご確認ください。
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {region?.links.map((link) => (
          <ExternalLink key={link.url} label={link.label} url={link.url} />
        ))}
        {NATIONWIDE_LINKS.map((link) => (
          <ExternalLink key={link.url} label={link.label} url={link.url} />
        ))}
      </div>
    </section>
  );
}
