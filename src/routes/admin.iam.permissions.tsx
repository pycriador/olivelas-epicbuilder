import { SaveOutlined } from "@ant-design/icons";
import { Button, Checkbox, Select, Space, Table, Typography } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import {
  fetchPermissionsMatrix,
  listPermissions,
  listRoles,
  setRolePermissions,
  type Permission,
  type Role,
} from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/permissions")({
  head: () => ({
    meta: [{ title: "Permissões — IAM | AIOPS App Model" }],
  }),
  component: IamPermissionsPage,
});

function IamPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Permission[]>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [perms, rolesPage, matrixData] = await Promise.all([
        listPermissions({ page_size: 100 }),
        listRoles({ page_size: 100 }),
        fetchPermissionsMatrix(),
      ]);
      setPermissions(perms.items);
      setRoles(rolesPage.items);
      setMatrix(matrixData);
      if (!selectedRoleId && rolesPage.items[0]) {
        setSelectedRoleId(rolesPage.items[0].id);
        setSelectedIds(rolesPage.items[0].permission_ids);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar permissões");
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId),
    [roles, selectedRoleId],
  );

  const onSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = roles.find((r) => r.id === roleId);
    setSelectedIds(role?.permission_ids ?? []);
  };

  const toggle = (permissionId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, permissionId])] : prev.filter((id) => id !== permissionId),
    );
  };

  const onSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const updated = await setRolePermissions(selectedRoleId, selectedIds);
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success("Matriz salva");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar matriz");
    } finally {
      setSaving(false);
    }
  };

  const categories = Object.keys(matrix).sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <IamAdminShell title="Permissões" description="Catálogo e matriz de permissões por role.">
      <IamSectionCard title="Catálogo" flush>
        <Table<Permission>
          rowKey="id"
          size="small"
          loading={loading}
          dataSource={permissions}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: "Código", dataIndex: "code" },
            { title: "Nome", dataIndex: "name" },
            { title: "Categoria", dataIndex: "category" },
            { title: "Descrição", dataIndex: "description", ellipsis: true },
          ]}
        />
      </IamSectionCard>

      <IamSectionCard
        title="Matriz por role"
        extra={
          <Space>
            <Select
              style={{ minWidth: 220 }}
              placeholder="Selecione a role"
              value={selectedRoleId ?? null}
              onChange={onSelectRole}
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!selectedRoleId}
              onClick={() => void onSave()}
            >
              Salvar matriz
            </Button>
          </Space>
        }
      >
        {selectedRole && (
          <Typography.Paragraph type="secondary" className="mb-4">
            Editando permissões de <strong>{selectedRole.name}</strong>
          </Typography.Paragraph>
        )}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <Typography.Title level={5}>{category}</Typography.Title>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(matrix[category] ?? []).map((perm) => (
                  <Checkbox
                    key={perm.id}
                    checked={selectedIds.includes(perm.id)}
                    onChange={(e) => toggle(perm.id, e.target.checked)}
                  >
                    <span className="text-sm">
                      <span className="font-medium">{perm.code}</span>
                      <span className="ml-1 text-muted-foreground">— {perm.name}</span>
                    </span>
                  </Checkbox>
                ))}
              </div>
            </div>
          ))}
        </div>
      </IamSectionCard>
    </IamAdminShell>
  );
}
