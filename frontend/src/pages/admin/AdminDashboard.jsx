import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/dashboard");

            console.log("Admin Dashboard:", response.data);

            setDashboard(response.data.data || null);
        } catch (error) {
            console.error("Admin Dashboard Error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="management-page">
                <div className="data-table-empty">
                    <div className="data-table-empty-title">
                        Loading Admin Dashboard...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="management-page">

                <div className="page-header">
                    <div className="page-header-info">
                        <h1 className="page-header-title">
                            Admin Dashboard
                        </h1>

                        <p className="page-header-description">
                            Overview of users and evaluation activities.
                        </p>
                    </div>
                </div>

                <div className="management-error">
                    {error}
                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={fetchDashboard}
                >
                    Retry
                </button>

            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="management-page">

                <div className="page-header">
                    <div className="page-header-info">
                        <h1 className="page-header-title">
                            Admin Dashboard
                        </h1>

                        <p className="page-header-description">
                            No dashboard data available.
                        </p>
                    </div>
                </div>

            </div>
        );
    }

    return (
        <div className="management-page">

            {/* Page Header */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Admin Dashboard
                    </h1>

                    <p className="page-header-description">
                        Overview of users and evaluation activities.
                    </p>

                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={fetchDashboard}
                >
                    Refresh Dashboard
                </button>

            </div>


            {/* User Summary */}

            <section className="dashboard-section">

                <h2 className="dashboard-section-title">
                    User Summary
                </h2>

                <div className="dashboard-card-grid">

                    <DashboardCard
                        title="Employees"
                        value={dashboard.employees}
                    />

                    <DashboardCard
                        title="Managers"
                        value={dashboard.managers}
                    />

                    <DashboardCard
                        title="HR"
                        value={dashboard.hr}
                    />

                </div>

            </section>


            {/* Evaluation Summary */}

            <section className="dashboard-section">

                <h2 className="dashboard-section-title">
                    Evaluation Summary
                </h2>

                <div className="dashboard-card-grid">

                    <DashboardCard
                        title="Total Evaluations"
                        value={dashboard.total_evaluations}
                    />

                    <DashboardCard
                        title="Draft"
                        value={dashboard.draft}
                    />

                    <DashboardCard
                        title="Submitted"
                        value={dashboard.submitted}
                    />

                    <DashboardCard
                        title="Reviewed"
                        value={dashboard.reviewed}
                    />

                    <DashboardCard
                        title="Approved"
                        value={dashboard.approved}
                    />

                    <DashboardCard
                        title="Rejected"
                        value={dashboard.rejected}
                    />

                    <DashboardCard
                        title="Returned"
                        value={dashboard.returned}
                    />

                </div>

            </section>

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Dashboard Card
|--------------------------------------------------------------------------
*/

const DashboardCard = ({ title, value }) => {
    return (
        <div className="dashboard-card">

            <div className="dashboard-card-title">
                {title}
            </div>

            <div className="dashboard-card-value">
                {value ?? 0}
            </div>

        </div>
    );
};


export default AdminDashboard;