"use server";

import { db } from "@/db";
import { mountains } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMountain(formData: FormData) {
  // Pobieramy dane z formularza
  const name = formData.get("name") as string;
  const elevation = Number(formData.get("elevation"));
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const mountainRange = formData.get("mountainRange") as string;

  // walidacja po stronie serwera
  if (!name || !elevation || !lat || !lng) {
    throw new Error("Wypełnij wszystkie wymagane pola!");
  }

  // zapis do bazy
  await db.insert(mountains).values({
    name,
    elevation,
    lat,
    lng,
    mountainRange,
  });

  // Odświeżamy cache strony głównej (żeby nowy szczyt się pojawił) i przekierowujemy
  revalidatePath("/");
  redirect("/");
}
