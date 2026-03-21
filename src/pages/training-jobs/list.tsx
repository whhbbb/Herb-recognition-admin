import { PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

type JobStatus = "pending" | "running" | "succeeded" | "failed";

type TrainingJob = {
  id: string;
  status: JobStatus;
  datasetSize: number;
  epochs: number;
  batchSize: number;
  validationSplit: number;
  log: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

type SampleMeta = {
  total: number;
};

type ClassRow = {
  herbId: string;
  herbName: string;
  count: number;
};

const statusColorMap: Record<JobStatus, string> = {
  pending: "default",
  running: "processing",
  succeeded: "success",
  failed: "error",
};

export const TrainingJobList = () => {
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [sampleTotal, setSampleTotal] = useState(0);
  const [classTotal, setClassTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm<{
    epochs: number;
    batchSize: number;
    validationSplit: number;
  }>();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [jobData, meta, classes] = await Promise.all([
        apiRequest<TrainingJob[]>("/training/jobs"),
        apiRequest<SampleMeta>("/samples/meta/count"),
        apiRequest<ClassRow[]>("/samples/classes"),
      ]);
      setJobs(jobData);
      setSampleTotal(meta.total);
      setClassTotal(classes.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
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

  const startTraining = async () => {
    const values = await form.validateFields();
    setCreating(true);
    setError("");
    try {
      await apiRequest<TrainingJob>("/training/jobs", {
        method: "POST",
        body: JSON.stringify(values),
      });
      await load();
      form.resetFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建训练任务失败");
    } finally {
      setCreating(false);
    }
  };

  return (
    <List
      title="训练任务"
      headerButtons={
        <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="可用样本总数" value={sampleTotal} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="可用类别数" value={classTotal} />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Card>
              <Statistic title="任务数" value={jobs.length} />
            </Card>
          </Col>
        </Row>

        <Card title="创建训练任务">
          <Space align="end" wrap>
            <Form
              layout="inline"
              form={form}
              initialValues={{ epochs: 20, batchSize: 16, validationSplit: 0.2 }}
            >
              <Form.Item
                label="Epochs"
                name="epochs"
                rules={[{ required: true, type: "number", min: 1, max: 200 }]}
              >
                <InputNumber min={1} max={200} />
              </Form.Item>
              <Form.Item
                label="Batch Size"
                name="batchSize"
                rules={[{ required: true, type: "number", min: 1, max: 256 }]}
              >
                <InputNumber min={1} max={256} />
              </Form.Item>
              <Form.Item
                label="Validation Split"
                name="validationSplit"
                rules={[{ required: true, type: "number", min: 0.05, max: 0.5 }]}
              >
                <InputNumber min={0.05} max={0.5} step={0.05} />
              </Form.Item>
            </Form>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={creating}
              onClick={() => void startTraining()}
              disabled={sampleTotal < 8 || classTotal < 2}
            >
              发起训练
            </Button>
          </Space>
        </Card>

        <Table<TrainingJob> rowKey="id" loading={loading} dataSource={jobs} pagination={{ pageSize: 10 }}>
          <Table.Column<TrainingJob> title="任务ID" dataIndex="id" key="id" width={240} ellipsis />
          <Table.Column<TrainingJob>
            title="状态"
            dataIndex="status"
            key="status"
            render={(status: JobStatus) => <Tag color={statusColorMap[status]}>{status}</Tag>}
          />
          <Table.Column<TrainingJob> title="样本数" dataIndex="datasetSize" key="datasetSize" />
          <Table.Column<TrainingJob> title="Epochs" dataIndex="epochs" key="epochs" />
          <Table.Column<TrainingJob> title="Batch Size" dataIndex="batchSize" key="batchSize" />
          <Table.Column<TrainingJob>
            title="Validation Split"
            dataIndex="validationSplit"
            key="validationSplit"
          />
          <Table.Column<TrainingJob>
            title="创建时间"
            dataIndex="createdAt"
            key="createdAt"
            render={(value: string) => new Date(value).toLocaleString()}
          />
          <Table.Column<TrainingJob>
            title="日志"
            dataIndex="log"
            key="log"
            ellipsis
            width={280}
          />
        </Table>
      </Space>
    </List>
  );
};
