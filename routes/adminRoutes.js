const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/authMiddleware");

// Все маршруты требуют авторизации и админских прав
router.use(authMiddleware);
router.use(isAdmin);

router.get("/stats", adminController.getStats);
router.get("/orders-stats", adminController.getOrdersStats);
router.get("/top-products", adminController.getTopProducts);
router.get("/users-stats", adminController.getUsersStats);
router.get("/all-users", adminController.getAllUsers);
router.get("/user/:userId", adminController.getUserDetails);
router.get("/user/:userId/cart", adminController.getUserCart);
router.get("/user/:userId/orders", adminController.getUserOrders);
router.put("/user/:userId/role", adminController.updateUserRole);
router.delete("/user/:userId", adminController.deleteUser);
router.get("/orders", adminController.getAllOrders);
router.put("/orders/:orderId/status", adminController.updateOrderStatus);

module.exports = router;
