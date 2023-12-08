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
  const [selectedTableName, setSelectedTableName] = useState<string>("");
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
    // console.log("res:", res);
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

  const handleSelectTable = async (value: string) => {
    // 用户选择表名后，根据选择的表名查询对应的数据
    console.log("选择的表名：", value);
    setSelectedTableName(value);
    setParams({tableName: value});
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
        // request={queryTables(selectedTableName)} 
        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params: T & {
            pageSize: number;
            current: number;
            tableName: string;
          },
          sort,
          filter,
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          const msg = await queryTables({
            page: params.current,
            pageSize: params.pageSize,
            tableName: params.tableName,
          });
          return {
            data: msg.data,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: msg.success,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: msg.total,
          };
        }}
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
