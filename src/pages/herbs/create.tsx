import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const HerbCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="学名" name="scientificName"><Input /></Form.Item>
        <Form.Item label="性味" name="properties"><Input /></Form.Item>
        <Form.Item label="分类" name="category"><Input /></Form.Item>
        <Form.Item label="功效 (输入后按回车)" name="functions"><Select mode="tags" /></Form.Item>
        <Form.Item label="禁忌 (输入后按回车)" name="cautions"><Select mode="tags" /></Form.Item>
        <Form.Item label="用法" name="usage"><Input /></Form.Item>
        <Form.Item label="图片URL" name="image"><Input /></Form.Item>
        <Form.Item label="描述" name="description"><Input.TextArea rows={4} /></Form.Item>
      </Form>
    </Create>
  );
};