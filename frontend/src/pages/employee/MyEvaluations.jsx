import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import DataTable from "../../components/DataTable";

const MyEvaluations = () => {

    const navigate = useNavigate();

    // ==========================================================
    // State
    // ==========================================================

    const [evaluations, setEvaluations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [deletingId, setDeletingId] = useState(null);


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
                "/evaluations/my"
            );

            console.log(
                "My Evaluations:",
                response.data
            );

            setEvaluations(
                response.data?.data || []
            );

        } catch (error) {

            console.error(
                "Failed to load my evaluations:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load your evaluations."
            );

        } finally {

            setLoading(false);

        }
    };


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
    // Delete Draft Evaluation
    // ==========================================================

    const handleDeleteEvaluation = async (
        evaluation
    ) => {

        /*
        |--------------------------------------------------------------------------
        | Safety Check
        |--------------------------------------------------------------------------
        |
        | Delete is ONLY allowed for draft evaluations.
        |
        */

        if (
            !evaluation ||
            evaluation.status !== "draft"
        ) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Confirmation
        |--------------------------------------------------------------------------
        */

        const confirmed = window.confirm(
            "Are you sure you want to delete this draft evaluation?\n\nThis action cannot be undone."
        );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(
                evaluation.id
            );

            setError("");


            /*
            |--------------------------------------------------------------------------
            | Delete API
            |--------------------------------------------------------------------------
            */

            await api.delete(
                `/evaluations/${evaluation.id}`
            );


            /*
            |--------------------------------------------------------------------------
            | Remove From Local List
            |--------------------------------------------------------------------------
            */

            setEvaluations((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== evaluation.id
                )
            );


            alert(
                "Draft evaluation deleted successfully."
            );

        } catch (error) {

            console.error(
                "Failed to delete evaluation:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete evaluation."
            );

        } finally {

            setDeletingId(null);

        }
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
            // HR RETURNED
            // ==================================================

            case "hr_returned":

                return (
                    <span className="status-badge status-returned">
                        Returned by HR
                    </span>
                );


            // ==================================================
            // HR REJECTED
            // ==================================================

            case "hr_rejected":

                return (
                    <span className="status-badge status-rejected">
                        Rejected by HR
                    </span>
                );


            // ==================================================
            // HR APPROVED
            // ==================================================

            case "hr_approved":

                return (
                    <span className="status-badge status-approved">
                        HR Approved
                    </span>
                );


            // ==================================================
            // MANAGEMENT RETURNED
            // ==================================================

            case "management_returned":

                return (
                    <span className="status-badge status-returned">
                        Returned by Management
                    </span>
                );


            // ==================================================
            // MANAGEMENT REJECTED
            // ==================================================

            case "management_rejected":

                return (
                    <span className="status-badge status-rejected">
                        Rejected by Management
                    </span>
                );


            // ==================================================
            // MANAGEMENT APPROVED
            // ==================================================

            case "management_approved":

                return (
                    <span className="status-badge status-approved">
                        Final Approved
                    </span>
                );


            // ==================================================
            // OLD ADMIN RETURNED
            // ==================================================

            case "admin_returned":

                return (
                    <span className="status-badge status-returned">
                        Returned by Admin
                    </span>
                );


            // ==================================================
            // OLD ADMIN REJECTED
            // ==================================================

            case "admin_rejected":

                return (
                    <span className="status-badge status-rejected">
                        Rejected by Admin
                    </span>
                );


            // ==================================================
            // OLD ADMIN APPROVED
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

        /*
        |--------------------------------------------------------------------------
        | DRAFT
        |--------------------------------------------------------------------------
        |
        | User can:
        |
        | Continue
        | Delete
        |
        */

        if (
            evaluation.status === "draft"
        ) {

            const isDeleting =
                deletingId === evaluation.id;


            return (
                <div className="table-actions">

                    {/* Continue */}

                    <button
                        type="button"
                        className="
                            action-button
                            evaluation-action-button
                            action-continue
                        "
                        onClick={(event) => {

                            event.stopPropagation();

                            handleViewEvaluation(
                                evaluation.id
                            );

                        }}
                        disabled={isDeleting}
                    >
                        Continue
                    </button>


                    {/* Delete */}

                    <button
                        type="button"
                        className="
                            action-button
                            evaluation-action-button
                            action-delete
                        "
                        onClick={(event) => {

                            event.stopPropagation();

                            handleDeleteEvaluation(
                                evaluation
                            );

                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting
                            ? "Deleting..."
                            : "Delete"
                        }
                    </button>

                </div>
            );

        }


        /*
        |--------------------------------------------------------------------------
        | ALL NON-DRAFT STATUSES
        |--------------------------------------------------------------------------
        |
        | User can ONLY view.
        |
        | No Edit.
        | No Delete.
        |
        */

        return (
            <div className="table-actions">

                <button
                    type="button"
                    className="
                        action-button
                        evaluation-action-button
                        action-view
                    "
                    onClick={(event) => {

                        event.stopPropagation();

                        handleViewEvaluation(
                            evaluation.id
                        );

                    }}
                >
                    View
                </button>

            </div>
        );
    };


    // ==========================================================
    // DataTable Columns
    // ==========================================================

    const columns = [

        // ======================================================
        // ID
        // ======================================================

        {
            key: "id",
            label: "ID",

            render: (evaluation) => (
                <strong>
                    #{evaluation.id}
                </strong>
            ),
        },


        // ======================================================
        // Evaluation Period
        // ======================================================

        {
            key: "evaluation_period",
            label: "Evaluation Period",

            render: (evaluation) =>
                evaluation
                    .evaluation_period
                    ?.name ||

                evaluation
                    .evaluationPeriod
                    ?.name ||

                "-",
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
        // Comment
        // ======================================================

        {
            key: "employee_comment",
            label: "Comment",

            render: (evaluation) => (

                <div className="evaluation-comment">

                    {evaluation.employee_comment ||
                        "-"
                    }

                </div>
            ),
        },


        // ======================================================
        // Action
        // ======================================================

        {
            key: "actions",
            label: "Action",

            render: (evaluation) =>
                renderAction(
                    evaluation
                ),
        },
    ];


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
                    onClick={
                        handleCreateEvaluation
                    }
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
                Evaluation DataTable
            ================================================== */}

            <DataTable
                columns={columns}
                data={evaluations}
                emptyMessage="You have not created any evaluations yet."
            />

        </div>
    );
};


export default MyEvaluations;