import mongoose from 'mongoose'
import { calculateArrivalDate } from '../utils/flightTimeUtil.js';

const FlightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true
    },
    route: {
        departureCity: { type: String, required: true }, //起飛城市(後台設定)
        arrivalCity: { type: String, required: true }, //到達城市後台設定)
        flightDuration: { type: Number, required: true }, // 飛行時間(自動計算)
    },
    // 艙等和價格設定（後台設定）
    cabinClasses: [{
        category: {
            type: String,
            enum: ['ECONOMY', 'BUSINESS', 'FIRST'], // 艙等只能是這三種
            required: true
        },
        basePrice: { type: Number, required: true },  //艙等的基本價格
        totalSeats: { type: Number, required: true }, //該艙等的總座位數
        bookedSeats: { type: Number, default: 0 } //已預訂座位的數量
    }],

    // 票價規則（後台設定）
    priceRules: {
        peakSeasonDates: [{ // 旺季日期範圍
            start: { type: Date },
            end: { type: Date },
            multiplier: { type: Number, default: 1.2 } // 旺季漲價20%
        }],
        holidayMultiplier: { type: Number, default: 1.1 }, // 假日漲價10%
        earlyBirdDiscount: { // 早鳥優惠
            daysInAdvance: { type: Number, default: 30 }, //提前幾天預訂可享受折扣，預設為 30 天
            discount: { type: Number, default: 0.9 } // 提前30天訂票9折
        }
    },

    // 航班排程  =>  只有實際起飛日期時間要自己設定(資料庫日期都是UTC）  
    schedules: [{
        departureDate: { type: Date, required: true },// 實際起飛日期時間
        arrivalDate: { type: Date }, // 預計抵達日期時間
        // 系統根據 departureDate 實際起飛日期時間 + flightDuration 飛行時間（分鐘） 自動計算 =  arrivalDate 抵達時間
        availableSeats: {
            ECONOMY: { type: Number }, // 經濟艙剩餘座位
            BUSINESS: { type: Number },// 商務艙剩餘座位
            FIRST: { type: Number }// 頭等艙剩餘座位
        }
    }]
});


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