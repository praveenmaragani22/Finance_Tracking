
import { useState } from 'react';

function Budgets() {

    const [budgets, setBudgets] = useState([]);

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
        'Other'
    ];

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (Number(formData.amount) <= 0) {
            alert('Please enter a valid budget amount.');
            return;
        }

        if (editId !== null) {

            setBudgets(
                budgets.map((budget) =>
                    budget.id === editId
                        ? { ...budget, ...formData, amount: Number(formData.amount) }
                        : budget
                )
            );

        } else {

            const newBudget = {
                id: Date.now(),
                ...formData,
                amount: Number(formData.amount),
                spent: 0
            };

            setBudgets([...budgets, newBudget]);
        }

        resetForm();
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
            amount: budget.amount,
            month: budget.month
        });

        setEditId(budget.id);
        setShowForm(true);
    }

    function handleDelete(id) {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this budget?'
        );

        if (confirmDelete) {
            setBudgets(
                budgets.filter((budget) => budget.id !== id)
            );
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
                    className="add-budget-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    + Create Budget
                </button>

            </div>

            {showForm && (

                <div className="budget-form-container">

                    <h2>
                        {editId !== null ? 'Edit Budget' : 'Create New Budget'}
                    </h2>

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

                            <button type="submit" className="save-budget-btn">
                                {editId !== null ? 'Update Budget' : 'Save Budget'}
                            </button>

                            <button
                                type="button"
                                className="cancel-budget-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>
            )}

            <div className="budget-list">

                {budgets.length === 0 ? (

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

                            const percentage = Math.min(
                                (budget.spent / budget.amount) * 100,
                                100
                            );

                            return (

                                <div className="budget-card" key={budget.id}>

                                    <div className="budget-card-header">

                                        <div>
                                            <h3>{budget.category}</h3>
                                            <p>{budget.month}</p>
                                        </div>

                                        <div className="budget-card-actions">

                                            <button onClick={() => handleEdit(budget)}>
                                                Edit
                                            </button>

                                            <button onClick={() => handleDelete(budget.id)}>
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                    <h2>
                                        ₹{budget.amount.toLocaleString('en-IN')}
                                    </h2>

                                    <p className="budget-spent">
                                        Spent: ₹{budget.spent.toLocaleString('en-IN')}
                                    </p>

                                    <div className="budget-progress">
                                        <div
                                            className="budget-progress-fill"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    <p className="budget-remaining">
                                        Remaining: ₹{(budget.amount - budget.spent).toLocaleString('en-IN')}
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
