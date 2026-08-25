import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/dateUtils";

const ReviewEvaluation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // ==========================================================
    // State
    // ==========================================================

    const [evaluation, setEvaluation] = useState(null);

    // All evaluation questions
    const [questions, setQuestions] = useState([]);

    // Employee answers
    const [answers, setAnswers] = useState([]);

    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================================
    // Role
    // ==========================================================

    const role = user?.role?.name;

    const isManager = role === "Manager";
    const isAdmin = role === "Admin";

    // ==========================================================
    // Back Navigation
    // ==========================================================

    const handleBack = () => {
        if (isAdmin) {
            navigate("/management/admin/reviews");
            return;
        }

        if (role === "HR") {
            navigate("/management");
            return;
        }

        if (isManager) {
            navigate("/management/manager/reviews");
            return;
        }

        navigate("/management");
    };

    // ==========================================================
    // Fetch Evaluation + Questions
    // ==========================================================

    useEffect(() => {
        if (id) {
            fetchEvaluation();
        }
    }, [id]);

    const fetchEvaluation = async () => {
        try {
            setLoading(true);
            setError("");

            // ==================================================
            // Load Evaluation
            // ==================================================

            const evaluationResponse = await api.get(
                `/evaluations/${id}`
            );

            console.log(
                "Evaluation Details:",
                evaluationResponse.data
            );

            if (!evaluationResponse.data.success) {
                setEvaluation(null);
                setQuestions([]);
                setAnswers([]);

                setError(
                    evaluationResponse.data.message ||
                    "Failed to load evaluation."
                );

                return;
            }

            const data = evaluationResponse.data.data;

            if (!data) {
                setEvaluation(null);
                setQuestions([]);
                setAnswers([]);

                setError(
                    "Evaluation not found."
                );

                return;
            }

            setEvaluation(data);

            // ==================================================
            // Employee Answers
            // ==================================================

            setAnswers(
                data.answers || []
            );

            // ==================================================
            // Load ALL Evaluation Questions
            // ==================================================

            const questionsResponse = await api.get(
                "/evaluation-questions"
            );

            console.log(
                "Evaluation Questions:",
                questionsResponse.data
            );

            const questionData =
                questionsResponse.data.data || [];

            setQuestions(questionData);

            // ==================================================
            // Load Latest Review
            // ==================================================

            // if (
            //     data.reviews &&
            //     data.reviews.length > 0
            // ) {
            //     const latestReview =
            //         data.reviews[
            //             data.reviews.length - 1
            //         ];

            //     setRating(
            //         latestReview.rating !== null &&
            //         latestReview.rating !== undefined
            //             ? String(latestReview.rating)
            //             : ""
            //     );

            //     setComment(
            //         latestReview.comment || ""
            //     );
            // } else {
            //     setRating("");
            //     setComment("");
            // }

        } catch (error) {
            console.error(
                "Fetch evaluation error:",
                error
            );

            setEvaluation(null);
            setQuestions([]);
            setAnswers([]);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // Find Answer For Question
    // ==========================================================

    const getAnswerForQuestion = (questionId) => {
        return answers.find(
            (item) =>
                Number(item.question_id) ===
                Number(questionId)
        );
    };

    // ==========================================================
    // Review Action
    // ==========================================================

    const handleReviewAction = async (action) => {

        setError("");
        setSuccess("");

        // ======================================================
        // Check user
        // ======================================================

        if (!user?.id) {
            setError("Logged-in user information not found.");
            return;
        }


        // ======================================================
        // Check role
        // ======================================================

        if (!isManager && !isAdmin) {
            setError(
                "You are not authorized to review evaluations."
            );
            return;
        }


        // ======================================================
        // Check evaluation
        // ======================================================

        if (!evaluation) {
            setError("Evaluation information not found.");
            return;
        }


        // ======================================================
        // Check status
        // ======================================================

        if (
            isManager &&
            evaluation.status !== "submitted"
        ) {
            setError(
                "This evaluation is not available for manager review."
            );
            return;
        }


        if (
            isAdmin &&
            evaluation.status !== "manager_approved"
        ) {
            setError(
                "This evaluation is not available for final admin review."
            );
            return;
        }


        // ======================================================
        // Validate rating
        // ======================================================

        if (!rating) {
            setError("Please select a rating.");
            return;
        }


        // ======================================================
        // Validate comment
        // ======================================================

        if (!comment.trim()) {
            setError("Please enter a comment.");
            return;
        }


        // ======================================================
        // Action text
        // ======================================================

        let actionText = action;

        if (action === "approved") {
            actionText = isAdmin
                ? "final approve"
                : "approve";
        }

        if (action === "rejected") {
            actionText = "reject";
        }

        if (action === "returned") {
            actionText = "return";
        }


        // ======================================================
        // Confirmation
        // ======================================================

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this evaluation?`
        );

        if (!confirmed) {
            return;
        }


        // ======================================================
        // Submit Review
        // ======================================================

        try {

            setActionLoading(true);

            const response = await api.post(
                "/evaluation-reviews",
                {
                    evaluation_id: Number(id),
                    rating: Number(rating),
                    comment: comment.trim(),
                    action: action,
                }
            );


            console.log(
                "Review Action Response:",
                response.data
            );


            if (response.data.success) {

                // ==================================================
                // Clear current review form immediately
                // ==================================================

                setRating("");
                setComment("");


                // ==================================================
                // Show success message
                // ==================================================

                setSuccess(
                    response.data.message ||
                    `Evaluation ${actionText} successfully.`
                );


                // ==================================================
                // Reload evaluation
                // This will reload:
                // - status
                // - answers
                // - review history
                // ==================================================

                await fetchEvaluation();

            } else {

                setError(
                    response.data.message ||
                    "Failed to process evaluation."
                );
            }

        } catch (error) {

            console.error(
                "Review action error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );


            // ======================================================
            // Laravel validation errors
            // ======================================================

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {

                const firstError =
                    Object.values(validationErrors)
                        .flat()[0];

                setError(
                    firstError ||
                    error.response?.data?.message ||
                    "Validation failed."
                );

                return;
            }


            // ======================================================
            // General error
            // ======================================================

            setError(
                error.response?.data?.message ||
                "Failed to process evaluation."
            );

        } finally {

            setActionLoading(false);

        }
    };

    // ==========================================================
    // Status Badge
    // ==========================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "submitted":
                return "status-active";

            case "manager_approved":
                return "status-completed";

            case "admin_approved":
                return "status-completed";

            case "manager_rejected":
                return "status-inactive";

            case "admin_rejected":
                return "status-inactive";

            case "manager_returned":
                return "status-extended";

            case "admin_returned":
                return "status-extended";

            case "draft":
                return "status-extended";

            default:
                return "status-extended";
        }
    };

    // ==========================================================
    // Status Label
    // ==========================================================

    const getStatusLabel = (status) => {
        switch (status) {
            case "submitted":
                return "Submitted";

            case "manager_approved":
                return "Manager Approved";

            case "manager_rejected":
                return "Manager Rejected";

            case "manager_returned":
                return "Returned by Manager";

            case "admin_approved":
                return "Admin Approved";

            case "admin_rejected":
                return "Admin Rejected";

            case "admin_returned":
                return "Returned by Admin";

            case "draft":
                return "Draft";

            default:
                return status || "-";
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
                            Review Evaluation
                        </h1>

                        <p className="page-header-description">
                            Loading employee evaluation...
                        </p>

                    </div>

                </div>

                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            Loading Evaluation...
                        </div>

                        <div className="data-table-empty-message">
                            Please wait while the evaluation
                            details are being loaded.
                        </div>

                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Error
    // ==========================================================

    if (error && !evaluation) {
        return (
            <div className="management-page">

                <div className="page-header">

                    <div className="page-header-info">

                        <h1 className="page-header-title">
                            Review Evaluation
                        </h1>

                        <p className="page-header-description">
                            Unable to load the requested
                            evaluation.
                        </p>

                    </div>

                </div>

                <div className="management-form-error">
                    {error}
                </div>

                <div className="management-form-actions">

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={handleBack}
                    >
                        Back
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Evaluation Not Found
    // ==========================================================

    if (!evaluation) {
        return (
            <div className="management-page">

                <div className="page-header">

                    <div className="page-header-info">

                        <h1 className="page-header-title">
                            Review Evaluation
                        </h1>

                        <p className="page-header-description">
                            Evaluation details
                        </p>

                    </div>

                </div>

                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            Evaluation Not Found
                        </div>

                        <div className="data-table-empty-message">
                            The requested evaluation could
                            not be found.
                        </div>

                    </div>

                </div>

                <div className="management-form-actions">

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={handleBack}
                    >
                        Back
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Evaluation Data
    // ==========================================================

    const employee = evaluation.employee;

    const evaluationPeriod =
        evaluation.evaluation_period ||
        evaluation.evaluationPeriod;

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
                        Review Evaluation
                    </h1>

                    <p className="page-header-description">
                        Review the employee's self-evaluation
                        and provide your assessment.
                    </p>

                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={handleBack}
                >
                    Back
                </button>

            </div>


            {/* ==================================================
                Messages
            ================================================== */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="management-form-success">
                    {success}
                </div>
            )}


            {/* ==================================================
                Evaluation Information
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Evaluation Information
                    </h2>

                    <p>
                        Basic information about this employee
                        evaluation.
                    </p>

                </div>

                <div className="management-form-grid">

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Evaluation ID
                        </span>

                        <span className="management-form-info-value">
                            #{evaluation.id}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Evaluation Period
                        </span>

                        <span className="management-form-info-value">
                            {evaluationPeriod?.name || "-"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Status
                        </span>

                        <span className="management-form-info-value">

                            <span
                                className={`status-badge ${getStatusClass(
                                    evaluation.status
                                )}`}
                            >
                                {getStatusLabel(
                                    evaluation.status
                                )}
                            </span>

                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Employee Information
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Employee Information
                    </h2>

                    <p>
                        Information about the employee who
                        submitted this evaluation.
                    </p>

                </div>

                <div className="management-form-grid">

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Employee Name
                        </span>

                        <span className="management-form-info-value">
                            {employee?.name || "N/A"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Employee ID
                        </span>

                        <span className="management-form-info-value">
                            {employee?.employee_id || "N/A"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Email
                        </span>

                        <span className="management-form-info-value">
                            {employee?.email || "N/A"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Department
                        </span>

                        <span className="management-form-info-value">
                            {employee?.department?.name || "N/A"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Position
                        </span>

                        <span className="management-form-info-value">
                            {employee?.position?.title || "N/A"}
                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Employee Comment
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Employee Comment
                    </h2>

                    <p>
                        Comment provided by the employee.
                    </p>

                </div>

                <div className="evaluation-review-comment">

                    {evaluation.employee_comment ||
                        "No comment provided."}

                </div>

            </div>


            {/* ==================================================
                ALL QUESTIONS & ANSWERS
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Evaluation Questions & Answers
                    </h2>

                    <p>
                        All evaluation questions are displayed
                        below, including questions that were not
                        answered by the employee.
                    </p>

                </div>


                {questions.length === 0 ? (

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Questions Found
                        </div>

                        <div className="data-table-empty-message">
                            No evaluation questions are
                            currently available.
                        </div>

                    </div>

                ) : (

                    <div className="evaluation-review-list">

                        {questions.map(
                            (question, index) => {

                                // Find employee answer
                                const employeeAnswer =
                                    getAnswerForQuestion(
                                        question.id
                                    );

                                return (

                                    <div
                                        key={question.id}
                                        className="evaluation-review-card"
                                    >

                                        {/* ==================================
                                            Question
                                        ================================== */}

                                        <div className="evaluation-review-question">

                                            <span>
                                                {index + 1}.
                                            </span>

                                            <strong>

                                                {question.question}

                                                {question.is_required && (
                                                    <span className="required-star">
                                                        {" "}*
                                                    </span>
                                                )}

                                            </strong>

                                        </div>


                                        {/* ==================================
                                            Required Status
                                        ================================== */}

                                        {/* {question.is_required && (
                                            <div
                                                style={{
                                                    marginTop: "6px",
                                                    fontSize: "13px",
                                                    color: "#b45309",
                                                }}
                                            >
                                                Required Question
                                            </div>
                                        )} */}


                                        {/* ==================================
                                            Employee Answer
                                        ================================== */}

                                        <div className="evaluation-review-answer">

                                            <span className="evaluation-review-label">
                                                Employee Answer
                                            </span>

                                            <p>

                                                {employeeAnswer?.answer
                                                    ? employeeAnswer.answer
                                                    : "No answer provided."}

                                            </p>

                                        </div>


                                        {/* ==================================
                                            Employee Rating
                                        ================================== */}

                                        <div className="evaluation-review-rating">

                                            <span className="evaluation-review-label">
                                                Employee Rating
                                            </span>

                                            <span
                                                className={
                                                    employeeAnswer?.rating !==
                                                        null &&
                                                    employeeAnswer?.rating !==
                                                        undefined
                                                        ? "status-badge status-active"
                                                        : "status-badge status-extended"
                                                }
                                            >

                                                {employeeAnswer?.rating !==
                                                    null &&
                                                employeeAnswer?.rating !==
                                                    undefined
                                                    ? `${employeeAnswer.rating} / 5`
                                                    : "Not provided"}

                                            </span>

                                        </div>


                                        {/* ==================================
                                            Employee Comment
                                        ================================== */}

                                        {employeeAnswer?.comment ? (

                                            <div className="evaluation-review-answer">

                                                <span className="evaluation-review-label">
                                                    Employee Comment
                                                </span>

                                                <p>
                                                    {
                                                        employeeAnswer.comment
                                                    }
                                                </p>

                                            </div>

                                        ) : null}

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {/* ==================================================
                Review History
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Review History
                    </h2>

                    <p>
                        Previous review actions for this
                        evaluation.
                    </p>

                </div>

                {evaluation.reviews &&
                evaluation.reviews.length > 0 ? (

                    <div className="evaluation-review-history">

                        {evaluation.reviews.map((review) => (

                            <div
                                key={review.id}
                                className="evaluation-history-card"
                            >

                                <div className="evaluation-history-header">

                                    <span className="status-badge status-completed">

                                        Rating:{" "}
                                        {review.rating}
                                        / 5

                                    </span>

                                    <span className="status-badge status-active">
                                        {review.action}
                                    </span>

                                    {review.reviewer_role && (
                                        <span className="status-badge status-extended">
                                            {review.reviewer_role}
                                        </span>
                                    )}

                                </div>

                                <div className="evaluation-history-comment">

                                    <span className="evaluation-review-label">
                                        Comment
                                    </span>

                                    <p>
                                        {review.comment || "-"}
                                    </p>

                                </div>

                                <div className="evaluation-history-date">

                                    <span className="evaluation-review-label">
                                        Reviewed At
                                    </span>

                                    <span>
                                        {formatDateTime(
                                            review.reviewed_at
                                        )}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Reviews Yet
                        </div>

                        <div className="data-table-empty-message">
                            This evaluation has not been
                            reviewed yet.
                        </div>

                    </div>

                )}

            </div>


            {/* ==================================================
                MANAGER REVIEW
            ================================================== */}

            {isManager &&
            evaluation.status === "submitted" && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Manager Review
                        </h2>

                        <p>
                            Review the employee evaluation and
                            approve, reject, or return it.
                        </p>

                    </div>

                    <ReviewForm
                        rating={rating}
                        setRating={setRating}
                        comment={comment}
                        setComment={setComment}
                        actionLoading={actionLoading}
                        ratingId="manager-rating"
                        commentId="manager-comment"
                        commentPlaceholder="Enter your manager review comments..."
                        onApprove={() =>
                            handleReviewAction("approved")
                        }
                        onReject={() =>
                            handleReviewAction("rejected")
                        }
                        onReturn={() =>
                            handleReviewAction("returned")
                        }
                        approveText="Approve"
                        rejectText="Reject"
                        returnText="Return"
                        onCancel={handleBack}
                    />

                </div>
            )}


            {/* ==================================================
                ADMIN FINAL REVIEW
            ================================================== */}

            {isAdmin &&
            evaluation.status === "manager_approved" && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Final Admin Review
                        </h2>

                        <p>
                            The manager has approved this
                            evaluation. Review it and make the
                            final decision.
                        </p>

                    </div>

                    <ReviewForm
                        rating={rating}
                        setRating={setRating}
                        comment={comment}
                        setComment={setComment}
                        actionLoading={actionLoading}
                        ratingId="admin-rating"
                        commentId="admin-comment"
                        commentPlaceholder="Enter your final admin decision comments..."
                        onApprove={() =>
                            handleReviewAction("approved")
                        }
                        onReject={() =>
                            handleReviewAction("rejected")
                        }
                        onReturn={() =>
                            handleReviewAction("returned")
                        }
                        approveText="Final Approve"
                        rejectText="Reject"
                        returnText="Return"
                        onCancel={handleBack}
                    />

                </div>
            )}

        </div>
    );
};


// ==========================================================
// Reusable Review Form
// ==========================================================

const ReviewForm = ({
    rating,
    setRating,
    comment,
    setComment,
    actionLoading,
    ratingId,
    commentId,
    commentPlaceholder,
    onApprove,
    onReject,
    onReturn,
    approveText,
    rejectText,
    returnText,
    onCancel,
}) => {

    return (
        <div className="management-form">

            {/* Rating */}

            <div className="management-form-field">

                <label htmlFor={ratingId}>
                    Rating
                </label>

                <select
                    id={ratingId}
                    value={rating}
                    onChange={(e) =>
                        setRating(e.target.value)
                    }
                    disabled={actionLoading}
                >

                    <option value="">
                        Select Rating
                    </option>

                    <option value="1">
                        1 - Poor
                    </option>

                    <option value="2">
                        2 - Needs Improvement
                    </option>

                    <option value="3">
                        3 - Meets Expectations
                    </option>

                    <option value="4">
                        4 - Very Good
                    </option>

                    <option value="5">
                        5 - Excellent
                    </option>

                </select>

            </div>


            {/* Comment */}

            <div className="management-form-field">

                <label htmlFor={commentId}>
                    Comment
                </label>

                <textarea
                    id={commentId}
                    value={comment}
                    onChange={(e) =>
                        setComment(e.target.value)
                    }
                    rows="6"
                    disabled={actionLoading}
                    placeholder={commentPlaceholder}
                />

            </div>


            {/* Actions */}

            <div className="management-form-actions">

                <button
                    type="button"
                    className="management-btn-primary"
                    disabled={actionLoading}
                    onClick={onApprove}
                >
                    {actionLoading
                        ? "Processing..."
                        : approveText}
                </button>

                <button
                    type="button"
                    className="action-button action-delete"
                    disabled={actionLoading}
                    onClick={onReject}
                >
                    {actionLoading
                        ? "Processing..."
                        : rejectText}
                </button>

                <button
                    type="button"
                    className="action-button action-password"
                    disabled={actionLoading}
                    onClick={onReturn}
                >
                    {actionLoading
                        ? "Processing..."
                        : returnText}
                </button>

                <button
                    type="button"
                    className="management-btn-secondary"
                    disabled={actionLoading}
                    onClick={onCancel}
                >
                    Cancel
                </button>

            </div>

        </div>
    );
};

export default ReviewEvaluation;