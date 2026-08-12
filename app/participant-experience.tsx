"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IdentityMap, type IdentityContribution } from "./identity-map";
import { drawAtlasPaper } from "./map-canvas";

const ROOM = "first-cohort-aug11";
const WHATSAPP_GROUP = "https://chat.whatsapp.com/Eq1u2zxmTSz3PjGoAj3Iq6";

type Draft = IdentityContribution & { shareWords: boolean };

const initial: Draft = {
  currentPhrase: "",
  futurePhrase: "",
  commitment: "",
  closeness: 48,
  shareWords: false,
};

function getClientId() {
  const key = "identity-map-client";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function drawCover(ctx: CanvasRenderingContext2D, source: CanvasImageSource, sourceWidth: number, sourceHeight: number, width: number, height: number) {
  const ratio = Math.max(width / sourceWidth, height / sourceHeight);
  const sw = width / ratio;
  const sh = height / ratio;
  ctx.drawImage(source, (sourceWidth - sw) / 2, (sourceHeight - sh) / 2, sw, sh, 0, 0, width, height);
}

function drawWave(ctx: CanvasRenderingContext2D, text: string, y: number, amplitude: number, color: string, stroke: string, width: number) {
  const words = (text.trim() || "בלי מילים").split(/\s+/);
  ctx.font = '700 38px "Polin", Arial';
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  for (let x = -40, i = 0; x < width + 100; i += 1) {
    const word = words[i % words.length];
    const wordWidth = ctx.measureText(word).width + 40;
    const waveY = y + Math.sin((x / width) * Math.PI * 4) * amplitude;
    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.strokeText(word, x, waveY);
    ctx.fillText(word, x, waveY);
    x += wordWidth;
  }
}

export function ParticipantExperience() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initial);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedUrl, setCapturedUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [room, setRoom] = useState(ROOM);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setRoom(new URLSearchParams(window.location.search).get("room") || ROOM);
    try {
      const saved = localStorage.getItem("identity-map-draft");
      if (saved) setDraft({ ...initial, ...JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("identity-map-draft", JSON.stringify(draft)); } catch {}
  }, [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [step]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  useEffect(() => {
    if (!cameraOn || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => setCameraError("המצלמה קיבלה רשות, אבל התצוגה נעצרה. לחצי שוב על פתיחת המצלמה."));
  }, [cameraOn]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((old) => ({ ...old, [key]: value }));
  const contribution = useMemo(() => draft as IdentityContribution, [draft]);

  async function submit(shareWords: boolean) {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/tiles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, shareWords, room, clientId: getClientId() }),
      });
      if (!response.ok) throw new Error("המפה עדיין לא עברה");
      setSent(true);
      setStep(4);
    } catch {
      setError("החיבור נעצר לרגע. המפה נשמרה כאן, ואפשר לנסות שוב.");
    } finally {
      setSending(false);
    }
  }

  async function startCamera() {
    setCameraError("");
    setCameraReady(false);
    setOpeningCamera(true);
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("camera-unavailable");
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1350 } },
          audio: false,
        });
      } catch (firstError) {
        if (firstError instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(firstError.name)) throw firstError;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      setCameraOn(true);
    } catch (cameraFailure) {
      const denied = cameraFailure instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(cameraFailure.name);
      setCameraError(denied
        ? "הדפדפן חסם את המצלמה. אשרי גישה למצלמה בשורת הכתובת ואז לחצי שוב."
        : "המצלמה אינה זמינה בדפדפן הזה כרגע. אפשר ליצור ולשמור את נקודת הזמן גם בלעדיה.");
      setCameraOn(false);
    } finally {
      setOpeningCamera(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
    setCameraReady(false);
  }

  async function capturePoint() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (cameraOn && videoRef.current?.videoWidth) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      drawCover(ctx, videoRef.current, videoRef.current.videoWidth, videoRef.current.videoHeight, canvas.width, canvas.height);
      ctx.restore();
    } else drawAtlasPaper(ctx, canvas.width, canvas.height);

    const hasPhoto = Boolean(cameraOn && videoRef.current?.videoWidth);
    const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
    shade.addColorStop(0, hasPhoto ? "rgba(42,31,29,.3)" : "rgba(255,253,248,.1)");
    shade.addColorStop(.46, hasPhoto ? "rgba(242,232,218,.04)" : "rgba(255,253,248,0)");
    shade.addColorStop(1, hasPhoto ? "rgba(42,31,29,.64)" : "rgba(236,224,209,.34)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await Promise.all([
      document.fonts.load('600 40px "Barlev"'),
      document.fonts.load('700 40px "Polin"'),
      document.fonts.load('700 20px "NotoBrand"'),
    ]).catch(() => undefined);
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = hasPhoto ? "#fffaf1" : "#352e2b";
    ctx.font = '600 44px "Barlev", Arial';
    ctx.fillText("המרחק ביני לביני", 540, 72);
    ctx.font = '400 22px "Polin", Arial';
    ctx.fillText("נקודה בזמן", 540, 112);
    drawWave(ctx, draft.currentPhrase || "מי שאני עכשיו", 430, 34, hasPhoto ? "rgba(255,250,243,.98)" : "#684b59", hasPhoto ? "rgba(42,31,29,.7)" : "rgba(255,253,248,.95)", canvas.width);
    drawWave(ctx, draft.futurePhrase || "מי שאני בוחרת לקרב", 720, 46, hasPhoto ? "#ffe0a6" : "#a45f3e", hasPhoto ? "rgba(42,31,29,.72)" : "rgba(255,253,248,.95)", canvas.width);
    ctx.fillStyle = "rgba(182,92,74,.96)";
    ctx.beginPath(); ctx.arc(540, 930, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hasPhoto ? "#fffaf1" : "#352e2b";
    ctx.font = '700 40px "Polin", Arial';
    const commitment = (draft.commitment || "התחייבות קטנה אחת").slice(0, 54);
    ctx.fillText(commitment, 540, 1000);
    ctx.font = '400 20px "Polin", Arial';
    ctx.fillText("הדימוי הוא עדות לרגע שבחרתי, לא הגדרה של מי שאני.", 540, 1260);
    ctx.font = '700 18px "NotoBrand", Arial';
    ctx.fillText("כל הזכויות שמורות © 2026, קרן בן עמי, אמא מגשימה", 540, 1310);
    setCapturedUrl(canvas.toDataURL("image/png"));
  }

  function downloadCapture() {
    if (!capturedUrl) return;
    const link = document.createElement("a");
    link.download = "נקודה-בזמן-המרחק-ביני-לביני.png";
    link.href = capturedUrl;
    link.click();
  }

  async function shareCapture() {
    if (!capturedUrl) return;
    const blob = await (await fetch(capturedUrl)).blob();
    const file = new File([blob], "נקודה-בזמן.png", { type: "image/png" });
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({ files: [file], title: "המרחק ביני לביני", text: "נקודה בזמן, קבוצת הווטסאפ של הכשרת המלוות" });
        setNotice("חלון השיתוף נפתח. בחרי את קבוצת הווטסאפ של ההכשרה.");
        return;
      } catch {}
    }
    downloadCapture();
    setNotice("התמונה נשמרה בנייד. עכשיו אפשר לפתוח את קבוצת הווטסאפ ולצרף אותה משם.");
  }

  const reflection = draft.commitment
    ? `המילים שלך אינן הבטחה לגבי מי תהיי. הן כן משאירות נקודה שאפשר לחזור אליה: ״${draft.commitment}״.`
    : "גם בלי התחייבות כתובה נוצרה כאן נקודה בזמן. אפשר להשאיר אותה פתוחה ולא להמציא תשובה.";

  return (
    <main className="participant-shell">
      <header className="brand-bar"><div><strong>להיות אני</strong><span>מפגש אינטגרציה, הכשרת מלוות, מחזור ראשון</span></div><div className="brand-signature">קרן בן עמי | אמא מגשימה</div></header>
      <section className="participant-stage">
        <div className="progress" aria-label={`שלב ${Math.min(step + 1, 5)} מתוך 5`}><span style={{ width: `${Math.min(step, 4) / 4 * 100}%` }} /></div>

        {step === 0 && <div className="scene-card intro-scene"><span className="kicker">המרחק ביני לביני</span><h1>מפה אחת.<br />שני קולות בתוכי.<br />נקודה אחת בזמן.</h1><p className="lead">המילים שלך ינועו על המסך. לא כדי לפרש אותך, כדי לתת צורה לרגע שאת נמצאת בו עכשיו.</p><div className="contract"><strong>לפני שמתחילות</strong><p>מה שתכתבי שייך לך. תוכלי להשאיר את המילים פרטיות או לצרף אותן למפה המשותפת, ללא שם.</p><p>המצלמה בסוף היא רשות בלבד. התמונה נוצרת במכשיר שלך ואינה עולה למפה הקבוצתית.</p></div><button className="primary wide" onClick={() => setStep(1)}>אני נכנסת למפה</button><a className="quiet-link" href={`/wall?room=${room}`}>אני רק מתבוננת במפה המשותפת</a></div>}

        {step === 1 && <div className="scene-card writing-scene"><span className="step-label">01, הקול של עכשיו</span><h1>בלי לסכם את עצמך.<br />ברגע הזה אני...</h1><label className="text-field"><span>שלוש עד שבע מילים, או להשאיר ריק</span><input maxLength={110} value={draft.currentPhrase} onChange={(e) => update("currentPhrase", e.target.value)} placeholder="ברגע הזה אני..." /></label><IdentityMap contribution={contribution} compact /><p className="map-hint">המילים שלך כבר התחילו לנוע.</p><nav className="scene-nav"><button className="secondary" onClick={() => setStep(0)}>חזרה</button><button className="primary" onClick={() => setStep(2)}>הקול הבא</button></nav></div>}

        {step === 2 && <div className="scene-card writing-scene"><span className="step-label">02, הקול שאני בוחרת לקרב</span><h1>כשאני קרובה אליי, אני...</h1><label className="text-field"><span>משפט קצר, עד שמרגיש אמת</span><input maxLength={110} value={draft.futurePhrase} onChange={(e) => update("futurePhrase", e.target.value)} placeholder="כשאני קרובה אליי, אני..." /></label><IdentityMap contribution={contribution} compact /><p className="map-hint">שני הקולות נעים עכשיו באותו מרחב.</p><nav className="scene-nav"><button className="secondary" onClick={() => setStep(1)}>חזרה</button><button className="primary" onClick={() => setStep(3)}>לפתוח את המפה</button></nav></div>}

        {step === 3 && <div className="scene-card map-scene"><span className="step-label">03, מפת נקודה בזמן</span><h1>את קובעת כמה קרוב.</h1><label className="range-field"><span><strong>כמה גישה יש לך אליה היום?</strong><output>{draft.closeness < 30 ? "עוד רחוקה" : draft.closeness < 65 ? "בתנועה אליה" : "כבר קרובה"}</output></span><input type="range" min="0" max="100" value={draft.closeness} onChange={(e) => update("closeness", Number(e.target.value))} /></label><label className="text-field"><span>התחייבות קטנה, לא הבטחה גדולה</span><input maxLength={110} value={draft.commitment} onChange={(e) => update("commitment", e.target.value)} placeholder="עד יום רביעי הבא אני נותנת לה מקום דרך..." /></label><div className="field-entry"><span>עכשיו מצטרפות למפה החיה</span><h2>העלי את הקול שלך לשדה המשותף.</h2><p>זה הכפתור שמחבר את המילים שלך, ללא שם, למפה שכולנו רואות עכשיו.</p><button className={`hold-button ${sending ? "sending" : ""}`} disabled={sending} onClick={() => submit(true)}><span>{sending ? "הקול שלך עולה לשדה..." : "להעלות את הקול שלי לשדה המשותף"}</span></button><button className="secondary wide" disabled={sending} onClick={() => submit(false)}>להמשיך עם מפה פרטית</button></div><p className="safety-line">אחרי הבחירה תיפתח נקודת הזמן שלך. המצלמה והשמירה יגיעו רק בשלב הבא.</p><IdentityMap contribution={contribution} /><p className="map-hint">שני הקולות שלך כבר נעים כתדר אחד.</p>{error && <p className="error" role="alert">{error}</p>}<button className="quiet wide" onClick={() => setStep(2)}>חזרה לעריכה</button></div>}

        {step === 4 && sent && <div className="scene-card capture-scene"><span className="kicker">המפה שלך נוצרה</span><h1>עכשיו אפשר להיכנס לתוכה.</h1><div className="camera-map"><IdentityMap contribution={contribution} />{cameraOn && <video ref={videoRef} muted playsInline autoPlay onLoadedMetadata={() => setCameraReady(true)} />}</div><div className="reflection-gift"><span>נקודה בזמן</span><p>{reflection}</p></div>{!capturedUrl && <div className="camera-actions"><button className="primary" onClick={cameraOn ? stopCamera : startCamera} disabled={openingCamera}>{openingCamera ? "פותחת מצלמה..." : cameraOn ? "סגרי מצלמה" : "פתחי מצלמה, רשות"}</button><button className="secondary" onClick={capturePoint} disabled={cameraOn && !cameraReady}>{cameraOn ? cameraReady ? "צלמי נקודה בזמן" : "רגע, המצלמה עולה..." : "צרי נקודה בזמן בלי מצלמה"}</button></div>}{cameraError && <p className="error" role="status">{cameraError}</p>}{capturedUrl && <div className="captured-card"><img src={capturedUrl} alt="נקודה בזמן עם מילות הזהות שלי" /><div className="capture-share"><button className="primary" onClick={shareCapture}>שתפי בקבוצת הווטסאפ שלנו</button><button className="secondary" onClick={downloadCapture}>שמרי בנייד בתמונות</button><a className="whatsapp-link" href={WHATSAPP_GROUP} target="_blank" rel="noreferrer">פתחי את קבוצת הווטסאפ שלנו</a><button className="quiet" onClick={() => setCapturedUrl("")}>צלמי מחדש</button></div></div>}{notice && <p className="notice">{notice}</p>}<a className="quiet-link" href={`/wall?room=${room}`}>לראות את המפה המשותפת</a></div>}
      </section>
      <footer>כל הזכויות שמורות © 2026, קרן בן עמי, אמא מגשימה</footer>
    </main>
  );
}
