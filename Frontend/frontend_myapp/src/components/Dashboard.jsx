import { useEffect, useState } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import { getDashboardData } from '../Api';

const CHART_COLORS = [
    '#35b99a',
    '#6478d3',
    '#f4a261',
    '#e76f51',
    '#8b72c7',
    '#48a9a6'
];

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getDashboardData();
                setDashboardData(response.data);
            } catch (err) {
                console.error('Dashboard error:', err);
                setError('Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Number(amount || 0));
    };

    if (loading) {
        return <div className="dashboard"><p style={{ padding: '30px', color: '#64748b' }}>Loading dashboard...</p></div>;
    }

    if (error) {
        return <div className="dashboard"><p style={{ padding: '30px', color: '#dc2626' }}>{error}</p></div>;
    }

    if (!dashboardData) return null;

    const recentTransactions =
        dashboardData.recent_transactions || [];

    const categoryData =
        dashboardData.expenses_by_category || [];

    const userBudgets =
        dashboardData.budgets || [];

    // Prepare monthly chart data
    const monthlyData = {};

    (dashboardData.monthly_income || []).forEach((item) => {
        const month = item.month.substring(0, 7);

        monthlyData[month] = {
            month,
            income: Number(item.total),
            expenses: 0
        };
    });

    (dashboardData.monthly_expenses || []).forEach((item) => {
        const month = item.month.substring(0, 7);

        if (!monthlyData[month]) {
            monthlyData[month] = {
                month,
                income: 0,
                expenses: 0
            };
        }

        monthlyData[month].expenses = Number(item.total);
    });

    const monthlyChartData = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((item) => ({
            ...item,
            month: new Date(
                item.month + '-01T00:00:00'
            ).toLocaleDateString('en-IN', {
                month: 'short',
                year: '2-digit'
            })
        }));

    // Prepare category chart data
    const pieChartData = categoryData.map((item) => ({
        name: item.category,
        value: Number(item.total)
    }));

    return (
        <div className="dashboard">

            {/* Dashboard Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome to your personal finance overview.</p>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="dashboard-overview">

                <div className="overview-card">
                    <h3>Total Balance</h3>
                    <p>{formatCurrency(dashboardData.total_balance)}</p>
                </div>

                <div className="overview-card">
                    <h3>Total Income</h3>
                    <p>{formatCurrency(dashboardData.total_income)}</p>
                </div>

                <div className="overview-card">
                    <h3>Total Expenses</h3>
                    <p>{formatCurrency(dashboardData.total_expenses)}</p>
                </div>

                <div className="overview-card">
                    <h3>Savings</h3>
                    <p>{formatCurrency(dashboardData.savings)}</p>
                </div>

            </div>

            {/* Analytics */}
            <div className="dashboard-analytics">

                {/* Income vs Expenses */}
                <div className="analytics-card">
                    <h3>Income vs Expenses</h3>

                    {monthlyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={monthlyChartData}
                                margin={{
                                    top: 20,
                                    right: 15,
                                    left: 10,
                                    bottom: 5
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis dataKey="month" />

                                <YAxis
                                    tickFormatter={(value) =>
                                        `₹${value / 1000}k`
                                    }
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(value)
                                    }
                                />

                                <Legend />

                                <Bar
                                    dataKey="income"
                                    name="Income"
                                    fill="#35b99a"
                                    radius={[5, 5, 0, 0]}
                                />

                                <Bar
                                    dataKey="expenses"
                                    name="Expenses"
                                    fill="#6478d3"
                                    radius={[5, 5, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <p>No monthly transaction data available yet.</p>
                        </div>
                    )}
                </div>

                {/* Expenses by Category */}
                <div className="analytics-card">
                    <h3>Expenses by Category</h3>

                    {pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={100}
                                    paddingAngle={3}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={CHART_COLORS[
                                                index % CHART_COLORS.length
                                            ]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(value)
                                    }
                                />

                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <p>No expense categories available yet.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Budget Overview */}
            <div className="dashboard-budget">

                <div className="budget-header">
                    <div>
                        <h3>Budget Overview</h3>
                        <p>
                            Track your spending against your planned budgets.
                        </p>
                    </div>
                </div>

                {userBudgets.length > 0 ? (
                    <div className="budget-cards" style={{ marginTop: '12px' }}>
                        {userBudgets.map((budget) => {
                            const spent = Number(budget.spent || 0);
                            const amount = Number(budget.amount || 0);
                            const percentage = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
                            const isExceeded = spent > amount;

                            return (
                                <div className="budget-card" key={budget.id}>
                                    <div className="budget-card-header">
                                        <div>
                                            <h3>{budget.category}</h3>
                                            <p>{budget.month || (budget.start_date ? budget.start_date.substring(0, 7) : '')}</p>
                                        </div>
                                    </div>

                                    <h2>{formatCurrency(amount)}</h2>

                                    <p className="budget-spent" style={{ color: isExceeded ? '#dc2626' : '#52627a' }}>
                                        Spent: {formatCurrency(spent)} {isExceeded && '(Exceeded!)'}
                                    </p>

                                    <div className="budget-progress">
                                        <div
                                            className="budget-progress-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: isExceeded ? '#dc2626' : percentage >= 80 ? '#f59e0b' : '#12c9a5'
                                            }}
                                        />
                                    </div>

                                    <p className="budget-remaining">
                                        Remaining: {formatCurrency(amount - spent)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="budget-empty-state">
                        <div className="empty-state-icon">▤</div>
                        <h4>No budgets created yet</h4>
                        <p>
                            Create your first budget to monitor your
                            monthly spending and manage your money better.
                        </p>
                    </div>
                )}

            </div>

            {/* Recent Transactions */}
            <div className="dashboard-recent">

                <div className="recent-header">
                    <div>
                        <h3>Recent Transactions</h3>
                        <p>Your latest income and expense activities.</p>
                    </div>
                </div>

                {recentTransactions.length > 0 ? (
                    <div className="transaction-table-container">
                        <table className="transaction-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.title}</td>
                                        <td>{transaction.category}</td>
                                        <td>{transaction.date}</td>
                                        <td>
                                            <span className="transaction-type">
                                                {transaction.transaction_type}
                                            </span>
                                        </td>
                                        <td className="transaction-amount">
                                            {transaction.transaction_type === 'Income'
                                                ? '+ '
                                                : '- '}
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="recent-empty-state">
                        <div className="empty-state-icon">⇄</div>
                        <h4>No transactions available</h4>
                        <p>
                            Your recent transactions will appear here
                            once you start recording your income and expenses.
                        </p>
                    </div>
                )}

            </div>

        </div>
    );
}

export default Dashboard;
