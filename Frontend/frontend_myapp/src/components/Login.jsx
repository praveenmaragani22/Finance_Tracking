
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setMessage('');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setMessage('');

        try {

            const response = await axios.post(
                'http://127.0.0.1:8000/api/login/',
                {
                    email: formData.email,
                    password: formData.password
                }
            );

            // Store JWT tokens for the current browser session
            sessionStorage.setItem('access_token', response.data.access);
            sessionStorage.setItem('refresh_token', response.data.refresh);

            // Redirect to dashboard
            navigate('/dashboard');

        } catch (error) {

            if (error.response) {
                setMessage(
                    error.response.data.detail ||
                    'Invalid email or password.'
                );
            } else {
                setMessage(
                    'Unable to connect to the server. Please try again.'
                );
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">

            <div className="login-info">
                <h1>FinanceTrack</h1>
                <h2>Welcome Back!</h2>
                <p>
                    Manage your income, expenses, budgets
                    and savings in one place.
                </p>
            </div>

            <div className="login-form-container">

                <form className="login-form" onSubmit={handleSubmit}>

                    <h2>Login</h2>
                    <p>Access your FinanceTrack account.</p>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {message && (
                        <p className="login-message" role="alert">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p className="register-link">
                        Don't have an account?
                        {' '}
                        <a href="/register">Register</a>
                    </p>

                    <p className="back-home-link">
                        <a href="/">Back to Home</a>
                    </p>

                </form>

            </div>

        </div>
    );
}

export default Login;
