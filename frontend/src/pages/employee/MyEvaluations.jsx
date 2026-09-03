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
    // Loading
    // ==========================================================

    if (loading) {

        return (
            <div className="management-page">

                <div className="data-table-container">

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

            </div>
        );
    }


    // ==========================================================
    // Create Evaluation
    // ==========================================================

    const handleCreateEvaluation = () => {

        navigate(
            "/management/employee/evaluations/create"
        );
    };


    // ==========================================================
    // View / Continue Evaluation
    // ==========================================================

    const handleViewEvaluation = (id) => {

        navigate(
            `/management/employee/evaluations/${id}`
        );
    };


    // ==========================================================
    // Status Badge
    // ==========================================================

    const renderStatus = (status) => {

        switch (status) {

            // ==================================================
            // DRAFT
            // ==================================================

            case "draft":

                return (
                    <span className="status-badge status-draft">
                        Draft
                    </span>
                );


            // ==================================================
            // SUBMITTED
            // ==================================================

            case "submitted":

                return (
                    <span className="status-badge status-submitted">
                        Submitted
                    </span>
                );


            // ==================================================
            // MANAGER RETURNED
            // ==================================================

            case "manager_returned":

                return (
                    <span className="status-badge status-returned">
                        Returned by Manager
                    </span>
                );


            // ==================================================
            // MANAGER REJECTED
            // ==================================================

            case "manager_rejected":

                return (
                    <span className="status-badge status-rejected">
                        Rejected by Manager
                    </span>
                );


            // ==================================================
            // MANAGER APPROVED
            // ==================================================

            case "manager_approved":

                return (
                    <span className="status-badge status-approved">
                        Manager Approved
                    </span>
                );


            // ==================================================
            // ADMIN RETURNED
            // ==================================================

            case "admin_returned":

                return (
                    <span className="status-badge status-returned">
                        Returned by Admin
                    </span>
                );


            // ==================================================
            // ADMIN REJECTED
            // ==================================================

            case "admin_rejected":

                return (
                    <span className="status-badge status-rejected">
                        Rejected by Admin
                    </span>
                );


            // ==================================================
            // ADMIN APPROVED
            // ==================================================

            case "admin_approved":

                return (
                    <span className="status-badge status-approved">
                        Final Approved
                    </span>
                );


            // ==================================================
            // DEFAULT
            // ==================================================

            default:

                return (
                    <span className="status-badge status-inactive">
                        {status || "-"}
                    </span>
                );
        }
    };


    // ==========================================================
    // Action Button
    // ==========================================================

    const renderAction = (evaluation) => {

        switch (evaluation.status) {

            // ==================================================
            // DRAFT
            //
            // Employee can continue editing.
            // ==================================================

            case "draft":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-continue
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            Continue
                        </button>

                    </div>
                );


            // ==================================================
            // SUBMITTED
            //
            // Employee can ONLY view.
            // ==================================================

            case "submitted":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );


            // ==================================================
            // MANAGER RETURNED
            //
            // Read-only.
            // No Edit & Resubmit.
            // ==================================================

            case "manager_returned":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );


            // ==================================================
            // MANAGER REJECTED
            //
            // Read-only.
            // No Edit & Resubmit.
            // ==================================================

            case "manager_rejected":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );


            // ==================================================
            // MANAGER APPROVED
            //
            // Read-only.
            // ==================================================

            case "manager_approved":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );


            // ==================================================
            // ADMIN RETURNED
            //
            // Read-only.
            // No Edit & Resubmit.
            // ==================================================

            case "admin_returned":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );


            // ==================================================
            // ADMIN REJECTED
            //
            // Read-only.
            // No Edit & Resubmit.
            // ==================================================

            case "admin_rejected":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );


            // ==================================================
            // ADMIN APPROVED
            //
            // Final completed evaluation.
            // Read-only.
            // ==================================================

            case "admin_approved":

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );


            // ==================================================
            // DEFAULT
            // ==================================================

            default:

                return (
                    <div className="table-actions">

                        <button
                            type="button"
                            className="
                                action-button
                                evaluation-action-button
                                action-view
                            "
                            onClick={() =>
                                handleViewEvaluation(
                                    evaluation.id
                                )
                            }
                        >
                            View
                        </button>

                    </div>
                );
        }
    };


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
                        My Evaluations
                    </h1>

                    <p className="page-header-description">
                        View your employee self-evaluations
                        and their current status.
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

                    <div className="data-table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Evaluation Period
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Comment
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

                                            {/* ID */}

                                            <td>

                                                <strong>
                                                    #{evaluation.id}
                                                </strong>

                                            </td>


                                            {/* Evaluation Period */}

                                            <td>

                                                <span className="evaluation-period-name">

                                                    {
                                                        evaluation
                                                            .evaluation_period
                                                            ?.name ||
                                                        evaluation
                                                            .evaluationPeriod
                                                            ?.name ||
                                                        "-"
                                                    }

                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td>

                                                {renderStatus(
                                                    evaluation.status
                                                )}

                                            </td>


                                            {/* Comment */}

                                            <td>

                                                <div className="evaluation-comment">

                                                    {
                                                        evaluation
                                                            .employee_comment ||
                                                        "-"
                                                    }

                                                </div>

                                            </td>


                                            {/* Action */}

                                            <td className="data-table-actions">

                                                {renderAction(
                                                    evaluation
                                                )}

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
    );
};

export default MyEvaluations;
