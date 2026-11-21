import { useState, useEffect } from 'react';
import {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget
} from '../Api';

function Budgets() {

    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        month: ''
    });

    const categories = [
        'Food',
        'Shopping',
        'Travel',
        'Bills',
        'Entertainment',
        'Health',
        'Education',
        'Salary',
        'Business',
        'Other'
    ];

    // Fetch budgets from backend
    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const response = await getBudgets();
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            setMessage(
                error.response?.data?.detail ||
                'Unable to load budgets. Please try again.'
            );
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

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

        const amountNum = Number(formData.amount);
        if (!Number.isFinite(amountNum) || amountNum <= 0) {
            setMessage('Please enter a valid budget amount greater than zero.');
            setMessageType('error');
            return;
        }

        if (!formData.category) {
            setMessage('Please select a category.');
            setMessageType('error');
            return;
        }

        const payload = {
            category: formData.category,
            amount: amountNum,
            name: `${formData.category} Budget`,
            month: formData.month
        };

        try {
            setSubmitting(true);
            setMessage('');

            if (editId !== null) {
                await updateBudget(editId, payload);
                setMessage('Budget updated successfully!');
            } else {
                await createBudget(payload);
                setMessage('Budget created successfully!');
            }

            setMessageType('success');
            resetForm();
            fetchBudgets();

        } catch (error) {
            console.error('Error saving budget:', error);
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                const firstError = Object.values(errorData)[0];
                setMessage(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : String(firstError || 'Unable to save budget.')
                );
            } else {
                setMessage('Unable to save budget. Please try again.');
            }
            setMessageType('error');
        } finally {
            setSubmitting(false);
        }
    }

    function resetForm() {
        setFormData({
            category: '',
            amount: '',
            month: ''
        });

        setEditId(null);
        setShowForm(false);
    }

    function handleEdit(budget) {
        setFormData({
            category: budget.category,
            amount: String(budget.amount),
            month: budget.month || (budget.start_date ? budget.start_date.substring(0, 7) : '')
        });

        setEditId(budget.id);
        setMessage('');
        setShowForm(true);
    }

    async function handleDelete(id) {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this budget?'
        );

        if (!confirmDelete) return;

        try {
            await deleteBudget(id);
            setBudgets(prev => prev.filter(b => b.id !== id));
            setMessage('Budget deleted successfully.');
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting budget:', error);
            setMessage(
                error.response?.data?.detail ||
                'Unable to delete budget. Please try again.'
            );
            setMessageType('error');
        }
    }

    return (
        <div className="budgets">

            <div className="budgets-header">

                <div>
                    <h1>Budget Management</h1>
                    <p>Plan and manage your monthly spending limits.</p>
                </div>

                <button
                    type="button"
                    className="add-budget-btn"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                            setMessage('');
                        }
                    }}
                >
                    {showForm ? 'Close Form' : '+ Create Budget'}
                </button>

            </div>

            {/* Notification message */}
            {message && !showForm && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: messageType === 'error' ? '#fee2e2' : '#e5faf5',
                    color: messageType === 'error' ? '#dc2626' : '#087f6e',
                    border: `1px solid ${messageType === 'error' ? '#fecaca' : '#b7eee2'}`
                }}>
                    {message}
                </div>
            )}

            {showForm && (

                <div className="budget-form-container">

                    <h2>
                        {editId !== null ? 'Edit Budget' : 'Create New Budget'}
                    </h2>

                    {message && (
                        <div style={{
                            padding: '10px 14px',
                            marginBottom: '15px',
                            borderRadius: '7px',
                            fontSize: '13px',
                            backgroundColor: messageType === 'error' ? '#fee2e2' : '#e5faf5',
                            color: messageType === 'error' ? '#dc2626' : '#087f6e',
                            border: `1px solid ${messageType === 'error' ? '#fecaca' : '#b7eee2'}`
                        }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="budget-form">

                        <div className="form-group">
                            <label>Category</label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>

                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Budget Amount (₹)</label>

                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Month</label>

                            <input
                                type="month"
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="budget-form-actions">

                            <button
                                type="button"
                                className="cancel-budget-btn"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-budget-btn"
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Saving...'
                                    : editId !== null
                                        ? 'Update Budget'
                                        : 'Save Budget'}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            <div className="budget-list">

                {loading ? (

                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        Loading budgets...
                    </div>

                ) : budgets.length === 0 ? (

                    <div className="budget-empty-state">

                        <div className="empty-state-icon">₹</div>

                        <h3>No Budgets Created Yet</h3>

                        <p>
                            Create your first monthly budget to start managing
                            your spending limits.
                        </p>

                    </div>

                ) : (

                    <div className="budget-cards">

                        {budgets.map((budget) => {

                            const spentAmount = Number(budget.spent || 0);
                            const totalAmount = Number(budget.amount || 0);
                            const remainingAmount = totalAmount - spentAmount;

                            const percentage = totalAmount > 0
                                ? (spentAmount / totalAmount) * 100
                                : 0;

                            const isExceeded = spentAmount > totalAmount;
                            const isWarning = percentage >= 80 && !isExceeded;

                            return (

                                <div className="budget-card" key={budget.id}>

                                    <div className="budget-card-header">

                                        <div>
                                            <h3>{budget.category}</h3>
                                            <p>{budget.month || (budget.start_date ? budget.start_date.substring(0, 7) : '')}</p>
                                        </div>

                                        <div className="budget-card-actions">

                                            <button
                                                type="button"
                                                onClick={() => handleEdit(budget)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(budget.id)}
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                    <h2>
                                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h2>

                                    <p className="budget-spent" style={{ color: isExceeded ? '#dc2626' : '#52627a' }}>
                                        Spent: ₹{spentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        {isExceeded && ' (Exceeded!)'}
                                    </p>

                                    <div className="budget-progress">
                                        <div
                                            className="budget-progress-fill"
                                            style={{
                                                width: `${Math.min(percentage, 100)}%`,
                                                backgroundColor: isExceeded ? '#dc2626' : isWarning ? '#f59e0b' : '#12c9a5'
                                            }}
                                        />
                                    </div>

                                    <p
                                        className="budget-remaining"
                                        style={{ color: remainingAmount < 0 ? '#dc2626' : '#64748b' }}
                                    >
                                        {remainingAmount < 0
                                            ? `Over budget by: ₹${Math.abs(remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : `Remaining: ₹${remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${(100 - percentage).toFixed(1)}%)`
                                        }
                                    </p>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Budgets;
