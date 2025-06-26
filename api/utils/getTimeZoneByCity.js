import cityTimezones from 'city-timezones';

export const getTimeZoneByCity = (cityName) => {
  const matches = cityTimezones.lookupViaCity(cityName);
  
  if (!matches || matches.length === 0) return null;

  // 直接使用第一筆匹配
  return matches[0].timezone;
};
