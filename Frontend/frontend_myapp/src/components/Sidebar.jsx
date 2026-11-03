
import { NavLink } from 'react-router-dom';

function Sidebar() {

    return (
        <div className="sidebar">

            {/* Navigation Menu */}
            <div className="sidebar-menu">

                <ul>

                    <li>
                        <NavLink to="/dashboard" end>
                            <span className="menu-icon">⌂</span>
                            <span>Dashboard</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/transactions">
                            <span className="menu-icon">⇄</span>
                            <span>Transactions</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/budgets">
                            <span className="menu-icon">◷</span>
                            <span>Budgets</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/reports">
                            <span className="menu-icon">▥</span>
                            <span>Reports</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/goals">
                            <span className="menu-icon">◎</span>
                            <span>Goals & Savings</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/alerts">
                            <span className="menu-icon">♧</span>
                            <span>Alerts</span>
                        </NavLink>
                    </li>

                </ul>

            </div>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">

                <ul>

                    <li>
                        <NavLink to="/settings">
                            <span className="menu-icon">⚙</span>
                            <span>Settings</span>
                        </NavLink>
                    </li>

                </ul>

            </div>

        </div>
    );
}

export default Sidebar;
