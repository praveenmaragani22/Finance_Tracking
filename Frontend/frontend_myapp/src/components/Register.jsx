import { useState } from 'react';
import { registerUser } from '../Api';

function Register() {

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setMessage('');
        setMessageType('');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            return;
        }

        if (formData.password.length < 8) {
            setMessage('Password must contain at least 8 characters.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {

            const response = await registerUser({
                full_name: formData.fullName,
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirmPassword
            });

            setMessage(response.data.message);
            setMessageType('success');

            setFormData({
                fullName: '',
                email: '',
                password: '',
                confirmPassword: ''
            });

            // Redirect to login after successful registration
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);

        } catch (error) {

            if (error.response) {

                const errors = error.response.data;

                const errorMessage = Object.entries(errors)
                    .map(([field, messages]) => {
                        const readableField = field.replaceAll('_', ' ');

                        return `${readableField}: ${
                            Array.isArray(messages)
                                ? messages.join(', ')
                                : messages
                        }`;
                    })
                    .join(' | ');

                setMessage(errorMessage || 'Registration failed.');
            } else {
                setMessage(
                    'Unable to connect to the server. Please try again.'
                );
            }

            setMessageType('error');

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-page">

            {/* Register Information */}
            <div className="register-info">

                <h1>FinanceTrack</h1>

                <h2>Start managing your money smarter.</h2>

                <p>
                    Create your account and take control of your
                    income, expenses, budgets and savings.
                </p>

                <div className="register-benefits">
                    <p>✓ Track your income and expenses</p>
                    <p>✓ Manage your monthly budgets</p>
                    <p>✓ Monitor your savings goals</p>
                    <p>✓ Understand your spending habits</p>
                </div>

            </div>

            {/* Registration Form */}
            <div className="register-form-container">

                <form className="register-form" onSubmit={handleSubmit}>

                    <h2>Create Account</h2>

                    <p className="register-subtitle">
                        Get started with FinanceTrack
                    </p>

                    <div className="form-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

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
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength="8"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {message && (
                        <p
                            className={`register-message ${messageType === 'success' ? 'success' : ''}`}
                            role="alert"
                            aria-live="polite"
                        >
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p className="login-link">
                        Already have an account? <a href="/login">Login</a>
                    </p>

                </form>

            </div>

        </div>
    );
}

export default Register;
