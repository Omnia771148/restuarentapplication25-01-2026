import mongoose from "mongoose";

const acceptedByRestaurantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [
    {
      itemId: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],

  totalCount: Number,
  totalPrice: Number,

  gst: Number,
  deliveryCharge: Number,
  grandTotal: Number,

  userName: String,
  userEmail: String,
  userPhone: String,

  deliveryAddress: Object,

  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentStatus: String,

  location: Object,

  restaurantId: String,
  aa: String,
  rest: String,
  mapUrl: String,
  distanceText: String,
  restaurantName: String,

  orderDate: { type: Date, default: Date.now },

  status: { type: String, default: "active" },

  orderId: { type: String, required: true, unique: true },
});

const AcceptedByRestaurant =
  mongoose.models.AcceptedByRestaurant ||
  mongoose.model("AcceptedByRestaurant", acceptedByRestaurantSchema, "acceptedbyrestorents");

export default AcceptedByRestaurant;
