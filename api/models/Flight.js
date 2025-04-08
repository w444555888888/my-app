import mongoose from 'mongoose'

const FlightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true
    },
    
    // 固定航線資訊（由航空公司設定）
    route: {
        departureCity: { type: String, required: true },
        arrivalCity: { type: String, required: true },
        flightDuration: { type: Number, required: true }, // 飛行時間（分鐘）
        standardDepartureTime: { type: String, required: true }, // 標準起飛時間 "14:30"
    },

    // 艙等和價格設定（由航空公司在後台管理）
    cabinClasses: [{
        category: {
            type: String,
            enum: ['ECONOMY', 'BUSINESS', 'FIRST'], // 艙等只能是這三種
            required: true
        },
        basePrice: { type: Number, required: true },
        totalSeats: { type: Number, required: true },
        bookedSeats: { type: Number, default: 0 }
    }],

    // 價格調整規則（由系統管理員設定）
    priceRules: {
        peakSeasonDates: [{ // 旺季日期範圍
            start: { type: Date },
            end: { type: Date },
            multiplier: { type: Number, default: 1.2 } // 旺季漲價20%
        }],
        holidayMultiplier: { type: Number, default: 1.1 }, // 假日漲價10%
        earlyBirdDiscount: { // 早鳥優惠
            daysInAdvance: { type: Number, default: 30 },
            discount: { type: Number, default: 0.9 } // 提前30天訂票9折
        }
    },

    // 航班排程（系統自動生成）
    schedules: [{
        departureDate: { type: Date, required: true },// 實際起飛日期時間
        arrivalDate: { type: Date, required: true }, // 預計抵達日期時間
        // 系統根據 departureDate 實際起飛日期時間 + flightDuration 飛行時間（分鐘） 自動計算 =  arrivalDate 抵達時間
        availableSeats: {
            ECONOMY: { type: Number }, // 經濟艙剩餘座位
            BUSINESS: { type: Number },// 商務艙剩餘座位
            FIRST: { type: Number }// 頭等艙剩餘座位
        }
    }]
});

// 計算實際價格的方法

FlightSchema.methods.calculateFinalPrice = function(category, departureDate) {
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
    const daysUntilFlight = Math.floor((departureDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilFlight >= this.priceRules.earlyBirdDiscount.daysInAdvance) {
        multiplier *= this.priceRules.earlyBirdDiscount.discount;
    }

    return basePrice * multiplier;
};

export default mongoose.model("Flight", FlightSchema)