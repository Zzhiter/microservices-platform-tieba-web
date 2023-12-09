import type { ProColumns } from '@ant-design/pro-components';
import { message, Spin } from 'antd';
import {
  EditableProTable,
  ProCard,
  ProFormField,
  ProFormRadio,
  QueryFilter,
  ProFormSelect,
} from '@ant-design/pro-components';
import React, { useState, useEffect } from 'react';
import {
  queryTables,
  createTable,
  deleteTable,
  queryTableNames,
  queryTableColumns,
  updateTables,
} from '@/services/system/api'; // 替换为实际的 API 调用方法

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

type DataSourceType = {
  id: React.Key;
  title?: string;
  readonly?: string;
  decs?: string;
  state?: string;
  created_at?: number;
  update_at?: number;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = [
  {
    id: 624748504,
    title: '活动名称一',
    readonly: '活动名称一',
    decs: '这个活动真好玩',
    state: 'open',
    created_at: 1590486176000,
    update_at: 1590486176000,
  },
  {
    id: 624691229,
    title: '活动名称二',
    readonly: '活动名称二',
    decs: '这个活动真好玩',
    state: 'closed',
    created_at: 1590481162000,
    update_at: 1590481162000,
  },
];

export default () => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>([]);
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
  const [params, setParams] = useState<Record<string, string | number>>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState<string>('');
  const [tableColumns, setTableColumns] = useState<any[]>([]); // 用于存储表格列信息
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // const columns: ProColumns<DataSourceType>[] = [
  //   {
  //     title: '活动名称',
  //     dataIndex: 'title',
  //     tooltip: '只读，使用form.getFieldValue获取不到值',
  //     formItemProps: (form, { rowIndex }) => {
  //       return {
  //         rules:
  //           rowIndex > 1 ? [{ required: true, message: '此项为必填项' }] : [],
  //       };
  //     },
  //     // 第一行不允许编辑
  //     editable: (text, record, index) => {
  //       return index !== 0;
  //     },
  //     width: '15%',
  //   },
  //   {
  //     title: '活动名称二',
  //     dataIndex: 'readonly',
  //     tooltip: '只读，使用form.getFieldValue可以获取到值',
  //     readonly: true,
  //     width: '15%',
  //   },
  //   {
  //     title: '状态',
  //     key: 'state',
  //     dataIndex: 'state',
  //     valueType: 'select',
  //     valueEnum: {
  //       all: { text: '全部', status: 'Default' },
  //       open: {
  //         text: '未解决',
  //         status: 'Error',
  //       },
  //       closed: {
  //         text: '已解决',
  //         status: 'Success',
  //       },
  //     },
  //   },
  //   {
  //     title: '描述',
  //     dataIndex: 'decs',
  //     fieldProps: (form, { rowKey, rowIndex }) => {
  //       if (form.getFieldValue([rowKey || '', 'title']) === '不好玩') {
  //         return {
  //           disabled: true,
  //         };
  //       }
  //       if (rowIndex > 9) {
  //         return {
  //           disabled: true,
  //         };
  //       }
  //       return {};
  //     },
  //   },
  //   {
  //     title: '活动时间',
  //     dataIndex: 'created_at',
  //     valueType: 'date',
  //   },
  //   {
  //     title: '操作',
  //     valueType: 'option',
  //     width: 200,
  //     render: (text, record, _, action) => [
  //       <a
  //         key="editable"
  //         onClick={() => {
  //           action?.startEditable?.(record.id);
  //         }}
  //       >
  //         编辑
  //       </a>,
  //       <a
  //         key="delete"
  //         onClick={() => {
  //           setDataSource(dataSource.filter((item) => item.id !== record.id));
  //         }}
  //       >
  //         删除
  //       </a>,
  //     ],
  //   },
  // ];

  useEffect(() => {
    // 获取业务线下的所有表名
    queryTableNames().then((names) => setTableNames(names.data));
  }, []);

  useEffect(() => {
    // 用户选择表名后，获取表格列信息
    if (selectedTableName) {
      queryTableColumns(selectedTableName).then((columns) =>
        setTableColumns(buildTableColumns(columns.data)),
      );
    }
  }, [selectedTableName]);

  const last_column: any = {
    title: '操作',
    valueType: 'option',
    width: 200,
    render: (text, record, _, action) => [
      <a
        key="editable"
        onClick={() => {
          console.log('点击了开始编辑哦!');
          action?.startEditable?.(record.id);
          console.log(editableKeys);
          // console.log("text: ", text, record);
        }}
      >
        编辑
      </a>,
      // rendering your delete link
      <a key="delete" onClick={() => handleDelete(record.pid, selectedTableName)}>
        删除
      </a>,
    ],
  };

  // in your component or wherever you want to trigger the delete
  const handleDelete = async (recordId: number, tableName: string) => {
    const deleteResult = await deleteRecord(recordId, tableName);

    if (deleteResult.success) {
      console.log('Record deleted successfully.');
      // Perform additional actions if needed, such as refreshing the data.
    } else {
      console.error('Error deleting record.');
    }
  };

  const buildTableColumns = (data: SYSTEM.TableField[]): column[] => {
    const res = data.map((field) => ({
      title: field.fieldName,
      dataIndex: field.fieldName,
      key: field.fieldName,
    }));
    res.push(last_column);
    return res;
  };

  const handleSelectTable = async (value: string) => {
    // 用户选择表名后，根据选择的表名查询对应的数据
    console.log('选择的表名：', value);
    setSelectedTableName(value);
    setParams({ tableName: value });
  };

  return (
    <>
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
      <Spin spinning={loading}>
        {selectedTableName && (
          <EditableProTable
            rowKey="id"
            headerTitle="可编辑表格"
            maxLength={5}
            scroll={{
              x: 960,
            }}
            recordCreatorProps={
              position !== 'hidden'
                ? {
                    position: position as 'top',
                    record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
                  }
                : false
            }
            loading={false}
            toolBarRender={() => [
              <ProFormRadio.Group
                key="render"
                fieldProps={{
                  value: position,
                  onChange: (e) => setPosition(e.target.value),
                }}
                options={[
                  {
                    label: '添加到顶部',
                    value: 'top',
                  },
                  {
                    label: '添加到底部',
                    value: 'bottom',
                  },
                  {
                    label: '隐藏',
                    value: 'hidden',
                  },
                ]}
              />,
            ]}
            columns={tableColumns}
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
                // page: params.current,
                page: 1,
                // pageSize: params.pageSize,
                pageSize: 10,
                tableName: params.tableName,
              });
              let counter = 1;
              return {
                data: msg.data.map((item) => ({
                  id: counter++,
                  ...item,
                })),
                // success 请返回 true，
                // 不然 table 会停止解析数据，即使有数据
                success: msg.success,
                // 不传会使用 data 的长度，如果是分页一定要传
                total: msg.total,
              };
            }}
            // value={dataSource}
            // onChange={setDataSource}
            params={params}
            editable={{
              type: 'multiple',
              onSave: async (rowKey, data, row, newLineConfig) => {
                console.log('保存编辑后的数据：', rowKey, data, row);

                // Set loading to true
                setLoading(true);

                try {
                  const res = await updateTables(data, selectedTableName);
                  // await waitTime(1000);

                  if (res.success !== 0) {
                    // Handle the case when the update was not successful
                    console.error('Update failed:', res.message);
                    // Display a pop-up message to the user
                    message.error(`Failed to save data: ${res.message}`);
                  } else {
                    // Update was successful
                    // Provide feedback to the user if needed
                    message.success('Data saved successfully');
                    // // Update the corresponding row in dataSource with the new data
                    // setDataSource((prevData) =>
                    //   prevData.map((item) =>
                    //     item.id === rowKey ? { ...item, ...data } : item
                    //   )
                    // );
                  }
                } catch (error) {
                  // Handle unexpected errors during the update
                  console.error('An unexpected error occurred during the update:', error);
                  // Display a pop-up message to the user
                  message.error('An unexpected error occurred. Please try again.');
                } finally {
                  // Ensure to set loading to false, regardless of success or failure
                  setLoading(false);
                }
              },
            }}
          />
        )}
      </Spin>
    </>
  );
};
