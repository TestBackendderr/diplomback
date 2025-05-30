const orderService = require("../services/orderService");

class OrderController {
  async createOrder(req, res) {
    const { userId, cartItems, orderDetails } = req.body;

    if (!userId || !cartItems || !orderDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const order = await orderService.createOrder(
        userId,
        cartItems,
        orderDetails
      );
      return res
        .status(201)
        .json({ message: "Order created successfully", order });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getUserOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.userId);
      return res.status(200).json({ success: true, orders });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController();
