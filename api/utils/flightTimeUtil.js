import { DateTime } from "luxon";
import { getTimeZoneByCity } from '../utils/getTimeZoneByCity.js';



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
    const depTZ = getTimeZoneByCity(departureCity);
    const arrTZ = getTimeZoneByCity(arrivalCity);

    if (!depTZ || !arrTZ) {
        console.error("找不到城市資訊：", { departureCity, arrivalCity, depCity, arrCity });
    }


    // 將出發地當地時間轉成 UTC
    const departureInUTC = DateTime.fromJSDate(departureDate, { zone: depTZ }).toUTC();
    // UTC 加上飛行時間
    const arrivalInUTC = departureInUTC.plus({ minutes: flightDurationMinutes });
    // 將 UTC 抵達時間轉換成抵達城市當地時間
    const arrivalInLocal = arrivalInUTC.setZone(arrTZ);
    // 回傳 UTC 格式的 JS Date 物件（儲存在 DB）
    return arrivalInLocal.toUTC().toJSDate();
}