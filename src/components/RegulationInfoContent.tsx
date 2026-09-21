"use client";

import { STATUS_BADGE_CLASS, formatDateTime } from "@/lib/regulation-ui";
import {
  REGULATION_STATUS_LABEL,
  type RegulationFeature,
} from "@/types/regulation";

/** InfoWindow（ポップアップ）の中身。 */
export function RegulationInfoContent({
  feature,
}: {
  feature: RegulationFeature;
}) {
  const { roadName, section, status, description, link, updatedAt } =
    feature.properties;

  return (
    <div className="max-w-[17rem] text-slate-800">
      <span
        className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${STATUS_BADGE_CLASS[status]}`}
      >
        {REGULATION_STATUS_LABEL[status]}
      </span>
      <h3 className="mt-1.5 text-sm font-bold text-slate-900">{roadName}</h3>
      {section && <p className="text-xs text-slate-500">{section}</p>}
      <p className="mt-2 text-xs leading-relaxed">{description}</p>
      <p className="mt-2 text-[11px] text-slate-500">
        情報更新: {formatDateTime(updatedAt)}
      </p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          詳細を見る →
        </a>
      )}
    </div>
  );
}
