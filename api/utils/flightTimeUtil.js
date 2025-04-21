import { DateTime } from "luxon";
import City from '../models/City.js';



/**
 * 計算抵達城市當地時間
 * @param {Date} departureDate - 出發城市當地時間
 * @param {Number} durationMinutes - 飛行時間（分鐘）
 * @param {String} departureTZ - 出發城市時區（例如："America/New_York"）
 * @param {String} arrivalTZ - 抵達城市時區（例如："Asia/Taipei"）
 * @returns {Date} 抵達城市的當地時間
 */

export async function calculateArrivalDate(departureDate, flightDurationMinutes, departureCity, arrivalCity) {
    // 查詢出發地與目的地的時區
    const depCity = await City.findOne({ name: departureCity });
    const arrCity = await City.findOne({ name: arrivalCity });

    if (!depCity || !arrCity) {
        throw new Error(`City DB找不到城市：${departureCity} 或 ${arrivalCity}`);
    }

    const depTZ = depCity.timeZone;
    const arrTZ = arrCity.timeZone;

    // 將出發地當地時間轉成 UTC
    const departureInUTC = DateTime.fromJSDate(departureDate, { zone: depTZ }).toUTC();
    // UTC 加上飛行時間
    const arrivalInUTC = departureInUTC.plus({ minutes: flightDurationMinutes });
    // 將 UTC 抵達時間轉換成抵達城市當地時間
    const arrivalInLocal = arrivalInUTC.setZone(arrTZ);
    // 回傳 UTC 格式的 JS Date 物件（儲存在 DB）
    return arrivalInLocal.toUTC().toJSDate();
}