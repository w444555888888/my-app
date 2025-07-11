import cityTimezones from "city-timezones";

/**
 * 根據出發城市與抵達城市，估算飛行時間（單位：分鐘）
 * 使用 Haversine Formula 計算兩城市的球面直線距離，再假設平均飛行速度來推算時間
 */
export const calculateFlightDuration = (departureCity, arrivalCity) => {
  const getCoords = (cityName) => {
    const matches = cityTimezones.lookupViaCity(cityName);
    if (!matches || matches.length === 0) return null;
    return { lat: matches[0].lat, lon: matches[0].lng }; // 緯度 & 經度
  };

  const from = getCoords(departureCity);
  const to = getCoords(arrivalCity);
  if (!from || !to) return null;

  const R = 6371; // 地球半徑 (km)
  const dLat = deg2rad(to.lat - from.lat); // Δφ = φ2 - φ1
  const dLon = deg2rad(to.lon - from.lon); // Δλ = λ2 - λ1

  /**
   * Haversine 公式核心：
   * a = sin²(Δφ / 2) + cos(φ1) * cos(φ2) * sin²(Δλ / 2)
   *
   * 其中：
   * Δφ = 緯度差（弧度）
   * Δλ = 經度差（弧度）
   * φ1、φ2 = 起點與終點的緯度（弧度）
   */
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(from.lat)) *
      Math.cos(deg2rad(to.lat)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  /**
   * 球面角距離公式：
   * c = 2 * atan2(√a, √(1 - a))
   * 單位為弧度，代表兩點在球面上的角距離
   */

  // 計算球面直線距離（公里）：distance = R × c
  const distance = R * c;
  // 假設飛機平均速度為 900 km/h，計算總小時數
  const averageSpeed = 900;
  const durationHours = distance / averageSpeed;
  return Math.round(durationHours * 60); // 轉分鐘
};

/**
 * 將角度轉換為弧度（radian）
 * 公式：radian = degree × π / 180
 */
const deg2rad = (deg) => (deg * Math.PI) / 180;
