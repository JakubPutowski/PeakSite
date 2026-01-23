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
  id: serial("id").primaryKey(),

  // ID użytkownika z Supabase Auth (jako tekst, aby uniknąć problemów z kluczami obcymi)
  userId: text("user_id").notNull(),

  // Powiązanie ze szczytem
  mountainId: integer("mountain_id")
    .references(() => mountains.id)
    .notNull(),

  // Szczegóły wyprawy
  dateClimbed: timestamp("date_climbed", { withTimezone: true })
    .defaultNow()
    .notNull(),

  notes: text("notes"), // Miejsce na Twoją historię (np. "Straszna mgła, ale warto było!")

  // Zdjęcie zrobione przez użytkownika (np. selfie na szczycie)
  userPhotoUrl: text("user_photo_url"),

  // Czy wejście było zimowe? (Przykład dodatkowego pola)
  isWinterEntry: integer("is_winter_entry").default(0),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
