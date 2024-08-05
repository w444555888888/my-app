import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./signUp.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
const SignUp = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const handleClickToHome = () => {
        navigate('/');
    };

    const handleSignUp = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
                email:email, username: username, password: password
            })
            if(response.data){
                navigate('/login')
            }

        } catch (error) {
            console.error('Error:', error)
            setMessage(error.response.data.Message)
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
                        <div className="navButton" onClick={handleClickToHome}><FontAwesomeIcon icon={faCircleRight} /></div>
                    </div>
                </div>
            </div>
            <div className="signUpContainer">
                <h2>Sign Up Account</h2>
                <form onSubmit={handleSignUp}>
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
                        <label htmlFor="username">username:</label>
                        <input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                   
                    <button type="submit">Sign Up</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default SignUp;
