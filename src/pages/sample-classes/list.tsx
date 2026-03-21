import { ReloadOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, apiRequest } from "../../api/client";

type ClassRow = {
  herbId: string;
  herbName: string;
  count: number;
  herbNameZh?: string;
  pinyin?: string;
  latinName?: string;
  properties?: string;
  meridian?: string;
  effects?: string[];
  usage?: string;
  cautions?: string;
  description?: string;
};

type SampleMeta = {
  total: number;
  uploadDir: string;
};

export const SampleClassList = () => {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [meta, setMeta] = useState<SampleMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [error, setError] = useState<string>("");
  const [form] = Form.useForm<ClassRow>();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [classData, metaData] = await Promise.all([
        apiRequest<ClassRow[]>("/herb-classes"),
        apiRequest<SampleMeta>("/samples/meta/count"),
      ]);
      setClasses(classData);
      setMeta(metaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totalClasses = useMemo(() => classes.length, [classes.length]);

  const openEdit = (row: ClassRow) => {
    setEditing(row);
    form.setFieldsValue({
      herbNameZh: row.herbNameZh,
      pinyin: row.pinyin,
      latinName: row.latinName,
      properties: row.properties,
      meridian: row.meridian,
      effects: row.effects ?? [],
      usage: row.usage,
      cautions: row.cautions,
      description: row.description,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const values = await form.validateFields();
    setSaving(true);
    setError("");
    try {
      await apiRequest(`/herb-classes/${encodeURIComponent(editing.herbId)}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <List
      title="类别统计"
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
              <Statistic title="类别总数" value={totalClasses} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="样本总数" value={meta?.total ?? 0} />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Card>
              <Typography.Text type="secondary">API 地址</Typography.Text>
              <Typography.Paragraph copyable style={{ marginBottom: 0 }}>
                {API_BASE_URL}
              </Typography.Paragraph>
            </Card>
          </Col>
        </Row>

        <Table<ClassRow>
          rowKey={(row) => `${row.herbId}-${row.herbName}`}
          loading={loading}
          dataSource={classes}
          pagination={{ pageSize: 20, showSizeChanger: false }}
        >
          <Table.Column<ClassRow> title="类别 ID" dataIndex="herbId" key="herbId" />
          <Table.Column<ClassRow> title="英文名" dataIndex="herbName" key="herbName" />
          <Table.Column<ClassRow> title="中文名" dataIndex="herbNameZh" key="herbNameZh" />
          <Table.Column<ClassRow>
            title="主要功效"
            dataIndex="effects"
            key="effects"
            render={(effects?: string[]) => (effects && effects.length > 0 ? effects.join("、") : "-")}
            ellipsis
            width={280}
          />
          <Table.Column<ClassRow>
            title="样本数"
            dataIndex="count"
            key="count"
            sorter={(a, b) => a.count - b.count}
            defaultSortOrder="descend"
          />
          <Table.Column<ClassRow>
            title="操作"
            key="actions"
            render={(_, row) => (
              <Button size="small" onClick={() => openEdit(row)}>
                编辑信息
              </Button>
            )}
          />
        </Table>
      </Space>

      <Modal
        open={!!editing}
        title={editing ? `编辑类别: ${editing.herbName} (${editing.herbId})` : "编辑类别"}
        onCancel={() => setEditing(null)}
        onOk={() => void saveEdit()}
        confirmLoading={saving}
        width={760}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="herbNameZh" label="中文名">
            <Input placeholder="例如：枸杞子" />
          </Form.Item>
          <Form.Item name="pinyin" label="拼音">
            <Input placeholder="例如：Gou Qi Zi" />
          </Form.Item>
          <Form.Item name="latinName" label="拉丁名">
            <Input />
          </Form.Item>
          <Form.Item name="properties" label="性味">
            <Input placeholder="例如：甘，平" />
          </Form.Item>
          <Form.Item name="meridian" label="归经">
            <Input placeholder="例如：肝、肾经" />
          </Form.Item>
          <Form.Item name="effects" label="功效（输入后回车）">
            <Select mode="tags" tokenSeparators={[",", "，"]} />
          </Form.Item>
          <Form.Item name="usage" label="用法用量">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="cautions" label="注意事项/禁忌">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="description" label="补充说明">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </List>
  );
};
