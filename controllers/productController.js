const productService = require("../services/productService");

class ProductController {
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).send("Error fetching products");
    }
  }

  async addProduct(req, res) {
    const { name, opis, price } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      const product = await productService.addProduct({
        name,
        opis,
        price,
        image_url,
      });
      res.status(201).json(product);
    } catch (err) {
      res.status(500).send("Error adding product");
    }
  }
}

module.exports = new ProductController();
