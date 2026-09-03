import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  LAYOUT_MODE_CHANGE_EVENT,
  LAYOUT_MODE_STORAGE_KEY,
  readLayoutMode,
  writeLayoutMode,
  type LayoutMode,
} from "@/lib/layout-mode";

export type LayoutModeContextValue = {
  mode: LayoutMode;
  /** False until client has hydrated preference from localStorage. */
  ready: boolean;
  isClassic: boolean;
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
};

const LayoutModeContext = createContext<LayoutModeContextValue | null>(null);

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LayoutMode>("harmony");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setModeState(readLayoutMode());
    setReady(true);

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<LayoutMode>).detail;
      if (detail === "classic" || detail === "harmony") {
        setModeState(detail);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LAYOUT_MODE_STORAGE_KEY) return;
      setModeState(readLayoutMode());
    };

    window.addEventListener(LAYOUT_MODE_CHANGE_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LAYOUT_MODE_CHANGE_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setMode = useCallback((next: LayoutMode) => {
    writeLayoutMode(next);
    setModeState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "classic" ? "harmony" : "classic");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      ready,
      isClassic: mode === "classic",
      setMode,
      toggleMode,
    }),
    [mode, ready, setMode, toggleMode],
  );

  return <LayoutModeContext.Provider value={value}>{children}</LayoutModeContext.Provider>;
}

export function useLayoutMode(): LayoutModeContextValue {
  const ctx = useContext(LayoutModeContext);
  if (!ctx) {
    throw new Error("useLayoutMode must be used within LayoutModeProvider");
  }
  return ctx;
}
