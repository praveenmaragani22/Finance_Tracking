import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from '../Api';

function Settings() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        fullName: '',
        email: ''
    });

    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('finance_preferences');
        return saved ? JSON.parse(saved) : {
            currency: 'INR',
            dateFormat: 'DD/MM/YYYY'
        };
    });

    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('finance_notifications');
        return saved ? JSON.parse(saved) : {
            emailAlerts: true,
            budgetAlerts: true,
            goalAlerts: true,
            transactionAlerts: false
        };
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [submittingProfile, setSubmittingProfile] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoadingProfile(true);
                const response = await getProfile();
                setProfile({
                    fullName: response.data.full_name || '',
                    email: response.data.email || ''
                });
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchUserProfile();
    }, []);

    function handleProfileChange(e) {
        const { name, value } = e.target;

        setProfile({
            ...profile,
            [name]: value
        });
    }

    function handlePreferenceChange(e) {
        const { name, value } = e.target;

        setPreferences({
            ...preferences,
            [name]: value
        });
    }

    function handleNotificationChange(e) {
        const { name, checked } = e.target;

        setNotifications({
            ...notifications,
            [name]: checked
        });
    }

    function handlePasswordChange(e) {
        const { name, value } = e.target;

        setPasswordData({
            ...passwordData,
            [name]: value
        });
    }

    async function handleProfileSubmit(e) {
        e.preventDefault();

        if (!profile.fullName.trim()) {
            setMessage('Full name cannot be empty.');
            setMessageType('error');
            return;
        }

        try {
            setSubmittingProfile(true);
            setMessage('');

            const response = await updateProfile({
                full_name: profile.fullName.trim()
            });

            setMessage(response.data.message || 'Profile updated successfully!');
            setMessageType('success');

            if (response.data.user) {
                setProfile({
                    fullName: response.data.user.full_name,
                    email: response.data.user.email
                });
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage(
                error.response?.data?.detail ||
                'Unable to update profile. Please try again.'
            );
            setMessageType('error');
        } finally {
            setSubmittingProfile(false);
        }
    }

    function handlePreferencesSubmit(e) {
        e.preventDefault();

        localStorage.setItem('finance_preferences', JSON.stringify(preferences));
        localStorage.setItem('finance_notifications', JSON.stringify(notifications));

        setMessage('Account and notification preferences saved successfully!');
        setMessageType('success');
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('New password and confirm password do not match.');
            setMessageType('error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage('New password must contain at least 8 characters.');
            setMessageType('error');
            return;
        }

        try {
            setSubmittingPassword(true);
            setMessage('');

            const response = await changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                confirm_password: passwordData.confirmPassword
            });

            setMessage(response.data.message || 'Password updated successfully!');
            setMessageType('success');

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

        } catch (error) {
            console.error('Error changing password:', error);
            const errData = error.response?.data;
            if (errData && typeof errData === 'object') {
                const firstErr = Object.values(errData)[0];
                setMessage(
                    Array.isArray(firstErr) ? firstErr[0] : String(firstErr)
                );
            } else {
                setMessage('Unable to change password. Please verify your current password.');
            }
            setMessageType('error');
        } finally {
            setSubmittingPassword(false);
        }
    }

    function handleLogout() {
        const confirmed = window.confirm('Are you sure you want to log out?');

        if (confirmed) {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.clear();
            navigate('/login');
        }
    }

    return (

        <div className="settings">

            <div className="settings-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account and application preferences.</p>
                </div>

                <button
                    type="button"
                    className="settings-logout-btn"
                    onClick={handleLogout}
                    title="Log out of your account"
                >
                    <span className="logout-icon">↪</span>
                    <span>Logout</span>
                </button>
            </div>

            {message && (
                <div
                    className="settings-message"
                    style={{
                        backgroundColor: messageType === 'error' ? '#fee2e2' : '#e5faf5',
                        borderColor: messageType === 'error' ? '#fecaca' : '#b7eee2',
                        color: messageType === 'error' ? '#dc2626' : '#087f6e'
                    }}
                >
                    <span>{message}</span>
                    <button
                        type="button"
                        onClick={() => setMessage('')}
                        style={{ color: messageType === 'error' ? '#dc2626' : '#087f6e' }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Personal Profile */}

            <section className="settings-card">

                <div className="settings-card-header">
                    <h2>Personal Profile</h2>
                    <p>Manage your personal account information.</p>
                </div>

                <form onSubmit={handleProfileSubmit}>

                    <div className="settings-form-grid">

                        <div className="form-group">
                            <label>Full Name</label>

                            <input
                                type="text"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleProfileChange}
                                placeholder={loadingProfile ? 'Loading...' : 'Enter your full name'}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>

                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                placeholder={loadingProfile ? 'Loading...' : 'Enter your email'}
                                disabled
                                style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                                title="Email address cannot be changed"
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="settings-save-btn"
                        disabled={submittingProfile}
                    >
                        {submittingProfile ? 'Saving...' : 'Save Profile'}
                    </button>

                </form>

            </section>

            {/* Preferences */}

            <section className="settings-card">

                <div className="settings-card-header">
                    <h2>Account Preferences</h2>
                    <p>Customize your financial display preferences.</p>
                </div>

                <form onSubmit={handlePreferencesSubmit}>

                    <div className="settings-form-grid">

                        <div className="form-group">
                            <label>Currency</label>

                            <select
                                name="currency"
                                value={preferences.currency}
                                onChange={handlePreferenceChange}
                            >
                                <option value="INR">Indian Rupee (₹)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">British Pound (£)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date Format</label>

                            <select
                                name="dateFormat"
                                value={preferences.dateFormat}
                                onChange={handlePreferenceChange}
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>

                    </div>

                    <button type="submit" className="settings-save-btn">
                        Save Preferences
                    </button>

                </form>

            </section>

            {/* Notifications */}

            <section className="settings-card">

                <div className="settings-card-header">
                    <h2>Notification Preferences</h2>
                    <p>Choose which financial alerts you want to receive.</p>
                </div>

                <div className="notification-settings">

                    <label>
                        <span>
                            <strong>Email Notifications</strong>
                            <small>Receive account notifications through email.</small>
                        </span>

                        <input
                            type="checkbox"
                            name="emailAlerts"
                            checked={notifications.emailAlerts}
                            onChange={handleNotificationChange}
                        />
                    </label>

                    <label>
                        <span>
                            <strong>Budget Alerts</strong>
                            <small>Get notified when spending approaches your budget.</small>
                        </span>

                        <input
                            type="checkbox"
                            name="budgetAlerts"
                            checked={notifications.budgetAlerts}
                            onChange={handleNotificationChange}
                        />
                    </label>

                    <label>
                        <span>
                            <strong>Goal Notifications</strong>
                            <small>Receive updates about your savings goals.</small>
                        </span>

                        <input
                            type="checkbox"
                            name="goalAlerts"
                            checked={notifications.goalAlerts}
                            onChange={handleNotificationChange}
                        />
                    </label>

                    <label>
                        <span>
                            <strong>Transaction Notifications</strong>
                            <small>Receive alerts when transactions are recorded.</small>
                        </span>

                        <input
                            type="checkbox"
                            name="transactionAlerts"
                            checked={notifications.transactionAlerts}
                            onChange={handleNotificationChange}
                        />
                    </label>

                </div>

            </section>

            {/* Security */}

            <section className="settings-card">

                <div className="settings-card-header">
                    <h2>Change Password</h2>
                    <p>Update your account password.</p>
                </div>

                <form onSubmit={handlePasswordSubmit}>

                    <div className="settings-form-grid">

                        <div className="form-group">
                            <label>Current Password</label>

                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>

                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                minLength="8"
                                placeholder="Min. 8 characters"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="settings-save-btn"
                        disabled={submittingPassword}
                    >
                        {submittingPassword ? 'Updating Password...' : 'Update Password'}
                    </button>

                </form>

            </section>

            {/* Account Information */}

            <section className="settings-card">

                <div className="settings-card-header">
                    <h2>Account Information</h2>
                    <p>General information about your application account.</p>
                </div>

                <div className="account-information">

                    <div>
                        <span>Account Type</span>
                        <strong>Personal Account</strong>
                    </div>

                    <div>
                        <span>Application</span>
                        <strong>Personal Finance Tracking System</strong>
                    </div>

                    <div>
                        <span>Account Status</span>
                        <strong style={{ color: '#12a98d' }}>Active & Secure</strong>
                    </div>

                    <div>
                        <span>Signed In As</span>
                        <strong>{profile.email || 'Authenticated User'}</strong>
                    </div>

                </div>

            </section>

            {/* Account Session / Logout */}

            <section className="settings-card">

                <div className="settings-card-header">
                    <h2>Account Session</h2>
                    <p>Manage your active session and sign out of your account.</p>
                </div>

                <div className="settings-logout-section">

                    <div>
                        <strong>Sign out of your account</strong>
                        <p>Logging out will end your session on this device. You will need your credentials to log back in.</p>
                    </div>

                    <button
                        type="button"
                        className="settings-logout-btn"
                        onClick={handleLogout}
                    >
                        <span className="logout-icon">↪</span>
                        <span>Logout</span>
                    </button>

                </div>

            </section>

        </div>
    );
}

export default Settings;
