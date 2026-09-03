import { useEffect, useState } from "react";

let aberto = false;
const listeners = new Set<(v: boolean) => void>();

export function setPaletteOpen(v: boolean) {
  aberto = v;
  listeners.forEach((l) => l(v));
}

export function usePaletteOpen() {
  const [open, setOpen] = useState(aberto);
  useEffect(() => {
    listeners.add(setOpen);
    return () => {
      listeners.delete(setOpen);
    };
  }, []);
  return [open, setPaletteOpen] as const;
}
