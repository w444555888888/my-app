/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-18 23:07:39
 * @FilePath: \my-app\src\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'react-loading-skeleton/dist/skeleton.css';
import { Provider } from 'react-redux'
import { store } from './redux/store'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);


