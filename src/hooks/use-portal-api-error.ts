import { useCallback, useEffect, useState } from "react";

import { getApiError, refreshContentFromApi } from "@/lib/content-store";

export function usePortalApiError() {
  // Start null on SSR and client so first paint matches (React #418).
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    setError(getApiError());
    const onStatus = () => setError(getApiError());
    window.addEventListener("aiportal:api-status", onStatus);
    return () => window.removeEventListener("aiportal:api-status", onStatus);
  }, []);

  const retry = useCallback(async () => {
    setRetrying(true);
    try {
      await refreshContentFromApi();
    } catch {
      /* error state is updated in content-store */
    } finally {
      setRetrying(false);
    }
  }, []);

  return { error, retrying, retry };
}
