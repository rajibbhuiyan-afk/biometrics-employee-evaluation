import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import DataTable from "../../components/DataTable";

const HRDashboard = () => {

    const navigate = useNavigate();


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

            const response = await api.get(
                "/evaluations"
            );

            console.log(
                "HR Evaluations:",
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
    // View Employee Profile
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
            `/management/hr/evaluations/${evaluationId}`
        );
    };


    // ==========================================================
    // View Evaluation
    // ==========================================================

    const handleView = (
        evaluationId
    ) => {

        if (!evaluationId) {
            return;
        }

        navigate(
            `/management/hr/evaluations/${evaluationId}`
        );
    };


    // ==========================================================
    // Handle Row Click
    // ==========================================================

    const handleRowClick = (
        evaluation
    ) => {

        const employeeId =
            evaluation?.employee?.id;

        if (!employeeId) {

            console.error(
                "Employee ID not found in evaluation:",
                evaluation
            );

            return;
        }

        handleEmployeeProfile(
            employeeId
        );
    };


    // ==========================================================
    // Check Whether HR Can Review
    // ==========================================================

    const canReview = (
        status
    ) => {

        return [
            "manager_approved",
            "hr_returned",
        ].includes(status);
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

            case "manager_approved":
                return "Manager Approved";

            case "manager_returned":
                return "Manager Returned";

            case "manager_rejected":
                return "Manager Rejected";

            case "hr_approved":
                return "HR Approved";

            case "hr_returned":
                return "HR Returned";

            case "hr_rejected":
                return "HR Rejected";

            case "management_approved":
                return "Management Approved";

            case "management_returned":
                return "Management Returned";

            case "management_rejected":
                return "Management Rejected";

            case "completed":
                return "Completed";

            default:
                return status || "Unknown";
        }
    };


    // ==========================================================
    // Status Badge
    // ==========================================================

    const renderStatus = (
        status
    ) => {

        switch (status) {

            // ==================================================
            // Draft
            // ==================================================

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


            // ==================================================
            // Submitted
            // ==================================================

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


            // ==================================================
            // Manager Approved
            // ==================================================

            case "manager_approved":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#dcfce7",
                            color: "#166534",
                        }}
                    >
                        Manager Approved
                    </span>
                );


            // ==================================================
            // Manager Returned
            // ==================================================

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


            // ==================================================
            // Manager Rejected
            // ==================================================

            case "manager_rejected":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                        }}
                    >
                        Manager Rejected
                    </span>
                );


            // ==================================================
            // HR Approved
            // ==================================================

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


            // ==================================================
            // HR Returned
            // ==================================================

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


            // ==================================================
            // HR Rejected
            // ==================================================

            case "hr_rejected":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                        }}
                    >
                        HR Rejected
                    </span>
                );


            // ==================================================
            // Management Approved
            // ==================================================

            case "management_approved":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#dcfce7",
                            color: "#166534",
                        }}
                    >
                        Management Approved
                    </span>
                );


            // ==================================================
            // Management Returned
            // ==================================================

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


            // ==================================================
            // Management Rejected
            // ==================================================

            case "management_rejected":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                        }}
                    >
                        Management Rejected
                    </span>
                );


            // ==================================================
            // Completed
            // ==================================================

            case "completed":

                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#dcfce7",
                            color: "#166534",
                        }}
                    >
                        Completed
                    </span>
                );


            // ==================================================
            // Default
            // ==================================================

            default:

                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#f3f4f6",
                            color: "#374151",
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
    // DataTable Columns
    // ==========================================================

    const columns = [

        // ======================================================
        // Evaluation ID
        // ======================================================

        {
            key: "id",
            label: "Evaluation ID",

            render: (evaluation) => (
                <strong>
                    #{evaluation.id}
                </strong>
            ),
        },


        // ======================================================
        // Employee
        // ======================================================

        {
            key: "employee",
            label: "Employee",

            render: (evaluation) =>
                evaluation?.employee?.name ||
                "Unknown",
        },


        // ======================================================
        // Employee ID
        // ======================================================

        {
            key: "employee_id",
            label: "Employee ID",

            render: (evaluation) =>
                evaluation?.employee?.employee_id ||
                "N/A",
        },


        // ======================================================
        // Department
        // ======================================================

        {
            key: "department",
            label: "Department",

            render: (evaluation) =>
                evaluation
                    ?.employee
                    ?.department
                    ?.name ||
                "N/A",
        },


        // ======================================================
        // Evaluation Period
        // ======================================================

        {
            key: "evaluation_period",
            label: "Evaluation Period",

            render: (evaluation) =>
                evaluation
                    ?.evaluationPeriod
                    ?.name ||

                evaluation
                    ?.evaluation_period
                    ?.name ||

                "N/A",
        },


        // ======================================================
        // Status
        // ======================================================

        {
            key: "status",
            label: "Status",

            render: (evaluation) =>
                renderStatus(
                    evaluation.status
                ),
        },


        // ======================================================
        // Action
        // ======================================================

        {
            key: "actions",
            label: "Action",

            render: (evaluation) => {

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
                                onClick={(event) => {

                                    /*
                                    Prevent DataTable
                                    row click
                                    */

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
                                onClick={(event) => {

                                    /*
                                    Prevent DataTable
                                    row click
                                    */

                                    event.stopPropagation();

                                    handleView(
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
    // Summary Counts
    // ==========================================================

    const totalEvaluations =
        evaluations.length;


    const waitingForHR =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                "manager_approved"
        ).length;


    const hrApproved =
        evaluations.filter(
            (evaluation) =>
                evaluation.status ===
                "hr_approved"
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
                        HR Dashboard
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
                Summary Cards
            ================================================== */}

            <div className="dashboard-card-grid">

                {/* ==================================================
                    Total Evaluations
                ================================================== */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Total Evaluations
                    </div>

                    <div className="dashboard-card-value">
                        {totalEvaluations}
                    </div>

                </div>


                {/* ==================================================
                    Waiting For HR
                ================================================== */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Waiting for HR Review
                    </div>

                    <div className="dashboard-card-value">
                        {waitingForHR}
                    </div>

                </div>


                {/* ==================================================
                    HR Approved
                ================================================== */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        HR Approved
                    </div>

                    <div className="dashboard-card-value">
                        {hrApproved}
                    </div>

                </div>


                {/* ==================================================
                    Completed
                ================================================== */}

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
                    DataTable
                ================================================== */}

                <DataTable
                    columns={columns}
                    data={evaluations}
                    emptyMessage="There are currently no employee evaluations available."
                    onRowClick={handleRowClick}
                />

            </div>

        </div>
    );
};


export default HRDashboard;