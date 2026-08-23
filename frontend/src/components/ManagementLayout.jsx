import { NavLink, Outlet, useNavigate } from "react-router-dom";

const ManagementLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            label: "Users",
            path: "/management/users",
        },
        {
            label: "Departments",
            path: "/management/departments",
        },
        {
            label: "Positions",
            path: "/management/positions",
        },
        {
            label: "Evaluation Categories",
            path: "/management/evaluation-categories",
        },
        {
            label: "Evaluation Questions",
            path: "/management/evaluation-questions",
        },
        {
            label: "Evaluation Periods",
            path: "/management/evaluation-periods",
        },
        {
            label: "Probation Periods",
            path: "/management/probation-periods",
        },
    ];

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#f5f6f8",
            }}
        >
            {/* Sidebar */}

            <aside
                style={{
                    width: "240px",
                    backgroundColor: "#1f2937",
                    color: "#fff",
                    padding: "20px",
                    boxSizing: "border-box",
                }}
            >
                <h2
                    style={{
                        marginBottom: "30px",
                        fontSize: "20px",
                    }}
                >
                    Management
                </h2>

                <nav>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: "block",
                                padding: "12px 14px",
                                marginBottom: "6px",
                                borderRadius: "6px",
                                textDecoration: "none",
                                color: "#fff",
                                backgroundColor: isActive
                                    ? "#374151"
                                    : "transparent",
                            })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={() => navigate("/management")}
                    style={{
                        marginTop: "25px",
                        width: "100%",
                        padding: "10px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Management Home
                </button>
            </aside>

            {/* Main Content */}

            <main
                style={{
                    flex: 1,
                    padding: "30px",
                    boxSizing: "border-box",
                }}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default ManagementLayout;