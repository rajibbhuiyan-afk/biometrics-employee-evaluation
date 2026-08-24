import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

const MyEvaluations = () => {
    const navigate = useNavigate();

    // ==========================================================
    // State
    // ==========================================================

    const [evaluations, setEvaluations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================================
    // Fetch My Evaluations
    // ==========================================================

    useEffect(() => {
        fetchMyEvaluations();
    }, []);

    const fetchMyEvaluations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/evaluations"
            );

            console.log(
                "My Evaluations:",
                response.data
            );

            setEvaluations(
                response.data.data || []
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
    // Loading State
    // ==========================================================

    if (loading) {
        return (
            <div className="management-form-container">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Loading Evaluations...
                    </div>

                    <div className="data-table-empty-message">
                        Please wait while your evaluations
                        are being loaded.
                    </div>

                </div>

            </div>
        );
    }


    // ==========================================================
    // Navigate to Create Evaluation
    // ==========================================================

    const handleCreateEvaluation = () => {
        navigate(
            "/management/employee/evaluations/create"
        );
    };


    // ==========================================================
    // Navigate to Evaluation Details
    // ==========================================================

    const handleViewEvaluation = (id) => {
        navigate(
            `/management/employee/evaluations/${id}`
        );
    };


    // ==========================================================
    // Render Status Action
    // ==========================================================

    const renderAction = (evaluation) => {
        switch (evaluation.status) {

            case "draft":
                return (
                    <button
                        type="button"
                        onClick={() =>
                            handleViewEvaluation(
                                evaluation.id
                            )
                        }
                    >
                        Continue
                    </button>
                );

            case "submitted":
                return (
                    <span>
                        Submitted
                    </span>
                );

            case "reviewed":
                return (
                    <span>
                        Reviewed
                    </span>
                );

            case "approved":
                return (
                    <span>
                        Approved
                    </span>
                );

            case "rejected":
                return (
                    <button
                        type="button"
                        onClick={() =>
                            handleViewEvaluation(
                                evaluation.id
                            )
                        }
                    >
                        Edit & Resubmit
                    </button>
                );

            case "returned":
                return (
                    <button
                        type="button"
                        onClick={() =>
                            handleViewEvaluation(
                                evaluation.id
                            )
                        }
                    >
                        Edit & Resubmit
                    </button>
                );

            default:
                return (
                    <span>
                        -
                    </span>
                );
        }
    };


    // ==========================================================
    // Page
    // ==========================================================

    return (
        <div className="management-page">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        My Evaluations
                    </h1>

                    <p className="page-header-description">
                        View and manage your employee
                        self-evaluations.
                    </p>

                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={handleCreateEvaluation}
                >
                    Create New Evaluation
                </button>

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
                Evaluation Table
            ================================================== */}

            <div className="data-table-container">

                {evaluations.length === 0 ? (

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Evaluations Found
                        </div>

                        <div className="data-table-empty-message">
                            You have not created any
                            evaluations yet.
                        </div>

                    </div>

                ) : (

                    <table className="data-table">

                        <thead>

                            <tr>
                                <th>ID</th>

                                <th>
                                    Evaluation Period
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Comment
                                </th>

                                <th>
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
                                            {evaluation.id}
                                        </td>

                                        <td>
                                            {
                                                evaluation
                                                    .evaluation_period
                                                    ?.name ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {evaluation.status}
                                        </td>

                                        <td>
                                            {
                                                evaluation
                                                    .employee_comment ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {renderAction(
                                                evaluation
                                            )}
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
};

export default MyEvaluations;