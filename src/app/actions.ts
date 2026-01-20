"use server";

import { db } from "@/db";
import { mountains, logs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- KONFIGURACJA TESTOWA ---
// TODO: Później podmienimy to na prawdziwe pobieranie ID z sesji (np. NextAuth)

const TEST_USER_ID = "44c72f94-93cd-40b3-947e-24460fdd06b4";

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
  const mountainId = Number(formData.get("mountainId"));
  const notes = formData.get("notes") as string;
  const dateClimbed = formData.get("date") as string; // Format YYYY-MM-DD z input type="date"

  if (
    !TEST_USER_ID ||
    TEST_USER_ID === "44c72f94-93cd-40b3-947e-24460fdd06b4"
  ) {
    throw new Error(
      "Musisz ustawić TEST_USER_ID w pliku actions.ts, żeby to zadziałało!",
    );
  }

  if (!mountainId || !dateClimbed) {
    throw new Error("Brak ID szczytu lub daty!");
  }

  // Zapis logu w bazie (powiązanie User <-> Mountain)
  await db.insert(logs).values({
    userId: TEST_USER_ID,
    mountainId: mountainId,
    dateClimbed: dateClimbed,
    notes: notes,
  });

  // Odświeżamy stronę konkretnego szczytu, żeby od razu zobaczyć wpis na liście
  revalidatePath(`/mountain/${mountainId}`);
}
