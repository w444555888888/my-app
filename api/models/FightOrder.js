
import mongoose from 'mongoose'

const FlightOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    passengerInfo: [{
        name: { type: String, required: true },
        idNumber: { type: String, required: true },
        phone: { type: String, required: true }
    }],
    category: {
        type: String,
        enum: ['ECONOMY', 'BUSINESS', 'FIRST'],
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    price: {
        basePrice: { type: Number, required: true },
        tax: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'CANCELLED', 'COMPLETED'],
        default: 'PENDING'
    },
    paymentInfo: {
        method: { type: String },
        transactionId: { type: String },
        paidAt: { type: Date }
    }
}, { timestamps: true });


export default mongoose.model("FlightOrder", FlightOrderSchema)