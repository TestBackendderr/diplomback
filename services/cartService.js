const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartService {
  async addToCart(userId, productId) {
    return await Cart.create({ user_id: userId, product_id: productId });
  }

  async getCart(userId) {
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "opis", "price", "image_url"],
        },
      ], // Указываем нужные поля продукта
    });

    // Преобразуем результат в более удобный формат
    return cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.Product.id,
        name: item.Product.name,
        description: item.Product.opis,
        price: item.Product.price,
        image_url: item.Product.image_url,
      },
    }));
  }

  async removeFromCart(userId, productId) {
    return await Cart.destroy({
      where: { user_id: userId, product_id: productId },
    });
  }

  async updateCartQuantity(userId, productId, quantity) {
    const cartItem = await Cart.findOne({
      where: { user_id: userId, product_id: productId },
    });
    if (!cartItem) throw new Error("Item not found in cart");
    return await cartItem.update({ quantity });
  }
}

module.exports = new CartService();
