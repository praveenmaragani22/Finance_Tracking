
import { useState } from 'react';

function Goals() {

    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        goalName: '',
        targetAmount: '',
        savedAmount: '',
        targetDate: ''
    });

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
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

    function handleSubmit(e) {
        e.preventDefault();

        const target = Number(formData.targetAmount);
        const saved = Number(formData.savedAmount);

        if (target <= 0 || saved < 0 || saved > target) {
            alert('Please enter valid goal amounts.');
            return;
        }

        if (editId !== null) {

            setGoals(goals.map((goal) =>
                goal.id === editId
                    ? {
                        ...goal,
                        ...formData,
                        targetAmount: target,
                        savedAmount: saved
                    }
                    : goal
            ));

        } else {

            const newGoal = {
                id: Date.now(),
                ...formData,
                targetAmount: target,
                savedAmount: saved
            };

            setGoals([...goals, newGoal]);
        }

        resetForm();
    }

    function handleEdit(goal) {
        setFormData({
            goalName: goal.goalName,
            targetAmount: goal.targetAmount,
            savedAmount: goal.savedAmount,
            targetDate: goal.targetDate
        });

        setEditId(goal.id);
        setShowForm(true);
    }

    function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            setGoals(goals.filter((goal) => goal.id !== id));
        }
    }

    function handleAddSavings(goal) {
        const amount = Number(
            window.prompt('Enter the amount you want to add:')
        );

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const remaining = goal.targetAmount - goal.savedAmount;

        if (amount > remaining) {
            alert(`You can add up to ₹${remaining.toLocaleString('en-IN')}.`);
            return;
        }

        setGoals(goals.map((item) =>
            item.id === goal.id
                ? { ...item, savedAmount: item.savedAmount + amount }
                : item
        ));
    }

    return (
        <div className="goals">

            <div className="goals-header">

                <div>
                    <h1>Goals & Savings</h1>
                    <p>Set financial goals and track your savings progress.</p>
                </div>

                <button
                    className="add-goal-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    + Create Goal
                </button>

            </div>

            {showForm && (

                <div className="goal-form-container">

                    <h2>{editId !== null ? 'Edit Goal' : 'Create New Goal'}</h2>

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

                            <button type="submit" className="save-goal-btn">
                                {editId !== null ? 'Update Goal' : 'Save Goal'}
                            </button>

                            <button
                                type="button"
                                className="cancel-goal-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {goals.length === 0 ? (

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

                        const percentage = Math.min(
                            (goal.savedAmount / goal.targetAmount) * 100,
                            100
                        );

                        const remaining = goal.targetAmount - goal.savedAmount;

                        return (

                            <div className="goal-card" key={goal.id}>

                                <div className="goal-card-header">

                                    <div>
                                        <h3>{goal.goalName}</h3>
                                        <p>Target: {goal.targetDate}</p>
                                    </div>

                                    <div className="goal-actions">
                                        <button onClick={() => handleEdit(goal)}>
                                            Edit
                                        </button>

                                        <button onClick={() => handleDelete(goal.id)}>
                                            Delete
                                        </button>
                                    </div>

                                </div>

                                <div className="goal-amounts">

                                    <div>
                                        <span>Saved Amount</span>
                                        <h2>₹{goal.savedAmount.toLocaleString('en-IN')}</h2>
                                    </div>

                                    <div>
                                        <span>Target Amount</span>
                                        <h2>₹{goal.targetAmount.toLocaleString('en-IN')}</h2>
                                    </div>

                                </div>

                                <div className="goal-progress">
                                    <div
                                        className="goal-progress-fill"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <div className="goal-progress-details">
                                    <span>{percentage.toFixed(1)}% completed</span>
                                    <span>₹{remaining.toLocaleString('en-IN')} remaining</span>
                                </div>

                                {remaining > 0 ? (
                                    <button
                                        className="add-savings-btn"
                                        onClick={() => handleAddSavings(goal)}
                                    >
                                        + Add Savings
                                    </button>
                                ) : (
                                    <p className="goal-completed">
                                        Goal completed!
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
