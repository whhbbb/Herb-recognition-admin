import { CheckCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { Alert, Button, Card, Space, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

type ModelVersion = {
  id: string;
  name: string;
  version: string;
  framework: string;
  artifactUrl: string;
  metrics: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const formatMetric = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toFixed(4) : "-";
  }
  return String(value ?? "-");
};

export const ModelList = () => {
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activatingId, setActivatingId] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<ModelVersion[]>("/models");
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载模型失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const activate = async (id: string) => {
    setActivatingId(id);
    setError("");
    try {
      await apiRequest(`/models/${id}/activate`, { method: "PATCH" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "激活模型失败");
    } finally {
      setActivatingId("");
    }
  };

  return (
    <List
      title="模型管理"
      headerButtons={
        <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Card size="small">
          <Typography.Text type="secondary">
            在此页面选择“前台识别”使用的模型。激活后，前台 `/api/infer/predict` 将优先使用该模型。
          </Typography.Text>
        </Card>

        <Table<ModelVersion>
          rowKey="id"
          dataSource={models}
          loading={loading}
          pagination={{ pageSize: 10 }}
        >
          <Table.Column<ModelVersion> title="模型名" dataIndex="name" key="name" />
          <Table.Column<ModelVersion> title="版本" dataIndex="version" key="version" />
          <Table.Column<ModelVersion> title="框架" dataIndex="framework" key="framework" />
          <Table.Column<ModelVersion>
            title="状态"
            key="active"
            render={(_, row) =>
              row.isActive ? <Tag color="success">当前前台模型</Tag> : <Tag>未激活</Tag>
            }
          />
          <Table.Column<ModelVersion>
            title="best_val_acc"
            key="bestValAcc"
            render={(_, row) => formatMetric(row.metrics?.best_val_acc)}
          />
          <Table.Column<ModelVersion>
            title="train/val"
            key="split"
            render={(_, row) =>
              `${formatMetric(row.metrics?.train_size)} / ${formatMetric(row.metrics?.val_size)}`
            }
          />
          <Table.Column<ModelVersion>
            title="产物路径"
            dataIndex="artifactUrl"
            key="artifactUrl"
            ellipsis
            width={260}
          />
          <Table.Column<ModelVersion>
            title="创建时间"
            dataIndex="createdAt"
            key="createdAt"
            render={(value: string) => new Date(value).toLocaleString()}
          />
          <Table.Column<ModelVersion>
            title="操作"
            key="actions"
            render={(_, row) =>
              row.isActive ? (
                <Button type="default" icon={<CheckCircleOutlined />} disabled size="small">
                  已激活
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  loading={activatingId === row.id}
                  onClick={() => void activate(row.id)}
                >
                  设为前台模型
                </Button>
              )
            }
          />
        </Table>
      </Space>
    </List>
  );
};

