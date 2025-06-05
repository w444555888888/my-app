import React, { useEffect, useState } from 'react';
import {
  Table,
  Space,
  Button,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

interface FlightType {
  _id: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seats: number;
}

const Flights: React.FC = () => {
  const [flights, setFlights] = useState<FlightType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/flight');
      const raw = response.data;

      
      if (raw.success && Array.isArray(raw.data)) {
        setFlights(raw.data);
      } else {
        setFlights([]);
        message.warning('獲取資料格式錯誤');
      }
    } catch (error) {
      message.error('獲取航班列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/v1/flight/${id}`);
      message.success('刪除航班成功');
      fetchFlights();
    } catch (error) {
      message.error('刪除航班失敗');
    }
  };

  const handleAdd = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        departureTime: values.departureTime.format(),
        arrivalTime: values.arrivalTime.format(),
      };
      await axios.post('/api/v1/flight', formattedValues);
      message.success('新增航班成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchFlights();
    } catch (error) {
      message.error('新增航班失敗');
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const columns: ColumnsType<FlightType> = [
    {
      title: '航班號',
      dataIndex: 'flightNumber',
      key: 'flightNumber',
    },
    {
      title: '出發地',
      dataIndex: 'departure',
      key: 'departure',
    },
    {
      title: '目的地',
      dataIndex: 'arrival',
      key: 'arrival',
    },
    {
      title: '出發時間',
      dataIndex: 'departureTime',
      key: 'departureTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '到達時間',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '價格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price}`,
    },
    {
      title: '剩餘座位',
      dataIndex: 'seats',
      key: 'seats',
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
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          新增航班
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={flights}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: <Empty description="尚無航班資料" /> }}
      />

      <Modal
        title="新增航班"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item
            name="flightNumber"
            label="航班號"
            rules={[{ required: true, message: '請輸入航班號' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="departure"
            label="出發地"
            rules={[{ required: true, message: '請輸入出發地' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="arrival"
            label="目的地"
            rules={[{ required: true, message: '請輸入目的地' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="departureTime"
            label="出發時間"
            rules={[{ required: true, message: '請選擇出發時間' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="arrivalTime"
            label="到達時間"
            rules={[{ required: true, message: '請選擇到達時間' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="price"
            label="價格"
            rules={[{ required: true, message: '請輸入價格' }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="seats"
            label="座位數"
            rules={[{ required: true, message: '請輸入座位數' }]}
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

export default Flights;
