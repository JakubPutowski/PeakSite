"use server";

import { db } from "@/db";
import { mountains, logs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Akcja dodawania nowego szczytu do bazy (Admin)
 */
export async function createMountain(formData: FormData) {
  // Pobieramy dane z formularza
  const name = formData.get("name") as string;
  const elevation = Number(formData.get("elevation"));
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const mountainRange = formData.get("mountainRange") as string;

  // Prosta walidacja
  if (!name || !elevation || !lat || !lng) {
    throw new Error("Wypełnij wszystkie wymagane pola!");
  }

  // Zapis do bazy
  await db.insert(mountains).values({
    name,
    elevation,
    lat,
    lng,
    mountainRange,
  });

  // Odświeżenie i przekierowanie
  revalidatePath("/");
  redirect("/");
}

/**
 * Akcja logowania wejścia na szczyt (Użytkownik)
 */
export async function logClimb(formData: FormData) {
  // 1. Sprawdzamy, kim jest użytkownik
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Jeśli ktoś nie jest zalogowany, wyrzuć błąd lub przekieruj do logowania
    throw new Error("Musisz być zalogowany, żeby dodać wpis!");
  }

  const mountainId = Number(formData.get("mountainId"));
  const notes = formData.get("notes") as string;
  const dateClimbed = formData.get("date") as string;

  if (!mountainId || !dateClimbed) {
    throw new Error("Brak ID szczytu lub daty!");
  }

  // 2. Zapisujemy log używając PRAWDZIWEGO user.id
  await db.insert(logs).values({
    userId: user.id, // <-- Tu jest zmiana!
    mountainId: mountainId,
    dateClimbed: dateClimbed,
    notes: notes,
  });

  revalidatePath(`/mountain/${mountainId}`);
}
