import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./signUp.scss";

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const handleClickToHome = () => {
        navigate('/');
    };

    const handleSignUp = async (event) => {
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
        <div className='signUpWrapper'>
            <div className="signUpContainer">
                <div className="signUpTitle">
                    <div className="left">
                        <span className="logo">MIKE.BOOKING</span>
                    </div>
                    <div className="right">
                        <div className="navButton" onClick={handleClickToHome}>返回首頁</div>
                    </div>
                </div>
            </div>
            <div className="signUpContainer">
                <h2>註冊</h2>
                <form onSubmit={handleSignUp}>
                    <div className="formGroup">
                        <label htmlFor="email">您的電子郵件:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="password">密碼:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="confirmPassword">確認密碼:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">註冊</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default SignUp;
