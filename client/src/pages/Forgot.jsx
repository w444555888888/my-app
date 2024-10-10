/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 20:24:17
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-10-10 11:46:37
 * @FilePath: \my-app\client\src\pages\Forgot.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./forgot.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
const Forgot = () => {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const navigate = useNavigate()
    const handleClickToLogin = () => {
        navigate('/login')
    }


    // 這裡handleForgotPassword 我還不知道怎麼寫
    const handleForgotPassword = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post('http://localhost:5000/api/v1/auth/forgot-password', {
                email: email
            })
            setMessage('重置密碼鏈接已發送到您的郵箱')

        } catch (error) {
            console.error('Error:', error)
            setMessage(error.response.data.Message)
        }
    }

    return (
        <div className='logInUpWrapper'>
            <div className="logInContainer">
                <div className="logInTitle">
                    <div className="left">
                        <span className="logo">MIKE.BOOKING</span>
                    </div>
                    <div className="right">
                        <div className="navButton" onClick={handleClickToLogin}><FontAwesomeIcon icon={faCircleRight} /></div>
                    </div>
                </div>
            </div>
            <div className="logInContainer">
                <h2>Forgot Account</h2>
                <form onSubmit={handleForgotPassword}>
                    <div className="formGroup">
                        <label htmlFor="email">Original E-mail:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Send to Email</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    )
}

export default Forgot
