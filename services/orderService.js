const { Order, OrderItem, Cart } = require("../models");
const sequelize = require("../config/db");

class OrderService {
  async createOrder(userId, cartItems, orderDetails) {
    const transaction = await sequelize.transaction(); // Используем sequelize вместо Sequelize

    try {
      // Calculate total price from cart items
      const totalPrice = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      // Create the order
      const order = await Order.create(
        {
          userId,
          address: orderDetails.address,
          paymentMethod: orderDetails.paymentMethod,
          totalPrice,
        },
        { transaction }
      );

      // Create order items
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
}

module.exports = new OrderService();
