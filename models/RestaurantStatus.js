import mongoose from "mongoose";

const RestaurantStatusSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.RestaurantStatus ||
  mongoose.model("RestaurantStatus", RestaurantStatusSchema);

  