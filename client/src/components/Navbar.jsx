/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-12 17:43:09
 * @FilePath: \my-app\src\components\Navbar.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react'
import "./navbar.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBed, faCar, faPlane, faTaxi, faToriiGate } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { toggleTheme  } from '../redux/userSlice'
const Navbar = () => {
    const [activeItem, setActiveItem] = useState('住宿')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    // 拿到全局initialState數據
    const { login, theme } = useSelector((state) => state.user)


    const handleClickActive = (item) => {
        setActiveItem(item)
    }

    const handleClickToHome = () => {
        navigate('/')
    }

    const handleClickToSignUp = () => {
        navigate('/signUp')
    }

    const handleClickToLogIn = () => {
        navigate('/logIn')
    }

    const handleClickToPersonal = () => {
        navigate('/personal')
    }

    // 切換主題白天/夜晚狀態
    const toggleThemeHandler = () => {
        dispatch(toggleTheme()) 
    }

    // (夜晚主題)添加類dark-theme
    useEffect(() => {
        document.documentElement.className = theme === 'dark' ? 'dark-theme' : ''
    }, [theme])



    return (
        <div className='navbar'>
            <div className="navbarContainer">
                <div className="lineOne">
                    <button className="navButton" onClick={toggleThemeHandler}>
                        {theme === 'light' ? '夜晚模式' : '白天模式'}
                    </button>
                    <div className="left">
                        <span className="logo" onClick={handleClickToHome}>MIKE.BOOKING</span>
                    </div>
                    <div className="right">
                        <button className="navButton" onClick={handleClickToSignUp}>註冊</button>

                        {login ? (
                            <button className="navButton" onClick={handleClickToPersonal}>我的帳戶</button>
                        ) : (<button className="navButton"
                            onClick={handleClickToLogIn}>登入</button>
                        )}

                    </div>
                </div>
                <div className="lineTwo">
                    <div className={`item ${activeItem === '住宿' ? 'active' : ''}`}
                        onClick={() => handleClickActive('住宿')}>
                        <FontAwesomeIcon icon={faBed} />
                        <span >住宿</span>
                    </div>
                    <div className={`item ${activeItem === '航班' ? 'active' : ''}`}
                        onClick={() => handleClickActive('航班')}>
                        <FontAwesomeIcon icon={faPlane} />
                        <span >航班</span>
                    </div>
                    <div className={`item ${activeItem === '租車' ? 'active' : ''}`}
                        onClick={() => handleClickActive('租車')}>
                        <FontAwesomeIcon icon={faCar} />
                        <span >租車</span>
                    </div>
                    <div className={`item ${activeItem === '景點/活動' ? 'active' : ''}`}
                        onClick={() => handleClickActive('景點/活動')}>
                        <FontAwesomeIcon icon={faToriiGate} />
                        <span >景點/活動</span>
                    </div>
                    <div className={`item ${activeItem === '機場計程車' ? 'active' : ''}`}
                        onClick={() => handleClickActive('機場計程車')}>
                        <FontAwesomeIcon icon={faTaxi} />
                        <span >機場計程車</span>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Navbar