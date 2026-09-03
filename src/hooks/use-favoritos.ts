import { useCallback, useEffect, useState } from "react";

const KEY = "loft-ai-favoritos";

let memoria: string[] = [];
const listeners = new Set<(v: string[]) => void>();

function emit(v: string[]) {
  memoria = v;
  listeners.forEach((l) => l(v));
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignora */
  }
}

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<string[]>(memoria);

  useEffect(() => {
    if (!memoria.length) {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) memoria = JSON.parse(raw) as string[];
      } catch {
        /* ignora */
      }
    }
    setFavoritos(memoria);
    listeners.add(setFavoritos);
    return () => {
      listeners.delete(setFavoritos);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const proximo = memoria.includes(id) ? memoria.filter((x) => x !== id) : [...memoria, id];
    emit(proximo);
    return proximo.includes(id);
  }, []);

  const isFavorito = useCallback((id: string) => favoritos.includes(id), [favoritos]);

  return { favoritos, toggle, isFavorito };
}
