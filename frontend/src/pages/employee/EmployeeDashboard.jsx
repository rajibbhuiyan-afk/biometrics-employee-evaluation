import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const menuItems = [
        {
            title: "Create Evaluation",
            description:
                "Start a new employee self-evaluation for an active evaluation period.",
            path: "/employee/evaluations/create",
            button: "Create Evaluation",
        },
        {
            title: "My Evaluations",
            description:
                "View your existing evaluations and check their current status.",
            path: "/employee/evaluations",
            button: "View Evaluations",
        },
    ];

    return (
        <div className="management-page">

            {/* Page Header */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Employee Dashboard
                    </h1>

                    <p className="page-header-description">
                        Welcome back, {user?.name || "Employee"}.
                        Manage your evaluations from here.
                    </p>

                </div>

            </div>


            {/* Employee Information */}

            <div className="dashboard-section">

                <h2 className="dashboard-section-title">
                    My Information
                </h2>

                <div className="dashboard-card-grid">

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Name
                        </div>

                        <div className="dashboard-card-info">
                            {user?.name || "N/A"}
                        </div>

                    </div>


                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Email
                        </div>

                        <div className="dashboard-card-info">
                            {user?.email || "N/A"}
                        </div>

                    </div>


                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Role
                        </div>

                        <div className="dashboard-card-info">
                            {user?.role?.name || "Employee"}
                        </div>

                    </div>

                </div>

            </div>


           

            

        </div>
    );
};

export default EmployeeDashboard;