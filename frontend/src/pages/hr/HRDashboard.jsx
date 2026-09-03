import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

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

            const response = await api.get("/evaluations");

            console.log("HR Evaluations:", response.data);

            setEvaluations(response.data.data || []);

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

    const handleEmployeeProfile = (employeeId) => {
        if (!employeeId) {
            console.error("Employee ID not found.");
            return;
        }

        navigate(
            `/management/users/${employeeId}/profile`
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
            `/management/hr/evaluations/${evaluationId}`
        );
    };

    // ==========================================================
    // View Evaluation
    // ==========================================================

    const handleView = (evaluationId) => {
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

    const handleRowClick = (evaluation) => {
        const employeeId =
            evaluation?.employee?.id;

        if (!employeeId) {
            console.error(
                "Employee ID not found in evaluation:",
                evaluation
            );

            return;
        }

        handleEmployeeProfile(employeeId);
    };

    // ==========================================================
    // Check Whether HR Can Review
    // ==========================================================

    const canReview = (status) => {
        return [
            "manager_approved",
            "hr_returned",
        ].includes(status);
    };

    // ==========================================================
    // Status Label
    // ==========================================================

    const getStatusLabel = (status) => {
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

            case "completed":
                return "Completed";

            default:
                return status || "Unknown";
        }
    };

    // ==========================================================
    // Status Badge
    // ==========================================================

    const renderStatus = (status) => {
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
                            background: "#dcfce7",
                            color: "#166534",
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
                        className="status-badge"
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
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
                        className="status-badge"
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                        }}
                    >
                        HR Rejected
                    </span>
                );

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

            default:
                return (
                    <span
                        className="status-badge"
                        style={{
                            background: "#f3f4f6",
                            color: "#374151",
                        }}
                    >
                        {getStatusLabel(status)}
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

                {/* Total */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Total Evaluations
                    </div>

                    <div className="dashboard-card-value">
                        {totalEvaluations}
                    </div>

                </div>


                {/* Waiting For HR */}

                <div className="dashboard-card">

                    <div className="dashboard-card-title">
                        Waiting for HR Review
                    </div>

                    <div className="dashboard-card-value">
                        {waitingForHR}
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

                    {evaluations.length === 0 ? (

                        <div className="data-table-empty">

                            <div className="data-table-empty-title">
                                No Evaluations Found
                            </div>

                            <div className="data-table-empty-message">
                                There are currently no employee
                                evaluations available.
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
                                        (evaluation) => {

                                            const reviewAllowed =
                                                canReview(
                                                    evaluation.status
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
                                                            evaluation
                                                                ?.employee
                                                                ?.id
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

export default HRDashboard;
