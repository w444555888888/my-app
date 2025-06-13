import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';
import './dashboard.scss';

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: 'users', icon: <UserOutlined />, label: '用戶管理' },
    { key: 'hotels', icon: <HomeOutlined />, label: '飯店管理' },
    { key: 'flights', icon: <ScheduleOutlined />, label: '航班管理' },
    { key: 'orders', icon: <ShoppingCartOutlined />, label: '訂單管理' },
    { key: 'flight-orders', icon: <FileDoneOutlined />, label: '機票訂單' }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  return (
    <Layout className="dashboard">
      <Sider width={200} theme="dark" collapsible>
        <div className="dashboard__logo">
          <DashboardOutlined className="dashboard__icon" />
          訂房後台
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[menuItems.find(item => location.pathname.startsWith(item.key))?.key || '']}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="dashboard__header">
          <div className="dashboard__header-content">
            <span className="dashboard__welcome"><UserOutlined />管理員</span>
            <button
              className="dashboard__logout"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              登出
            </button>
          </div>
        </Header>
        <Content className="dashboard__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
