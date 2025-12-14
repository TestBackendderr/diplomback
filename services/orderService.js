const { Order, OrderItem, Cart, Product } = require("../models");
const sequelize = require("../config/db");

class OrderService {
  async createOrder(userId, cartItems, orderDetails) {
    const transaction = await sequelize.transaction();

    try {
      const totalPrice = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      const order = await Order.create(
        {
          userId,
          address: orderDetails.address,
          paymentMethod: orderDetails.paymentMethod,
          totalPrice,
        },
        { transaction }
      );

      const orderItems = cartItems.map((item) => ({
        orderId: order.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      await OrderItem.bulkCreate(orderItems, { transaction });

      await Cart.destroy({ where: { user_id: userId }, transaction });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw new Error("Failed to create order: " + error.message);
    }
  }

  async getUserOrders(userId) {
    try {
      const orders = await Order.findAll({
        where: { userId },
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "opis", "price", "image_url"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return orders.map((order) => ({
        id: order.id,
        address: order.address,
        paymentMethod: order.paymentMethod,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        items: order.OrderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            description: item.Product.opis,
            price: item.Product.price,
            image_url: item.Product.image_url,
          },
        })),
      }));
    } catch (error) {
      throw new Error("Failed to fetch user orders: " + error.message);
    }
  }

  async getAllOrders() {
    try {
      const User = require("../models/User");
      const orders = await Order.findAll({
        include: [
          {
            model: User,
            attributes: ["user_id", "imie", "nazwisko", "email"],
          },
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "opis", "price", "image_url"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        user: order.User ? {
          id: order.User.user_id,
          name: order.User.imie,
          surname: order.User.nazwisko,
          email: order.User.email,
        } : null,
        address: order.address,
        paymentMethod: order.paymentMethod,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        items: order.OrderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            description: item.Product.opis,
            price: item.Product.price,
            image_url: item.Product.image_url,
          },
        })),
      }));
    } catch (error) {
      throw new Error("Failed to fetch all orders: " + error.message);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      
      if (!["pending", "completed", "cancelled"].includes(status)) {
        throw new Error("Invalid status");
      }
      
      await order.update({ status });
      return order;
    } catch (error) {
      throw new Error("Failed to update order status: " + error.message);
    }
  }
}

module.exports = new OrderService();
