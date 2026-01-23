"use server";

import { db } from "@/db";
import { mountains, logs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

/**
 * Akcja dodawania nowego szczytu do bazy (Admin)
 */
export async function createMountain(formData: FormData) {
  const supabase = await createClient(); // Klient do uploadu

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
    // 1. Generujemy unikalną nazwę pliku (np. rysy-12345.jpg)
    // Używamy nazwy szczytu + losowy ciąg, żeby uniknąć konfliktów
    const fileExt = imageFile.name.split(".").pop();
    const cleanName = name
      .toLowerCase()
      .normalize("NFD") // Rozdziela litery od akcentów (ś -> s + ´)
      .replace(/[\u0300-\u036f]/g, "") // Usuwa akcenty
      .replace(/ł/g, "l") // Specjalny przypadek dla ł
      .replace(/[^a-z0-9]/g, "-"); // Zamienia spacje i dziwne znaki na myślniki

    const fileName = `${cleanName}-${crypto.randomBytes(4).toString("hex")}.${fileExt}`;

    // 2. Wysyłamy do Supabase Storage
    const { data, error } = await supabase.storage
      .from("mountains") // Nazwa twojego bucketa
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Błąd uploadu:", error);
      throw new Error("Nie udało się wgrać zdjęcia");
    }

    // 3. Pobieramy publiczny URL
    const { data: publicUrlData } = supabase.storage
      .from("mountains")
      .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }
  // ----------------------
  await db.insert(mountains).values({
    name,
    elevation,
    lat,
    lng,
    mountainRange,
    imageUrl: imageUrl, // <-- Zapisujemy link
  });

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
