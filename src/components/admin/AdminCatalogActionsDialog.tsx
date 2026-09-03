import { DeleteOutlined, EditOutlined, ExportOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Typography } from "antd";

const { Text } = Typography;

/** Admin catalog picker: open, edit, or delete a hub item / case. */
export function AdminCatalogActionsDialog({
  open,
  onOpenChange,
  title,
  description,
  onOpen,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | undefined;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={title}
      footer={null}
      destroyOnHidden
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        {description?.trim()
          ? description
          : "O que você quer fazer com este item?"}
      </Text>
      <Space orientation="vertical" size="small" style={{ width: "100%" }}>
        <Button
          block
          icon={<ExportOutlined />}
          onClick={() => {
            onOpenChange(false);
            onOpen();
          }}
        >
          Abrir
        </Button>
        <Button
          block
          icon={<EditOutlined />}
          onClick={() => {
            onOpenChange(false);
            onEdit();
          }}
        >
          Editar
        </Button>
        <Button
          block
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            onOpenChange(false);
            onDelete();
          }}
        >
          Excluir
        </Button>
      </Space>
    </Modal>
  );
}
