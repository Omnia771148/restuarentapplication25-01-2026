
import mongoose from "mongoose";

const OrderReviewSchema = new mongoose.Schema({
    restaurantId: {
        type: String,
        required: true,
    },
    deliveryBoyId: {
        type: String,
        required: false, // Optional as per user description? Actually user provided an ID.
    },
    restaurantRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    restaurantReview: {
        type: String,
        required: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    items: [
        {
            itemId: String,
            name: String,
            price: Number,
            quantity: Number,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.OrderReview || mongoose.model("OrderReview", OrderReviewSchema);
