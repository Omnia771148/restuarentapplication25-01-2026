import mongoose from "mongoose";

const ButtonStatusSchema = new mongoose.Schema({
    buttonId: {
        type: Number,
        required: true,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
});

export default mongoose.models.ButtonStatus ||
    mongoose.model("ButtonStatus", ButtonStatusSchema);
