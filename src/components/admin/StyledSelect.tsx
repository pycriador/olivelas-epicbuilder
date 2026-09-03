import { Select } from "antd";

export type StyledOption = {
  value: string;
  label: string;
};

/** Admin select — Ant Design primitive themed via LoftProvider. */
export function StyledSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecionar",
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: StyledOption[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <Select
      {...(className ? { className } : {})}
      style={{ width: "100%" }}
      value={value || undefined}
      placeholder={placeholder}
      options={options.map((opt) => ({ value: opt.value, label: opt.label }))}
      onChange={(next) => {
        if (typeof next === "string") onValueChange(next);
      }}
    />
  );
}
