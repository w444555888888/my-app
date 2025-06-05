import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Card,
  Space,
  Modal,
  message
} from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface LoginFormData {
  account: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({ account: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm] = Form.useForm();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/login', formData, {
        withCredentials: true
      });

      if (res.data.data.userDetails.isAdmin) {
        navigate('/dashboard');
      } else {
        setError('非管理員帳號，無法登入！');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormData) => {
    try {
      await axios.post('http://localhost:5000/api/v1/auth/register', values);
      message.success('註冊成功，請登入');
      setIsRegisterModalOpen(false);
      registerForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || '註冊失敗');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
      <Card style={{ width: 400 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3} style={{ textAlign: 'center' }}>管理員登入</Title>

          {error && <Alert type="error" message={error} showIcon />}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="電子郵件"
              name="account"
              rules={[{ required: true, message: '請輸入電子郵件' }]}
              initialValue={formData.account}
            >
              <Input
                prefix={<MailOutlined />}
                value={formData.account}
                onChange={e => setFormData({ ...formData, account: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              label="密碼"
              name="password"
              rules={[{ required: true, message: '請輸入密碼' }]}
              initialValue={formData.password}
            >
              <Input.Password
                prefix={<LockOutlined />}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading}>
              {loading ? '登入中...' : '登入'}
            </Button>
          </Form>

          <Button type="link" block onClick={() => setIsRegisterModalOpen(true)}>
            沒有帳號？註冊
          </Button>
        </Space>
      </Card>

      <Modal
        title="註冊新帳號"
        open={isRegisterModalOpen}
        onCancel={() => setIsRegisterModalOpen(false)}
        onOk={() => registerForm.submit()}
        okText="註冊"
        cancelText="取消"
      >
        <Form layout="vertical" form={registerForm} onFinish={handleRegister}>
          <Form.Item
            label="用戶名"
            name="username"
            rules={[{ required: true, message: '請輸入用戶名' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="電子郵件"
            name="email"
            rules={[{ required: true, message: '請輸入電子郵件' }]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            label="密碼"
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
