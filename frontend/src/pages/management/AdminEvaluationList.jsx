import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { formatDateTime } from "../../utils/dateUtils";


// ==========================================================
// Admin Evaluation List
// ==========================================================

const AdminEvaluationList = () => {

    // ======================================================
    // Navigation
    // ======================================================

    const navigate = useNavigate();


    // ======================================================
    // State
    // ======================================================

    const [evaluations, setEvaluations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ======================================================
    // Fetch Evaluations
    // ======================================================

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
                "Admin Evaluations:",
                response.data
            );


            const data =
                response.data?.data || [];


            // ------------------------------------------------
            // Only manager-approved evaluations
            // ------------------------------------------------

            const managerApprovedEvaluations =
                data.filter(
                    (evaluation) =>
                        evaluation.status ===
                        "manager_approved"
                );


            setEvaluations(
                managerApprovedEvaluations
            );


        } catch (error) {

            console.error(
                "Admin evaluation fetch error:",
                error
            );


            setEvaluations([]);


            setError(
                error.response?.data?.message ||
                "Failed to load evaluations."
            );


        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // Open Evaluation
    // ======================================================

    const handleReview = (evaluationId) => {

        navigate(
            `/management/admin/evaluations/${evaluationId}`
        );

    };


    // ======================================================
    // Refresh List
    // ======================================================

    const handleRefresh = () => {

        fetchEvaluations();

    };


    // ======================================================
    // Loading State
    // ======================================================

    if (loading) {

        return (

            <div className="management-page">

                <div className="page-header">

                    <div className="page-header-info">

                        <h1 className="page-header-title">
                            Final Evaluation Reviews
                        </h1>

                        <p className="page-header-description">
                            Loading manager-approved evaluations...
                        </p>

                    </div>

                </div>


                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            Loading Evaluations...
                        </div>

                        <div className="data-table-empty-message">
                            Please wait while the evaluations
                            are being loaded.
                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // Page
    // ======================================================

    return (

        <div className="management-page">


            {/* ==================================================
                Page Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Final Evaluation Reviews
                    </h1>

                    <p className="page-header-description">
                        Review manager-approved evaluations
                        and make the final decision.
                    </p>

                </div>


                <button
                    type="button"
                    className="page-header-button"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    Refresh
                </button>

            </div>


            {/* ==================================================
                Error Message
            ================================================== */}

            {error && (

                <div className="management-form-error">

                    {error}

                </div>

            )}


            {/* ==================================================
                Empty State
            ================================================== */}

            {!error &&
            evaluations.length === 0 && (

                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Evaluations Pending
                        </div>

                        <div className="data-table-empty-message">
                            There are currently no
                            manager-approved evaluations
                            waiting for final review.
                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                Evaluation Table
            ================================================== */}

            {evaluations.length > 0 && (

                <div className="data-table-container">

                    <table className="data-table">


                        {/* ======================================
                            Table Header
                        ======================================= */}

                        <thead>

                            <tr>

                                <th>
                                    Evaluation ID
                                </th>

                                <th>
                                    Employee
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

                                <th>
                                    Submitted At
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        {/* ======================================
                            Table Body
                        ======================================= */}

                        <tbody>

                            {evaluations.map(
                                (evaluation) => {

                                    const employee =
                                        evaluation.employee;

                                    const department =
                                        employee?.department;

                                    const evaluationPeriod =
                                        evaluation.evaluation_period ||
                                        evaluation.evaluationPeriod;


                                    return (

                                        <tr
                                            key={
                                                evaluation.id
                                            }
                                        >

                                            {/* ----------------
                                                Evaluation ID
                                            ----------------- */}

                                            <td>
                                                #
                                                {
                                                    evaluation.id
                                                }
                                            </td>


                                            {/* ----------------
                                                Employee
                                            ----------------- */}

                                            <td>

                                                <strong>
                                                    {
                                                        employee?.name ||
                                                        "N/A"
                                                    }
                                                </strong>

                                            </td>


                                            {/* ----------------
                                                Department
                                            ----------------- */}

                                            <td>
                                                {
                                                    department?.name ||
                                                    "N/A"
                                                }
                                            </td>


                                            {/* ----------------
                                                Evaluation Period
                                            ----------------- */}

                                            <td>
                                                {
                                                    evaluationPeriod?.name ||
                                                    "N/A"
                                                }
                                            </td>


                                            {/* ----------------
                                                Status
                                            ----------------- */}

                                            <td>

                                                <span
                                                    className="
                                                        status-badge
                                                        status-completed
                                                    "
                                                >
                                                    Manager Approved
                                                </span>

                                            </td>


                                            {/* ----------------
                                                Submitted At
                                            ----------------- */}

                                            <td>

                                                {evaluation.submitted_at
                                                    ? formatDateTime(
                                                        evaluation.submitted_at
                                                    )
                                                    : "-"
                                                }

                                            </td>


                                            {/* ----------------
                                                Action
                                            ----------------- */}                                           

                                            <td>

                                                <div className="management-table-actions">

                                                    <button
                                                        type="button"
                                                        className="action-button action-view"
                                                        onClick={() =>
                                                            handleReview(evaluation.id)
                                                        }
                                                    >
                                                        Review
                                                    </button>

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

    );

};


export default AdminEvaluationList;