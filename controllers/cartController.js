const cartService = require("../services/cartService");

class CartController {
  async addToCart(req, res) {
    try {
      const { productId } = req.body;
      const cartItem = await cartService.addToCart(req.userId, productId);
      res.status(201).json({ success: true, product: cartItem });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Error adding product to cart" });
    }
  }

  async getCart(req, res) {
    try {
      const cartItems = await cartService.getCart(req.userId);
      res.json(cartItems);
    } catch (err) {
      res.status(500).send("Error fetching cart items");
    }
  }

  async removeFromCart(req, res) {
    try {
      await cartService.removeFromCart(req.userId, req.params.productId);
      res.status(200).send("Product removed from cart");
    } catch (err) {
      res.status(500).send("Error removing product from cart");
    }
  }

  async updateCartQuantity(req, res) {
    try {
      const { quantity } = req.body;
      const updatedItem = await cartService.updateCartQuantity(
        req.userId,
        req.params.productId,
        quantity
      );
      res.status(200).json({ success: true, updatedItem });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new CartController();
