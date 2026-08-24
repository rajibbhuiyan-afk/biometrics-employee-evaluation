import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: "Employee Evaluation",
            description:
                "Complete and manage employee self-evaluations efficiently.",
        },
        {
            title: "Performance Review",
            description:
                "Review employee performance and provide valuable feedback.",
        },
        {
            title: "Evaluation Periods",
            description:
                "Manage evaluation cycles, submission periods and deadlines.",
        },
        {
            title: "Evaluation Questions",
            description:
                "Manage evaluation categories, questions and rating criteria.",
        },
    ];

    return (
        <div className="home-page">

            {/* Hero Section */}

            <section className="home-hero">

                <div className="home-hero-content">

                    <span className="home-badge">
                        Employee Performance Management
                    </span>

                    <h1 className="home-title">
                        Employee Evaluation System
                    </h1>

                    <p className="home-description">
                        A centralized platform for managing employee
                        evaluations, performance reviews and appraisal
                        processes.
                    </p>

                    <div className="home-actions">

                        <button
                            type="button"
                            className="home-primary-button"
                            onClick={() => navigate("/login")}
                        >
                            Login to System
                        </button>

                    </div>

                </div>

            </section>


            {/* Features Section */}

            <section className="home-features">

                <div className="home-section-header">

                    <span className="home-section-label">
                        SYSTEM FEATURES
                    </span>

                    <h2>
                        Everything you need for employee evaluation
                    </h2>

                    <p>
                        Manage the complete employee evaluation process
                        from a single platform.
                    </p>

                </div>


                <div className="home-feature-grid">

                    {features.map((feature) => (

                        <div
                            key={feature.title}
                            className="home-feature-card"
                        >

                            <div className="home-feature-icon">
                                ✓
                            </div>

                            <h3>
                                {feature.title}
                            </h3>

                            <p>
                                {feature.description}
                            </p>

                        </div>

                    ))}

                </div>

            </section>


            {/* Login CTA */}

            <section className="home-cta">

                <h2>
                    Ready to get started?
                </h2>

                <p>
                    Login to access your employee evaluation dashboard.
                </p>

                <button
                    type="button"
                    className="home-cta-button"
                    onClick={() => navigate("/login")}
                >
                    Login to System
                </button>

            </section>


            {/* Footer */}

            <footer className="home-footer">

                <p>
                    © {new Date().getFullYear()} Employee Evaluation System
                </p>

            </footer>

        </div>
    );
};

export default Home;