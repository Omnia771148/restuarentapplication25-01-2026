import mongoose from "mongoose";

const RegisterUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    // NEW FIELDS 👇
    restId: {
      type: String,
      required: true,
    },
    restLocation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.RestuarentUser ||
  mongoose.model(
    "RestuarentUser",
    RegisterUserSchema,
    "restuarentusers"
  );
