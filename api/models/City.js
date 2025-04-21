// models/City.js
import mongoose from 'mongoose';

const CitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // 城市名稱
    timeZone: { type: String, required: true } // 城市的時區，例如 'Asia/Taipei'
});

const City = mongoose.model('City', CitySchema);

export default City;
