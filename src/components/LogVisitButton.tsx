"use client";

import { useState } from "react";
import { logClimb } from "@/app/actions";
import { Loader2, CalendarIcon, Mountain } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function LogVisitButton({
  mountainId,
  onSuccess,
}: {
  mountainId: number;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isWinter, setIsWinter] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);

    const notes = formData.get("notes") as string;
    
    const dateString = date ? date.toISOString() : new Date().toISOString();

    const result = await logClimb({
      mountainId,
      notes,
      date: dateString,
      isWinterEntry: isWinter,
    });

    setIsLoading(false);

    if (result.success) {
      setOpen(false);
      // Tutaj w przyszłości dodamy Toast (powiadomienie)
      if (onSuccess) onSuccess(); 
      // Opcjonalnie przeładuj stronę, jeśli onSuccess nie jest podane
      if (!onSuccess) window.location.reload(); 
    } else {
      alert(result.error || "Wystąpił błąd");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg shadow-lg shadow-slate-900/20">
          ⛰️ Zaloguj wejście
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mountain className="h-5 w-5" />
            Gratulacje!
          </DialogTitle>
          <DialogDescription>
            Dodaj ten szczyt do swojej kolekcji. Opowiedz krótko, jak było.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="date">Data zdobycia</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "d MMMM yyyy", { locale: pl }) : <span>Wybierz datę</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={pl}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notatki */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Pogoda była super, ale podejście dało w kość..."
              className="min-h-[100px]"
            />
          </div>

          {/* Checkbox Zima */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="winter" 
              checked={isWinter}
              onCheckedChange={(checked) => setIsWinter(checked as boolean)}
            />
            <Label htmlFor="winter" className="cursor-pointer font-normal">
              To było wejście zimowe ❄️
            </Label>
          </div>

          <Button type="submit" disabled={isLoading} className="mt-2 bg-green-600 hover:bg-green-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Zapisywanie...
              </>
            ) : (
              "Zapisz w dzienniku"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
