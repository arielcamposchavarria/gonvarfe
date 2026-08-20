"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";

export interface ImageUploadFieldProps {
  name: string;
  maxFiles?: number;
  label?: string;
}

export function ImageUploadField({ name, maxFiles = 5, label = "Imágenes (opcional)" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function syncInput(next: File[]) {
    setFiles(next);
    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    if (inputRef.current) inputRef.current.files = transfer.files;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    syncInput([...files, ...selected].slice(0, maxFiles));
  }

  function removeAt(index: number) {
    syncInput(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-wrap gap-2">
        {previews.map((src, index) => (
          <div key={index} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
            {/*
              `src` es un blob: URL de URL.createObjectURL() sobre un File que el propio usuario eligió en su
              equipo: es opaco, generado por el navegador y nunca contiene el contenido del archivo ni texto/HTML
              de un tercero, así que no hay riesgo de XSS aunque CodeQL (js/xss-through-dom) lo marque como tal.
            */}
            {/* lgtm[js/xss-through-dom] */}
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local desde blob:, no un asset del sitio */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-white"
              aria-label="Quitar imagen"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {files.length < maxFiles && (
          <label
            htmlFor={name}
            className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:bg-surface-hover"
          >
            <ImagePlus className="h-5 w-5" />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {files.length}/{maxFiles} imágenes
      </p>
    </div>
  );
}
