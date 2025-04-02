import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api/v1'

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export const request = async (method, endpoint, data = {}, setLoading = () => {}) => {
    if (setLoading) setLoading(true)
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${endpoint}`,
            data,
        }
        const response = await axios(config)
        return { success: true, data: response.data.data }
    } catch (error) {
        const errorMessage = error.response?.data?.Message || '請求失敗'
        return { success: false, Message: errorMessage }
    } finally {
        if (setLoading) setLoading(false)
    }
}
