const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/authMiddleware");

router.get("/reviews", reviewController.getAllReviews);
router.post("/reviews", authMiddleware, reviewController.addReview);
router.delete("/reviews/:id", authMiddleware, isAdmin, reviewController.deleteReview);

module.exports = router;

