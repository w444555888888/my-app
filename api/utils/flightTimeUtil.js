import { DateTime } from "luxon";

// 城市對應的時區
export const cityTimeZoneMap = {
    'Taipei': 'Asia/Taipei',
    'Tokyo': 'Asia/Tokyo',
    'Seoul': 'Asia/Seoul',
    'Beijing': 'Asia/Shanghai',
    'Singapore': 'Asia/Singapore',
    'Hong Kong': 'Asia/Hong_Kong',
    'Bangkok': 'Asia/Bangkok',
    'Sydney': 'Australia/Sydney',
    'Melbourne': 'Australia/Melbourne',
    'Dubai': 'Asia/Dubai',
    'London': 'Europe/London',
    'Paris': 'Europe/Paris',
    'New York': 'America/New_York',
    'Los Angeles': 'America/Los_Angeles',
    'Vancouver': 'America/Vancouver',
    'Toronto': 'America/Toronto',
    'Manila': 'Asia/Manila',
    'Kuala Lumpur': 'Asia/Kuala_Lumpur',
    'Ho Chi Minh': 'Asia/Ho_Chi_Minh'
};


/**
 * 計算抵達城市當地時間
 * @param {Date} departureDate - 出發城市當地時間
 * @param {Number} durationMinutes - 飛行時間（分鐘）
 * @param {String} departureTZ - 出發城市時區（例如："America/New_York"）
 * @param {String} arrivalTZ - 抵達城市時區（例如："Asia/Taipei"）
 * @returns {Date} 抵達城市的當地時間
 */


/**
 * 根據出發時間、飛行時間（分鐘）、出發地與目的地時區，計算抵達時間
 */
export function calculateArrivalDate(departureDate, flightDurationMinutes, departureTimeZone, arrivalTimeZone) {
    // 將 departureDate 套用出發地時區
    const dep = DateTime.fromJSDate(departureDate, { zone: departureTimeZone });
    // 在出發地時區加上飛行時間
    const arrivalInDepTZ = dep.plus({ minutes: flightDurationMinutes });
    // 將時間轉換成抵達地時區
    const arrivalInArrTZ = arrivalInDepTZ.setZone(arrivalTimeZone);
    // 回傳 JS Date 格式（mongoose 要的）
    return arrivalInArrTZ.toJSDate();
}