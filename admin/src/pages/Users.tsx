import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface UserType {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

 const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await axios.get('/api/v1/users');
    setUsers(response.data.data);
  } catch (error) {
    message.error('獲取用戶列表失敗');
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/v1/users/${id}`);
      message.success('刪除用戶成功');
      fetchUsers();
    } catch (error) {
      message.error('刪除用戶失敗');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: ColumnsType<UserType> = [
    {
      title: '用戶名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '郵箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '管理員',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin: boolean) => (isAdmin ? '是' : '否'),
    },
    {
      title: '創建時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" danger onClick={() => handleDelete(record._id)}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>用戶管理</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
};

export default Users; 