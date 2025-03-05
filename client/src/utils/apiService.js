import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

<<<<<<< HEAD
export const request = async (method, endpoint, data = {}, setLoading = () => {}, setMessage) => {
    if (setLoading) setLoading(true);   
=======
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const request = async (method, endpoint, data = {}, setLoading, setMessage) => {
    setLoading(true);
>>>>>>> caa9c78 (HOME飯店數據直接寫 取消狀態管理)
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${endpoint}`,
            data,
        };

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error:', error);
        setMessage(error.response?.data?.Message || '請求失敗');
        return { success: false, message: error.response?.data?.Message || '請求失敗' };
    } finally {
<<<<<<< HEAD
        if (setLoading) setLoading(false);  
=======
        setLoading(false);
>>>>>>> caa9c78 (HOME飯店數據直接寫 取消狀態管理)
    }
};
