import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/managementlayout.css";

const ManagementLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            label: "Dashboard",
            path: "/management",
            end: true,
        },
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

    const handleLogout = () => {
        /*
         * Temporary logout handler.
         *
         * Once we check your AuthContext.jsx,
         * we can connect this with your actual logout function.
         */

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="management-layout">

            {/* =========================
                Sidebar
            ========================== */}

            <aside className="management-sidebar">

                {/* Logo / Brand */}

                <div className="sidebar-brand">
                    <div className="brand-title">
                        Employee Evaluation
                    </div>

                    <div className="brand-subtitle">
                        Management Panel
                    </div>
                </div>


                {/* Navigation */}

                <nav className="sidebar-navigation">

                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}

                </nav>


                {/* Sidebar Bottom */}

                <div className="sidebar-footer">

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                Main Area
            ========================== */}

            <div className="management-main">

                {/* Top Header */}

                <header className="management-header">

                    <div className="header-title">
                        Employee Evaluation System
                    </div>

                    <div className="header-user">

                        <span className="user-name">
                            Management
                        </span>

                        <button
                            type="button"
                            className="header-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>


                {/* Page Content */}

                <main className="management-content">

                    <div className="management-content-card">
                        <Outlet />
                    </div>

                </main>

            </div>

        </div>
    );
};

export default ManagementLayout;