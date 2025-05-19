const reviewModel = require('../model/review.model');

class ReviewRepository {
  async findByUserId(userId) {
    return await reviewModel.findOne({ userId });
  }

  async createReview(data) {
    const review = new reviewModel(data);
    return await review.save();
  }

  async updateReviewByUserId(userId, data) {
    return await reviewModel.findOneAndUpdate(
      { userId },
      data,
      { new: true, runValidators: true }
    );
  }

  async findAllReviews() {
    return await reviewModel.find().sort({ createdAt: -1 });
  }

  async findReviewByIdAndUserId(id, userId) {
    return await reviewModel.findOneAndDelete({ _id: id, userId });
  }
}

module.exports = new ReviewRepository();
