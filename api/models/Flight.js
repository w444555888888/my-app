import mongoose from 'mongoose'
import { calculateArrivalDate } from '../utils/flightTimeUtil.js';


const ScheduleSchema = new mongoose.Schema({
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date },
    availableSeats: {
        ECONOMY: { type: Number },
        BUSINESS: { type: Number },
        FIRST: { type: Number }
    },
    prices: {
        ECONOMY: Number,
        BUSINESS: Number,
        FIRST: Number
    }
}, { _id: true }) 

const FlightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true
    },
    route: {
        departureCity: { type: String, required: true },
        arrivalCity: { type: String, required: true },
        flightDuration: { type: Number, required: true }
    },
    cabinClasses: [{
        category: {
            type: String,
            enum: ['ECONOMY', 'BUSINESS', 'FIRST'],
            required: true
        },
        basePrice: { type: Number, required: true },
        totalSeats: { type: Number, required: true },
        bookedSeats: { type: Number, default: 0 }
    }],
    priceRules: {
        peakSeasonDates: [{
            start: { type: Date },
            end: { type: Date },
            multiplier: { type: Number, default: 1.2 }
        }],
        holidayMultiplier: { type: Number, default: 1.1 },
        earlyBirdDiscount: {
            daysInAdvance: { type: Number, default: 30 },
            discount: { type: Number, default: 0.9 }
        }
    },
    schedules: [ScheduleSchema]
})


/*
* 計算實際價格的方法
* 根據艙等、出發日期和價格規則計算最終價格
* @param {String} category - 艙等 (ECONOMY, BUSINESS, FIRST)
* @param {Date} departureDate - 實際起飛日期時間
**/
FlightSchema.methods.calculateFinalPrice = function (category, departureDate) {
    const basePrice = this.cabinClasses.find(c => c.category === category).basePrice;
    let multiplier = 1.0;

    // 檢查是否為旺季
    const isPeakSeason = this.priceRules.peakSeasonDates.some(period =>
        departureDate >= period.start && departureDate <= period.end
    );
    if (isPeakSeason) {
        multiplier *= this.priceRules.peakSeasonDates[0].multiplier;
    }

    // 檢查是否為假日
    const isHoliday = departureDate.getDay() === 0 || departureDate.getDay() === 6;
    if (isHoliday) {
        multiplier *= this.priceRules.holidayMultiplier;
    }


    // 檢查是否符合早鳥優惠
    const MILLISECONDS_IN_ONE_DAY = 1000 * 60 * 60 * 24; // 每天毫秒數
    const now = new Date();
    const timeDiff = departureDate.getTime() - now.getTime();
    const daysUntilFlight = Math.floor(timeDiff / MILLISECONDS_IN_ONE_DAY);

    if (daysUntilFlight >= this.priceRules.earlyBirdDiscount.daysInAdvance) {
        multiplier *= this.priceRules.earlyBirdDiscount.discount;
    }

    return basePrice * multiplier;
};


FlightSchema.pre('save', async function (next) {
    const flight = this;
    if (flight.schedules && flight.schedules.length > 0) {
        for (let schedule of flight.schedules) {
            try {
                schedule.arrivalDate = await calculateArrivalDate(
                    schedule.departureDate,
                    flight.route.flightDuration,
                    flight.route.departureCity,
                    flight.route.arrivalCity
                );
            } catch (error) {
                return next(error);
            }
        }
    }
    next();
});;

export default mongoose.model("Flight", FlightSchema)