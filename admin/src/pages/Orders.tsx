import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

interface OrderType {
  _id: string;
  userId: string;
  flightId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  flight: {
    flightNumber: string;
    departure: string;
    arrival: string;
    departureTime: string;
  };
  user: {
    username: string;
    email: string;
  };
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/order');
      const raw = response.data;

      // ✅ 修正重點：只設 data 陣列
      if (raw.success && Array.isArray(raw.data)) {
        setOrders(raw.data);
      } else {
        setOrders([]);
        message.warning('訂單資料格式錯誤');
      }
    } catch (error) {
      message.error('獲取訂單列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await axios.post(`/api/v1/flight/orders/${id}/cancel`);
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
      title: '用戶名',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: '航班號',
      dataIndex: ['flight', 'flightNumber'],
      key: 'flightNumber',
    },
    {
      title: '航線',
      key: 'route',
      render: (_, record) => (
        <span>
          {record.flight?.departure || '-'} → {record.flight?.arrival || '-'}
        </span>
      ),
    },
    {
      title: '出發時間',
      dataIndex: ['flight', 'departureTime'],
      key: 'departureTime',
      render: (time: string) =>
        time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '總價',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `$${price}`,
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
            : 'gold';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: '下單時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) =>
        time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'confirmed' && (
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
    <div>
      <h2 style={{ marginBottom: 16 }}>訂單管理</h2>
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
