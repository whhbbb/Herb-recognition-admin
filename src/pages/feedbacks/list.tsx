import { List, ShowButton, TagField, useTable } from "@refinedev/antd";
import { Table, Space, Rate } from "antd";

export const FeedbackList = () => {
  const { tableProps } = useTable();

  return (
    <List title="模型识别反馈">
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="isCorrect"
          title="识别准确"
          render={(value) => <TagField value={value ? "正确" : "错误"} color={value ? "green" : "red"} />}
        />
        <Table.Column dataIndex="predictedHerbName" title="模型预测" />
        <Table.Column dataIndex="actualHerbName" title="实际药材" />
        <Table.Column
          dataIndex="confidence"
          title="置信度"
          render={(value) => `${(value * 100).toFixed(1)}%`}
        />
        <Table.Column
          dataIndex="userRating"
          title="用户评分"
          render={(value) => <Rate disabled value={value} count={5} style={{ fontSize: 14 }} />}
        />
        <Table.Column
          title="操作"
          render={(_, record: any) => <ShowButton hideText size="small" recordItemId={record.id} />}
        />
      </Table>
    </List>
  );
};