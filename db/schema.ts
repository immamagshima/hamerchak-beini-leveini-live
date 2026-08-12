import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const identityTiles = sqliteTable(
  "identity_tiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    room: text("room").notNull(),
    clientId: text("client_id").notNull(),
    currentWord: text("current_word").notNull().default(""),
    futurePhrase: text("future_phrase").notNull().default(""),
    bridgePhrase: text("bridge_phrase").notNull().default(""),
    currentColor: text("current_color").notNull(),
    futureColor: text("future_color").notNull(),
    shape: text("shape").notNull(),
    motion: text("motion").notNull(),
    distance: integer("distance").notNull().default(48),
    shareWords: integer("share_words", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("idx_identity_tiles_room_client").on(table.room, table.clientId)],
);

export type IdentityTile = typeof identityTiles.$inferSelect;
