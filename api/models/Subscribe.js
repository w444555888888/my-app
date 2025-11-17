import mongoose from 'mongoose';

const SubscribeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true } 
);

SubscribeSchema.index({ email: 1 }, { unique: true });
export default mongoose.model('Subscribe', SubscribeSchema);