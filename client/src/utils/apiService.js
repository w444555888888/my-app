import axios from 'axios'
axios.defaults.withCredentials = true;

const API_BASE_URL = 'http://localhost:5000/api/v1'


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      console.warn("未授權，重新導向登入頁");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


export const request = async (method, endpoint, data = {}, setLoading = () => {}) => {
    setLoading(true)
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${endpoint}`,
            ...(method.toUpperCase() === 'GET' ? { params: data } : { data }),
            withCredentials: true
        }
        const response = await axios(config)
        return { success: true, data: response.data.data }
    } catch (error) {
        const errorMessage = error.response?.data?.message || '請求失敗'
        return { success: false, message: errorMessage }
    } finally {
        setLoading(false)
    }
}
