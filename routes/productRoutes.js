const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/cake", productController.getAllProducts);
router.post("/cake", authMiddleware, isAdmin, upload.single("image"), productController.addProduct);
router.put("/cake/:id", authMiddleware, isAdmin, upload.single("image"), productController.updateProduct);
router.delete("/cake/:id", authMiddleware, isAdmin, productController.deleteProduct);

module.exports = router;
