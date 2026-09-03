import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Space, Tag, Typography } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import { LayoutModeSwitcher } from "@/components/layout/LayoutModeSwitcher";
import { useAuth } from "@/auth/useAuth";
import {
  listRuntimeSettings,
  updateRuntimeSettings,
  type RuntimeSettingItem,
} from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/settings")({
  head: () => ({
    meta: [{ title: "Configurações — IAM | AIOPS App Model" }],
  }),
  component: IamSettingsPage,
});

function sourceTag(source: string) {
  if (source === "database") return <Tag color="orange">Banco (cifrado)</Tag>;
  if (source === "environment") return <Tag>Ambiente (.env)</Tag>;
  return <Tag>Vazio</Tag>;
}

function IamSettingsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<RuntimeSettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<Record<string, string>>();

  const load = useCallback(
    async (reveal = false) => {
      setLoading(true);
      try {
        const data = await listRuntimeSettings(reveal);
        setItems(data);
        const values: Record<string, string> = {};
        for (const item of data) {
          values[item.key] = item.is_secret && !reveal ? "" : item.value;
        }
        form.setFieldsValue(values);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha ao carregar configurações");
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const byCategory = useMemo(() => {
    const map = new Map<string, RuntimeSettingItem[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [items]);

  const onSave = async () => {
    const values = form.getFieldsValue(true) as Record<string, string>;
    const payload: Record<string, string | null> = {};
    for (const item of items) {
      const raw = values[item.key];
      if (raw === undefined) continue;
      if (item.is_secret && (raw === "" || raw.includes("•"))) {
        continue;
      }
      payload[item.key] = raw.trim() === "" ? null : raw;
    }
    setSaving(true);
    try {
      const data = await updateRuntimeSettings(payload);
      setItems(data);
      const next: Record<string, string> = {};
      for (const item of data) {
        next[item.key] = item.is_secret ? "" : item.value;
      }
      form.setFieldsValue(next);
      toast.success("Configurações salvas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <IamAdminShell
      title="Configurações"
      description="Integrações e opções gerenciáveis pela UI. Valores sensíveis ficam cifrados no banco; DATABASE_* e JWT_SECRET permanecem apenas no .env."
      actions={
        <Space wrap>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => void onSave()}
          >
            Salvar alterações
          </Button>
          {isAdmin ? (
            <Button icon={<EyeOutlined />} onClick={() => void load(true)}>
              Revelar segredos
            </Button>
          ) : null}
          <Button onClick={() => void load(false)}>Recarregar</Button>
        </Space>
      }
    >
      <Alert
        type="info"
        showIcon
        message="Como funciona"
        description="Se o campo estiver vazio e você salvar, a sobrescrita do banco é removida e o valor volta a vir do .env. Alterações em CORS exigem reinício da API para valer no middleware."
      />

      <IamSectionCard
        title="Interface"
        description="Escolha entre o layout clássico (Lovable) e o layout novo (Design Harmony). A preferência fica salva neste navegador."
      >
        <LayoutModeSwitcher />
      </IamSectionCard>

      <Form form={form} layout="vertical" disabled={loading} className="flex flex-col gap-4">
        {byCategory.map(([category, group]) => (
          <IamSectionCard key={category} title={category}>
            {group.map((item) => (
              <Form.Item
                key={item.key}
                name={item.key}
                className="!mb-5 last:!mb-0"
                label={
                  <Space wrap size="small">
                    <span>{item.label}</span>
                    {sourceTag(item.source)}
                    <Typography.Text type="secondary" code>
                      {item.key}
                    </Typography.Text>
                  </Space>
                }
                extra={item.description}
              >
                {item.is_secret ? (
                  <Input.Password
                    placeholder={
                      item.has_value
                        ? "Deixe em branco para manter o valor atual"
                        : item.placeholder || "Informe o segredo"
                    }
                    autoComplete="new-password"
                  />
                ) : (
                  <Input placeholder={item.placeholder || undefined} />
                )}
              </Form.Item>
            ))}
          </IamSectionCard>
        ))}
      </Form>
    </IamAdminShell>
  );
}
