import { useNavigate } from "react-router-dom";

const ManagementDashboard = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: "User Management",
            description: "Create, view, edit and manage users.",
            path: "/management/users",
        },
        {
            title: "Department Management",
            description: "Manage company departments.",
            path: "/management/departments",
        },
        {
            title: "Position Management",
            description: "Manage employee positions.",
            path: "/management/positions",
        },
        {
            title: "Evaluation Periods",
            description: "Create and manage evaluation periods.",
            path: "/management/evaluation-periods",
        },
        {
            title: "Evaluation Categories",
            description: "Manage evaluation categories.",
            path: "/management/evaluation-categories",
        },
        {
            title: "Evaluation Questions",
            description: "Create and manage evaluation questions.",
            path: "/management/evaluation-questions",
        },
        {
            title: "Probation Period",
            description: "Create and manage employee probation periods.",
            path: "/management/probation-periods",
        },
    ];

    return (
        <div
            style={{
                // maxWidth: "1200px",
                // margin: "30px auto",
                // padding: "20px",
            }}
        >
            <h1>Management</h1>

            <p>
                Manage users, departments, positions and evaluation settings.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                    marginTop: "30px",
                }}
            >
                {menuItems.map((item) => (
                    <div
                        key={item.path}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "25px",
                            backgroundColor: "#fff",
                        }}
                    >
                        <h2>{item.title}</h2>

                        <p>{item.description}</p>

                        <button
                            onClick={() => navigate(item.path)}
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