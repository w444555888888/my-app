/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 20:24:17
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-10-10 10:41:52
 * @FilePath: \my-app\client\src\pages\LogIn.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 20:24:17
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-04 18:21:22
 * @FilePath: \my-app\client\src\pages\LogIn.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logIn } from '../redux/userSlice'
import axios from 'axios'
import "./logIn.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight, faQuestion } from '@fortawesome/free-solid-svg-icons'

const LogIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleClickToHome = () => {
        navigate('/')
    }

    const handleClickToForgot = () => {
        navigate('/forgot')
    }

    const handleClickToSignUp = () => {
        navigate('/signUp')
    }

    const handleLogIn = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
                account: email, password: password
            })

            // 登入把登入帳號資料存到本地存儲
            if (response.data) {
                // 物件轉換字串
                localStorage.setItem('username', JSON.stringify(response.data.userDetails))
                dispatch(logIn())
                navigate('/')
            }
        } catch (error) {
            console.error('Error:', error)
            setMessage(error.response.data.Message)
        }
    }

    return (
        <div className='logInWrapper'>
            <div className="logInContainer">
                <div className="logInTitle">
                    <div className="left">
                        <span className="logo">MIKE.BOOKING</span>
                    </div>
                    <div className="right">
                        <div className="navButton" onClick={handleClickToHome}><FontAwesomeIcon icon={faCircleRight} /></div>
                    </div>
                </div>
            </div>
            <div className="logInContainer">
                <h2>LogIn Account</h2>
                <form onSubmit={handleLogIn}>
                    <div className="formGroup">
                        <label htmlFor="email">E-mail:</label>
                        <input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="password">password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">LogIn</button>
                </form>
                <div className='buttonGroup'>
                    <button className="forgotBtn" onClick={handleClickToForgot}>forgot account <FontAwesomeIcon icon={faQuestion} /></button>
                    <button className="signUpBtn" onClick={handleClickToSignUp}>Sign Up</button>
                    {message && <p>{message}</p>}
                </div>

            </div>
        </div>
    )
}

export default LogIn
