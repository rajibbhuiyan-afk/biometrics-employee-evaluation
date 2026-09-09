import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import DataTable from "../../components/DataTable";

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
    // Review / View Evaluation
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
    // DataTable Columns
    // ==========================================================

    const columns = [

        // ======================================================
        // Evaluation ID
        // ======================================================

        {
            key: "id",
            label: "Evaluation ID",

            render: (
                evaluation
            ) => (
                <strong>
                    #
                    {evaluation.id}
                </strong>
            ),
        },

        // ======================================================
        // Employee
        // ======================================================

        {
            key: "employee",
            label: "Employee",

            render: (
                evaluation
            ) =>
                evaluation
                    ?.employee
                    ?.name ||
                "Unknown",
        },

        // ======================================================
        // Employee ID
        // ======================================================

        {
            key: "employee_id",
            label: "Employee ID",

            render: (
                evaluation
            ) =>
                evaluation
                    ?.employee
                    ?.employee_id ||
                "N/A",
        },

        // ======================================================
        // Department
        // ======================================================

        {
            key: "department",
            label: "Department",

            render: (
                evaluation
            ) =>
                evaluation
                    ?.employee
                    ?.department
                    ?.name ||
                "N/A",
        },

        // ======================================================
        // Position
        // ======================================================

        {
            key: "position",
            label: "Position",

            render: (
                evaluation
            ) =>
                evaluation
                    ?.employee
                    ?.position
                    ?.title ||
                "N/A",
        },

        // ======================================================
        // Evaluation Period
        // ======================================================

        {
            key: "evaluation_period",
            label: "Evaluation Period",

            render: (
                evaluation
            ) =>
                evaluation
                    ?.evaluationPeriod
                    ?.name ||
                evaluation
                    ?.evaluation_period
                    ?.name ||
                evaluation
                    ?.evaluationPeriod
                    ?.title ||
                evaluation
                    ?.evaluation_period
                    ?.title ||
                "N/A",
        },

        // ======================================================
        // Status
        // ======================================================

        {
            key: "status",
            label: "Status",

            render: (
                evaluation
            ) =>
                renderStatus(
                    evaluation.status
                ),
        },

        // ======================================================
        // Action
        // ======================================================

        {
            key: "action",
            label: "Action",

            headerClassName:
                "data-table-actions-header",

            className:
                "data-table-actions",

            render: (
                evaluation
            ) => {

                const reviewAllowed =
                    canReview(
                        evaluation.status
                    );

                return (
                    <div className="table-actions">

                        {reviewAllowed ? (

                            <button
                                type="button"
                                className="action-button action-edit"
                                onClick={(
                                    event
                                ) => {

                                    event.stopPropagation();

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
                                    event
                                ) => {

                                    event.stopPropagation();

                                    handleReview(
                                        evaluation.id
                                    );

                                }}
                            >
                                View
                            </button>

                        )}

                    </div>
                );
            },
        },
    ];

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


                {/* ==================================================
                    Reusable DataTable
                ================================================== */}

                <DataTable
                    columns={
                        columns
                    }
                    data={
                        evaluations
                    }
                    emptyMessage="There are currently no employee evaluations available."
                    onRowClick={
                        handleRowClick
                    }
                />

            </div>

        </div>
    );
};

export default ManagementPersonalDashboard;