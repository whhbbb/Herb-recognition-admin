import { Show, TextField, TagField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const FeedbackShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>预测名称</Title>
      <TextField value={record?.predictedHerbName} />
      <Title level={5}>真实名称</Title>
      <TextField value={record?.actualHerbName} />
      <Title level={5}>用户评论</Title>
      <TextField value={record?.comments || "无评论"} />
    </Show>
  );
};