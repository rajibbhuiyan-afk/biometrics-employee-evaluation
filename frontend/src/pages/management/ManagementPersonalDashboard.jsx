import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

const ManagementPersonalDashboard = () => {
    const navigate = useNavigate();

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

            const response = await api.get(
                "/evaluations"
            );

            console.log(
                "Management Evaluations:",
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
    // Employee Profile
    // ==========================================================

    const handleEmployeeProfile = (
        employeeId
    ) => {
        if (!employeeId) {
            console.error(
                "Employee ID not found."
            );

            return;
        }

        navigate(
            `/management/users/${employeeId}/profile`
        );
    };

    // ==========================================================
    // Review Evaluation
    // ==========================================================

    const handleReview = (
        evaluationId
    ) => {
        if (!evaluationId) {
            return;
        }

        navigate(
            `/management/management/evaluations/${evaluationId}`
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
            console.error(
                "Employee ID not found:",
                evaluation
            );

            return;
        }

        handleEmployeeProfile(
            employeeId
        );
    };

    // ==========================================================
    // Can Management Review?
    // ==========================================================

    const canReview = (
        status
    ) => {
        return [
            "hr_approved",
            "management_returned",
            "management_rejected",
        ].includes(status);
    };

    // ==========================================================
    // Status
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
                            background: "#f3f4f6",
                            color: "#374151",
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
                            background: "#dbeafe",
                            color: "#1d4ed8",
                        }}
                    >
                        Submitted
                    </span>
                );

            case "manager_approved":
                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#fef3c7",
                            color: "#92400e",
                        }}
                    >
                        Manager Approved
                    </span>
                );

            case "manager_returned":
                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#fef3c7",
                            color: "#92400e",
                        }}
                    >
                        Manager Returned
                    </span>
                );

            case "manager_rejected":
                return (
                    <span
                        className="status-badge status-inactive"
                    >
                        Manager Rejected
                    </span>
                );

            case "hr_approved":
                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#dcfce7",
                            color: "#166534",
                        }}
                    >
                        HR Approved
                    </span>
                );

            case "hr_returned":
                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#fef3c7",
                            color: "#92400e",
                        }}
                    >
                        HR Returned
                    </span>
                );

            case "hr_rejected":
                return (
                    <span
                        className="status-badge status-inactive"
                    >
                        HR Rejected
                    </span>
                );

            case "management_returned":
                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#fef3c7",
                            color: "#92400e",
                        }}
                    >
                        Management Returned
                    </span>
                );

            case "management_rejected":
                return (
                    <span
                        className="status-badge status-inactive"
                    >
                        Management Rejected
                    </span>
                );

            case "completed":
                return (
                    <span
                        className="status-badge status-active"
                    >
                        Completed
                    </span>
                );

            default:
                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#f3f4f6",
                            color: "#374151",
                        }}
                    >
                        {status || "Unknown"}
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
                        Please wait while employee
                        evaluations are being loaded.
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Dashboard Counts
    // ==========================================================

    const totalEvaluations =
        evaluations.length;

    const pendingManagementReview =
        evaluations.filter(
            (evaluation) =>
                canReview(
                    evaluation.status
                )
        ).length;

    const completedEvaluations =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                "completed"
        ).length;

    const hrApproved =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                "hr_approved"
        ).length;

    // ==========================================================
    // Dashboard
    // ==========================================================

    return (
        <div className="management-page">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Management Dashboard
                    </h1>

                    <p className="page-header-description">
                        Review and manage employee
                        self-evaluations.
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
                Dashboard Cards
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

                {/* Pending Management Review */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Pending Review
                    </div>

                    <div className="dashboard-card-value">
                        {pendingManagementReview}
                    </div>

                </div>

                {/* HR Approved */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        HR Approved
                    </div>

                    <div className="dashboard-card-value">
                        {hrApproved}
                    </div>

                </div>

                {/* Completed */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Completed
                    </div>

                    <div className="dashboard-card-value">
                        {completedEvaluations}
                    </div>

                </div>

            </div>

            {/* ==================================================
                Evaluation List
            ================================================== */}

            <div className="dashboard-section">

                <h2 className="dashboard-section-title">
                    Employee Evaluations
                </h2>

                <div className="data-table-container">

                    {evaluations.length === 0 ? (

                        <div className="data-table-empty">

                            <div className="data-table-empty-title">
                                No Evaluations Found
                            </div>

                            <div className="data-table-empty-message">
                                There are currently no
                                employee evaluations
                                available.
                            </div>

                        </div>

                    ) : (

                        <div className="data-table-wrapper">

                            <table className="data-table">

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
                                            Position
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

                                <tbody>

                                    {evaluations.map(
                                        (
                                            evaluation
                                        ) => (

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
                                                        evaluation
                                                            ?.employee
                                                            ?.id
                                                            ? "pointer"
                                                            : "default",
                                                }}
                                            >

                                                {/* Evaluation ID */}

                                                <td>

                                                    <strong>
                                                        #
                                                        {
                                                            evaluation.id
                                                        }
                                                    </strong>

                                                </td>

                                                {/* Employee */}

                                                <td>

                                                    {
                                                        evaluation
                                                            ?.employee
                                                            ?.name ||
                                                        "Unknown"
                                                    }

                                                </td>

                                                {/* Employee ID */}

                                                <td>

                                                    {
                                                        evaluation
                                                            ?.employee
                                                            ?.employee_id ||
                                                        "N/A"
                                                    }

                                                </td>

                                                {/* Department */}

                                                <td>

                                                    {
                                                        evaluation
                                                            ?.employee
                                                            ?.department
                                                            ?.name ||
                                                        "N/A"
                                                    }

                                                </td>

                                                {/* Position */}

                                                <td>

                                                    {
                                                        evaluation
                                                            ?.employee
                                                            ?.position
                                                            ?.name ||
                                                        "N/A"
                                                    }

                                                </td>

                                                {/* Evaluation Period */}

                                                <td>

                                                    {
                                                        evaluation
                                                            ?.evaluation_period
                                                            ?.name ||
                                                        evaluation
                                                            ?.evaluationPeriod
                                                            ?.name ||
                                                        evaluation
                                                            ?.evaluation_period
                                                            ?.title ||
                                                        evaluation
                                                            ?.evaluationPeriod
                                                            ?.title ||
                                                        "N/A"
                                                    }

                                                </td>

                                                {/* Status */}

                                                <td>

                                                    {renderStatus(
                                                        evaluation.status
                                                    )}

                                                </td>

                                                {/* Action */}

                                                <td className="data-table-actions">

                                                    <div className="table-actions">

                                                        {canReview(
                                                            evaluation.status
                                                        ) ? (

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
                                                                className="action-button action-view"
                                                                onClick={(
                                                                    e
                                                                ) => {

                                                                    e.stopPropagation();

                                                                    handleReview(
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

                                        )
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

export default ManagementPersonalDashboard;