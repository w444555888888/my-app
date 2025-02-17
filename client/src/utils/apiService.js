import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export const request = async (method, endpoint, data = {}, setLoading = () => {}, setMessage) => {
    if (setLoading) setLoading(true);   
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
        if (setLoading) setLoading(false);  
    }
};
