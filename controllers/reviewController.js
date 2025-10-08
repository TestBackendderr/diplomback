const reviewService = require("../services/reviewService");

class ReviewController {
  async getAllReviews(req, res) {
    try {
      const reviews = await reviewService.getAllReviews();
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const userId = req.userId;
      const userName = req.userName || "Anonymous";

      const review = await reviewService.addReview({
        userId,
        userName,
        rating,
        comment,
      });

      res.status(201).json({ success: true, review });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const result = await reviewService.deleteReview(id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ReviewController();

