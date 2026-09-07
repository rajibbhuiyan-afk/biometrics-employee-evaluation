import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import api from "../../api/axios";

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // ==========================================================
    // State
    // ==========================================================

    const [evaluations, setEvaluations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================================
    // Fetch Evaluations
    // ==========================================================

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/evaluations");

            console.log(
                "Employee Dashboard Evaluations:",
                response.data
            );

            setEvaluations(
                response.data?.data || []
            );

        } catch (error) {
            console.error(
                "Failed to load evaluations:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load evaluations."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // View Evaluation
    // ==========================================================

    const handleView = (evaluationId) => {
        if (!evaluationId) {
            return;
        }

        navigate(
            `/management/employee/evaluations/${evaluationId}`
        );
    };

    // ==========================================================
    // Review Evaluation
    // ==========================================================

    const handleReview = (evaluationId) => {
        if (!evaluationId) {
            return;
        }

        navigate(
            `/management/employee/evaluations/${evaluationId}/review`
        );
    };

    // ==========================================================
    // View Employee Profile
    // ==========================================================

    const handleEmployeeProfile = (
        employeeId
    ) => {
        if (!employeeId) {
            return;
        }

        navigate(
            `/management/users/${employeeId}/profile`
        );
    };

    // ==========================================================
    // Row Click
    // ==========================================================

    const handleRowClick = (
        evaluation
    ) => {
        const employeeId =
            evaluation?.employee?.id;

        if (!employeeId) {
            return;
        }

        handleEmployeeProfile(
            employeeId
        );
    };

    // ==========================================================
    // Check Whether Employee Can Review
    // ==========================================================
    //
    // Employee -> Employee
    //
    // If another employee's evaluation is submitted,
    // Employee reviewer can review it.
    //
    // Backend will verify actual reviewer ownership.
    // ==========================================================

    const canReview = (
        evaluation
    ) => {

        if (!evaluation) {
            return false;
        }

        const status =
            evaluation.status;

        const employeeId =
            evaluation?.employee?.id;

        // Current user's own evaluation
        // should not show Review.
        if (
            user?.id &&
            employeeId &&
            Number(user.id) ===
                Number(employeeId)
        ) {
            return false;
        }

        return (
            status ===
            "submitted"
        );
    };

    // ==========================================================
    // Status Label
    // ==========================================================

    const getStatusLabel = (
        status
    ) => {

        switch (status) {

            case "draft":
                return "Draft";

            case "submitted":
                return "Submitted";

            case "employee_approved":
                return "Employee Approved";

            case "employee_rejected":
                return "Employee Rejected";

            case "manager_approved":
                return "Manager Approved";

            case "manager_rejected":
                return "Manager Rejected";

            case "hr_approved":
                return "HR Approved";

            case "hr_rejected":
                return "HR Rejected";

            case "management_rejected":
                return "Management Rejected";

            case "completed":
                return "Completed";

            default:
                return status ||
                    "Unknown";
        }
    };

    // ==========================================================
    // Status Badge
    // ==========================================================

    const renderStatus = (
        status
    ) => {

        switch (status) {

            case "draft":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#f3f4f6",
                            color:
                                "#374151",
                        }}
                    >
                        Draft
                    </span>
                );

            case "submitted":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#dbeafe",
                            color:
                                "#1d4ed8",
                        }}
                    >
                        Submitted
                    </span>
                );

            case "employee_approved":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#dcfce7",
                            color:
                                "#166534",
                        }}
                    >
                        Employee Approved
                    </span>
                );

            case "employee_rejected":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#fee2e2",
                            color:
                                "#991b1b",
                        }}
                    >
                        Employee Rejected
                    </span>
                );

            case "manager_approved":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#dcfce7",
                            color:
                                "#166534",
                        }}
                    >
                        Manager Approved
                    </span>
                );

            case "manager_rejected":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#fee2e2",
                            color:
                                "#991b1b",
                        }}
                    >
                        Manager Rejected
                    </span>
                );

            case "hr_approved":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#dcfce7",
                            color:
                                "#166534",
                        }}
                    >
                        HR Approved
                    </span>
                );

            case "hr_rejected":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#fee2e2",
                            color:
                                "#991b1b",
                        }}
                    >
                        HR Rejected
                    </span>
                );

            case "management_rejected":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#fee2e2",
                            color:
                                "#991b1b",
                        }}
                    >
                        Management Rejected
                    </span>
                );

            case "completed":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#dcfce7",
                            color:
                                "#166534",
                        }}
                    >
                        Completed
                    </span>
                );

            default:

                return (
                    <span
                        className="status-badge"
                        style={{
                            background:
                                "#f3f4f6",
                            color:
                                "#374151",
                        }}
                    >
                        {getStatusLabel(
                            status
                        )}
                    </span>
                );
        }
    };

    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (
            <div className="management-page">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Loading Evaluations...
                    </div>

                    <div className="data-table-empty-message">
                        Please wait while evaluations
                        are being loaded.
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Summary Counts
    // ==========================================================

    const totalEvaluations =
        evaluations.length;

    const myEvaluations =
        evaluations.filter(
            (evaluation) =>
                Number(
                    evaluation?.employee?.id
                ) ===
                Number(user?.id)
        ).length;

    const waitingForMyReview =
        evaluations.filter(
            (evaluation) =>
                canReview(
                    evaluation
                )
        ).length;

    const completed =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                "completed"
        ).length;

    // ==========================================================
    // Page
    // ==========================================================

    return (
        <div className="management-page">

            {/* ==================================================
                Page Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Employee Dashboard
                    </h1>

                    <p className="page-header-description">
                        Welcome back,{" "}
                        {user?.name ||
                            "Employee"}
                        . Manage your evaluations
                        and review assigned employee
                        evaluations from here.
                    </p>

                </div>

            </div>


            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                Employee Information
            ================================================== */}

            <div className="dashboard-section">

                <h2 className="dashboard-section-title">
                    My Information
                </h2>

                <div className="dashboard-card-grid">

                    {/* Name */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Name
                        </div>

                        <div className="dashboard-card-info">
                            {user?.name ||
                                "N/A"}
                        </div>

                    </div>


                    {/* Email */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Email
                        </div>

                        <div className="dashboard-card-info">
                            {user?.email ||
                                "N/A"}
                        </div>

                    </div>


                    {/* Role */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Role
                        </div>

                        <div className="dashboard-card-info">
                            {user?.role?.name ||
                                "Employee"}
                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Summary Cards
            ================================================== */}

            <div className="dashboard-card-grid">

                {/* Total */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Total Evaluations
                    </div>

                    <div className="dashboard-card-value">
                        {totalEvaluations}
                    </div>

                </div>


                {/* My Evaluations */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        My Evaluations
                    </div>

                    <div className="dashboard-card-value">
                        {myEvaluations}
                    </div>

                </div>


                {/* Waiting For Review */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Waiting for My Review
                    </div>

                    <div className="dashboard-card-value">
                        {waitingForMyReview}
                    </div>

                </div>


                {/* Completed */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Completed
                    </div>

                    <div className="dashboard-card-value">
                        {completed}
                    </div>

                </div>

            </div>


            {/* ==================================================
                Evaluation Section
            ================================================== */}

            <div className="dashboard-section">

                <h2 className="dashboard-section-title">
                    Employee Evaluations
                </h2>


                {/* ==================================================
                    Table Container
                ================================================== */}

                <div className="data-table-container">

                    {evaluations.length ===
                    0 ? (

                        <div className="data-table-empty">

                            <div className="data-table-empty-title">
                                No Evaluations Found
                            </div>

                            <div className="data-table-empty-message">
                                There are currently
                                no evaluations
                                available.
                            </div>

                        </div>

                    ) : (

                        <div className="data-table-wrapper">

                            <table className="data-table">

                                {/* ==================================================
                                    Table Header
                                ================================================== */}

                                <thead>

                                    <tr>

                                        <th>
                                            Evaluation ID
                                        </th>

                                        <th>
                                            Employee
                                        </th>

                                        <th>
                                            Employee ID
                                        </th>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Evaluation Period
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th className="data-table-actions-header">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                {/* ==================================================
                                    Table Body
                                ================================================== */}

                                <tbody>

                                    {evaluations.map(
                                        (
                                            evaluation
                                        ) => {

                                            const reviewAllowed =
                                                canReview(
                                                    evaluation
                                                );

                                            const employeeId =
                                                evaluation
                                                    ?.employee
                                                    ?.id;

                                            const isOwnEvaluation =
                                                Number(
                                                    employeeId
                                                ) ===
                                                Number(
                                                    user?.id
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        evaluation.id
                                                    }
                                                    onClick={() =>
                                                        handleRowClick(
                                                            evaluation
                                                        )
                                                    }
                                                    style={{
                                                        cursor:
                                                            employeeId
                                                                ? "pointer"
                                                                : "default",
                                                    }}
                                                >

                                                    {/* ==================================================
                                                        Evaluation ID
                                                    ================================================== */}

                                                    <td>

                                                        <strong>
                                                            #
                                                            {
                                                                evaluation.id
                                                            }
                                                        </strong>

                                                    </td>


                                                    {/* ==================================================
                                                        Employee
                                                    ================================================== */}

                                                    <td>

                                                        {
                                                            evaluation
                                                                ?.employee
                                                                ?.name ||
                                                            "Unknown"
                                                        }

                                                        {isOwnEvaluation && (
                                                            <span
                                                                style={{
                                                                    marginLeft:
                                                                        "8px",
                                                                    fontSize:
                                                                        "12px",
                                                                    color:
                                                                        "#6b7280",
                                                                }}
                                                            >
                                                                (You)
                                                            </span>
                                                        )}

                                                    </td>


                                                    {/* ==================================================
                                                        Employee ID
                                                    ================================================== */}

                                                    <td>

                                                        {
                                                            evaluation
                                                                ?.employee
                                                                ?.employee_id ||
                                                            "N/A"
                                                        }

                                                    </td>


                                                    {/* ==================================================
                                                        Department
                                                    ================================================== */}

                                                    <td>

                                                        {
                                                            evaluation
                                                                ?.employee
                                                                ?.department
                                                                ?.name ||
                                                            "N/A"
                                                        }

                                                    </td>


                                                    {/* ==================================================
                                                        Evaluation Period
                                                    ================================================== */}

                                                    <td>

                                                        {
                                                            evaluation
                                                                ?.evaluation_period
                                                                ?.name ||
                                                            "N/A"
                                                        }

                                                    </td>


                                                    {/* ==================================================
                                                        Status
                                                    ================================================== */}

                                                    <td>

                                                        {renderStatus(
                                                            evaluation.status
                                                        )}

                                                    </td>


                                                    {/* ==================================================
                                                        Action
                                                    ================================================== */}

                                                    <td className="data-table-actions">

                                                        <div className="table-actions">

                                                            {reviewAllowed ? (

                                                                <button
                                                                    type="button"
                                                                    className="action-button action-edit"
                                                                    onClick={(
                                                                        e
                                                                    ) => {

                                                                        e.stopPropagation();

                                                                        handleReview(
                                                                            evaluation.id
                                                                        );

                                                                    }}
                                                                >
                                                                    Review
                                                                </button>

                                                            ) : (

                                                                <button
                                                                    type="button"
                                                                    className="action-button"
                                                                    onClick={(
                                                                        e
                                                                    ) => {

                                                                        e.stopPropagation();

                                                                        handleView(
                                                                            evaluation.id
                                                                        );

                                                                    }}
                                                                >
                                                                    View
                                                                </button>

                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default EmployeeDashboard;