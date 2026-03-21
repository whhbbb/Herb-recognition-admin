import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { Alert, Button, Image, Popconfirm, Select, Space, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/client";

type SampleItem = {
  id: string;
  herbId: string;
  herbName: string;
  fileUrl: string;
  source: "manual" | "dataset";
  split: "train" | "val" | "test";
  createdAt: string;
};

type SampleListResp = {
  items: SampleItem[];
  total: number;
  page: number;
  pageSize: number;
};

type SourceFilter = "all" | "manual" | "dataset";
type SplitFilter = "all" | "train" | "val" | "test";

export const SampleList = () => {
  const [items, setItems] = useState<SampleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [source, setSource] = useState<SourceFilter>("all");
  const [split, setSplit] = useState<SplitFilter>("all");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (source !== "all") params.set("source", source);
    if (split !== "all") params.set("split", split);
    return params.toString();
  }, [page, pageSize, source, split]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<SampleListResp>(`/samples?${queryString}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [queryString]);

  const removeSample = async (id: string) => {
    setDeletingId(id);
    setError("");
    try {
      await apiRequest(`/samples/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <List
      title="样本管理"
      headerButtons={
        <Space>
          <Select<SourceFilter>
            value={source}
            onChange={(value) => {
              setPage(1);
              setSource(value);
            }}
            options={[
              { value: "all", label: "全部来源" },
              { value: "dataset", label: "数据集" },
              { value: "manual", label: "手动上传" },
            ]}
            style={{ width: 120 }}
          />
          <Select<SplitFilter>
            value={split}
            onChange={(value) => {
              setPage(1);
              setSplit(value);
            }}
            options={[
              { value: "all", label: "全部集合" },
              { value: "train", label: "train" },
              { value: "val", label: "val" },
              { value: "test", label: "test" },
            ]}
            style={{ width: 120 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
            刷新
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Table<SampleItem>
          rowKey="id"
          dataSource={items}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
        >
          <Table.Column<SampleItem> title="ID" dataIndex="id" key="id" width={240} ellipsis />
          <Table.Column<SampleItem> title="类别" dataIndex="herbName" key="herbName" />
          <Table.Column<SampleItem> title="类别ID" dataIndex="herbId" key="herbId" />
          <Table.Column<SampleItem>
            title="图片"
            key="fileUrl"
            render={(_, row) => (
              <Image
                width={56}
                height={56}
                src={row.fileUrl}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
            )}
          />
          <Table.Column<SampleItem>
            title="来源"
            dataIndex="source"
            key="source"
            render={(value: SampleItem["source"]) => (
              <Tag color={value === "dataset" ? "blue" : "green"}>{value}</Tag>
            )}
          />
          <Table.Column<SampleItem> title="集合" dataIndex="split" key="split" />
          <Table.Column<SampleItem>
            title="创建时间"
            dataIndex="createdAt"
            key="createdAt"
            render={(value: string) => new Date(value).toLocaleString()}
          />
          <Table.Column<SampleItem>
            title="操作"
            key="actions"
            render={(_, row) => (
              <Popconfirm
                title="确认删除该样本？"
                okButtonProps={{ danger: true, loading: deletingId === row.id }}
                onConfirm={() => void removeSample(row.id)}
              >
                <Button danger icon={<DeleteOutlined />} size="small">
                  删除
                </Button>
              </Popconfirm>
            )}
          />
        </Table>
      </Space>
    </List>
  );
};
