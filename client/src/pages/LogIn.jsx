/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 20:24:17
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-10-10 10:41:52
 * @FilePath: \my-app\client\src\pages\LogIn.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logIn, setUserInfo } from '../redux/userStore'
import { request } from '../utils/apiService';
import "./logIn.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

const LogIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);
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

    const handleLogIn = async (e) => {
        e.preventDefault()
        const result = await request('POST', '/auth/login', { account: email, password }, setLoading);

        if (result.success) {
            const { userDetails } = result.data;
            toast.success('登入成功！')
            dispatch(setUserInfo(userDetails));  //儲存用戶資料
            dispatch(logIn());  // 標記為登入狀態
            navigate('/'); 
        } else toast.error(`${result.message}`) 
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
                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'LogIn'}
                    </button>
                </form>
                <div className='buttonGroup'>
                    <button className="forgotBtn" onClick={handleClickToForgot}>forgot account <FontAwesomeIcon icon={faQuestion} /></button>
                    <button className="signUpBtn" onClick={handleClickToSignUp}>Sign Up</button>
                </div>
            </div>
        </div>
    )
}

export default LogIn
