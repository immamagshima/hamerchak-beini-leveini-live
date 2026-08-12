"use client";

import type { EvidenceParticipant } from "./evidence-participants";

export type EvidenceLiveState = {
  index: number;
  showOld: boolean;
  showNew: boolean;
  oldDistance: number;
  newCloseness: number;
  statement: string;
};

export const initialEvidenceState: EvidenceLiveState = {
  index: 0,
  showOld: true,
  showNew: true,
  oldDistance: 50,
  newCloseness: 50,
  statement: "",
};

export function EvidenceStage({ participant, state, onImage }: { participant: EvidenceParticipant; state: EvidenceLiveState; onImage?: (src: string, label: string) => void }) {
  return (
    <section className="evidence-live-stage" aria-label={`עדות הזהות של ${participant.name}`}>
      <header className="evidence-stage-header">
        <div><span>המרחק ביני לביני</span><h1>{participant.name}</h1></div>
        <small>שלוש דקות אינטגרציה</small>
      </header>

      <div className="evidence-images">
        <figure className={`evidence-image-card old-evidence ${participant.split ? "split-old" : ""} ${state.showOld ? "is-visible" : ""}`}>
          <button type="button" onClick={() => onImage?.(participant.oldImage, `${participant.name}, הזהות הישנה`)} aria-label={`פתחי את תמונת הזהות הישנה של ${participant.name}`}>
            <span className="evidence-image-viewport"><img src={participant.oldImage} alt={`הזהות הישנה של ${participant.name}`} /></span>
          </button>
          <figcaption><b>הזהות הישנה</b><span>{state.oldDistance} / 100 מרחק ממנה היום</span></figcaption>
        </figure>
        <div className="identity-bridge" aria-hidden="true"><i /><span>מכאן</span><em>אליי</em></div>
        <figure className={`evidence-image-card new-evidence ${participant.split ? "split-new" : ""} ${state.showNew ? "is-visible" : ""}`}>
          <button type="button" onClick={() => onImage?.(participant.newImage, `${participant.name}, הזהות החדשה`)} aria-label={`פתחי את תמונת הזהות החדשה של ${participant.name}`}>
            <span className="evidence-image-viewport"><img src={participant.newImage} alt={`הזהות החדשה של ${participant.name}`} /></span>
          </button>
          <figcaption><b>הזהות החדשה</b><span>{state.newCloseness} / 100 קרבה אליה היום</span></figcaption>
        </figure>
      </div>

      <div className="evidence-scale" aria-label="מפת המרחק והקרבה">
        <span>הישנה מנהלת פחות</span><div><i style={{ insetInlineStart: `${state.oldDistance}%` }} /><b style={{ insetInlineEnd: `${state.newCloseness}%` }} /></div><span>החדשה נגישה יותר</span>
      </div>
      {state.statement && <blockquote>״{state.statement}״</blockquote>}
    </section>
  );
}
