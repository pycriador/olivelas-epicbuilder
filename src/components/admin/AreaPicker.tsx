import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Select } from "antd";
import { useEffect, useState } from "react";

import { getCustomAreas, saveCustomArea } from "@/lib/content-store";

export function AreaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (area: string) => void;
}) {
  const [areas, setAreas] = useState<string[]>([]);
  const [novaArea, setNovaArea] = useState("");

  const refreshAreas = () => {
    setAreas([...getCustomAreas()].sort((a, b) => a.localeCompare(b, "pt-BR")));
  };

  useEffect(() => {
    refreshAreas();
  }, []);

  const adicionar = () => {
    const nome = novaArea.trim();
    if (!nome) return;
    void (async () => {
      await saveCustomArea(nome);
      refreshAreas();
      onChange(nome);
      setNovaArea("");
    })();
  };

  return (
    <Select
      style={{ width: "100%" }}
      value={value || undefined}
      placeholder="Selecionar área"
      options={areas.map((area) => ({ value: area, label: area }))}
      onChange={(next) => {
        if (typeof next === "string") onChange(next);
      }}
      onOpenChange={(open) => {
        if (open) refreshAreas();
      }}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <div style={{ display: "flex", gap: 8, padding: "0 8px 8px" }}>
            <Input
              placeholder="Ex: Jurídico"
              value={novaArea}
              onChange={(e) => setNovaArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  adicionar();
                }
              }}
              aria-label="Nova área"
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={adicionar}>
              Add
            </Button>
          </div>
        </>
      )}
    />
  );
}
