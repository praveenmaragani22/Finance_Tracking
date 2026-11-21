import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../Api';

function Navbar({ searchQuery, setSearchQuery }) {

    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        getProfile()
            .then(res => {
                if (res.data && res.data.full_name) {
                    setUserName(res.data.full_name);
                }
            })
            .catch(() => {});
    }, []);

    const initial = userName ? userName.trim().charAt(0).toUpperCase() : 'P';
    const displayName = userName ? userName.trim().split(' ')[0] : 'Profile';

    return (
        <div className="navbar">

            {/* Application Logo */}
            <div
                className="navbar-logo"
                onClick={() => navigate('/dashboard')}
                style={{ cursor: 'pointer' }}
            >
                <h2>FinanceTrack</h2>
            </div>

            {/* Navbar Right Section */}
            <div className="navbar-right">

                {/* Global Search Bar */}
                <div className="navbar-search">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        aria-label="Search transactions"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Notification */}
                <div className="navbar-notification">
                    <button
                        type="button"
                        aria-label="Notifications"
                        title="Notifications"
                        onClick={() => navigate('/alerts')}
                    >
                        <span>♧</span>
                    </button>
                </div>

                {/* User Profile */}
                <div
                    className="navbar-profile"
                    onClick={() => navigate('/settings')}
                    style={{ cursor: 'pointer' }}
                    title="Open Settings"
                >
                    <div className="profile-avatar">
                        {initial}
                    </div>

                    <div className="profile-details">
                        <h4>{displayName}</h4>
                        <p>Account</p>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Navbar;
