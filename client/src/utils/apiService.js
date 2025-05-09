import axios from 'axios'


const API_BASE_URL = 'http://localhost:5000/api/v1'


export const request = async (method, endpoint, data = {}, setLoading = () => {}) => {
    if (setLoading) setLoading(true)
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${endpoint}`,
            data,
            withCredentials: true
        }
        const response = await axios(config)
        return { success: true, data: response.data.data }
    } catch (error) {
        const errorMessage = error.response?.data?.message || '請求失敗'
        return { success: false, message: errorMessage }
    } finally {
        if (setLoading) setLoading(false)
    }
}
