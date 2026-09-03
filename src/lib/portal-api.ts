import type { PortalContentSnapshot } from "@/lib/content-store";
import { apiFetch } from "@/lib/auth-api";

export async function fetchPortalSnapshot(): Promise<PortalContentSnapshot> {
  const response = await apiFetch("/api/v1/portal/snapshot");
  if (!response.ok) {
    throw new Error(`Falha ao carregar conteúdo (${response.status})`);
  }
  return (await response.json()) as PortalContentSnapshot;
}

export async function savePortalSnapshot(snapshot: PortalContentSnapshot): Promise<void> {
  const response = await apiFetch("/api/v1/portal/snapshot", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });
  if (!response.ok) {
    throw new Error(`Falha ao salvar conteúdo (${response.status})`);
  }
}
