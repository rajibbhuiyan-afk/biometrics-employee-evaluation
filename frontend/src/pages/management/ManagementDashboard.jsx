import { useNavigate } from "react-router-dom";

const ManagementDashboard = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: "User Management",
            description:
                "Create, view, edit and manage users.",
            path: "/management/users",
        },
        {
            title: "Department Management",
            description:
                "Manage company departments.",
            path: "/management/departments",
        },
        {
            title: "Position Management",
            description:
                "Manage employee positions.",
            path: "/management/positions",
        },
        {
            title: "Evaluation Periods",
            description:
                "Create and manage evaluation periods.",
            path: "/management/evaluation-periods",
        },
        {
            title: "Evaluation Categories",
            description:
                "Manage evaluation categories.",
            path: "/management/evaluation-categories",
        },
        {
            title: "Evaluation Questions",
            description:
                "Create and manage evaluation questions.",
            path: "/management/evaluation-questions",
        },
        {
            title: "Probation Period",
            description:
                "Create and manage employee probation periods.",
            path: "/management/probation-periods",
        },
    ];

    return (
        <div className="management-page">

            {/* Page Header */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Management
                    </h1>

                    <p className="page-header-description">
                        Manage users, departments,
                        positions and evaluation
                        settings.
                    </p>

                </div>

            </div>


            {/* Management Cards */}

            <div className="management-dashboard-grid">

                {menuItems.map((item) => (

                    <div
                        key={item.path}
                        className="management-dashboard-card"
                    >

                        <h2 className="management-dashboard-card-title">
                            {item.title}
                        </h2>

                        <p className="management-dashboard-card-description">
                            {item.description}
                        </p>

                        <button
                            type="button"
                            className="page-header-button"
                            onClick={() =>
                                navigate(item.path)
                            }
                        >
                            Manage
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );
};

export default ManagementDashboard;