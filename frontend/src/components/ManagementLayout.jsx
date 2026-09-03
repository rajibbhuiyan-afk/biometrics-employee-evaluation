import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/managementlayout.css";
import logo from "../assets/logo.png";


const ManagementLayout = () => {

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    /*
    |--------------------------------------------------------------------------
    | Current Role
    |--------------------------------------------------------------------------
    */

    const role = user?.role?.name || "";


    /*
    |--------------------------------------------------------------------------
    | Menu Items
    |--------------------------------------------------------------------------
    */

    const menuItems = [

        // ==========================================================
        // Dashboard
        // ==========================================================

        {
            label: "Dashboard",
            path: "/management",
            end: true,
            roles: [
                "Admin",
                "HR",
                "Manager",
                "Employee",
                "Management"
            ],
        },

          {
            label: "Final Evaluations",
            path: "/management/admin/reviews",
            end: true,
            roles: ["Admin", "Management"],
        },

      


        // ==========================================================
        // Admin + HR
        // ==========================================================

        {
            label: "Users",
            path: "/management/users",
            roles: [
                "Admin",
                "Management",
                "HR",
            ],
        },

        {
            label: "Departments",
            path: "/management/departments",
            roles: [
                "Admin",
                "Management",
                "HR",
            ],
        },

        {
            label: "Positions",
            path: "/management/positions",
            roles: [
                "Admin",
                "Management",
                "HR",
            ],
        },

        {
            label: "Evaluation Categories",
            path: "/management/evaluation-categories",
            roles: [
                "Admin",
                "Management",
                "HR",
            ],
        },

        {
            label: "Evaluation Questions",
            path: "/management/evaluation-questions",
            roles: [
                "Admin",
                "Management",
                "HR",
            ],
        },

        {
            label: "Evaluation Periods",
            path: "/management/evaluation-periods",
            roles: [
                "Admin",
                "Management",
                "HR",
            ],
        },

        {
            label: "Probation Periods",
            path: "/management/probation-periods",
            roles: [
                "Admin",
                "Management",
                "HR",
            ],
        },


      

        // ==========================================================
        // Employee
        // ==========================================================

        {
            label: "Create Evaluation",
            path: "/management/employee/evaluations/create",
            end: true,
            roles: ["Employee"],
        },

        {
            label: "My Evaluations",
            path: "/management/employee/evaluations",
            end: true,
            roles: ["Employee"],
        },
        {
            label: "My Profile",
            path: "/management/employee/profile",
            end: true,
            roles: ["Employee"],
        },


        // ==========================================================
        // Manager
        // ==========================================================

        {
            label: "Evaluation Reviews",
            path: "/management/manager/reviews",
            roles: [
                "Manager",                
            ],
        },

          {
            label: "Change Password",
            path: "/management/change-password",
            end: true,
            roles: [
                "Admin",
                "HR",
                "Manager",
                "Employee",
                "Management"
            ],
        },

      

    ];


    /*
    |--------------------------------------------------------------------------
    | Filter Menu By Role
    |--------------------------------------------------------------------------
    */

    const visibleMenuItems = menuItems.filter((item) =>
        item.roles.includes(role)
    );


    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const handleLogout = async () => {

        try {

            if (logout) {
                await logout();
            }

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", {
                replace: true,
            });

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Layout
    |--------------------------------------------------------------------------
    */

    return (

        <div className="management-layout">


            {/* ==========================================================
                SIDEBAR
            ========================================================== */}

            <aside className="management-sidebar">


                {/* Brand */}

                <div className="sidebar-brand">

                    <div className="brand-logo">
                        <img
                            src={logo}
                            alt="Employee Evaluation"
                        />
                    </div>

                    <div className="brand-title">
                        Employee Evaluation
                    </div>

                    <div className="brand-subtitle">
                        {role || "Management Panel"}
                    </div>

                </div>


                {/* Navigation */}

                <nav className="sidebar-navigation">

                    {visibleMenuItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>

                    ))}

                </nav>


                {/* Sidebar Footer */}

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


            {/* ==========================================================
                MAIN
            ========================================================== */}

            <div className="management-main">


                {/* Header */}

                <header className="management-header">

                    <div className="header-title">
                        Employee Evaluation System
                    </div>


                    <div className="header-user">

                        <div className="header-user-info">

                            <span className="user-name">
                                {user?.name || "User"}
                            </span>

                            <span className="user-role">
                                {role}
                            </span>

                        </div>


                        <button
                            type="button"
                            className="header-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>


                {/* Content */}

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