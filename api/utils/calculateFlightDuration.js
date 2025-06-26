import cityTimezones from 'city-timezones';

/**
 * 根據城市名稱計算飛行時間（分鐘）
 */
export const calculateFlightDuration = (departureCity, arrivalCity) => {
  const getCoords = (cityName) => {
    const matches = cityTimezones.lookupViaCity(cityName);
    if (!matches || matches.length === 0) return null;
    return { lat: matches[0].lat, lon: matches[0].lng };
  };

  const from = getCoords(departureCity);
  const to = getCoords(arrivalCity);
  if (!from || !to) return null;

  const R = 6371; // 地球半徑 (km)
  const dLat = deg2rad(to.lat - from.lat);
  const dLon = deg2rad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(from.lat)) *
      Math.cos(deg2rad(to.lat)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km

  const averageSpeed = 900; // km/h
  const durationHours = distance / averageSpeed;
  return Math.round(durationHours * 60); // 轉分鐘
};

const deg2rad = (deg) => (deg * Math.PI) / 180;
