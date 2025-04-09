const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/user", authMiddleware, userController.getUser);
router.get("/user-info", authMiddleware, userController.getUserInfo);
router.put("/user-info", authMiddleware, userController.updateUserInfo);

module.exports = router;
