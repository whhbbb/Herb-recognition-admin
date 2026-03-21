import {
    DeleteButton,
    EditButton,
    List,
    ShowButton,
    TagField,
    useTable,
  } from "@refinedev/antd";
  import { BaseRecord } from "@refinedev/core";
  import { Space, Table, Image } from "antd";
  
  export const HerbList = () => {
    const { tableProps } = useTable({
      syncWithLocation: true,
    });
  
    return (
      <List>
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title={"ID"} />
          <Table.Column
            dataIndex="image"
            title={"预览图"}
            render={(value) => <Image src={value} width={50} height={50} style={{ objectFit: "cover" }} />}
          />
          <Table.Column dataIndex="name" title={"名称"} />
          <Table.Column dataIndex="scientificName" title={"学名"} />
          <Table.Column
            dataIndex="category"
            title={"分类"}
            render={(value) => <TagField value={value} color="blue" />}
          />
          <Table.Column
            dataIndex="functions"
            title={"主要功效"}
            render={(value: string[]) => (
              <Space wrap>
                {value?.map((v) => (
                  <TagField key={v} value={v} color="green" />
                ))}
              </Space>
            )}
          />
          <Table.Column
            title={"操作"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.id} />
                <ShowButton hideText size="small" recordItemId={record.id} />
                <DeleteButton hideText size="small" recordItemId={record.id} />
              </Space>
            )}
          />
        </Table>
      </List>
    );
  };