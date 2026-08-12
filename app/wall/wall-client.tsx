"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { IdentityContribution } from "../identity-map";

type Stage = "building" | "witness" | "landing";

function repeat(text: string) {
  return `${text}   ·   ${text}`;
}

function laneStyle(index: number, total: number) {
  const top = total <= 1 ? 44 : 12 + index * (68 / (total - 1));
  return {
    "--lane-top": `${top}%`,
    "--lane-delay": `${-((index * 1.3) % 8)}s`,
    "--lane-speed": `${22 + (index % 6) * 2}s`,
    "--lane-wave": `${8 + (index % 4) * 3}px`,
  } as CSSProperties;
}

function groupedPhrases(items: IdentityContribution[], key: "currentPhrase" | "futurePhrase") {
  const phrases = items.map((item) => item[key]?.trim()).filter(Boolean) as string[];
  const groups: string[] = [];
  for (let index = 0; index < phrases.length; index += 4) groups.push(phrases.slice(index, index + 4).join("   ·   "));
  return groups;
}

export function CollageWall() {
  const [tiles, setTiles] = useState<IdentityContribution[]>([]);
  const [stage, setStage] = useState<Stage>("building");
  const [frozen, setFrozen] = useState(false);
  const [control, setControl] = useState(false);
  const [copied, setCopied] = useState("");
  const room = "first-cohort-aug11";

  useEffect(() => { setControl(new URLSearchParams(location.search).get("control") === "1"); }, []);

  const refresh = useCallback(async () => {
    if (frozen) return;
    try {
      const response = await fetch(`/api/tiles?room=${room}`, { cache: "no-store" });
      const data = await response.json() as { tiles?: IdentityContribution[] };
      if (response.ok && data.tiles) setTiles(data.tiles);
    } catch {}
  }, [frozen]);

  useEffect(() => { refresh(); const timer = setInterval(refresh, 1500); return () => clearInterval(timer); }, [refresh]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key.toLowerCase() === "w") setStage("witness"); if (event.key.toLowerCase() === "l") setStage("landing"); if (event.key.toLowerCase() === "b") setStage("building"); if (event.key.toLowerCase() === "f") setFrozen((v) => !v); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);

  const shared = useMemo(() => tiles.filter((tile) => tile.shared && (tile.currentPhrase || tile.futurePhrase || tile.commitment)), [tiles]);
  const countLabel = shared.length === 1 ? "נקודה אחת הצטרפה" : `${shared.length} נקודות הצטרפו`;
  const waveLanes = useMemo(() => {
    const current = groupedPhrases(shared, "currentPhrase").map((text) => ({ kind: "current" as const, text }));
    const future = groupedPhrases(shared, "futurePhrase").map((text) => ({ kind: "future" as const, text }));
    const lanes: Array<{ kind: "current" | "future"; text: string }> = [];
    const length = Math.max(current.length, future.length);
    for (let index = 0; index < length; index += 1) {
      if (current[index]) lanes.push(current[index]);
      if (future[index]) lanes.push(future[index]);
    }
    return lanes;
  }, [shared]);
  const commitments = useMemo(() => shared.map((tile) => tile.commitment?.trim()).filter(Boolean) as string[], [shared]);

  function copyLink(kind: "participant" | "wall") {
    const url = kind === "participant" ? `${location.origin}/` : `${location.origin}/wall?room=${room}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(kind); setTimeout(() => setCopied(""), 1600); });
  }

  async function downloadMap() {
    const canvas = document.createElement("canvas"); canvas.width = 1920; canvas.height = 1080;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const image = new Image(); image.src = "/identity-map-field.png";
    await new Promise<void>((resolve) => { image.onload = () => resolve(); image.onerror = () => resolve(); });
    if (image.width) ctx.drawImage(image, 0, 0, 1920, 1080); else { ctx.fillStyle = "#f2e8da"; ctx.fillRect(0, 0, 1920, 1080); }
    ctx.fillStyle = "rgba(242,232,218,.18)"; ctx.fillRect(0, 0, 1920, 1080);
    ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.fillStyle = "#3b2b29"; ctx.font = "700 56px Arial"; ctx.fillText("המרחק ביני לביני", 960, 82);
    const words = shared.flatMap((tile) => [tile.currentPhrase, tile.futurePhrase, tile.commitment]).filter(Boolean) as string[];
    words.slice(0, 28).forEach((word, index) => { const x = 110 + ((index * 263) % 1700); const y = 190 + ((index * 151) % 720); ctx.save(); ctx.translate(x, y); ctx.rotate((((index * 13) % 18) - 9) * Math.PI / 180); ctx.fillStyle = index % 3 === 0 ? "#b65c4a" : index % 3 === 1 ? "#75556f" : "#3b2b29"; ctx.font = `${index % 4 === 0 ? 700 : 500} ${28 + (index % 5) * 6}px Arial`; ctx.fillText(word.slice(0, 42), 0, 0); ctx.restore(); });
    ctx.fillStyle = "#816f68"; ctx.font = "400 22px Arial"; ctx.fillText("מילים שנבחרו להצטרף, ללא שמות.", 960, 1008); ctx.font = "400 18px Arial"; ctx.fillText("כל הזכויות שמורות © 2026, קרן בן עמי, אמא מגשימה", 960, 1046);
    const link = document.createElement("a"); link.download = "מפת-נקודה-בזמן-המרחק-ביני-לביני.png"; link.href = canvas.toDataURL("image/png"); link.click();
  }

  return (
    <main className={`wall-shell word-map-wall stage-${stage} ${control ? "has-control" : ""}`}>
      <header className="wall-header"><div><span>להיות אני</span><strong>המרחק ביני לביני</strong><small><b>מפת נקודה בזמן</b> מילים שנבחרו להצטרף, ללא שמות.</small></div><div className="wall-count">{shared.length ? countLabel : "המפה מחכה למילה הראשונה"}</div></header>

      <section className="collective-word-map" aria-live="polite" aria-label={`מפה משותפת ובה ${shared.length} נקודות בזמן`}>
        <div className="collective-haze" />
        <div className="contribution-lanes">
          {waveLanes.map((lane, index) => <div className={`collective-lane lane-${lane.kind}`} style={laneStyle(index, waveLanes.length)} key={`${lane.kind}-${index}`}><div className="wave-track"><span>{repeat(lane.text)}</span><span aria-hidden="true">{repeat(lane.text)}</span></div></div>)}
        </div>
        {commitments.length > 0 && <div className="commitment-river" aria-label="התחייבויות שנבחרו להצטרף"><div>{[...commitments, ...commitments].map((commitment, index) => <span key={`${commitment}-${index}`}><i />{commitment}</span>)}</div></div>}
        {shared.length === 0 && <div className="empty-map"><p>עוד רגע מילה אחת תתחיל לנוע.</p><small>הווה, עתיד, התחייבות קטנה.</small></div>}
        {stage === "witness" && <div className="wall-overlay"><span>עדות משותפת</span><h1>המילים אינן מסכמות אותנו.</h1><p>הן משאירות נקודה שאפשר לחזור אליה.</p></div>}
        {stage === "landing" && <div className="wall-overlay landing-overlay"><span>נחיתה</span><h1>איזו מילה מהגל<br />את לוקחת איתך?</h1><p>אין צורך לענות בקול.</p></div>}
      </section>

      <footer className="wall-footer"><span><b className="legend-now" /> הווה נע ביין. <b className="legend-next" /> עתיד נע בזהב. <b className="legend-point" /> התחייבות נשארת כנקודה.</span><span>כל הזכויות שמורות © 2026, קרן בן עמי, אמא מגשימה</span></footer>

      {control && <aside className="wall-controls" aria-label="בקר למנחה, קרן"><div className="control-title"><strong>בקר למנחה</strong><span>{frozen ? "העדכונים עצורים" : "המפה מתעדכנת"}</span></div><p className="control-help">הבקר גלוי רק אצלך. מכאן את מחליפה את מה שהקבוצה רואה.</p><div className="control-grid"><button onClick={() => setStage("building")} className={stage === "building" ? "active" : ""}>המפה החיה</button><button onClick={() => setStage("witness")} className={stage === "witness" ? "active" : ""}>רואות יחד</button><button onClick={() => setStage("landing")} className={stage === "landing" ? "active" : ""}>שאלת סיום</button><button onClick={() => setFrozen((v) => !v)}>{frozen ? "המשיכי עדכונים" : "עצרי עדכונים"}</button><button onClick={() => document.documentElement.requestFullscreen?.()}>מסך מלא</button><button onClick={downloadMap}>הורידי את המפה</button></div><div className="link-actions"><button onClick={() => copyLink("participant")}>{copied === "participant" ? "הקישור הועתק" : "העתיקי קישור למשתתפות"}</button><button onClick={() => copyLink("wall")}>{copied === "wall" ? "הקישור הועתק" : "העתיקי קישור למסך הקבוצה"}</button></div></aside>}
    </main>
  );
}
