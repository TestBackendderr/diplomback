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

  async updateProduct(id, { name, opis, price, image_url, category }) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error("Product not found");
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (opis !== undefined) updateData.opis = opis;
    if (price !== undefined) updateData.price = price;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (category !== undefined) updateData.category = category;
    
    await product.update(updateData);
    return product;
  }
}

module.exports = new ProductService();
