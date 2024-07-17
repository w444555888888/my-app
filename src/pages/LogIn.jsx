import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./logIn.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight } from '@fortawesome/free-solid-svg-icons'

const LogIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const handleClickToHome = () => {
        navigate('/');
    };

    const handleLogIn = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setMessage('密碼不正確請重新輸入');
            return;
        }

        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            setMessage('註冊成功');
        } else {
            setMessage('註冊失敗，請重新註冊');
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
                <h2>Log In</h2>
                <form onSubmit={handleLogIn}>
                    <div className="formGroup">
                        <label htmlFor="email">E-mail;:</label>
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
                    <button type="submit">Log In</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default LogIn;
