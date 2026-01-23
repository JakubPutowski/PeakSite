"use server";

import { db } from "@/db";
import { mountains, logs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

/**
 * Akcja dodawania nowego szczytu do bazy (Admin)
 * Obsługuje upload zdjęcia do Supabase Storage z unikalną nazwą pliku.
 */
export async function createMountain(formData: FormData) {
  const supabase = await createClient();

  // Dane tekstowe
  const name = formData.get("name") as string;
  const elevation = Number(formData.get("elevation"));
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const mountainRange = formData.get("mountainRange") as string;

  // Plik zdjęcia
  const imageFile = formData.get("image") as File;
  let imageUrl = null;

  // Walidacja
  if (!name || !elevation || !lat || !lng) {
    throw new Error("Wypełnij wymagane pola!");
  }

  // --- LOGIKA UPLOADU ---
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const cleanName = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9]/g, "-");

    const fileName = `${cleanName}-${crypto.randomBytes(4).toString("hex")}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("mountains")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Błąd uploadu:", error);
      throw new Error("Nie udało się wgrać zdjęcia");
    }

    const { data: publicUrlData } = supabase.storage
      .from("mountains")
      .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }

  // Zapis do bazy danych
  await db.insert(mountains).values({
    name,
    elevation,
    lat,
    lng,
    mountainRange,
    imageUrl: imageUrl,
  });

  revalidatePath("/");
  redirect("/");
}

/**
 * Akcja logowania wejścia na szczyt (Użytkownik)
 * Zapisuje szczegółowy log wyprawy do tabeli logs.
 */
export async function logClimb(data: {
  mountainId: number;
  notes?: string;
  date?: string;
  isWinterEntry?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Musisz być zalogowany, aby dodać wpis!");
  }

  const { mountainId, notes, date, isWinterEntry } = data;

  if (!mountainId) {
    throw new Error("Brak ID szczytu!");
  }

  // Konwersja daty na obiekt Date (jeśli brak, używamy aktualnej)
  const climbingDate = date ? new Date(date) : new Date();

  try {
    await db.insert(logs).values({
      userId: user.id,
      mountainId: mountainId,
      dateClimbed: climbingDate,
      notes: notes || "",
      isWinterEntry: isWinterEntry ? 1 : 0,
      // userPhotoUrl: null, // Tu można dodać upload zdjęcia użytkownika w przyszłości
    });

    // Odświeżamy strony, aby zmiany były widoczne natychmiast
    revalidatePath(`/mountain/${mountainId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Błąd zapisu logu:", error);
    return { success: false, error: "Nie udało się zapisać wejścia." };
  }
}
