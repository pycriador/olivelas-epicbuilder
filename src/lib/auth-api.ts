import { apiBaseUrl } from "@/lib/jira-import";

/** Access token kept in memory (not localStorage). */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  must_change_password: boolean;
};

export type AuthUser = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  photo_url: string | null;
  status: string;
  primary_group_id: string | null;
  locale: string;
  timezone: string;
  must_change_password: boolean;
  email_verified: boolean;
  groups: string[];
  permissions: string[];
  is_admin: boolean;
  last_login_at: string | null;
  created_at: string | null;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: string;
  is_system: boolean;
  role_ids: string[];
  created_at: string | null;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  priority: number;
  status: string;
  is_system: boolean;
  permission_ids: string[];
  created_at: string | null;
};

export type Permission = {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  ip_address: string;
  browser: string;
  os: string;
  user_agent: string;
  remember_me: boolean;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  current: boolean;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
};

export type Invitation = {
  id: string;
  email: string;
  group_id: string | null;
  status: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  invite_token: string | null;
};

export type Share = {
  id: string;
  resource_type: string;
  resource_id: string;
  permission: string;
  grantee_type: string;
  grantee_id: string;
  granted_by: string | null;
  created_at: string;
};

export type DashboardStats = {
  users: number;
  groups: number;
  permissions: number;
  sessions: number;
  pending_invitations: number;
  recent_logs: AuditLog[];
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string | { msg?: string }[] };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    /* not JSON */
  }
  return `Request failed (${response.status})`;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        setAccessToken(null);
        return false;
      }
      const data = (await response.json()) as TokenResponse;
      setAccessToken(data.access_token);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${apiBaseUrl()}${path}`;
  let response = await fetch(url, { ...init, headers, credentials: "include" });

  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryHeaders = new Headers(init.headers);
      if (accessToken) {
        retryHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
      if (init.body && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }
      response = await fetch(url, { ...init, headers: retryHeaders, credentials: "include" });
    }
  }

  return response;
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) throw new Error(await readError(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/* ── Auth ─────────────────────────────────────────────────────────────── */

export async function login(input: {
  login: string;
  password: string;
  remember_me?: boolean;
}): Promise<TokenResponse> {
  const data = await apiJson<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      login: input.login,
      password: input.password,
      remember_me: input.remember_me ?? false,
    }),
  });
  setAccessToken(data.access_token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export async function me(): Promise<AuthUser> {
  return apiJson<AuthUser>("/api/v1/auth/me");
}

export async function refresh(): Promise<TokenResponse | null> {
  const ok = await tryRefresh();
  if (!ok || !accessToken) return null;
  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 0,
    must_change_password: false,
  };
}

export async function changePassword(input: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await apiJson("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function forgotPassword(email: string): Promise<{ status: string; message: string; reset_token?: string }> {
  return apiJson("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: { token: string; new_password: string }): Promise<void> {
  await apiJson("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/* ── IAM ──────────────────────────────────────────────────────────────── */

export async function fetchIamDashboard(): Promise<DashboardStats> {
  return apiJson("/api/v1/iam/dashboard");
}

export async function listUsers(params: {
  q?: string;
  status?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<Page<AuthUser>> {
  return apiJson(`/api/v1/iam/users${qs(params)}`);
}

export async function createUser(body: Record<string, unknown>): Promise<AuthUser> {
  return apiJson("/api/v1/iam/users", { method: "POST", body: JSON.stringify(body) });
}

export async function updateUser(id: string, body: Record<string, unknown>): Promise<AuthUser> {
  return apiJson(`/api/v1/iam/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteUser(id: string): Promise<void> {
  await apiJson(`/api/v1/iam/users/${id}`, { method: "DELETE" });
}

export async function activateUser(id: string): Promise<AuthUser> {
  return apiJson(`/api/v1/iam/users/${id}/activate`, { method: "POST" });
}

export async function deactivateUser(id: string): Promise<AuthUser> {
  return apiJson(`/api/v1/iam/users/${id}/deactivate`, { method: "POST" });
}

export async function listGroups(params: { page?: number; page_size?: number } = {}): Promise<Page<Group>> {
  return apiJson(`/api/v1/iam/groups${qs(params)}`);
}

export async function createGroup(body: Record<string, unknown>): Promise<Group> {
  return apiJson("/api/v1/iam/groups", { method: "POST", body: JSON.stringify(body) });
}

