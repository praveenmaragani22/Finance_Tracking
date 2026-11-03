
import { useNavigate } from 'react-router-dom';

function Navbar({ searchQuery, setSearchQuery }) {

    const navigate = useNavigate();

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
                        P
                    </div>

                    <div className="profile-details">
                        <h4>Profile</h4>
                        <p>Account</p>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Navbar;
