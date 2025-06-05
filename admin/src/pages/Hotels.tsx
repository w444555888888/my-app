import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message, Modal, Form, Input, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { request } from '../utils/apiService';
import './hotels.scss'; 

interface HotelType {
  _id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  distance: string;
  photos: string[];
  title: string;
  desc: string;
  rating: number;
  cheapestPrice: number;
  email: string;
  phone: string;
  checkInTime: string;
  checkOutTime: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  facilities: {
    wifi: boolean;
    parking: boolean;
    pool: boolean;
    gym: boolean;
    spa: boolean;
    restaurant: boolean;
    bar: boolean;
  };
  popularHotel: boolean;
  comments: number;
  nearbyAttractions: string[];
}

interface ApiResponse {
  success: boolean;
  data?: HotelType[]; 
  message?: string;   
}

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res: ApiResponse = await request('GET', '/hotels');
      if (res.success && res.data) {
        setHotels(res.data.length > 0 ? res.data : []);
      } 
    } catch (error) {
      message.error('獲取飯店列表失敗');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request('DELETE', `/hotels/${id}`);
      if (res.success) {
        message.success('刪除飯店成功');
        fetchHotels();
      } else {
        message.error(res.message || '刪除飯店失敗');
      }
    } catch (error) {
      message.error('刪除飯店失敗');
    }
  };

  const handleAdd = async (values: any) => {
    try {
      const res = await request('POST', '/hotels', values);
      if (res.success) {
        message.success('新增飯店成功');
        setIsModalVisible(false);
        form.resetFields();
        fetchHotels();
      } else {
        message.error(res.message || '新增飯店失敗');
      }
    } catch (error) {
      message.error('新增飯店失敗');
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const columns: ColumnsType<HotelType> = [
    {
      title: '飯店名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '評分',
      dataIndex: 'rating',
      key: 'rating',
    },
    {
      title: '最低價格',
      dataIndex: 'cheapestPrice',
      key: 'cheapestPrice',
      render: (price: number) => `$${price}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => console.log('編輯', record._id)}>
            編輯
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record._id)}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="hotels-container">
      <div className="hotels-header" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          新增飯店
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: '尚無飯店資料' }}
      />

      <Modal
        title="新增飯店"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item
            name="name"
            label="飯店名稱"
            rules={[{ required: true, message: '請輸入飯店名稱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '請輸入城市' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="類型"
            rules={[{ required: true, message: '請輸入類型' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '請輸入地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cheapestPrice"
            label="最低價格"
            rules={[{ required: true, message: '請輸入最低價格' }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Hotels;
