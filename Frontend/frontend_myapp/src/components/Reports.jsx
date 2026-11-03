
import { useState } from 'react';
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

function Reports() {

    const [selectedMonth, setSelectedMonth] = useState('');

    // No sample financial data is added.
    const transactions = [];

    const income = transactions
        .filter(item => item.type === 'income')
        .reduce((total, item) => total + Number(item.amount), 0);

    const expenses = transactions
        .filter(item => item.type === 'expense')
        .reduce((total, item) => total + Number(item.amount), 0);

    const savings = income - expenses;

    const hasData = transactions.length > 0;

    const chartData = hasData ? [
        { name: 'Income', amount: income },
        { name: 'Expenses', amount: expenses }
    ] : [];

    const categoryData = Object.values(
        transactions
            .filter(item => item.type === 'expense')
            .reduce((result, item) => {
                result[item.category] = result[item.category] || {
                    name: item.category,
                    value: 0
                };

                result[item.category].value += Number(item.amount);

                return result;
            }, {})
    );

    const COLORS = [
        '#12c9a5',
        '#4f8df5',
        '#f59e0b',
        '#e87979',
        '#9b8af5',
        '#64748b'
    ];

    return (

        <div className="reports">

            <div className="reports-header">

                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Understand your income, expenses and savings.</p>
                </div>

                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />

            </div>

            <div className="report-summary">

                <div className="report-card">
                    <h3>Total Income</h3>
                    <h2>
                        {hasData ? `₹${income.toLocaleString('en-IN')}` : '--'}
                    </h2>
                </div>

                <div className="report-card">
                    <h3>Total Expenses</h3>
                    <h2>
                        {hasData ? `₹${expenses.toLocaleString('en-IN')}` : '--'}
                    </h2>
                </div>

                <div className="report-card">
                    <h3>Net Savings</h3>
                    <h2>
                        {hasData ? `₹${savings.toLocaleString('en-IN')}` : '--'}
                    </h2>
                </div>

            </div>

            <div className="report-charts">

                <div className="report-chart-card">

                    <h3>Income vs Expenses</h3>

                    {hasData ? (

                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData}>

                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis dataKey="name" />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Bar dataKey="amount" fill="#12c9a5" />

                            </BarChart>
                        </ResponsiveContainer>

                    ) : (

                        <div className="report-empty-state">
                            <h4>No Financial Data Available</h4>
                            <p>
                                Add transactions to view your income and
                                expense comparison.
                            </p>
                        </div>

                    )}

                </div>

                <div className="report-chart-card">

                    <h3>Expenses by Category</h3>

                    {categoryData.length > 0 ? (

                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>

                                <Pie
                                    data={categoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip />

                                <Legend />

                            </PieChart>
                        </ResponsiveContainer>

                    ) : (

                        <div className="report-empty-state">
                            <h4>No Expense Data Available</h4>
                            <p>
                                Add expense transactions to see your
                                category-wise spending.
                            </p>
                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Reports;
