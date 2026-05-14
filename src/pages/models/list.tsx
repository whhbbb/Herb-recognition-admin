import { BarChartOutlined, CheckCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { Alert, Button, Card, Image, Modal, Space, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { API_BASE_URL, apiRequest } from "../../api/client";

type EvaluationMetrics = {
  split?: string;
  sampleSize?: number;
  numClasses?: number;
  top1Acc?: number;
  top3Acc?: number;
  top5Acc?: number;
  macroF1?: number;
  avgInferMs?: number;
  evaluatedAt?: string;
};

type ModelVersion = {
  id: string;
  name: string;
  version: string;
  framework: string;
  artifactUrl: string;
  metrics: (Record<string, unknown> & { evaluation?: EvaluationMetrics }) | null;
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

const formatPercent = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }
  return `${(value * 100).toFixed(2)}%`;
};

export const ModelList = () => {
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activatingId, setActivatingId] = useState("");
  const [evaluatingId, setEvaluatingId] = useState("");
  const [matrixModel, setMatrixModel] = useState<ModelVersion | null>(null);
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

  const evaluate = async (id: string) => {
    setEvaluatingId(id);
    setError("");
    try {
      await apiRequest(`/models/${id}/evaluate`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "模型评估失败");
    } finally {
      setEvaluatingId("");
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
            在此页面选择“前台识别”使用的模型，也可以对已登记模型执行验证集/测试集评估，生成 Top-K、宏平均 F1、推理耗时和混淆矩阵。
          </Typography.Text>
        </Card>

        <Table<ModelVersion>
          rowKey="id"
          dataSource={models}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1600 }}
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
            title="Top-1"
            key="top1"
            render={(_, row) => formatPercent(row.metrics?.evaluation?.top1Acc)}
          />
          <Table.Column<ModelVersion>
            title="Top-3"
            key="top3"
            render={(_, row) => formatPercent(row.metrics?.evaluation?.top3Acc)}
          />
          <Table.Column<ModelVersion>
            title="Macro F1"
            key="macroF1"
            render={(_, row) => formatPercent(row.metrics?.evaluation?.macroF1)}
          />
          <Table.Column<ModelVersion>
            title="推理耗时"
            key="avgInferMs"
            render={(_, row) => {
              const value = row.metrics?.evaluation?.avgInferMs;
              return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)} ms` : "-";
            }}
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
            render={(_, row) => (
              <Space>
                {row.isActive ? (
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
                )}
                <Button
                  size="small"
                  icon={<BarChartOutlined />}
                  loading={evaluatingId === row.id}
                  onClick={() => void evaluate(row.id)}
                >
                  执行评估
                </Button>
                <Button
                  size="small"
                  disabled={!row.metrics?.evaluation}
                  onClick={() => setMatrixModel(row)}
                >
                  混淆矩阵
                </Button>
              </Space>
            )}
          />
        </Table>

        <Modal
          title={matrixModel ? `${matrixModel.name} 混淆矩阵` : "混淆矩阵"}
          open={Boolean(matrixModel)}
          footer={null}
          width={980}
          onCancel={() => setMatrixModel(null)}
        >
          {matrixModel ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                评估样本：{formatMetric(matrixModel.metrics?.evaluation?.sampleSize)}，
                评估划分：{formatMetric(matrixModel.metrics?.evaluation?.split)}，
                评估时间：{formatMetric(matrixModel.metrics?.evaluation?.evaluatedAt)}
              </Typography.Text>
              <Image
                width="100%"
                src={`${API_BASE_URL}/models/${matrixModel.id}/evaluation/confusion-matrix`}
              />
            </Space>
          ) : null}
        </Modal>
      </Space>
    </List>
  );
};
