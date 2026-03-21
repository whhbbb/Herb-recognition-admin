import { ReloadOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { Alert, Button, Card, Col, Row, Space, Statistic, Table, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, apiRequest } from "../../api/client";

type ClassRow = {
  herbId: string;
  herbName: string;
  count: number;
};

type SampleMeta = {
  total: number;
  uploadDir: string;
};

export const SampleClassList = () => {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [meta, setMeta] = useState<SampleMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [classData, metaData] = await Promise.all([
        apiRequest<ClassRow[]>("/samples/classes"),
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
          <Table.Column<ClassRow> title="类别名称" dataIndex="herbName" key="herbName" />
          <Table.Column<ClassRow> title="样本数" dataIndex="count" key="count" sorter={(a, b) => a.count - b.count} defaultSortOrder="descend" />
        </Table>
      </Space>
    </List>
  );
};
