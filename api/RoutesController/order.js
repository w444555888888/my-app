/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-02-11 19:40:34
 * @FilePath: \my-app\api\RoutesController\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Order  from "../models/Order.js"
import { errorMessage } from "../errorMessage.js"

// 全部訂單
export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: errorMessage(err) });
    }
  };
  
  // 新訂單
  export const createOrder = async (req, res) => {
    const newOrder = new Order(req.body);
    try {
      const savedOrder = await newOrder.save();
      res.status(201).json(savedOrder);
    } catch (err) {
      res.status(500).json({ message: errorMessage(err) });
    }
  };
  
  //根據id查找
  export const getOrderById = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    } catch (err) {
      res.status(500).json({ message: errorMessage(err) });
    }
  };
  
  // 根據id更新訂單
  export const updateOrder = async (req, res) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(updatedOrder);
    } catch (err) {
      res.status(500).json({ message: errorMessage(err) });
    }
  };
  
  // 根據id刪除訂單
  export const deleteOrder = async (req, res) => {
    try {
      const deletedOrder = await Order.findByIdAndDelete(req.params.id);
      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: errorMessage(err) });
    }
  };