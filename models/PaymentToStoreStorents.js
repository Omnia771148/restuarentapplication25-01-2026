import mongoose from "mongoose";

const PaymentToStoreStorentsSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true, unique: true },
  restaurantName: { type: String, required: true },
  totalPrice: { type: Number, default: 0 },
  orderId: { type: String }, // Storing the latest orderId
}, { timestamps: true });

const PaymentToStoreStorents =
  mongoose.models.PaymentToStoreStorents ||
  mongoose.model("PaymentToStoreStorents", PaymentToStoreStorentsSchema, "paymentstorestorents");

export default PaymentToStoreStorents;
