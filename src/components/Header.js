import React, { useState, useEffect } from 'react';
import './Header.css'; // Import corresponding CSS

const Header = () => {
    const [isNightMode, setIsNightMode] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('nightMode') === 'true';
        setIsNightMode(savedMode);
        document.body.classList.toggle('night-mode', savedMode);
    }, []);

    const toggleNightMode = () => {
        setIsNightMode(prevMode => {
            const newMode = !prevMode;
            localStorage.setItem('nightMode', newMode);
            document.body.classList.toggle('night-mode', newMode);
            return newMode;
        });
    };

    return (
        <header>
            <img src="/assets/images/logo.png" alt="Company Logo" id="site-logo" />
            <nav>
                {/* Navigation links */}
            </nav>
            <button onClick={toggleNightMode} className="night-mode-toggle">
                {isNightMode ? '🌙' : '☀️'}
            </button>
        </header>
    );
};

export default Header;
