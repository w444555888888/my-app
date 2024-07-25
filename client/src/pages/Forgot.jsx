import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./forgot.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight  } from '@fortawesome/free-solid-svg-icons'

const Forgot = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const handleClickToLogin = () => {
        navigate('/login');
    };


    const handleLogIn = async (event) => {
        event.preventDefault();

        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
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
                        <div className="navButton" onClick={handleClickToLogin}><FontAwesomeIcon icon={faCircleRight} /></div>
                    </div>
                </div>
            </div>
            <div className="logInContainer">
                <h2>Forgot Account</h2>
                <form onSubmit={handleLogIn}>
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
    );
}

export default Forgot;
