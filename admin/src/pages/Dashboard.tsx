import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  ScheduleOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: 'users', icon: <UserOutlined />, label: '用戶管理' },
    { key: 'hotels', icon: <HomeOutlined />, label: '飯店管理' },
    { key: 'flights', icon: <ScheduleOutlined />, label: '航班管理' },
    { key: 'orders', icon: <ShoppingCartOutlined />, label: '訂單管理' },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255,255,255,0.2)' }} />
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname.replace('/', '')]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
