import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { request } from '../utils/apiService';
import DynamicFormModal, { FormFieldConfig } from '../component/DynamicFormModal';
import './users.scss';

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
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsers = async () => {
    const res = await request('GET', '/users', {}, setLoading);
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
    } else {
      message.error(res.message || '獲取用戶列表失敗');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await request('DELETE', `/users/${id}`);
    if (res.success) {
      message.success('刪除用戶成功');
      fetchUsers();
    } else {
      message.error(res.message || '刪除用戶失敗');
    }
  };

  const handleAddUser = async (values: any) => {
    const res = await request('POST', '/auth/register', values);
    if (res.success) {
      message.success('新增用戶成功');
      setModalVisible(false);
      fetchUsers();
    } else {
      message.error(res.message || '新增用戶失敗');
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

  const userFormFields: FormFieldConfig[] = [
    { name: 'username', label: '用戶名', type: 'input', required: true },
    { name: 'email', label: '郵箱', type: 'input', required: true, placeholder: '請輸入有效郵箱' },
    { name: 'password', label: '密碼', type: 'input', required: true, placeholder: '請輸入密碼' },
    { name: 'isAdmin', label: '管理員權限', type: 'checkboxGroup', options: [{ label: '是', value: true }] }
  ];

  return (
    <div className="users-container">
      <div className="users-header">
        <div className="users-title">用戶管理</div>
        <Button
          type="primary"
          className="add-user-btn"
          onClick={() => setModalVisible(true)}
        >
          新增用戶
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
      />

      <DynamicFormModal
        visible={modalVisible}
        title="新增用戶"
        fields={userFormFields}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleAddUser}
      />
    </div>
  );
};

export default Users;
