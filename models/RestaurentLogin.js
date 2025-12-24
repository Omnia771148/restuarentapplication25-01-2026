import mongoose from "mongoose";

const restaurentLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.models.RestaurentLogin ||
  mongoose.model("restaurentlogin", restaurentLoginSchema);