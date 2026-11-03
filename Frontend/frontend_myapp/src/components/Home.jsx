
function Home() {
    return (
        <div className="home-page">

            {/* Navbar */}
            <nav className="home-navbar">

                <div className="home-logo">
                    <h2>FinanceTrack</h2>
                </div>

                <div className="home-nav-links">
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#about">About</a>
                </div>

                <div className="home-nav-buttons">
                    <a href="/login" className="home-login-btn">
                        Login
                    </a>

                    <a href="/register" className="home-register-btn">
                        Register
                    </a>
                </div>

            </nav>

            {/* Hero Section */}
            <section className="hero-section" id="home">

                <div className="hero-content">

                    <span className="hero-tag">
                        PERSONAL FINANCE MANAGEMENT
                    </span>

                    <h1>
                        Take Control of Your Money,
                        <span> Build a Better Future.</span>
                    </h1>

                    <p>
                        Manage your income, track expenses, set budgets
                        and monitor your savings — all in one place.
                        Make smarter financial decisions with FinanceTrack.
                    </p>

                    <div className="hero-buttons">

                        <a href="/register" className="get-started-btn">
                            Get Started
                        </a>

                        <a href="#features" className="know-more-btn">
                            Know More
                        </a>

                    </div>

                </div>

                <div className="hero-visual">

                    <div className="hero-card">

                        <h3>Your Financial Overview</h3>

                        <div className="hero-card-content">
                            <span>Income Tracking</span>
                            <span>Expense Management</span>
                            <span>Budget Planning</span>
                            <span>Savings Goals</span>
                        </div>

                        <div className="hero-card-footer">
                            <p>Everything you need to manage your money.</p>
                        </div>

                    </div>

                </div>

            </section>

            {/* Features Section */}
            <section className="features-section" id="features">

                <div className="section-heading">

                    <span>OUR FEATURES</span>

                    <h2>Everything You Need to Manage Your Money</h2>

                    <p>
                        Keep your finances organized with simple
                        and useful financial management tools.
                    </p>

                </div>

                <div className="features-container">

                    <div className="feature-card">
                        <div className="feature-icon">↗</div>
                        <h3>Income Tracking</h3>
                        <p>
                            Record and monitor your income
                            from different sources.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">↘</div>
                        <h3>Expense Management</h3>
                        <p>
                            Track your daily expenses and
                            understand your spending habits.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">◷</div>
                        <h3>Budget Planning</h3>
                        <p>
                            Create budgets and keep your
                            spending within planned limits.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">◎</div>
                        <h3>Savings Goals</h3>
                        <p>
                            Set financial goals and monitor
                            your savings progress.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">▥</div>
                        <h3>Financial Reports</h3>
                        <p>
                            Understand your financial activities
                            through reports and analytics.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">♧</div>
                        <h3>Smart Alerts</h3>
                        <p>
                            Receive notifications about budget
                            limits and important financial activities.
                        </p>
                    </div>

                </div>

            </section>

            {/* How It Works Section */}
            <section className="how-section" id="how-it-works">

                <div className="section-heading">

                    <span>HOW IT WORKS</span>

                    <h2>Manage Your Finances in Simple Steps</h2>

                </div>

                <div className="steps-container">

                    <div className="step-card">
                        <div className="step-number">01</div>
                        <h3>Create an Account</h3>
                        <p>
                            Register with your details
                            to get started.
                        </p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">02</div>
                        <h3>Track Transactions</h3>
                        <p>
                            Add your income and expenses
                            regularly.
                        </p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">03</div>
                        <h3>Set Your Budgets</h3>
                        <p>
                            Plan your spending and
                            create savings goals.
                        </p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">04</div>
                        <h3>View Your Reports</h3>
                        <p>
                            Analyze your finances and
                            make better decisions.
                        </p>
                    </div>

                </div>

            </section>

            {/* About Section */}
            <section className="about-section" id="about">

                <div className="about-content">

                    <span>ABOUT FINANCETRACK</span>

                    <h2>
                        Your Money.
                        Your Goals.
                        Your Control.
                    </h2>

                    <p>
                        FinanceTrack is a personal finance management
                        platform designed to help users organize their
                        financial activities in one place.
                    </p>

                    <p>
                        From tracking everyday expenses to planning
                        budgets and monitoring savings, FinanceTrack
                        helps you understand where your money goes.
                    </p>

                    <a href="/register" className="about-register-btn">
                        Start Managing Your Money
                    </a>

                </div>

            </section>

            {/* Footer */}
            <footer className="home-footer">

                <div className="footer-content">

                    <div>
                        <h2>FinanceTrack</h2>
                        <p>
                            Make better financial decisions.
                            Build better financial habits.
                        </p>
                    </div>

                    <div className="footer-links">
                        <a href="#home">Home</a>
                        <a href="#features">Features</a>
                        <a href="#about">About</a>
                        <a href="/login">Login</a>
                        <a href="/register">Register</a>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} FinanceTrack.
                        All rights reserved.
                    </p>
                </div>

            </footer>

        </div>
    );
}

export default Home;
