import type { Metadata } from "next";
import { ParticipantExperience } from "./participant-experience";

export const metadata: Metadata = {
  title: "המרחק ביני לביני | מפת נקודה בזמן",
  description: "מפת מילים אינטראקטיבית חיה למפגש האינטגרציה, הכשרת מלוות מחזור ראשון.",
};

export default function Home() {
  return <ParticipantExperience />;
}
