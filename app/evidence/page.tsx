import type { Metadata } from "next";
import { EvidencePresentation } from "./evidence-presentation";

export const metadata: Metadata = {
  title: "המרחק ביני לביני | עדות הזהויות",
  description: "מסך ההקרנה לחלק הראשון של מפגש האינטגרציה.",
};

export default function EvidencePage() {
  return <EvidencePresentation />;
}
