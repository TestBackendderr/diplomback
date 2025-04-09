const Product = require("../models/Product");

class ProductService {
  async getAllProducts() {
    return await Product.findAll();
  }

  async addProduct({ name, opis, price, image_url }) {
    return await Product.create({ name, opis, price, image_url });
  }
}

module.exports = new ProductService();
