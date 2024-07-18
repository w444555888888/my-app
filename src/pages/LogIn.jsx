import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./logIn.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight, faQuestion } from '@fortawesome/free-solid-svg-icons'

const LogIn = ({setIsLoggedIn}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const handleClickToHome = () => {
        navigate('/');
    };

    const handleClickToForgot = () => {
        navigate('/forgot');
    };

    const handleLogIn = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/users');
            const resUsers = await response.json();
            const user = resUsers.find(e => e.username === email && e.password === password);

            if (user) {
                setMessage('登入成功');
                localStorage.setItem('username', user.username);
                setIsLoggedIn(true);
                navigate('/');
            } else {
                setMessage('帳號密碼輸出錯誤，請重新輸入');
            }

        } catch (error) {
            setMessage('登入失敗，稍後在試');
        }
    };

    return (
        <div className='logInUpWrapper'>
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
                            type="email"
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
                <button className="forgotBtn" onClick={handleClickToForgot}>forgot account <FontAwesomeIcon icon={faQuestion} /></button>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default LogIn;
