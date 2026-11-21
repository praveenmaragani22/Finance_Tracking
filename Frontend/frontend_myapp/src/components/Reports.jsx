import { useState, useEffect } from 'react';
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
import { getReportsData } from '../Api';

const COLORS = [
    '#12c9a5',
    '#4f8df5',
    '#f59e0b',
    '#e87979',
    '#9b8af5',
    '#64748b',
    '#06b6d4',
    '#84cc16'
];

function Reports() {

    const [selectedMonth, setSelectedMonth] = useState('');
    const [reportData, setReportData] = useState({
        total_income: 0,
        total_expenses: 0,
        net_savings: 0,
        transactions_count: 0,
        category_data: [],
        income_category_data: [],
        monthly_trends: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                setError('');
                const params = {};
                if (selectedMonth) {
                    params.month = selectedMonth;
                }
                const response = await getReportsData(params);
                setReportData(response.data);
            } catch (err) {
                console.error('Error fetching reports data:', err);
                setError('Unable to load financial reports. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [selectedMonth]);

    const income = reportData.total_income || 0;
    const expenses = reportData.total_expenses || 0;
    const savings = reportData.net_savings || 0;
    const hasData = (income > 0 || expenses > 0 || reportData.transactions_count > 0);

    // Chart data for Income vs Expenses
    // If a month is selected or monthly_trends is empty, show comparison of the period
    // If all-time and monthly trends exist, show multi-month trend
    const chartData = selectedMonth || reportData.monthly_trends.length <= 1
        ? [
            { name: 'Income', amount: income },
            { name: 'Expenses', amount: expenses }
        ]
        : reportData.monthly_trends.map(item => ({
            name: item.month,
            Income: item.income,
            Expenses: item.expenses
        }));

    const categoryData = (reportData.category_data || []).filter(item => item.value > 0);

    return (
        <div className="reports">

            <div className="reports-header">

                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Understand your income, expenses and savings.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {selectedMonth && (
                        <button
                            type="button"
                            onClick={() => setSelectedMonth('')}
                            style={{
                                padding: '8px 12px',
                                background: '#edf1f6',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#52627a',
                                cursor: 'pointer'
                            }}
                        >
                            Clear Month Filter
                        </button>
                    )}
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        aria-label="Filter report by month"
                    />
                </div>

            </div>

            {error && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    fontSize: '13px'
                }}>
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="report-summary">

                <div className="report-card">
                    <h3>Total Income</h3>
                    <h2>
                        {loading ? '...' : `₹${income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h2>
                </div>

                <div className="report-card">
                    <h3>Total Expenses</h3>
                    <h2>
                        {loading ? '...' : `₹${expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h2>
                </div>

                <div className="report-card">
                    <h3>Net Savings</h3>
                    <h2 style={{ color: savings < 0 ? '#dc2626' : '#12c9a5' }}>
                        {loading ? '...' : `₹${savings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h2>
                </div>

            </div>

            {/* Visual Charts */}
            <div className="report-charts">

                <div className="report-chart-card">

                    <h3>
                        {selectedMonth
                            ? `Income vs Expenses (${selectedMonth})`
                            : 'Income vs Expenses Overview'}
                    </h3>

                    {loading ? (

                        <div style={{ padding: '60px', textAlign: 'center', color: '#8492a6' }}>
                            Loading chart...
                        </div>

                    ) : hasData ? (

                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
                                <XAxis dataKey="name" tick={{ fill: '#8492a6', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#8492a6', fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => [
                                        `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                                        ''
                                    ]}
                                />
                                <Legend />
                                {selectedMonth || reportData.monthly_trends.length <= 1 ? (
                                    <Bar dataKey="amount" fill="#12c9a5" radius={[4, 4, 0, 0]} />
                                ) : (
                                    <>
                                        <Bar dataKey="Income" fill="#12c9a5" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                                    </>
                                )}
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

                    {loading ? (

                        <div style={{ padding: '60px', textAlign: 'center', color: '#8492a6' }}>
                            Loading chart...
                        </div>

                    ) : categoryData.length > 0 ? (

                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${entry.name}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [
                                        `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                                        'Expense'
                                    ]}
                                />
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
