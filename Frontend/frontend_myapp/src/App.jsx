
import './App.css';

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './components/Dashboard';
import Transactions from './components/Transcations';
import Budgets from './components/Budgets';
import Goals from './components/Goals';
import Reports from './components/Reports';
import Alerts from './components/Alerts';
import Settings from './components/Settings';

// Protect dashboard pages
function PrivateRoute({ children }) {
    const accessToken = sessionStorage.getItem('access_token');

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Common layout for all dashboard pages
function DashboardLayout({ children, searchQuery, setSearchQuery }) {
    return (
        <div className="app">

            <div className="navbar-area">
                <Navbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>

            <div className="sidebar-area">
                <Sidebar />
            </div>

            <main className="dashboard-area">
                {children}
            </main>

        </div>
    );
}

function App() {

    // Shared search state
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <Routes>

            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <DashboardLayout
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        >
                            <Dashboard />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Transactions */}
            <Route
                path="/transactions"
                element={
                    <PrivateRoute>
                        <DashboardLayout
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        >
                            <Transactions searchQuery={searchQuery} />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Budgets */}
            <Route
                path="/budgets"
                element={
                    <PrivateRoute>
                        <DashboardLayout
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        >
                            <Budgets />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Goals & Savings */}
            <Route
                path="/goals"
                element={
                    <PrivateRoute>
                        <DashboardLayout
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        >
                            <Goals />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Reports */}
            <Route
                path="/reports"
                element={
                    <PrivateRoute>
                        <DashboardLayout
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        >
                            <Reports />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Alerts */}
            <Route
                path="/alerts"
                element={
                    <PrivateRoute>
                        <DashboardLayout
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        >
                            <Alerts />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Settings */}
            <Route
                path="/settings"
                element={
                    <PrivateRoute>
                        <DashboardLayout
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        >
                            <Settings />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Unknown URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    );
}

export default App;
