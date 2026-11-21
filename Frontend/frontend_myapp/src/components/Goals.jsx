import { useState, useEffect } from 'react';
import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addGoalSavings
} from '../Api';

function Goals() {

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        goalName: '',
        targetAmount: '',
        savedAmount: '',
        targetDate: ''
    });

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await getGoals();
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            // Normalize fields for the UI
            const normalized = data.map(g => ({
                id: g.id,
                goalName: g.title,
                targetAmount: Number(g.target_amount || 0),
                savedAmount: Number(g.current_amount || 0),
                targetDate: g.target_date,
                progressPercentage: Number(g.progress_percentage || 0),
                remainingAmount: Number(g.remaining_amount || 0),
                isCompleted: Boolean(g.is_completed)
            }));

            setGoals(normalized);
        } catch (error) {
            console.error('Error fetching goals:', error);
            setMessage(
                error.response?.data?.detail ||
                'Unable to load savings goals. Please try again.'
            );
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
        setMessage('');
    }

    function resetForm() {
        setFormData({
            goalName: '',
            targetAmount: '',
            savedAmount: '',
            targetDate: ''
        });

        setEditId(null);
        setShowForm(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const target = Number(formData.targetAmount);
        const saved = Number(formData.savedAmount || 0);

        if (!Number.isFinite(target) || target <= 0) {
            setMessage('Please enter a valid target amount greater than zero.');
            setMessageType('error');
            return;
        }

        if (saved < 0 || saved > target) {
            setMessage('Saved amount cannot be negative or exceed the target amount.');
            setMessageType('error');
            return;
        }

        if (!formData.targetDate) {
            setMessage('Please specify a target date.');
            setMessageType('error');
            return;
        }

        const payload = {
            title: formData.goalName.trim(),
            target_amount: target,
            current_amount: saved,
            target_date: formData.targetDate
        };

        try {
            setSubmitting(true);
            setMessage('');

            if (editId !== null) {
                await updateGoal(editId, payload);
                setMessage('Goal updated successfully!');
            } else {
                await createGoal(payload);
                setMessage('Goal created successfully!');
            }

            setMessageType('success');
            resetForm();
            fetchGoals();

        } catch (error) {
            console.error('Error saving goal:', error);
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                const firstError = Object.values(errorData)[0];
                setMessage(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : String(firstError || 'Unable to save goal.')
                );
            } else {
                setMessage('Unable to save goal. Please try again.');
            }
            setMessageType('error');
        } finally {
            setSubmitting(false);
        }
    }

    function handleEdit(goal) {
        setFormData({
            goalName: goal.goalName,
            targetAmount: String(goal.targetAmount),
            savedAmount: String(goal.savedAmount),
            targetDate: goal.targetDate
        });

        setEditId(goal.id);
        setMessage('');
        setShowForm(true);
    }

    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this goal?')) {
            return;
        }

        try {
            await deleteGoal(id);
            setGoals(prev => prev.filter(g => g.id !== id));
            setMessage('Goal deleted successfully.');
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting goal:', error);
            setMessage(
                error.response?.data?.detail ||
                'Unable to delete goal. Please try again.'
            );
            setMessageType('error');
        }
    }

    async function handleAddSavings(goal) {
        const remaining = goal.targetAmount - goal.savedAmount;

        const input = window.prompt(
            `Enter amount to add to "${goal.goalName}" (Remaining: ₹${remaining.toLocaleString('en-IN')}):`
        );

        if (input === null) return; // User cancelled

        const amount = Number(input);

        if (!Number.isFinite(amount) || amount <= 0) {
            alert('Please enter a valid amount greater than zero.');
            return;
        }

        if (amount > remaining) {
            alert(`You can add up to ₹${remaining.toLocaleString('en-IN')}.`);
            return;
        }

        try {
            await addGoalSavings(goal.id, amount);
            setMessage(`Added ₹${amount.toLocaleString('en-IN')} to "${goal.goalName}"!`);
            setMessageType('success');
            fetchGoals();
        } catch (error) {
            console.error('Error adding savings:', error);
            alert(
                error.response?.data?.detail ||
                'Unable to add savings. Please try again.'
            );
        }
    }

    return (
        <div className="goals">

            <div className="goals-header">

                <div>
                    <h1>Goals & Savings</h1>
                    <p>Set financial goals and track your savings progress.</p>
                </div>

                <button
                    type="button"
                    className="add-goal-btn"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                            setMessage('');
                        }
                    }}
                >
                    {showForm ? 'Close Form' : '+ Create Goal'}
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

                <div className="goal-form-container">

                    <h2>{editId !== null ? 'Edit Goal' : 'Create New Goal'}</h2>

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

                    <form className="goal-form" onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Goal Name</label>
                            <input
                                type="text"
                                name="goalName"
                                value={formData.goalName}
                                onChange={handleChange}
                                placeholder="Example: Buy a Laptop"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Target Amount (₹)</label>
                            <input
                                type="number"
                                name="targetAmount"
                                value={formData.targetAmount}
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                placeholder="Enter target amount"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Already Saved (₹)</label>
                            <input
                                type="number"
                                name="savedAmount"
                                value={formData.savedAmount}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="Enter saved amount"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Target Date</label>
                            <input
                                type="date"
                                name="targetDate"
                                value={formData.targetDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="goal-form-actions">

                            <button
                                type="button"
                                className="cancel-goal-btn"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-goal-btn"
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Saving...'
                                    : editId !== null
                                        ? 'Update Goal'
                                        : 'Save Goal'}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {loading ? (

                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    Loading goals...
                </div>

            ) : goals.length === 0 ? (

                <div className="goal-empty-state">
                    <div className="empty-state-icon">◎</div>
                    <h3>No Savings Goals Yet</h3>
                    <p>
                        Create your first financial goal and start tracking
                        your savings journey.
                    </p>
                </div>

            ) : (

                <div className="goal-cards">

                    {goals.map((goal) => {

                        const percentage = goal.targetAmount > 0
                            ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
                            : 0;

                        const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

                        return (

                            <div className="goal-card" key={goal.id}>

                                <div className="goal-card-header">

                                    <div>
                                        <h3>{goal.goalName}</h3>
                                        <p>Target: {goal.targetDate}</p>
                                    </div>

                                    <div className="goal-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(goal)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(goal.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>

                                </div>

                                <div className="goal-amounts">

                                    <div>
                                        <span>Saved Amount</span>
                                        <h2>₹{goal.savedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                                    </div>

                                    <div>
                                        <span>Target Amount</span>
                                        <h2>₹{goal.targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                                    </div>

                                </div>

                                <div className="goal-progress">
                                    <div
                                        className="goal-progress-fill"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: percentage >= 100 ? '#10b981' : '#12c9a5'
                                        }}
                                    />
                                </div>

                                <div className="goal-progress-details">
                                    <span>{percentage.toFixed(1)}% completed</span>
                                    <span>₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining</span>
                                </div>

                                {remaining > 0 ? (
                                    <button
                                        type="button"
                                        className="add-savings-btn"
                                        onClick={() => handleAddSavings(goal)}
                                    >
                                        + Add Savings
                                    </button>
                                ) : (
                                    <p className="goal-completed">
                                        ✓ Goal completed!
                                    </p>
                                )}

                            </div>

                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default Goals;
