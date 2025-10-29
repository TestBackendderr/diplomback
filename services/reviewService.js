const Review = require("../models/Review");

class ReviewService {
  async getAllReviews() {
    const reviews = await Review.findAll({
      order: [["createdAt", "DESC"]],
    });
    return reviews;
  }

  async getReviewsByUserId(userId) {
    const reviews = await Review.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });
    return reviews;
  }

  async addReview({ userId, userName, rating, comment }) {
    const review = await Review.create({
      user_id: userId,
      user_name: userName,
      rating,
      comment,
    });
    return review;
  }

  async deleteReview(id) {
    const review = await Review.findByPk(id);
    if (!review) {
      throw new Error("Review not found");
    }
    await review.destroy();
    return { message: "Review deleted successfully" };
  }
}

module.exports = new ReviewService();

