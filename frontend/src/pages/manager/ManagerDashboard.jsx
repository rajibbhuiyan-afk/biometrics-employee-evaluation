import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import DataTable from "../../components/DataTable";

const ManagerDashboard = () => {
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

            const response =
                await api.get("/evaluations");

            console.log(
                "Manager Evaluations:",
                response.data
            );

            // IMPORTANT:
            // Do NOT filter evaluations here.
            // Backend returns:
            // - Manager's own evaluation
            // - Evaluations of employees directly
            //   assigned to this manager
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

            case "manager_returned":
                return "Returned by Manager";

            case "manager_rejected":
                return "Rejected by Manager";

            case "manager_approved":
                return "Manager Approved";

            case "hr_returned":
                return "Returned by HR";

            case "hr_rejected":
                return "Rejected by HR";

            case "hr_approved":
                return "HR Approved";

            case "management_returned":
                return "Returned by Management";

            case "management_rejected":
                return "Rejected by Management";

            case "completed":
                return "Completed";

            default:
                return status || "-";
        }
    };

    // ==========================================================
    // Status Class
    // ==========================================================

    const getStatusClass = (
        status
    ) => {
        switch (status) {

            case "submitted":
                return "status-active";

            case "manager_approved":
            case "hr_approved":
            case "completed":
                return "status-completed";

            case "manager_rejected":
            case "hr_rejected":
            case "management_rejected":
                return "status-inactive";

            case "manager_returned":
            case "hr_returned":
            case "management_returned":
            case "draft":
                return "status-extended";

            default:
                return "status-extended";
        }
    };

    // ==========================================================
    // Can Manager Review?
    // ==========================================================

    const canManagerReview = (
        status
    ) => {
        return (
            status === "submitted" ||
            status === "manager_returned" ||
            status === "manager_rejected"
        );
    };

    // ==========================================================
    // Evaluation Action
    // ==========================================================

    const handleEvaluationAction = (
        evaluation
    ) => {
        if (!evaluation?.id) {
            return;
        }

        navigate(
            `/management/manager/evaluations/${evaluation.id}`
        );
    };

    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {
        return (
            <div className="management-page">

                <div className="page-header">

                    <div className="page-header-info">

                        <h1 className="page-header-title">
                            Manager Dashboard
                        </h1>

                        <p className="page-header-description">
                            Review and view employee
                            performance evaluations.
                        </p>

                    </div>

                </div>

                <div className="data-table-container">

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

            </div>
        );
    }

    // ==========================================================
    // Summary Counts
    // ==========================================================

    const pendingReviews =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                "submitted"
        ).length;

    const reviewed =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                "manager_approved"
        ).length;

    const returnedOrRejected =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                    "manager_returned" ||
                evaluation.status ===
                    "manager_rejected"
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
                "Unknown",
        },

        // ======================================================
        // Status
        // ======================================================

        {
            key: "status",
            label: "Status",

            render: (
                evaluation
            ) => (
                <span
                    className={`status-badge ${getStatusClass(
                        evaluation.status
                    )}`}
                >
                    {getStatusLabel(
                        evaluation.status
                    )}
                </span>
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
                    canManagerReview(
                        evaluation.status
                    );

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className={
                                reviewAllowed
                                    ? "action-button action-edit"
                                    : "action-button action-view"
                            }
                            onClick={(
                                event
                            ) => {

                                event.stopPropagation();

                                handleEvaluationAction(
                                    evaluation
                                );

                            }}
                        >
                            {reviewAllowed
                                ? "Review"
                                : "View"}
                        </button>

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
                Page Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Manager Dashboard
                    </h1>

                    <p className="page-header-description">
                        Review and view employee
                        performance evaluations.
                    </p>

                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={fetchEvaluations}
                    disabled={loading}
                >
                    Refresh
                </button>

            </div>


            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                Summary
            ================================================== */}

            <div className="dashboard-section">

                <h2 className="dashboard-section-title">
                    Evaluation Overview
                </h2>

                <div className="dashboard-card-grid">

                    {/* Pending */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Pending Reviews
                        </div>

                        <div className="dashboard-card-value">
                            {pendingReviews}
                        </div>

                    </div>


                    {/* Approved */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Manager Approved
                        </div>

                        <div className="dashboard-card-value">
                            {reviewed}
                        </div>

                    </div>


                    {/* Returned / Rejected */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Returned / Rejected
                        </div>

                        <div className="dashboard-card-value">
                            {returnedOrRejected}
                        </div>

                    </div>


                    {/* Total */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Total Evaluations
                        </div>

                        <div className="dashboard-card-value">
                            {evaluations.length}
                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                All Evaluations
            ================================================== */}

            <div className="dashboard-section">

                <div className="page-header">

                    <div className="page-header-info">

                        <h2 className="dashboard-section-title">
                            Employee Evaluations
                        </h2>

                        <p className="page-header-description">
                            All evaluations submitted by
                            employees assigned to you.
                        </p>

                    </div>

                </div>


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
                />

            </div>

        </div>
    );
};

export default ManagerDashboard;