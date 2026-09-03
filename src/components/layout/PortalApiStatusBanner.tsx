import { ExclamationCircleOutlined, LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";

import { usePortalApiError } from "@/hooks/use-portal-api-error";

export function PortalApiStatusBanner() {
  const { error, retrying, retry } = usePortalApiError();

  if (!error) return null;

  return (
    <div className="sticky top-0 z-40 px-4 pt-3">
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        message="Servidor indisponível"
        description={`${error}. Os dados exibidos podem estar desatualizados até a conexão ser restabelecida.`}
        action={
          <Button
            size="small"
            disabled={retrying}
            icon={retrying ? <LoadingOutlined /> : <ReloadOutlined />}
            onClick={() => void retry()}
          >
            Tentar novamente
          </Button>
        }
      />
    </div>
  );
}
