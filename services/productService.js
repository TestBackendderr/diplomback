const Product = require("../models/Product");

class ProductService {
  async getAllProducts() {
    return await Product.findAll();
  }

  async addProduct({ name, opis, price, image_url, category }) {
    return await Product.create({ name, opis, price, image_url, category });
  }

  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error("Product not found");
    }
    await product.destroy();
    return { message: "Product deleted successfully" };
  }
}

module.exports = new ProductService();
