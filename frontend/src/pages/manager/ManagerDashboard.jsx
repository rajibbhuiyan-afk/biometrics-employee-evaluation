import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ManagerDashboard = () => {
    const navigate = useNavigate();

    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/evaluations");

            console.log("Manager Evaluations:", response.data);

            const data = response.data.data || [];

            const filtered = data.filter(
                (evaluation) =>
                    evaluation.status === "submitted" ||
                    evaluation.status === "reviewed"
            );

            setEvaluations(filtered);
        } catch (error) {
            console.error("Failed to load evaluations:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluations."
            );
        } finally {
            setLoading(false);
        }
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
                            Review employee performance evaluations.
                        </p>
                    </div>
                </div>

                <div className="data-table-container">
                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            Loading Evaluations...
                        </div>

                        <div className="data-table-empty-message">
                            Please wait while employee evaluations
                            are being loaded.
                        </div>

                    </div>
                </div>

            </div>
        );
    }

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
                        Review and manage submitted employee
                        performance evaluations.
                    </p>

                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={fetchEvaluations}
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

                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Pending Reviews
                        </div>

                        <div className="dashboard-card-value">
                            {
                                evaluations.filter(
                                    (evaluation) =>
                                        evaluation.status ===
                                        "submitted"
                                ).length
                            }
                        </div>

                    </div>


                    <div className="dashboard-card">

                        <div className="dashboard-card-title">
                            Reviewed
                        </div>

                        <div className="dashboard-card-value">
                            {
                                evaluations.filter(
                                    (evaluation) =>
                                        evaluation.status ===
                                        "reviewed"
                                ).length
                            }
                        </div>

                    </div>


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
                Evaluations
            ================================================== */}

            <div className="dashboard-section">

                <div className="page-header">

                    <div className="page-header-info">

                        <h2 className="dashboard-section-title">
                            Employee Evaluations
                        </h2>

                        <p className="page-header-description">
                            Evaluations submitted by employees
                            for manager review.
                        </p>

                    </div>

                </div>


                <div className="data-table-container">

                    {evaluations.length === 0 ? (

                        <div className="data-table-empty">

                            <div className="data-table-empty-title">
                                No Evaluations Found
                            </div>

                            <div className="data-table-empty-message">
                                There are currently no submitted
                                evaluations available for review.
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
                                        (evaluation) => (

                                            <tr
                                                key={
                                                    evaluation.id
                                                }
                                            >

                                                <td>
                                                    #{evaluation.id}
                                                </td>


                                                <td>
                                                    {
                                                        evaluation
                                                            .employee
                                                            ?.name ||
                                                        "Unknown"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        evaluation
                                                            .evaluation_period
                                                            ?.name ||
                                                        "Unknown"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={`status-badge ${
                                                            evaluation.status ===
                                                            "submitted"
                                                                ? "status-active"
                                                                : "status-completed"
                                                        }`}
                                                    >
                                                        {
                                                            evaluation.status
                                                        }
                                                    </span>

                                                </td>


                                                <td className="data-table-actions">

                                                    <div className="table-actions">

                                                        <button
                                                            type="button"
                                                            className="action-button action-edit"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/management/manager/evaluations/${evaluation.id}`
                                                                )
                                                            }
                                                        >
                                                            Review
                                                        </button>

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

export default ManagerDashboard;