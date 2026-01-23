"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logClimb } from "@/app/actions";
import { CheckCircle2, Loader2 } from "lucide-react";

export function LogVisitButton({ mountainId }: { mountainId: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLog = async () => {
    setIsLoading(true);
    try {
      const result = await logClimb({
        mountainId,
        notes: "Zdobyto!",
        isWinterEntry: false,
      });
      setIsSuccess(true);
    } catch (error) {
      alert("Błąd logowania wizyty. Zaloguj się!");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Button disabled className="w-full bg-green-500 text-white h-12">
        <CheckCircle2 className="mr-2 h-5 w-5" /> Zdobyto!
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLog}
      disabled={isLoading}
      className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        "Zaloguj wejście"
      )}
    </Button>
  );
}
