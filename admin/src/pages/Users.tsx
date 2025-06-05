import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message, Modal, Form, Input, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { request } from '../utils/apiService';
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
  const [form] = Form.useForm();

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

  // 新增用戶
  const handleAddUser = async () => {
    try {
      const values = await form.validateFields();
      const res = await request('POST', '/auth/register', values);
      if (res.success) {
        message.success('新增用戶成功');
        setModalVisible(false);
        form.resetFields();
        fetchUsers();
      } else {
        message.error(res.message || '新增用戶失敗');
      }
    } catch (error) {
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
    <div className="users-container">
      <h2 className="users-title">用戶管理</h2>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setModalVisible(true)}
      >
        新增用戶
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
      />


      <Modal
        title="新增用戶"
        visible={modalVisible}
        onOk={handleAddUser}
        onCancel={() => setModalVisible(false)}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用戶名"
            name="username"
            rules={[{ required: true, message: '請輸入用戶名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="郵箱"
            name="email"
            rules={[
              { required: true, message: '請輸入郵箱' },
              { type: 'email', message: '請輸入有效郵箱' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密碼"
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="isAdmin" valuePropName="checked">
            <Checkbox>管理員權限</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
