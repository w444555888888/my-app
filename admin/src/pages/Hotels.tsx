import React, { useEffect, useState } from "react";
import {
  CoffeeOutlined,
  CarOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
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
  TimePicker,
  Select
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

interface RoomType {
  _id: string;
  name: string;
  desc?: string[];
  maxPeople: number;
  price: number;
  hotelId: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [roomList, setRoomList] = useState<RoomType[]>([]);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [roomEditModalVisible, setRoomEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [roomForm] = Form.useForm();

  const handleEditRoom = (room: RoomType) => {
    setEditingRoom(room);
    setRoomEditModalVisible(true);
    roomForm.setFieldsValue({
      ...room,
      desc: room?.desc?.join(", "),
    });
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    roomForm.resetFields();
    setRoomEditModalVisible(true);
  };

  const handleRoomSubmit = async (values: any) => {
    try {
      const url = editingRoom ? `/rooms/${editingRoom._id}` : "/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const payload = {
        ...values,
        hotelId: editingHotelId,
        desc: values.desc.split(',').map((str: string) => str.trim()).filter(Boolean),
        pricing: values.pricing,
        paymentOptions: values.paymentOptions,
        service: values.service,
        holidays: values.holidays,
      };

      const res = await request(method, url, payload);
      if (res.success) {
        message.success(editingRoom ? "房型編輯成功" : "房型新增成功");
        setRoomModalVisible(false);
        setRoomEditModalVisible(false);
        fetchHotels();
      } else {
        message.error(res.message || "操作失敗");
      }
    } catch {
      message.error("提交房型失敗");
    }
  };

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res: ApiResponse = await request("GET", "/hotels");
      if (res.success && res.data) {
        setHotels(res.data);
      }
    } catch {
      message.error("獲取飯店列表失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request("DELETE", `/hotels/${id}`);
      if (res.success) {
        message.success("刪除成功");
        fetchHotels();
      } else {
        message.error(res.message || "刪除失敗");
      }
    } catch {
      message.error("刪除發生錯誤");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await request("GET", `/hotels/find/${id}`);
      if (res.success && res.data) {
        const hotel = res.data;
        form.setFieldsValue({
          ...hotel,
          photos: hotel.photos.join(','),
          nearbyAttractions: hotel.nearbyAttractions.join(','),
          facilities: Object.keys(hotel.facilities).filter(k => hotel.facilities[k]),
          checkInTime: dayjs(hotel.checkInTime, 'HH:mm'),
          checkOutTime: dayjs(hotel.checkOutTime, 'HH:mm'),
        });
        setEditingHotel(hotel);
        setIsModalVisible(true);
      }
    } catch {
      message.error("編輯失敗");
    }
  };

  const handleSubmit = async (values: any) => {
    const body = {
      ...values,
      checkInTime: values.checkInTime.format("HH:mm"),
      checkOutTime: values.checkOutTime.format("HH:mm"),
      photos: values.photos?.split(",").map((s: string) => s.trim()),
      nearbyAttractions: values.nearbyAttractions?.split(",").map((s: string) => s.trim()),
      facilities: {
        wifi: values.facilities?.includes("wifi") || false,
        parking: values.facilities?.includes("parking") || false,
        pool: values.facilities?.includes("pool") || false,
        gym: values.facilities?.includes("gym") || false,
        spa: values.facilities?.includes("spa") || false,
        restaurant: values.facilities?.includes("restaurant") || false,
        bar: values.facilities?.includes("bar") || false,
      },
    };

    const res = editingHotel
      ? await request("PUT", `/hotels/${editingHotel._id}`, body)
      : await request("POST", "/hotels", body);

    if (res.success) {
      message.success(editingHotel ? "編輯成功" : "新增成功");
      setIsModalVisible(false);
      form.resetFields();
      fetchHotels();
      setEditingHotel(null);
    } else {
      message.error(res.message || "操作失敗");
    }
  };

  const handleViewRooms = async (hotelId: string) => {
    try {
      const res: ApiResponse = await request("GET", `/rooms/findHotel/${hotelId}`);
      if (res.success && res.data) {
        setEditingHotelId(hotelId);
        setRoomList(res.data);
        setRoomModalVisible(true);
      } else {
        message.error("查詢房型失敗");
      }
    } catch {
      message.error("查詢房型發生錯誤");
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const columns: ColumnsType<HotelType> = [
    { title: "飯店名稱", dataIndex: "name", key: "name" },
    { title: "城市", dataIndex: "city", key: "city" },
    { title: "類型", dataIndex: "type", key: "type" },
    { title: "評分", dataIndex: "rating", key: "rating" },
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
        <Space>
          <Button type="primary" onClick={() => handleEdit(record._id)}>編輯</Button>
          <Button danger onClick={() => handleDelete(record._id)}>刪除</Button>
          <Button onClick={() => handleViewRooms(record._id)}>查看房型</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="hotels-container">
      <Button type="primary" onClick={() => {
        setEditingHotel(null);
        setIsModalVisible(true);
        form.resetFields();
      }}>新增飯店</Button>

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="_id"
        loading={loading}
        style={{ marginTop: 16 }}
      />

      <Modal
        title={editingHotel ? "編輯飯店" : "新增飯店"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingHotel(null);
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="飯店名稱" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="city" label="城市" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="類型" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="cheapestPrice" label="最低價格" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="photos" label="照片 (逗號分隔)" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="title" label="標題" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="desc" label="描述" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
          <Form.Item name="checkInTime" label="入住時間" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="checkOutTime" label="退房時間" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="email" label="聯絡信箱" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="聯絡電話" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="座標 - 緯度"><Form.Item name={["coordinates", "latitude"]} noStyle rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Form.Item>
          <Form.Item label="座標 - 經度"><Form.Item name={["coordinates", "longitude"]} noStyle rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Form.Item>
          <Form.Item name="nearbyAttractions" label="附近景點 (逗號分隔)" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="facilities" label="設施"><Checkbox.Group>
            <Checkbox value="wifi">Wi-Fi</Checkbox>
            <Checkbox value="parking">停車場</Checkbox>
            <Checkbox value="pool">游泳池</Checkbox>
            <Checkbox value="gym">健身房</Checkbox>
            <Checkbox value="spa">SPA</Checkbox>
            <Checkbox value="restaurant">餐廳</Checkbox>
            <Checkbox value="bar">酒吧</Checkbox>
          </Checkbox.Group></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">提交</Button></Form.Item>
        </Form>
      </Modal>

      <Modal
        title="房型列表"
        open={roomModalVisible}
        onCancel={() => setRoomModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Button type="primary" onClick={handleAddRoom} style={{ marginBottom: 8 }}>新增房型</Button>
        <Table
          dataSource={roomList}
          rowKey="_id"
          columns={[
            {
              title: "房型名稱",
              dataIndex: "title",
            },
            {
              title: "平日價格",
              dataIndex: "pricing",
              render: (pricing: any[]) => {
                const weekdays = [1, 2, 3, 4, 0];
                const item = pricing?.find(p => p.days_of_week?.some((d: number) => weekdays.includes(d)));
                return item ? `$${item.price}` : "-";
              }
            },
            {
              title: "週六價格",
              dataIndex: "pricing",
              render: (pricing: any[]) => {
                const item = pricing?.find(p => p.days_of_week?.includes(5));
                return item ? `$${item.price}` : "-";
              }
            },
            {
              title: "週日價格",
              dataIndex: "pricing",
              render: (pricing: any[]) => {
                const item = pricing?.find(p => p.days_of_week?.includes(6));
                return item ? `$${item.price}` : "-";
              }
            },
            {
              title: "特殊節日",
              dataIndex: "holidays",
              render: (holidays: any[]) => {
                if (!holidays || holidays.length === 0) return "—";
                return holidays.map(h => `${h.date}：$${h.price}`).join("\n");
              }
            },
            {
              title: "付款方式",
              dataIndex: "paymentOptions",
              render: (options: any[]) => {
                if (!options || options.length === 0) return "—";
                return options.map(opt => opt.description).join("、");
              }
            },
            {
              title: "服務項目",
              dataIndex: "service",
              render: (service: any) => {
                if (!service) return "—";
                return (
                  <div style={{ display: "flex", gap: 8 }}>
                    {service.breakfast && <CoffeeOutlined title="含早餐" />}
                    {service.parking && <CarOutlined title="含停車" />}
                    {service.dinner && <ShoppingOutlined title="含晚餐" />}
                  </div>
                );
              }
            },
            {
              title: "可住人數",
              dataIndex: "maxPeople"
            },
            {
              title: "操作",
              render: (_: any, record: any) => (
                <Button type="link" onClick={() => handleEditRoom(record)}>編輯</Button>
              )
            }
          ]}
          pagination={false}
          scroll={{ x: true }}
        />
      </Modal>



      <Modal
        title={editingRoom ? "編輯房型" : "新增房型"}
        open={roomEditModalVisible}
        onCancel={() => setRoomEditModalVisible(false)}
        footer={null}
      >
        <Form form={roomForm} onFinish={handleRoomSubmit} layout="vertical">
          <Form.Item name="title" label="房型名稱" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="roomType" label="房型類型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Single Room">單人房</Select.Option>
              <Select.Option value="Double Room">雙人房</Select.Option>
              <Select.Option value="Twin Room">雙床房</Select.Option>
              <Select.Option value="Family Room">家庭房</Select.Option>
              <Select.Option value="Deluxe Room">豪華房</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="maxPeople" label="可住人數" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>

          <Form.Item
            name="desc"
            label="設施（以逗號分隔）"
            rules={[{ required: true, message: "請輸入設施名稱（以逗號分隔）" }]}
          >
            <Input.TextArea placeholder="例如：免費盥洗用品, 浴袍, 保險箱" rows={4} />
          </Form.Item>

          <Form.Item label="服務選項" required>
            <Form.Item name={['service', 'breakfast']} valuePropName="checked" noStyle>
              <Checkbox>含早餐</Checkbox>
            </Form.Item>
            <Form.Item name={['service', 'dinner']} valuePropName="checked" noStyle>
              <Checkbox>含晚餐</Checkbox>
            </Form.Item>
            <Form.Item name={['service', 'parking']} valuePropName="checked" noStyle>
              <Checkbox>提供停車</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.List name="paymentOptions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      rules={[{ required: true, message: '請選擇付款類型' }]}
                    >
                      <Select placeholder="選擇付款類型">
                        <Select.Option value="credit_card">信用卡</Select.Option>
                        <Select.Option value="paypal">PayPal</Select.Option>
                        <Select.Option value="bank_transfer">銀行轉帳</Select.Option>
                        <Select.Option value="on_site_payment">現場付款</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']} rules={[{ required: true }]}>
                      <Input placeholder="付款描述" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'refundable']} valuePropName="checked">
                      <Checkbox>可退款</Checkbox>
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>刪除</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()}>新增付款方式</Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.List name="pricing">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline">
                    <Form.Item {...restField} name={[name, 'days_of_week']} rules={[{ required: true }]}>
                      <Select mode="multiple" placeholder="選擇星期">
                        <Select.Option value={0}>週日</Select.Option>
                        <Select.Option value={1}>週一</Select.Option>
                        <Select.Option value={2}>週二</Select.Option>
                        <Select.Option value={3}>週三</Select.Option>
                        <Select.Option value={4}>週四</Select.Option>
                        <Select.Option value={5}>週五</Select.Option>
                        <Select.Option value={6}>週六</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true }]}>
                      <InputNumber placeholder="價格" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>刪除</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()}>新增價格</Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.List name="holidays">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline">
                    <Form.Item {...restField} name={[name, 'date']} rules={[{ required: true }]}>
                      <Input placeholder="日期 2025-01-01" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true }]}>
                      <InputNumber placeholder="價格" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>刪除</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()}>新增特殊節日</Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">提交</Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default Hotels;
