"use client";

import { useEffect, useState } from "react";
import { evidenceParticipants } from "../evidence-participants";
import { EvidenceStage, initialEvidenceState, type EvidenceLiveState } from "../evidence-stage";

export function EvidencePresentation() {
  const [state, setState] = useState<EvidenceLiveState>(initialEvidenceState);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("identity-evidence-live-state") || "null");
      if (saved?.state) setState({ ...initialEvidenceState, ...saved.state });
    } catch {}
    const channel = "BroadcastChannel" in window ? new BroadcastChannel("identity-evidence-live") : null;
    if (channel) channel.onmessage = (event) => event.data?.state && setState({ ...initialEvidenceState, ...event.data.state });
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "identity-evidence-live-state" || !event.newValue) return;
      try { const value = JSON.parse(event.newValue); if (value?.state) setState({ ...initialEvidenceState, ...value.state }); } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => { channel?.close(); window.removeEventListener("storage", onStorage); };
  }, []);

  const participant = evidenceParticipants[state.index] || evidenceParticipants[0];
  return <main className="evidence-presentation"><EvidenceStage participant={participant} state={state} /><footer>כל הזכויות שמורות © 2026, קרן בן עמי, אמא מגשימה</footer></main>;
}
