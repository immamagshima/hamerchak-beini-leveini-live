"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { evidenceParticipants } from "../evidence-participants";
import { EvidenceStage, initialEvidenceState, type EvidenceLiveState } from "../evidence-stage";

type LessonPhase = "evidence" | "personal" | "invitation";

const EVIDENCE_KEY = "identity-evidence-live-state";
const LIVE_ROOM = "first-cohort-aug11";
const LIVE_ROOM_KEY = "identity-live-room";

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function FacilitatorStudio() {
  const [phase, setPhase] = useState<LessonPhase>("evidence");
  const [state, setState] = useState<EvidenceLiveState>(initialEvidenceState);
  const [done, setDone] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(180);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState("");
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [origin, setOrigin] = useState("");
  const [liveRoom, setLiveRoom] = useState(LIVE_ROOM);
  const [liveCount, setLiveCount] = useState(0);
  const [wallRefresh, setWallRefresh] = useState(0);
  const [resetArmed, setResetArmed] = useState(false);
  const [mapNotice, setMapNotice] = useState("");
  const [mapBusy, setMapBusy] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const invitationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOrigin(location.origin);
    const savedRoom = localStorage.getItem(LIVE_ROOM_KEY);
    if (savedRoom) setLiveRoom(savedRoom);
    try {
      const saved = JSON.parse(localStorage.getItem(EVIDENCE_KEY) || "null");
      if (saved?.state) {
        const journey = Number(saved.state.newCloseness ?? saved.state.oldDistance ?? 50);
        setState({ ...initialEvidenceState, ...saved.state, oldDistance: journey, newCloseness: journey });
      }
      if (Array.isArray(saved?.done)) setDone(saved.done);
    } catch {}
    channelRef.current = "BroadcastChannel" in window ? new BroadcastChannel("identity-evidence-live") : null;
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    const payload = { state, done, at: Date.now() };
    try { localStorage.setItem(EVIDENCE_KEY, JSON.stringify(payload)); } catch {}
    channelRef.current?.postMessage(payload);
  }, [state, done]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const refreshLiveCount = useCallback(async () => {
    try {
      const response = await fetch(`/api/tiles?room=${liveRoom}`, { cache: "no-store" });
      const data = await response.json() as { tiles?: Array<{ shared?: boolean }> };
      if (response.ok) setLiveCount((data.tiles || []).filter((tile) => tile.shared).length);
    } catch {}
  }, [liveRoom]);

  useEffect(() => {
    refreshLiveCount();
    const timer = window.setInterval(refreshLiveCount, 1500);
    return () => window.clearInterval(timer);
  }, [refreshLiveCount]);

  const participant = evidenceParticipants[state.index] || evidenceParticipants[0];
  const participantUrl = origin ? `${origin}/?room=${liveRoom}` : `/?room=${liveRoom}`;
  const wallUrl = origin ? `${origin}/wall?room=${liveRoom}` : `/wall?room=${liveRoom}`;
  const remaining = useMemo(() => evidenceParticipants.length - done.length, [done]);

  function update(patch: Partial<EvidenceLiveState>) {
    setState((value) => ({ ...value, ...patch }));
  }

  function updateJourney(value: number) {
    update({ oldDistance: value, newCloseness: value });
  }

  function select(index: number) {
    setState({ ...initialEvidenceState, index });
    setSeconds(180);
    setRunning(false);
  }

  function completeAndNext() {
    setDone((values) => values.includes(state.index) ? values : [...values, state.index]);
    const next = evidenceParticipants.findIndex((_, index) => index > state.index && !done.includes(index));
    select(next >= 0 ? next : Math.min(state.index + 1, evidenceParticipants.length - 1));
  }

  function copy(text: string, kind: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(kind); window.setTimeout(() => setCopied(""), 1600); });
  }

  async function collectNow() {
    setMapBusy(true);
    setMapNotice("");
    await refreshLiveCount();
    setWallRefresh((value) => value + 1);
    setMapNotice("המפה רועננה. כל מי שכבר העלתה קול נמצאת עכשיו בשדה.");
    setMapBusy(false);
  }

  async function resetLiveMap() {
    if (!resetArmed) {
      setResetArmed(true);
      setMapNotice("האיפוס יפתח חדר חדש ונקי. הנקודות הקודמות יישמרו בחדר הישן. לחצי שוב כדי לאשר.");
      return;
    }
    setMapBusy(true);
    const nextRoom = `first-cohort-${Date.now().toString(36)}`;
    localStorage.setItem(LIVE_ROOM_KEY, nextRoom);
    setLiveRoom(nextRoom);
    setLiveCount(0);
    setWallRefresh((value) => value + 1);
    setResetArmed(false);
    setMapNotice("נפתח חדר חדש ונקי. העתיקי מכאן את הקישור החדש למשתתפות. הקליטה החיה כבר פעילה.");
    setMapBusy(false);
  }

  return (
    <main className="facilitator-studio">
      <header className="lesson-header">
        <div><span>להיות אני</span><strong>המרחק ביני לביני</strong><small>מהלך מפגש האינטגרציה</small></div>
        <nav aria-label="שלושת חלקי המפגש">
          <button className={phase === "evidence" ? "active" : ""} onClick={() => setPhase("evidence")}><b>01</b> עדות הזהויות</button>
          <button className={phase === "personal" ? "active" : ""} onClick={() => setPhase("personal")}><b>02</b> החוויה האישית</button>
          <button className={phase === "invitation" ? "active" : ""} onClick={() => setPhase("invitation")}><b>03</b> נחיתה והמשך</button>
        </nav>
        <div className="wall-brand-signature">קרן בן עמי | אמא מגשימה</div>
      </header>

      {phase === "evidence" && <section className="lesson-evidence-layout">
        <EvidenceStage participant={participant} state={state} onImage={(src, label) => setLightbox({ src, label })} />
        <aside className="evidence-controller" aria-label="שליטה בעדות הזהויות">
          <div className="controller-summary"><strong>{done.length} מתוך {evidenceParticipants.length} הושלמו</strong><span>{remaining} נשארו</span></div>
          <div className="evidence-timer"><output>{formatTime(seconds)}</output><div><button onClick={() => setRunning((value) => !value)}>{running ? "השהיה" : seconds === 180 ? "התחלה" : "המשך"}</button><button onClick={() => { setSeconds(180); setRunning(false); }}>איפוס</button><button onClick={() => setSeconds((value) => value + 60)}>דקה +</button></div></div>
          <div className="reveal-controls"><button className={state.showOld ? "active" : ""} onClick={() => update({ showOld: !state.showOld })}>זהות ישנה</button><button className={state.showNew ? "active" : ""} onClick={() => update({ showNew: !state.showNew })}>זהות חדשה</button></div>
          <label className="facilitator-range journey-range"><span>איפה היא נמצאת היום בתנועה ביניהן? <output>{state.newCloseness} / 100</output></span><input type="range" min="0" max="100" value={state.newCloseness} onChange={(event) => updateJourney(Number(event.target.value))} /><small><b>עוד קרובה לישנה</b><b>קרובה לחדשה</b></small></label>
          <label className="facilitator-statement"><span>המשפט שנשאר</span><input value={state.statement} maxLength={110} onChange={(event) => update({ statement: event.target.value })} placeholder="אפשר גם בלי משפט" /></label>
          <div className="controller-actions"><button className="primary" onClick={completeAndNext}>הושלם, לבאה</button><button onClick={() => select(Math.max(0, state.index - 1))}>הקודמת</button><button onClick={() => window.open("/evidence", "identityEvidenceStage")}>פתחי מסך הקרנה נקי</button></div>
          <div className="people-strip" aria-label="רשימת המשתתפות">{evidenceParticipants.map((person, index) => <button key={person.name} className={`${index === state.index ? "active" : ""} ${done.includes(index) ? "done" : ""}`} onClick={() => select(index)}><i />{person.name}</button>)}</div>
        </aside>
      </section>}

      {phase === "personal" && <section className="lesson-personal-stage">
        <div className="lesson-copy"><span>חלק שני</span><h1>עכשיו כל אחת פוגשת<br />את מי שהיא היום.</h1><p>הקול שלה עולה לשדה המשותף ללא שם. המפה קולטת קולות חדשים אוטומטית, בתוך עד שתי שניות.</p><div className="live-operations"><div className="live-status"><i /><span>קליטה חיה פעילה</span><strong>{liveCount} קולות בשדה</strong></div><p>אפשר להתחיל את חמש דקות השידור. מי שתצטרף תוך כדי תופיע לבד.</p><small>חדר פעיל: {liveRoom}</small><div><button className="primary" disabled={mapBusy} onClick={collectNow}>{mapBusy ? "רגע..." : "קלטי עכשיו את כולן"}</button><button className={resetArmed ? "danger armed" : "danger"} disabled={mapBusy} onClick={resetLiveMap}>{resetArmed ? "אישור סופי, פתחי חדר נקי" : "אפסי לפתיחת המפגש"}</button></div>{mapNotice && <output>{mapNotice}</output>}</div><div className="lesson-link"><code>{participantUrl}</code><button onClick={() => copy(participantUrl, "participant")}>{copied === "participant" ? "הועתק" : "העתיקי קישור חדש למשתתפות"}</button></div><div className="lesson-buttons"><button className="primary" onClick={() => window.open(participantUrl, "participantExperience")}>פתחי חוויית משתתפת</button><button onClick={() => window.open(wallUrl, "collectiveMap")}>פתחי את המפה להקרנה</button></div></div>
        <div className="wall-window"><iframe key={wallRefresh} title="המפה הקבוצתית החיה" src={wallUrl} /></div>
      </section>}

      {phase === "invitation" && <section className="invitation-stage" ref={invitationRef}>
        <span>התרגיל נסגר כאן. עכשיו נפתח פרק חדש.</span>
        <h1>מה שהתקרב היום<br />יכול לקבל מקום אמיתי.</h1>
        <p>מחזור 2 מתחיל ב-15 בספטמבר.</p>
        <div className="invitation-card"><strong>אתן מוזמנות לעבור איתי את התוכנית כמלוות.</strong><span>את ימי רביעי נשמור לאינטגרציה וליווי ה-VIP.</span></div>
        <small>הזמנה, לא התחייבות. כל אחת בוחרת את הקצב ואת הדרך שלה.</small>
        <div className="invitation-actions"><button className="primary" onClick={() => invitationRef.current?.requestFullscreen?.()}>הציגי במסך מלא</button><button onClick={() => window.open(wallUrl, "collectiveMap")}>חזרה למפה החיה</button></div>
      </section>}

      {lightbox && <div className="evidence-lightbox" role="dialog" aria-modal="true" aria-label={lightbox.label} onClick={() => setLightbox(null)}><button onClick={() => setLightbox(null)}>סגרי</button><img src={lightbox.src} alt={lightbox.label} /></div>}
      <footer className="lesson-footer">כל הזכויות שמורות © 2026, קרן בן עמי, אמא מגשימה</footer>
    </main>
  );
}
