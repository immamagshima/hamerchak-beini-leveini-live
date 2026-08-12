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
            <span className="evidence-image-viewport"><img src={participant.oldImage} alt={`הזהות הישנה של ${participant.name}`} /><span className="image-open-cue">פתיחה מלאה</span></span>
          </button>
          <figcaption><b>הזהות הישנה</b><span>{state.oldDistance} / 100, כמה היא כבר מנהלת פחות</span></figcaption>
        </figure>
        <div className="identity-bridge" aria-hidden="true"><i /><span>מכאן</span><em>אליי</em></div>
        <figure className={`evidence-image-card new-evidence ${participant.split ? "split-new" : ""} ${state.showNew ? "is-visible" : ""}`}>
          <button type="button" onClick={() => onImage?.(participant.newImage, `${participant.name}, הזהות החדשה`)} aria-label={`פתחי את תמונת הזהות החדשה של ${participant.name}`}>
            <span className="evidence-image-viewport"><img src={participant.newImage} alt={`הזהות החדשה של ${participant.name}`} /><span className="image-open-cue">פתיחה מלאה</span></span>
          </button>
          <figcaption><b>הזהות החדשה</b><span>{state.newCloseness} / 100, כמה היא כבר נגישה</span></figcaption>
        </figure>
      </div>

      <div className="evidence-scale" aria-label={`התנועה מהזהות הישנה לזהות החדשה, ${state.newCloseness} מתוך 100`}>
        <span>עוד קרובה לישנה</span><div><b className="journey-marker" style={{ insetInlineStart: `${state.newCloseness}%` }} /></div><span>כבר קרובה לחדשה</span>
      </div>
      <div className="evidence-scale-readout"><span>מתרחקת מהישנה: {state.oldDistance}</span><i aria-hidden="true" /><span>מתקרבת לחדשה: {state.newCloseness}</span></div>
      {state.statement && <blockquote>״{state.statement}״</blockquote>}
    </section>
  );
}
