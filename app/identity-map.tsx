"use client";

import type { CSSProperties } from "react";

export type IdentityContribution = {
  id?: number;
  currentPhrase?: string;
  futurePhrase?: string;
  commitment?: string;
  closeness: number;
  shared?: boolean;
  updatedAt?: string;
};

function flowingText(text: string | undefined, fallback: string) {
  const value = text?.trim() || fallback;
  return `${value}   ·   ${value}`;
}

export function IdentityMap({ contribution, compact = false }: { contribution: IdentityContribution; compact?: boolean }) {
  const closeness = Math.max(0, Math.min(100, contribution.closeness));
  const style = {
    "--current-top": `${66 - closeness * 0.28}%`,
    "--future-top": `${14 + closeness * 0.3}%`,
    "--camera-current-top": `${66 - closeness * 0.25}%`,
    "--camera-future-top": `${16 + closeness * 0.28}%`,
  } as CSSProperties;
  return (
    <article className={`living-map ${compact ? "compact-map" : ""}`} style={style} aria-label="מפת הזהות שלי">
      <div className="map-haze" aria-hidden="true" />
      <div className="word-wave current-wave"><div className="wave-track"><span>{flowingText(contribution.currentPhrase, "מי שאני עכשיו")}</span><span aria-hidden="true">{flowingText(contribution.currentPhrase, "מי שאני עכשיו")}</span></div></div>
      <div className="word-wave future-wave"><div className="wave-track"><span>{flowingText(contribution.futurePhrase, "מי שאני בוחרת לקרב")}</span><span aria-hidden="true">{flowingText(contribution.futurePhrase, "מי שאני בוחרת לקרב")}</span></div></div>
      <div className="commitment-point"><i /><strong>{contribution.commitment || "הנקודה שאני בוחרת להניח בזמן"}</strong></div>
      <div className="map-key" aria-hidden="true"><span>עכשיו</span><span>אני מקרבת</span></div>
    </article>
  );
}
