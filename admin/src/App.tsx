/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2025-06-05 19:39:35
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-06-05 20:40:00
 * @FilePath: \my-app\admin\src\App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import './App.css';
import 'leaflet/dist/leaflet.css';

import { checkLogin } from './utils/auth';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Hotels from './pages/Hotels';
import Orders from './pages/Orders';
import Flights from './pages/Flights';
import FlightOrders from './pages/FlightOrders';





const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const user = await checkLogin();
      setIsLogin(!!user);
      setIsLoading(false);
    };
    verify();
  }, []);

  if (isLoading) {
    return (
      <div className="fullscreen-center">
        <Spin size="large" />
      </div>
    );
  }

  return isLogin ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          >
            <Route path="users" element={<Users />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="orders" element={<Orders />} />
            <Route path="flights" element={<Flights />} />
            <Route path="flight-orders" element={<FlightOrders />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
