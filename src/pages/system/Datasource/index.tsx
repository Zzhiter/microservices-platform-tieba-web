import React, { useEffect, useState } from 'react';
import { PageContainer, ProFormSelect, ProFormText, ProTable, QueryFilter } from '@ant-design/pro-components';
import { Button, Typography, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { queryTables, createTable, deleteTable, queryTableNames, queryTableColumns } from '@/services/system/api'; // 替换为实际的 API 调用方法

const { Link } = Typography;

type column = {
  title: string;
  dataIndex: string;
  key: string;
};

const Datasource: React.FC = () => {
  const [params, setParams] = useState<Record<string, string | number>>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState<string | undefined>();
  const [tableColumns, setTableColumns] = useState<any[]>([]); // 用于存储表格列信息
  const [tableNames, setTableNames] = useState<string[]>([]);


  useEffect(() => {
    // 获取业务线下的所有表名
    queryTableNames().then((names) => setTableNames(names.data));
  }, []);

  useEffect(() => {
    // 用户选择表名后，获取表格列信息
    if (selectedTableName) {
      queryTableColumns(selectedTableName).then((columns) => setTableColumns(buildTableColumns(columns.data)));
    }
  }, [selectedTableName]);

  const buildTableColumns = (data: SYSTEM.TableField[]): column[] => {
    const res = data.map(field => ({
      title: field.fieldName,
      dataIndex: field.fieldName,
      key: field.fieldName
    }));
    console.log("res:", res);
    return res;
  };
  

  // const columns = [
  //   {
  //     title: '表名',
  //     dataIndex: 'table_name',
  //     key: 'table_name',
  //   },
  //   {
  //     title: '业务线',
  //     dataIndex: 'tenant_id',
  //     key: 'tenant_id',
  //   },
  //   {
  //     title: '描述',
  //     dataIndex: 'table_description',
  //     key: 'table_description',
  //   },
  //   {
  //     title: '操作',
  //     key: 'action',
  //     render: (_, record) => (
  //       <>
  //         <Link onClick={() => handleEditTable(record)}>编辑</Link>
  //         <DeleteOutlined style={{ color: 'red', marginLeft: 8 }} onClick={() => handleDeleteTable(record)} />
  //       </>
  //     ),
  //   },
  // ];

  // const handleSelectTable = async (value: {tableName: string, label: string}) => {
  //   // 用户选择表名后，根据选择的表名查询对应的数据
  //   console.log("hhhhhhhhhhhhhhh")
  //   setSelectedTableName(value.tableName);
  //   setParams({});
  // };

  const handleSelectTable = async (value: string) => {
    // 用户选择表名后，根据选择的表名查询对应的数据
    console.log("选择的表名：", value);
    setSelectedTableName(value);
    setParams({});
  };
  

  const handleCreateTable = async (values) => {
    await createTable(values);
    setCreateModalVisible(false);
  };

  const handleDeleteTable = async (record) => {
    await deleteTable(record.table_id);
    // 刷新表格数据
    setParams({});
  };

  const handleEditTable = (record) => {
    // 编辑表格的逻辑，可以根据实际情况处理
    console.log('Edit table:', record);
  };

  return (
    <PageContainer
      header={{
        title: '数据表管理',
        breadcrumb: {
          routes: [
            {
              path: '/',
              breadcrumbName: '首页',
            },
            {
              path: '/table-management',
              breadcrumbName: '数据表管理',
            },
          ],
        },
        subTitle: '管理系统中的数据表',
      }}
      extra={[
        // <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => queryTables()}>
        //   获取数据
        // </Button>,
        <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          新建表格
        </Button>,
      ]}
    >
      <QueryFilter span={6}>
        <ProFormSelect
          name="table_name"
          label="选择表"
          placeholder="请选择表"
          options={tableNames.map((name) => ({ label: name, value: name }))}
          fieldProps={{
            showSearch: true,
            filterOption: (input, option) =>
              option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0,
          }}
          onChange={handleSelectTable}
        />
      </QueryFilter>
      <ProTable
        headerTitle="数据表列表"
        columns={tableColumns}
        request={queryTables} // 替换为实际的数据请求方法
        search={false}
        params={params}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

    </PageContainer>
  );
};

export default Datasource;
