"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MarcaTagInputProps {
  name: string;
  label?: string;
}

export function MarcaTagInput({ name, label = "Marcas" }: MarcaTagInputProps) {
  const [marcas, setMarcas] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim();
    setDraft("");
    if (!value) return;
    setMarcas((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft.length === 0 && marcas.length > 0) {
      setMarcas((prev) => prev.slice(0, -1));
    }
  }

  function removeMarca(marca: string) {
    setMarcas((prev) => prev.filter((m) => m !== marca));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="marca-tag-input">{label}</Label>
      {marcas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {marcas.map((marca) => (
            <Badge key={marca} variant="secondary" className="flex items-center gap-1">
              {marca}
              <button
                type="button"
                onClick={() => removeMarca(marca)}
                aria-label={`Quitar marca ${marca}`}
                className="rounded-full hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
              <input type="hidden" name={name} value={marca} />
            </Badge>
          ))}
        </div>
      )}
      <Input
        id="marca-tag-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder="Escriba una marca y presione Enter"
      />
    </div>
  );
}
