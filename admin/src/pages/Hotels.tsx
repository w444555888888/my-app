import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  Button,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  TimePicker
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { request } from "../utils/apiService";
import "./hotels.scss";

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
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res: ApiResponse = await request("GET", "/hotels");
      if (res.success && res.data) {
        setHotels(res.data.length > 0 ? res.data : []);
      }
    } catch (error) {
      message.error("獲取飯店列表失敗");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request("DELETE", `/hotels/${id}`);
      if (res.success) {
        message.success("刪除飯店成功");
        fetchHotels();
      } else {
        message.error(res.message || "刪除飯店失敗");
      }
    } catch (error) {
      message.error("刪除飯店失敗");
    }
  };

  const handleSubmit = async (values: any) => {
    const body = {
      ...values,
      checkInTime: values.checkInTime.format('HH:mm'),
      checkOutTime: values.checkOutTime.format('HH:mm'),
      photos: values.photos?.split(',').map((s: string) => s.trim()),
      nearbyAttractions: values.nearbyAttractions?.split(',').map((s: string) => s.trim()),
      facilities: {
        wifi: values.facilities?.includes('wifi') || false,
        parking: values.facilities?.includes('parking') || false,
        pool: values.facilities?.includes('pool') || false,
        gym: values.facilities?.includes('gym') || false,
        spa: values.facilities?.includes('spa') || false,
        restaurant: values.facilities?.includes('restaurant') || false,
        bar: values.facilities?.includes('bar') || false,
      },
    };

    try {
      const res = editingHotel
        ? await request('PUT', `/hotels/${editingHotel._id}`, body)
        : await request('POST', '/hotels', body);

      if (res.success) {
        message.success(editingHotel ? '編輯成功' : '新增成功');
        setIsModalVisible(false);
        form.resetFields();
        setEditingHotel(null);
        fetchHotels();
      } else {
        message.error(res.message || (editingHotel ? '編輯失敗' : '新增失敗'));
      }
    } catch (error) {
      message.error(editingHotel ? '編輯失敗' : '新增失敗');
    }
  }


  const handleEdit = async (id: string) => {
    try {
      const res = await request('GET', `/hotels/find/${id}`);
      if (res.success && res.data) {
        const hotel = res.data;
        form.setFieldsValue({
          ...hotel,
          photos: hotel.photos.join(','),
          nearbyAttractions: hotel.nearbyAttractions.join(','),
          facilities: Object.keys(hotel.facilities).filter((key) => hotel.facilities[key]),
          coordinates: hotel.coordinates,
          checkInTime: dayjs(hotel.checkInTime, 'HH:mm'),
          checkOutTime: dayjs(hotel.checkOutTime, 'HH:mm'),
        });
        setEditingHotel(hotel);
        setIsModalVisible(true);
      } else {
        message.error('找不到飯店資料');
      }
    } catch (error) {
      message.error('讀取資料失敗');
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const columns: ColumnsType<HotelType> = [
    {
      title: "飯店名稱",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "城市",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "類型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "評分",
      dataIndex: "rating",
      key: "rating",
    },
    {
      title: "最低價格",
      dataIndex: "cheapestPrice",
      key: "cheapestPrice",
      render: (price: number) => `$${price}`,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record._id)}>
            編輯
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDelete(record._id)}
          >
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="hotels-container">
      <div className="hotels-header" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => {
          setEditingHotel(null);
          form.resetFields();
          setIsModalVisible(true);
        }}>
          新增飯店
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: "尚無飯店資料" }}
      />

      <Modal
        title={editingHotel ? '編輯飯店' : '新增飯店'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingHotel(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="飯店名稱" rules={[{ required: true, message: '請輸入飯店名稱' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label="城市" rules={[{ required: true, message: '請輸入城市' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="類型" rules={[{ required: true, message: '請輸入類型' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true, message: '請輸入地址' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cheapestPrice" label="最低價格" rules={[{ required: true, message: '請輸入最低價格' }]}>
            <InputNumber min={0} className="full-width" />
          </Form.Item>


          <Form.Item name="photos" label="照片 (逗號分隔)" rules={[{ required: true, message: '請輸入照片' }]}>
            <Input placeholder="https://..., https://..." />
          </Form.Item>
          <Form.Item name="title" label="標題" rules={[{ required: true, message: '請輸入標題' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="desc" label="描述" rules={[{ required: true, message: '請輸入描述' }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="checkInTime" label="入住時間" rules={[{ required: true, message: '請選擇入住時間' }]}>
            <TimePicker format="HH:mm" className="full-width" />
          </Form.Item>
          <Form.Item name="checkOutTime" label="退房時間" rules={[{ required: true, message: '請選擇退房時間' }]}>
            <TimePicker format="HH:mm" className="full-width" />
          </Form.Item>
          <Form.Item name="email" label="聯絡信箱" rules={[{ required: true, message: '請輸入聯絡信箱' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="聯絡電話" rules={[{ required: true, message: '請輸入聯絡電話' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="座標 - 緯度" required>
            <Form.Item name={['coordinates', 'latitude']} rules={[{ required: true, message: '請輸入緯度' }]} noStyle>
              <InputNumber className="full-width" />
            </Form.Item>
          </Form.Item>
          <Form.Item label="座標 - 經度" required>
            <Form.Item name={['coordinates', 'longitude']} rules={[{ required: true, message: '請輸入經度' }]} noStyle>
              <InputNumber className="full-width" />
            </Form.Item>
          </Form.Item>
          <Form.Item name="nearbyAttractions" label="附近景點 (逗號分隔)" rules={[{ required: true, message: '請輸入景點' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="facilities" label="設施">
            <Checkbox.Group>
              <Checkbox value="wifi">Wi-Fi</Checkbox>
              <Checkbox value="parking">停車場</Checkbox>
              <Checkbox value="pool">游泳池</Checkbox>
              <Checkbox value="gym">健身房</Checkbox>
              <Checkbox value="spa">SPA</Checkbox>
              <Checkbox value="restaurant">餐廳</Checkbox>
              <Checkbox value="bar">酒吧</Checkbox>
            </Checkbox.Group>
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
