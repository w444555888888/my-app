import React, { useState } from 'react'
import "./navbar.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBed, faCar, faPlane, faTaxi, faToriiGate } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
const Navbar = () => {

    const [activeItem, setActiveItem] = useState('住宿');

    const handleClickActive = (item) => {
        setActiveItem(item);
    };

    
    const navigate = useNavigate();
    const handleClickToHome = () => {
        navigate('/');
    };

    const handleClickToSignUp = () => {
        navigate('/SignUp');
    };

    return (
        <div className='navbar'>
            <div className="navbarContainer">
                <div className="lineOne">
                    <div className="left">
                        <span className="logo" onClick={handleClickToHome}>MIKE.BOOKING</span>
                    </div>
                    <div className="right">
                        <button className="navButton" onClick={handleClickToSignUp}>註冊</button>
                        <button className="navButton" >登入</button>
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