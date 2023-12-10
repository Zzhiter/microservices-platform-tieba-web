import { batchUpdatePost, queryTables } from '@/services/system/api';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Space, Spin, Table, message } from 'antd';
import { useEffect, useState } from 'react';

// const { RangePicker } = DatePicker;

// const valueEnum = {
//   0: 'close',
//   1: 'running',
//   2: 'online',
//   3: 'error',
// };

// const ProcessMap = {
//   close: 'normal',
//   running: 'active',
//   online: 'success',
//   error: 'exception',
// } as const;

export type TableListItem = {
  key: number;
  pid: number;
  title: string;
  text: string;
  date: string;
  comments: number;
  uid: number;
  type: number;
  tenant_id: string;
};
// const tableListDataSource: TableListItem[] = [];

// const creators = ['付小小', '曲丽丽', '林东东', '陈帅帅', '兼某某'];

// for (let i = 0; i < 50; i += 1) {
//   tableListDataSource.push({
//     key: i,
//     name: 'AppName-' + i,
//     containers: Math.floor(Math.random() * 20),
//     callNumber: Math.floor(Math.random() * 2000),
//     progress: Math.ceil(Math.random() * 100) + 1,
//     creator: creators[Math.floor(Math.random() * creators.length)],
//     status: valueEnum[((Math.floor(Math.random() * 10) % 4) + '') as '0'],
//     createdAt: Date.now() - Math.floor(Math.random() * 100000),
//     memo:
//       i % 2 === 1
//         ? '很长很长很长很长很长很长很长的文字要展示但是要留下尾巴'
//         : '简短备注文案',
//   });
// }

const columns: ProColumns<TableListItem>[] = [
  {
    title: 'pid',
    width: 120,
    dataIndex: 'pid',
    fixed: 'left',
    render: (_) => <a>{_}</a>,
  },
  {
    title: 'title',
    width: 120,
    dataIndex: 'title',
    align: 'right',
    search: false,
    // sorter: (a, b) => a.containers - b.containers,
  },
  {
    title: 'text',
    width: 120,
    align: 'right',
    dataIndex: 'text',
  },
  {
    title: 'comments',
    dataIndex: 'comments',
    // valueType: (item) => ({
    //   type: 'progress',
    //   status: ProcessMap[item.status as 'close'],
    // }),
  },
  {
    title: 'uid',
    width: 120,
    dataIndex: 'uid',
    // valueType: 'select',
    // valueEnum: {
    //   all: { text: '全部' },
    //   付小小: { text: '付小小' },
    //   曲丽丽: { text: '曲丽丽' },
    //   林东东: { text: '林东东' },
    //   陈帅帅: { text: '陈帅帅' },
    //   兼某某: { text: '兼某某' },
    // },
  },
  {
    title: 'type',
    width: 140,
    key: 'type',
    dataIndex: 'type',
    // valueType: 'date',
    // sorter: (a, b) => a.createdAt - b.createdAt,
    // renderFormItem: () => {
    //   return <RangePicker />;
    // },
  },
  {
    title: 'tenant_id',
    dataIndex: 'tenant_id',
    // ellipsis: true,
    // copyable: true,
    // search: false,
  },
];

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableListDataSource, setTableListDataSource] = useState<TableListItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async (params?: { current?: number; pageSize?: number }) => {
    try {
      const result = await queryTables({
        page: params?.current || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
        tableName: 'post',
      });
      setTableListDataSource(result.data);
      setPagination({ ...pagination, total: result.total });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures useEffect runs once on mount

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
    fetchData({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const handleBatchAction = async (actionType: 'approve' | 'reject') => {
    // Get the selected rows
    const selectedRows = tableListDataSource.filter((item) => selectedRowKeys.includes(item.key));
    console.log(selectedRows)
    // Perform the batch action based on the type (approve or reject)
    try {
      setLoading(true);
      const result = await batchUpdatePost(
        { actionType: actionType, pids: selectedRows.map((row) => row.pid) },
        'post',
        // Add other necessary parameters
      );

      // Optionally, handle the result or show a notification
      console.log('Batch action result:', result);
      message.success("操作成功！")
    } catch (error) {
      console.error('Error performing batch action:', error);
      message.error("操作失败！")
    } finally {
      setLoading(false);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleApprove = () => {
    handleBatchAction('approve');
  };
  
  const handleReject = () => {
    handleBatchAction('reject');
  };

  return (
    <>
    {/* TODO: 这里添加一个筛选框，可以根据type筛选数据 */}
    <Spin spinning={loading}>
    <ProTable<TableListItem>
      columns={columns}
      rowSelection={{
        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
        // 注释该行则默认不显示下拉选项
        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        defaultSelectedRowKeys: [1],
        onChange: onSelectChange,
      }}
      tableAlertOptionRender={() => {
        return (
          <Space size={16}>
            <Button onClick={handleApprove}>批量同意</Button>
    <Button onClick={handleReject}>批量拒绝</Button>
          </Space>
        );
      }}      
      dataSource={tableListDataSource}
      scroll={{ x: 1300 }}
      options={false}
      search={false}
      pagination={{
        ...pagination,
        onChange: handleTableChange,
      }}
      rowKey="key"
      headerTitle="批量操作"
    />
    </Spin>
    </>
  );
};
