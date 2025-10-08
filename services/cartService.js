const { Cart, Product } = require("../models");

class CartService {
  async addToCart(userId, productId) {
    // Проверяем, есть ли уже этот продукт в корзине
    const existingItem = await Cart.findOne({
      where: { user_id: userId, product_id: productId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "opis", "price", "image_url", "category"],
        },
      ],
    });

    if (existingItem) {
      // Если продукт уже в корзине - увеличиваем количество
      await existingItem.update({ quantity: existingItem.quantity + 1 });
      // Перезагружаем с продуктом
      await existingItem.reload();
      return {
        id: existingItem.id,
        quantity: existingItem.quantity,
        product: {
          id: existingItem.Product.id,
          name: existingItem.Product.name,
          description: existingItem.Product.opis,
          price: existingItem.Product.price,
          image_url: existingItem.Product.image_url,
          category: existingItem.Product.category,
        },
      };
    } else {
      // Если продукта нет - создаем новую запись с quantity = 1
      const newItem = await Cart.create({ 
        user_id: userId, 
        product_id: productId,
        quantity: 1
      });
      
      // Загружаем информацию о продукте
      const itemWithProduct = await Cart.findByPk(newItem.id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "opis", "price", "image_url", "category"],
          },
        ],
      });
      
      return {
        id: itemWithProduct.id,
        quantity: itemWithProduct.quantity,
        product: {
          id: itemWithProduct.Product.id,
          name: itemWithProduct.Product.name,
          description: itemWithProduct.Product.opis,
          price: itemWithProduct.Product.price,
          image_url: itemWithProduct.Product.image_url,
          category: itemWithProduct.Product.category,
        },
      };
    }
  }

  async getCart(userId) {
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "opis", "price", "image_url", "category"],
        },
      ], // Указываем нужные поля продукта
    });

    // Преобразуем результат в более удобный формат
    return cartItems
      .filter(item => item.Product) // Фильтруем только товары, которые существуют
      .map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          description: item.Product.opis,
          price: item.Product.price,
          image_url: item.Product.image_url,
          category: item.Product.category,
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
