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
    const { name, opis, price, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      const product = await productService.addProduct({
        name,
        opis,
        price,
        image_url,
        category: category || 'domowe',
      });
      res.status(201).json(product);
    } catch (err) {
      res.status(500).send("Error adding product");
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ProductController();
