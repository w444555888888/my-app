import React, { useEffect, useState } from 'react';
import { Table, Space, Button, message, Modal, Select, InputNumber, Input, Checkbox, Form } from 'antd';
import { CoffeeOutlined, CarOutlined, ShoppingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { request } from '../utils/apiService';
import DynamicFormModal, { FormFieldConfig } from '../component/DynamicFormModal';
import DynamicFormList from '../component/DynamicFormList';
import PricingFormList from '../component/PricingFormList';
import './hotels.scss';

const Hotels = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any | null>(null);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [roomEditModalVisible, setRoomEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [roomList, setRoomList] = useState<any[]>([]);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [_, forceUpdate] = useState({});
  const [roomForm] = Form.useForm();

  const hotelFields: FormFieldConfig[] = [
    { name: 'name', label: '飯店名稱', type: 'input', required: true },
    { name: 'city', label: '城市', type: 'input', required: true },
    {
      name: 'type', label: '類型', type: 'select', required: true, options: [
        { label: '飯店', value: 'hotel' },
        { label: '公寓', value: 'apartment' },
        { label: '民宿', value: 'guesthouse' },
        { label: 'Villa', value: 'villa' },
        { label: '背包客棧', value: 'hostel' },
        { label: '汽車旅館', value: 'motel' },
        { label: '膠囊旅館', value: 'capsule' },
        { label: '渡假村', value: 'resort' }
      ]
    },
    { name: 'address', label: '地址', type: 'input', required: true },
    { name: 'cheapestPrice', label: '最低價格', type: 'number', required: true },
    { name: 'photos', label: '照片 (逗號分隔)', type: 'input', required: true },
    { name: 'title', label: '標題', type: 'input', required: true },
    { name: 'desc', label: '描述', type: 'textarea', required: true },
    { name: 'checkInTime', label: '入住時間', type: 'time', required: true },
    { name: 'checkOutTime', label: '退房時間', type: 'time', required: true },
    { name: 'email', label: '聯絡信箱', type: 'input', required: true },
    { name: 'phone', label: '聯絡電話', type: 'input', required: true },
    { name: ['coordinates', 'latitude'], label: '緯度', type: 'number', required: true },
    { name: ['coordinates', 'longitude'], label: '經度', type: 'number', required: true },
    { name: 'nearbyAttractions', label: '附近景點 (逗號分隔)', type: 'input', required: true },
    {
      name: 'facilities',
      label: '設施',
      type: 'checkboxGroup',
      options: [
        { label: 'Wi-Fi', value: 'wifi' },
        { label: '停車場', value: 'parking' },
        { label: '游泳池', value: 'pool' },
        { label: '健身房', value: 'gym' },
        { label: 'SPA', value: 'spa' },
        { label: '餐廳', value: 'restaurant' },
        { label: '酒吧', value: 'bar' }
      ]
    }
  ];

  const roomFields: FormFieldConfig[] = [
    { name: 'title', label: '房型名稱', type: 'input', required: true },
    {
      name: 'roomType', label: '房型類型', type: 'select', required: true,
      options: [
        { label: '單人房', value: 'Single Room' },
        { label: '雙人房', value: 'Double Room' },
        { label: '雙床房', value: 'Twin Room' },
        { label: '家庭房', value: 'Family Room' },
        { label: '豪華房', value: 'Deluxe Room' }
      ]
    },
    { name: 'maxPeople', label: '可住人數', type: 'number', required: true },
    { name: 'desc', label: '設施（以逗號分隔）', type: 'textarea', required: true },
    {
      name: 'service', label: '服務項目', type: 'custom',
      customRender: (
        <>
          <Checkbox.Group className="vertical-checkbox-group">
            <Checkbox value="breakfast">含早餐</Checkbox>
            <Checkbox value="dinner">含晚餐</Checkbox>
            <Checkbox value="parking">提供停車</Checkbox>
          </Checkbox.Group>
        </>
      )
    },
    {
      name: 'paymentOptions', label: '付款方式', type: 'custom',
      customRender: (
        <DynamicFormList
          name="paymentOptions"
          fields={[
            {
              name: 'type', label: '付款類型', type: 'select', required: true, options: [
                { label: '信用卡', value: 'credit_card' },
                { label: 'PayPal', value: 'paypal' },
                { label: '銀行轉帳', value: 'bank_transfer' },
                { label: '現場付款', value: 'on_site_payment' }
              ]
            },
            { name: 'description', label: '付款描述', type: 'input', required: true },
            { name: 'refundable', label: '可退款', type: 'checkbox' }
          ]}
        />
      )
    },
    {
      name: 'pricing',
      label: '平日價格',
      type: 'custom',
      customRender: <PricingFormList form={roomForm} />
    },
    {
      name: 'holidays', label: '特殊節日價格', type: 'custom',
      customRender: (
        <DynamicFormList
          name="holidays"
          fields={[
            { name: 'date', label: '日期（YYYY-MM-DD）', type: 'input', required: true },
            { name: 'price', label: '價格', type: 'number', required: true }
          ]}
        />
      )
    }
  ];



  const handleSubmitRoom = async (values: any) => {
    const payload = {
      ...values,
      hotelId: editingHotelId,
      desc: values.desc.split(',').map((s: string) => s.trim()),
      service: (values.service || []).reduce((acc: any, key: string) => {
        acc[key] = true;
        return acc;
      }, {}),
    };
    const res = editingRoom ? await request('PUT', `/rooms/${editingRoom._id}`, payload) : await request('POST', '/rooms', payload);
    if (res.success) {
      message.success(editingRoom ? '房型編輯成功' : '房型新增成功');
      setRoomEditModalVisible(false);
      handleViewRooms(editingHotelId!);
    }
  };


  const handleViewRooms = async (hotelId: string) => {
    const res = await request('GET', `/rooms/findHotel/${hotelId}`);
    if (res.success) {
      setEditingHotelId(hotelId);
      setRoomList(res.data);
      setRoomModalVisible(true);
    }
  };


  const handleEditRoom = (room: any) => {
    setEditingRoom({
      ...room,
      desc: room.desc?.join(', '),
      service: Object.entries(room.service || {}).filter(([_, v]) => v).map(([k]) => k)
    });
    setRoomEditModalVisible(true);
  };


  const handleDeleteRoom = async (roomId: string) => {
    const res = await request('DELETE', `/rooms/${roomId}`);
    if (res.success) {
      message.success('房型已刪除');
      handleViewRooms(editingHotelId!);
    } else {
      message.error(res.message || '刪除失敗');
    }
  };


  const fetchHotels = async () => {
    setLoading(true);
    const res = await request('GET', '/hotels');
    if (res.success) setHotels(res.data);
    setLoading(false);
  };


  const handleEditHotel = async (id: string) => {
    const res = await request('GET', `/hotels/find/${id}`);
    if (res.success) {
      const h = res.data;
      setEditingHotel({
        ...h,
        checkInTime: dayjs(h.checkInTime, 'HH:mm'),
        checkOutTime: dayjs(h.checkOutTime, 'HH:mm'),
        photos: h.photos.join(','),
        nearbyAttractions: h.nearbyAttractions.join(','),
        facilities: Object.keys(h.facilities).filter(k => h.facilities[k])
      });
      setIsModalVisible(true);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    const res = await request('DELETE', `/hotels/${hotelId}`);
    if (res.success) {
      message.success('飯店已刪除');
      fetchHotels();
    } else {
      message.error(res.message || '刪除失敗');
    }
  };

  const handleSubmitHotel = async (values: any) => {
    const payload = {
      ...values,
      checkInTime: values.checkInTime,
      checkOutTime: values.checkOutTime,
      photos: values.photos.split(',').map((s: string) => s.trim()),
      nearbyAttractions: values.nearbyAttractions.split(',').map((s: string) => s.trim()),
      facilities: ['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar'].reduce((obj, key) => {
        obj[key] = values.facilities?.includes(key);
        return obj;
      }, {} as Record<string, boolean>)
    };
    const res = editingHotel ? await request('PUT', `/hotels/${editingHotel._id}`, payload) : await request('POST', '/hotels', payload);
    if (res.success) {
      message.success(editingHotel ? '編輯飯店成功' : '新增飯店成功');
      setIsModalVisible(false);
      fetchHotels();
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const columns: ColumnsType<any> = [
    { title: '飯店名稱', dataIndex: 'name', key: 'name' },
    { title: '城市', dataIndex: 'city', key: 'city' },
    { title: '類型', dataIndex: 'type', key: 'type' },
    { title: '評分', dataIndex: 'rating', key: 'rating' },
    {
      title: '最低價格',
      dataIndex: 'cheapestPrice',
      key: 'cheapestPrice',
      render: (price: number) => `$${price}`
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEditHotel(record._id)}>編輯</Button>
          <Button danger onClick={() => handleDeleteHotel(record._id)}>刪除</Button>
          <Button onClick={() => handleViewRooms(record._id)}>查看房型</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="hotels-container">
      <div className="hotels-header">
        <div className="hotels-title">飯店管理</div>
        <Button type="primary" onClick={() => { setEditingHotel(null); setIsModalVisible(true); }}>新增飯店</Button>
      </div>
      <Table columns={columns} dataSource={hotels} rowKey="_id" loading={loading} className="hotel-table" />

      <DynamicFormModal
        visible={isModalVisible}
        title={editingHotel ? '編輯飯店' : '新增飯店'}
        fields={hotelFields}
        initialValues={editingHotel || undefined}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmitHotel}
      />

      <DynamicFormModal
        visible={roomEditModalVisible}
        title={editingRoom ? '編輯房型' : '新增房型'}
        fields={roomFields}
        initialValues={editingRoom || undefined}
        onCancel={() => setRoomEditModalVisible(false)}
        onSubmit={handleSubmitRoom}
      />

      <Modal
        title="房型列表"
        open={roomModalVisible}
        onCancel={() => setRoomModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Button type="primary" onClick={() => { setEditingRoom(null); setRoomEditModalVisible(true); }} className="add-room-btn">新增房型</Button>
        <Table
          dataSource={roomList}
          rowKey="_id"
          pagination={false}
          columns={[
            { title: '房型名稱', dataIndex: 'title' },
            { title: '可住人數', dataIndex: 'maxPeople' },
            {
              title: '服務項目',
              dataIndex: 'service',
              render: (service: any) => (
                <Space>
                  {service?.breakfast && <CoffeeOutlined title="含早餐" />}
                  {service?.dinner && <ShoppingOutlined title="含晚餐" />}
                  {service?.parking && <CarOutlined title="含停車" />}
                </Space>
              )
            },
            {
              title: '操作',
              render: (_: any, record: any) => (
                <Space>
                  <Button type="link" onClick={() => handleEditRoom(record)}>編輯</Button>
                  <Button danger onClick={() => handleDeleteRoom(record._id)}>刪除</Button>
                </Space>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default Hotels;
