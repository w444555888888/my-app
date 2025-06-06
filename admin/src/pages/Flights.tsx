import React, { useEffect, useState } from 'react';
import {
  Table,
  Space,
  Button,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { request } from '../utils/apiService';
import './flights.scss';

interface FlightSchedule {
  _id: string;
  departureDate: string;
  arrivalDate: string;
  availableSeats: {
    ECONOMY?: number;
    BUSINESS?: number;
    FIRST?: number;
  };
}

interface FlightType {
  _id: string;
  flightNumber: string;
  route: {
    departureCity: string;
    arrivalCity: string;
    flightDuration: number;
  };
  schedules: FlightSchedule[];
}

const Flights: React.FC = () => {
  const [flights, setFlights] = useState<FlightType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightType | null>(null);
  const [form] = Form.useForm();

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const res = await request('GET', '/flight');
      if (res.success && Array.isArray(res.data)) {
        setFlights(res.data);
      } else {
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
      const res = await request('DELETE', `/flight/${id}`);
      if (res.success) {
        message.success('刪除航班成功');
        fetchFlights();
      } else {
        message.error(res.message || '刪除航班失敗');
      }
    } catch (error) {
      message.error('刪除航班失敗');
    }
  };

  const handleEdit = (flight: FlightType) => {
    setEditingFlight(flight);
    setIsModalVisible(true);
    form.setFieldsValue({
      flightNumber: flight.flightNumber,
      departureCity: flight.route.departureCity,
      arrivalCity: flight.route.arrivalCity,
      flightDuration: flight.route.flightDuration,
      departureDate: dayjs(flight.schedules[0].departureDate),
      seatsECONOMY: flight.schedules[0].availableSeats?.ECONOMY || 0,
      seatsBUSINESS: flight.schedules[0].availableSeats?.BUSINESS || 0,
      seatsFIRST: flight.schedules[0].availableSeats?.FIRST || 0,
    });
  };

  const handleSubmit = async (values: any) => {
    const body = {
      flightNumber: values.flightNumber,
      route: {
        departureCity: values.departureCity,
        arrivalCity: values.arrivalCity,
        flightDuration: values.flightDuration,
      },
      cabinClasses: [
        {
          category: 'ECONOMY',
          totalSeats: values.seatsECONOMY,
          basePrice: 1000,
        },
        {
          category: 'BUSINESS',
          totalSeats: values.seatsBUSINESS,
          basePrice: 2000,
        },
        {
          category: 'FIRST',
          totalSeats: values.seatsFIRST,
          basePrice: 3000,
        },
      ].filter(c => c.totalSeats > 0),
      schedules: [
        {
          departureDate: values.departureDate.format(),
        },
      ],
    };

    try {
      const res = editingFlight
        ? await request('PUT', `/flight/${editingFlight._id}`, body)
        : await request('POST', '/flight', body);

      if (res.success) {
        message.success(`${editingFlight ? '編輯' : '新增'}航班成功`);
        setIsModalVisible(false);
        form.resetFields();
        setEditingFlight(null);
        fetchFlights();
      } else {
        message.error(res.message || `${editingFlight ? '編輯' : '新增'}航班失敗`);
      }
    } catch (error) {
      message.error(`${editingFlight ? '編輯' : '新增'}航班失敗`);
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
      title: '航線',
      key: 'route',
      render: (_, record) => `${record.route.departureCity} → ${record.route.arrivalCity}`,
    },
    {
      title: '飛行時間',
      key: 'flightDuration',
      render: (_, record) => `${record.route.flightDuration} 分鐘`,
    },
    {
      title: '出發時間',
      key: 'departureDate',
      render: (_, record) =>
        record.schedules[0]
          ? dayjs(record.schedules[0].departureDate).format('YYYY-MM-DD HH:mm')
          : '-',
    },
    {
      title: '到達時間',
      key: 'arrivalDate',
      render: (_, record) =>
        record.schedules[0]
          ? dayjs(record.schedules[0].arrivalDate).format('YYYY-MM-DD HH:mm')
          : '-',
    },
    {
      title: '經濟艙',
      key: 'economy',
      render: (_, record) => record.schedules[0]?.availableSeats?.ECONOMY ?? '-',
    },
    {
      title: '商務艙',
      key: 'business',
      render: (_, record) => record.schedules[0]?.availableSeats?.BUSINESS ?? '-',
    },
    {
      title: '頭等艙',
      key: 'first',
      render: (_, record) => record.schedules[0]?.availableSeats?.FIRST ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>
            編輯
          </Button>
          <Button danger onClick={() => handleDelete(record._id)}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flights-container">
      <div className="flights-header" style={{ marginBottom: 16 }}>
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
        title={editingFlight ? '編輯航班' : '新增航班'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingFlight(null);
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="flightNumber"
            label="航班號"
            rules={[{ required: true, message: '請輸入航班號' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="departureCity"
            label="出發城市"
            rules={[{ required: true, message: '請輸入出發城市' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="arrivalCity"
            label="到達城市"
            rules={[{ required: true, message: '請輸入到達城市' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="flightDuration"
            label="飛行時間（分鐘）"
            rules={[{ required: true, message: '請輸入飛行時間' }]}
          >
            <InputNumber min={1} className="full-width" />
          </Form.Item>
          <Form.Item
            name="departureDate"
            label="出發時間"
            rules={[{ required: true, message: '請選擇出發時間' }]}
          >
            <DatePicker showTime className="full-width" />
          </Form.Item>
          <Form.Item name="seatsECONOMY" label="經濟艙座位" rules={[{ required: true, message: '請輸入經濟艙座位數' }]}>
            <InputNumber min={0} className="full-width" />
          </Form.Item>
          <Form.Item name="seatsBUSINESS" label="商務艙座位">
            <InputNumber min={0} className="full-width" />
          </Form.Item>
          <Form.Item name="seatsFIRST" label="頭等艙座位">
            <InputNumber min={0} className="full-width" />
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
