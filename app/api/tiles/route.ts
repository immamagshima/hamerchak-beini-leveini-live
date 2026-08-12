import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { identityTiles } from "../../../db/schema";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function roomName(value: string | null) {
  const room = clean(value, 40).toLowerCase();
  return /^[a-z0-9-]+$/.test(room) ? room : "first-cohort-aug11";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const room = roomName(url.searchParams.get("room"));
    const db = getDb();
    const rows = await db
      .select()
      .from(identityTiles)
      .where(eq(identityTiles.room, room))
      .orderBy(asc(identityTiles.id))
      .limit(80);

    return Response.json({
      tiles: rows.map((row) => ({
        id: row.id,
        currentPhrase: row.shareWords ? row.currentWord : "",
        futurePhrase: row.shareWords ? row.futurePhrase : "",
        commitment: row.shareWords ? row.bridgePhrase : "",
        closeness: row.distance,
        shared: row.shareWords,
        updatedAt: row.updatedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "שגיאה לא צפויה";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const room = roomName(clean(body.room, 40));
    const clientId = clean(body.clientId, 80);
    const closeness = Math.max(0, Math.min(100, Number(body.closeness) || 0));

    if (!clientId) {
      return Response.json({ error: "חסר מזהה למפה" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const values = {
      room,
      clientId,
      currentWord: clean(body.currentPhrase, 110),
      futurePhrase: clean(body.futurePhrase, 110),
      bridgePhrase: clean(body.commitment, 110),
      currentColor: "clay",
      futureColor: "amber",
      shape: "map",
      motion: "wave",
      distance: closeness,
      shareWords: Boolean(body.shareWords),
      updatedAt: now,
    };

    const db = getDb();
    await db
      .insert(identityTiles)
      .values({ ...values, createdAt: now })
      .onConflictDoUpdate({
        target: [identityTiles.room, identityTiles.clientId],
        set: values,
      });

    const [tile] = await db
      .select({ id: identityTiles.id })
      .from(identityTiles)
      .where(and(eq(identityTiles.room, room), eq(identityTiles.clientId, clientId)))
      .limit(1);

    return Response.json({ ok: true, id: tile?.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "שגיאה לא צפויה";
    return Response.json({ error: message }, { status: 500 });
  }
}
