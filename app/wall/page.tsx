import type { Metadata } from "next";
import { CollageWall } from "./wall-client";

export const metadata: Metadata = {
  title: "המרחק ביני לביני | מפת נקודה בזמן",
  description: "מפת מילים קבוצתית שנוצרת בזמן אמת, ללא שמות.",
};

export default function WallPage() {
  return <CollageWall />;
}
