import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  date,
  timestamp,
  uuid,
  bigint,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- Tabela Szczytów ---
export const mountains = pgTable("mountains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  elevation: integer("elevation").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  mountainRange: text("mountain_range"),
  imageUrl: text("image_url"),
});

// --- Tabela Profili ---
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  fullName: text("full_name"),
});

// --- Tabela Logów ---
export const logs = pgTable("logs", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),

  mountainId: integer("mountain_id")
    .references(() => mountains.id)
    .notNull(),

  dateClimbed: date("date_climbed")
    .default(sql`CURRENT_DATE`)
    .notNull(),

  notes: text("notes"),
  userPhotoUrl: text("user_photo_url"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
