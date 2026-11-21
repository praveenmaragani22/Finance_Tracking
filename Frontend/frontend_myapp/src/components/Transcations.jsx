import { useState, useEffect } from 'react';
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../Api';

function Transactions({ searchQuery = '' }) {

    const [transactions, setTransactions] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const initialForm = {
        description: '',
        amount: '',
        category: '',
        date: '',
        type: 'expense'
    };

    const [formData, setFormData] = useState(initialForm);

    const categories = [
        'Salary',
        'Business',
        'Food',
        'Shopping',
        'Travel',
        'Bills',
        'Entertainment',
        'Health',
        'Education',
        'Other'
    ];

    // Convert Django transaction data into frontend format
    function formatTransaction(transaction) {
        return {
            id: transaction.id,
            description: transaction.title,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
            type: transaction.transaction_type.toLowerCase()
        };
    }

    // Fetch transactions from Django
    useEffect(() => {

        async function fetchTransactions() {
            try {
                setLoading(true);

                const response = await getTransactions();

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

                setTransactions(data.map(formatTransaction));

            } catch (error) {
                console.error('Error fetching transactions:', error);

                setMessage(
                    error.response?.data?.detail ||
                    'Unable to load transactions. Please try again.'
                );

            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();

    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    function openAddForm() {
        setFormData(initialForm);
        setEditingId(null);
        setMessage('');
        setShowForm(true);
    }

    // Add or update transaction
    async function handleSubmit(e) {
        e.preventDefault();

        const amount = Number(formData.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setMessage('Please enter a valid amount greater than zero.');
            return;
        }

        const transactionData = {
            title: formData.description.trim(),
            amount: amount,
            transaction_type: formData.type === 'income' ? 'Income' : 'Expense',
            category: formData.category,
            date: formData.date
        };

        try {
            setSubmitting(true);
            setMessage('');

            if (editingId !== null) {

                const response = await updateTransaction(
                    editingId,
                    transactionData
                );

                const updatedTransaction = formatTransaction(response.data);

                setTransactions(previous =>
                    previous.map(transaction =>
                        transaction.id === editingId
                            ? updatedTransaction
                            : transaction
                    )
                );

            } else {

                const response = await createTransaction(transactionData);

                const newTransaction = formatTransaction(response.data);

                setTransactions(previous => [
                    newTransaction,
                    ...previous
                ]);
            }

            setFormData(initialForm);
            setEditingId(null);
            setShowForm(false);

        } catch (error) {
            console.error('Error saving transaction:', error);

            const errorData = error.response?.data;

            if (errorData && typeof errorData === 'object') {
                const firstError = Object.values(errorData)[0];

                setMessage(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : String(firstError || 'Unable to save transaction.')
                );
            } else {
                setMessage('Unable to save transaction. Please try again.');
            }

        } finally {
            setSubmitting(false);
        }
    }

    function handleEdit(transaction) {
        setFormData({
            description: transaction.description,
            amount: String(transaction.amount),
            category: transaction.category,
            date: transaction.date,
            type: transaction.type
        });

        setEditingId(transaction.id);
        setMessage('');
        setShowForm(true);
    }

    // Delete transaction from Django
    async function handleDelete(id) {

        const confirmed = window.confirm(
            'Are you sure you want to delete this transaction?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteTransaction(id);

            setTransactions(previous =>
                previous.filter(transaction => transaction.id !== id)
            );

        } catch (error) {
            console.error('Error deleting transaction:', error);

            setMessage(
                error.response?.data?.detail ||
                'Unable to delete transaction. Please try again.'
            );
        }
    }

    function handleCancel() {
        setShowForm(false);
        setFormData(initialForm);
        setEditingId(null);
        setMessage('');
    }

    // Global search and filters
    const filteredTransactions = transactions.filter(transaction => {

        const query = searchQuery.trim().toLowerCase();

        const matchesSearch =
            transaction.description.toLowerCase().includes(query) ||
            transaction.category.toLowerCase().includes(query) ||
            String(transaction.amount).includes(query);

        const matchesType =
            typeFilter === 'all' || transaction.type === typeFilter;

        const matchesCategory =
            categoryFilter === 'all' ||
            transaction.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    return (
        <div className="transactions">

            {/* Transactions Header */}
            <div className="transactions-header">

                <div>
                    <h1>Transactions</h1>
                    <p>Manage and track your income and expenses.</p>
                </div>

                <button
                    type="button"
                    className="add-transaction-btn"
                    onClick={openAddForm}
                >
                    + Add Transaction
                </button>

            </div>

            {/* Loading and API messages */}
            {loading && (
                <p>Loading transactions...</p>
            )}

            {!loading && message && !showForm && (
                <p className="transaction-error">{message}</p>
            )}

            {/* Add / Edit Transaction Form */}
            {showForm && (

                <div className="transaction-form-container">

                    <form
                        className="transaction-form"
                        onSubmit={handleSubmit}
                    >

                        <h2>
                            {editingId !== null
                                ? 'Edit Transaction'
                                : 'Add New Transaction'}
                        </h2>

                        <div className="transaction-form-grid">

                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Enter description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Enter amount"
                                    min="0.01"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Transaction Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>

                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        {message && (
                            <p className="transaction-error">
                                {message}
                            </p>
                        )}

                        <div className="transaction-form-actions">

                            <button
                                type="button"
                                className="cancel-transaction-btn"
                                onClick={handleCancel}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-transaction-btn"
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Saving...'
                                    : editingId !== null
                                        ? 'Update Transaction'
                                        : 'Save Transaction'}
                            </button>

                        </div>

                    </form>

                </div>

            )}

            {/* Transaction Filters */}
            <div className="transaction-filters">

                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    aria-label="Filter by transaction type"
                >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                >
                    <option value="all">All Categories</option>

                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}

                </select>

            </div>

            {/* Transactions Table */}
            <div className="transaction-table-container">

                <table className="transaction-table">

                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td colSpan="6" className="no-transactions">
                                    Loading transactions...
                                </td>
                            </tr>

                        ) : filteredTransactions.length > 0 ? (

                            filteredTransactions.map(transaction => (

                                <tr key={transaction.id}>

                                    <td>{transaction.description}</td>

                                    <td>{transaction.category}</td>

                                    <td>{transaction.date}</td>

                                    <td>
                                        <span className={`transaction-type ${transaction.type}`}>
                                            {transaction.type}
                                        </span>
                                    </td>

                                    <td className={`transaction-amount ${transaction.type}`}>
                                        {transaction.type === 'income' ? '+' : '-'}
                                        ₹{Number(transaction.amount).toFixed(2)}
                                    </td>

                                    <td>
                                        <div className="transaction-actions">

                                            <button
                                                type="button"
                                                className="edit-transaction-btn"
                                                onClick={() => handleEdit(transaction)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-transaction-btn"
                                                onClick={() => handleDelete(transaction.id)}
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>
                                <td colSpan="6" className="no-transactions">

                                    <div className="empty-state">
                                        <h3>
                                            {transactions.length === 0
                                                ? 'No Transactions Yet'
                                                : 'No Matching Transactions'}
                                        </h3>

                                        <p>
                                            {transactions.length === 0
                                                ? 'Start tracking your income and expenses by adding your first transaction.'
                                                : 'Try changing your search or filter options.'}
                                        </p>
                                    </div>

                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Transactions;
