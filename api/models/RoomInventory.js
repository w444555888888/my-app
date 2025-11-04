import mongoose from 'mongoose';

const RoomInventorySchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalRooms: {
    type: Number, // 飯店該房型總間數
    required: true
  },
  bookedRooms: {
    type: Number, // 已被訂走的房數
    default: 0
  }
}, { timestamps: true });

RoomInventorySchema.index({ roomId: 1, date: 1 }, { unique: true });

// 虛擬欄位：剩餘房數
RoomInventorySchema.virtual('remainingRooms').get(function () {
  return this.totalRooms - this.bookedRooms;
});

RoomInventorySchema.set('toJSON', { virtuals: true });
RoomInventorySchema.set('toObject', { virtuals: true });

export default mongoose.model('RoomInventory', RoomInventorySchema);
