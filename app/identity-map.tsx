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

const waveOffsets = [0, -4, -8, -5, -1, 4, 8, 5, 1, -3];

export function FrequencySentence({ text, fallback, hidden = false, amplitude = 1 }: { text?: string; fallback: string; hidden?: boolean; amplitude?: number }) {
  const value = text?.trim() || fallback;
  const source = value.split(/\s+/).filter(Boolean);
  const repeats = source.length < 4 ? 2 : 1;
  const words = Array.from({ length: repeats }, () => [...source, "·"]).flat();
  return (
    <span className={`wave-segment ${text?.trim() ? "has-voice" : "placeholder-voice"}`} aria-hidden={hidden || undefined}>
      {words.map((word, index) => <b key={`${word}-${index}`} style={{ "--wave-y": `${waveOffsets[index % waveOffsets.length] * amplitude}px` } as CSSProperties}>{word}</b>)}
    </span>
  );
}

export function IdentityMap({ contribution, compact = false }: { contribution: IdentityContribution; compact?: boolean }) {
  const closeness = Math.max(0, Math.min(100, contribution.closeness));
  const style = {
    "--current-top": `${62 - closeness * 0.2}%`,
    "--future-top": `${16 + closeness * 0.14}%`,
    "--camera-current-top": `${61 - closeness * 0.18}%`,
    "--camera-future-top": `${17 + closeness * 0.14}%`,
  } as CSSProperties;
  return (
    <article className={`living-map ${compact ? "compact-map" : ""}`} style={style} aria-label="מפת הזהות שלי">
      <div className="map-haze" aria-hidden="true" />
      <div className="word-wave current-wave"><div className="wave-track"><FrequencySentence text={contribution.currentPhrase} fallback="מי שאני עכשיו" /><FrequencySentence text={contribution.currentPhrase} fallback="מי שאני עכשיו" hidden /></div></div>
      <div className="word-wave future-wave"><div className="wave-track"><FrequencySentence text={contribution.futurePhrase} fallback="מי שאני בוחרת לקרב" /><FrequencySentence text={contribution.futurePhrase} fallback="מי שאני בוחרת לקרב" hidden /></div></div>
      <div className="commitment-point"><i /><strong>{contribution.commitment || "הנקודה שאני בוחרת להניח בזמן"}</strong></div>
      <div className="map-key" aria-hidden="true"><span>עכשיו</span><span>אני מקרבת</span></div>
    </article>
  );
}
