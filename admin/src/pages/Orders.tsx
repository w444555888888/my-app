import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { request } from '../utils/apiService';
import './orders.scss';

interface OrderType {
  _id: string;
  hotelId: string;
  roomId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  payment: {
    method: string;
    status: string;
    transactionId: string;
  };
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await request('GET', '/order');
      if (res.success && res.data) {
        setOrders(res.data.length > 0 ? res.data : []);
      }
    } catch (error) {
      message.error('獲取訂單列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await request('DELETE', `/order/${id}`);
      message.success('取消訂單成功');
      fetchOrders();
    } catch (error) {
      message.error('取消訂單失敗');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: ColumnsType<OrderType> = [
    {
      title: '訂單編號',
      dataIndex: '_id',
      key: '_id',
      width: 220,
    },
    {
      title: '飯店 ID',
      dataIndex: 'hotelId',
      key: 'hotelId',
    },
    {
      title: '房型 ID',
      dataIndex: 'roomId',
      key: 'roomId',
    },
    {
      title: '入住日期',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (val: string) => dayjs(val).format('YYYY-MM-DD'),
    },
    {
      title: '退房日期',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      render: (val: string) => dayjs(val).format('YYYY-MM-DD'),
    },
    {
      title: '總價',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `$${price}`,
    },
    {
      title: '付款方式',
      dataIndex: ['payment', 'method'],
      key: 'paymentMethod',
    },
    {
      title: '付款狀態',
      dataIndex: ['payment', 'status'],
      key: 'paymentStatus',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'gold' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === 'confirmed'
            ? 'green'
            : status === 'cancelled'
            ? 'red'
            : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Button
              type="primary"
              danger
              onClick={() => handleCancel(record._id)}
            >
              取消訂單
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-container">
      <h2 className="orders-title">訂單管理</h2>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: '尚無訂單資料' }}
      />
    </div>
  );
};

export default Orders;
