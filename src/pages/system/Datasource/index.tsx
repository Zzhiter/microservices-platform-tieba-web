import React, { useEffect, useState } from 'react';
import { PageContainer, ProFormSelect, ProFormText, ProTable, QueryFilter } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { queryTables, createTable, deleteTable, queryTableNames } from '@/services/system/api'; // 替换为实际的 API 调用方法

const { Link } = Typography;

const Datasource: React.FC = () => {
  const [params, setParams] = useState<Record<string, string | number>>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState<string | undefined>();
  const [tableNames, setTableNames] = useState<string[]>([]);


  useEffect(() => {
    // 获取业务线下的所有表名
    queryTableNames().then((data) => setTableNames(data.data));
  }, []);

  const columns = [
    {
      title: '表名',
      dataIndex: 'table_name',
      key: 'table_name',
    },
    {
      title: '业务线',
      dataIndex: 'tenant_id',
      key: 'tenant_id',
    },
    {
      title: '描述',
      dataIndex: 'table_description',
      key: 'table_description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Link onClick={() => handleEditTable(record)}>编辑</Link>
          <DeleteOutlined style={{ color: 'red', marginLeft: 8 }} onClick={() => handleDeleteTable(record)} />
        </>
      ),
    },
  ];

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
          // onChange={handleSelectTable}
        />
      </QueryFilter>
      <ProTable
        headerTitle="数据表列表"
        columns={columns}
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