export async function updateGroup(id: string, body: Record<string, unknown>): Promise<Group> {
  return apiJson(`/api/v1/iam/groups/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteGroup(id: string): Promise<void> {
  await apiJson(`/api/v1/iam/groups/${id}`, { method: "DELETE" });
}

export async function listRoles(params: { page?: number; page_size?: number } = {}): Promise<Page<Role>> {
  return apiJson(`/api/v1/iam/roles${qs(params)}`);
}

export async function createRole(body: Record<string, unknown>): Promise<Role> {
  return apiJson("/api/v1/iam/roles", { method: "POST", body: JSON.stringify(body) });
}

export async function updateRole(id: string, body: Record<string, unknown>): Promise<Role> {
  return apiJson(`/api/v1/iam/roles/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteRole(id: string): Promise<void> {
  await apiJson(`/api/v1/iam/roles/${id}`, { method: "DELETE" });
}

export async function setRolePermissions(roleId: string, permission_ids: string[]): Promise<Role> {
  return apiJson(`/api/v1/iam/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permission_ids }),
  });
}

export async function listPermissions(params: {
  page?: number;
  page_size?: number;
} = {}): Promise<Page<Permission>> {
  return apiJson(`/api/v1/iam/permissions${qs(params)}`);
}

export async function fetchPermissionsMatrix(): Promise<Record<string, Permission[]>> {
  return apiJson("/api/v1/iam/permissions/matrix");
}

export async function createPermission(body: Record<string, unknown>): Promise<Permission> {
  return apiJson("/api/v1/iam/permissions", { method: "POST", body: JSON.stringify(body) });
}

export async function updatePermission(id: string, body: Record<string, unknown>): Promise<Permission> {
  return apiJson(`/api/v1/iam/permissions/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deletePermission(id: string): Promise<void> {
  await apiJson(`/api/v1/iam/permissions/${id}`, { method: "DELETE" });
}

export async function listSessions(params: {
  page?: number;
  page_size?: number;
} = {}): Promise<Page<SessionRow>> {
  return apiJson(`/api/v1/iam/sessions${qs(params)}`);
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiJson(`/api/v1/iam/sessions/${sessionId}`, { method: "DELETE" });
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await apiJson(`/api/v1/iam/sessions/user/${userId}`, { method: "DELETE" });
}

export async function listAuditLogs(params: {
  page?: number;
  page_size?: number;
  action?: string;
} = {}): Promise<Page<AuditLog>> {
  return apiJson(`/api/v1/iam/audit-logs${qs(params)}`);
}

export async function listInvitations(params: {
  page?: number;
  page_size?: number;
} = {}): Promise<Page<Invitation>> {
  return apiJson(`/api/v1/iam/invitations${qs(params)}`);
}

export async function createInvitation(body: {
  email: string;
  group_id?: string | null;
  expires_in_hours?: number;
}): Promise<Invitation> {
  return apiJson("/api/v1/iam/invitations", { method: "POST", body: JSON.stringify(body) });
}

export async function resendInvitation(id: string): Promise<Invitation> {
  return apiJson(`/api/v1/iam/invitations/${id}/resend`, { method: "POST" });
}

export async function cancelInvitation(id: string): Promise<Invitation> {
  return apiJson(`/api/v1/iam/invitations/${id}/cancel`, { method: "POST" });
}

export async function listShares(params: { page?: number; page_size?: number } = {}): Promise<Page<Share>> {
  return apiJson(`/api/v1/iam/shares${qs(params)}`);
}

export async function createShare(body: Record<string, unknown>): Promise<Share> {
  return apiJson("/api/v1/iam/shares", { method: "POST", body: JSON.stringify(body) });
}

export async function deleteShare(id: string): Promise<void> {
  await apiJson(`/api/v1/iam/shares/${id}`, { method: "DELETE" });
}

/* ── Runtime settings (encrypted in DB) ──────────────────────────────── */

export type RuntimeSettingItem = {
  key: string;
  label: string;
  category: string;
  description: string;
  is_secret: boolean;
  placeholder: string;
  value: string;
  has_value: boolean;
  source: string;
  configured_in_db: boolean;
};

export async function listRuntimeSettings(reveal = false): Promise<RuntimeSettingItem[]> {
  return apiJson(`/api/v1/settings${qs({ reveal: reveal ? "true" : undefined })}`);
}

export async function updateRuntimeSettings(
  values: Record<string, string | null>,
): Promise<RuntimeSettingItem[]> {
  return apiJson("/api/v1/settings", {
    method: "PUT",
    body: JSON.stringify({ values }),
  });
}
