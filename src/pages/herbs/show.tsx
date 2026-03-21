import { Show, TextField, TagField, MarkdownField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Space, Image } from "antd";

const { Title } = Typography;

export const HerbShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>名称</Title>
      <TextField value={record?.name} />
      <Title level={5}>学名</Title>
      <TextField value={record?.scientificName} />
      <Title level={5}>图片</Title>
      <Image src={record?.image} width={200} />
      <Title level={5}>功效</Title>
      <Space wrap>
        {record?.functions?.map((v: string) => <TagField key={v} value={v} color="green" />)}
      </Space>
      <Title level={5}>详细描述</Title>
      <MarkdownField value={record?.description} />
    </Show>
  );
};