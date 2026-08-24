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
    const [answers, setAnswers] = useState([]);

    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================================
    // Back Navigation
    // ==========================================================

    const handleBack = () => {
        if (user?.role?.name === "HR") {
            navigate("/management");
            return;
        }

        navigate("/management/manager/reviews");
    };

    // ==========================================================
    // Fetch Evaluation
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

            const response = await api.get(
                `/evaluations/${id}`
            );

            console.log(
                "Evaluation Details:",
                response.data
            );

            if (!response.data.success) {
                setEvaluation(null);
                setAnswers([]);

                setError(
                    response.data.message ||
                    "Failed to load evaluation."
                );

                return;
            }

            const data = response.data.data;

            if (!data) {
                setEvaluation(null);
                setAnswers([]);

                setError(
                    "Evaluation not found."
                );

                return;
            }

            setEvaluation(data);
            setAnswers(data.answers || []);

            // Existing review
            if (
                data.reviews &&
                data.reviews.length > 0
            ) {
                const latestReview =
                    data.reviews[
                        data.reviews.length - 1
                    ];

                setRating(
                    latestReview.rating !== null &&
                    latestReview.rating !== undefined
                        ? String(latestReview.rating)
                        : ""
                );

                setComment(
                    latestReview.comment || ""
                );
            } else {
                setRating("");
                setComment("");
            }

        } catch (error) {
            console.error(
                "Fetch evaluation error:",
                error
            );

            setEvaluation(null);
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
    // Review Action
    // ==========================================================

    const handleReviewAction = async (action) => {
        // Clear previous messages
        setError("");
        setSuccess("");

        // Validate rating
        if (!rating) {
            setError(
                "Please select a rating."
            );

            return;
        }

        // Validate comment
        if (!comment.trim()) {
            setError(
                "Please enter a comment."
            );

            return;
        }

        // Check logged-in user
        if (!user?.id) {
            setError(
                "Logged-in user information not found."
            );

            return;
        }

        // Confirmation
        const confirmed = window.confirm(
            `Are you sure you want to ${action} this evaluation?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);

            const response = await api.post(
                "/evaluation-reviews",
                {
                    evaluation_id: Number(id),
                    reviewer_id: user.id,
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
                setSuccess(
                    response.data.message ||
                    `Evaluation ${action} successfully.`
                );

                // Reload evaluation
                await fetchEvaluation();

                // Clear form
                setRating("");
                setComment("");
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

            setError(
                error.response?.data?.message ||
                "Failed to process evaluation."
            );

        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================================
    // Loading State
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
    // Error State
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
                        Back to Dashboard
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
                            not be found or is not available
                            for review.
                        </div>

                    </div>

                </div>

                <div className="management-form-actions">

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={handleBack}
                    >
                        Back to Dashboard
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
        evaluation.evaluation_period;

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
                                className={`status-badge ${
                                    evaluation.status ===
                                    "submitted"
                                        ? "status-active"
                                        : evaluation.status ===
                                          "approved"
                                        ? "status-completed"
                                        : evaluation.status ===
                                          "rejected"
                                        ? "status-inactive"
                                        : "status-extended"
                                }`}
                            >
                                {evaluation.status}
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
                            {employee?.department?.name ||
                                "N/A"}
                        </span>

                    </div>


                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Position
                        </span>

                        <span className="management-form-info-value">
                            {employee?.position?.title ||
                                "N/A"}
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
                Employee Answers
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Evaluation Questions & Answers
                    </h2>

                    <p>
                        Review the answers and ratings provided
                        by the employee.
                    </p>

                </div>


                {answers.length === 0 ? (

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Answers Found
                        </div>

                        <div className="data-table-empty-message">
                            The employee has not provided any
                            answers yet.
                        </div>

                    </div>

                ) : (

                    <div className="evaluation-review-list">

                        {answers.map(
                            (item, index) => (

                                <div
                                    key={
                                        item.id ||
                                        index
                                    }
                                    className="evaluation-review-card"
                                >

                                    <div className="evaluation-review-question">

                                        <span>
                                            {index + 1}.
                                        </span>

                                        <strong>
                                            {
                                                item.question
                                                    ?.question ||
                                                "Question not found"
                                            }
                                        </strong>

                                    </div>


                                    <div className="evaluation-review-answer">

                                        <span className="evaluation-review-label">
                                            Employee Answer
                                        </span>

                                        <p>
                                            {item.answer ||
                                                "No answer provided."}
                                        </p>

                                    </div>


                                    <div className="evaluation-review-rating">

                                        <span className="evaluation-review-label">
                                            Employee Rating
                                        </span>

                                        <span className="status-badge status-active">
                                            {item.rating !==
                                                null &&
                                            item.rating !==
                                                undefined
                                                ? `${item.rating} / 5`
                                                : "Not provided"}
                                        </span>

                                    </div>


                                    {item.comment && (

                                        <div className="evaluation-review-answer">

                                            <span className="evaluation-review-label">
                                                Employee Comment
                                            </span>

                                            <p>
                                                {item.comment}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            )
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
                        Manager Review History
                    </h2>

                    <p>
                        Previous review actions for this
                        evaluation.
                    </p>

                </div>


                {evaluation.reviews &&
                evaluation.reviews.length > 0 ? (

                    <div className="evaluation-review-history">

                        {evaluation.reviews.map(
                            (review) => (

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

                                    </div>


                                    <div className="evaluation-history-comment">

                                        <span className="evaluation-review-label">
                                            Comment
                                        </span>

                                        <p>
                                            {review.comment ||
                                                "-"}
                                        </p>

                                    </div>


                                    <div className="evaluation-history-date">

                                        <span className="evaluation-review-label">
                                            Reviewed At
                                        </span>

                                        <span>
                                            {formatDateTime(review.reviewed_at)}
                                        </span>

                                    </div>

                                </div>

                            )
                        )}

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
                Manager Review
            ================================================== */}

            {evaluation.status === "submitted" && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Manager Review
                        </h2>

                        <p>
                            Provide your rating and comments
                            before marking this evaluation as
                            reviewed.
                        </p>

                    </div>


                    <div className="management-form">

                        <div className="management-form-field">

                            <label htmlFor="manager-rating">
                                Rating
                            </label>

                            <select
                                id="manager-rating"
                                value={rating}
                                onChange={(e) =>
                                    setRating(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    actionLoading
                                }
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


                        <div className="management-form-field">

                            <label htmlFor="manager-comment">
                                Manager Comment
                            </label>

                            <textarea
                                id="manager-comment"
                                value={comment}
                                onChange={(e) =>
                                    setComment(
                                        e.target.value
                                    )
                                }
                                rows="6"
                                disabled={
                                    actionLoading
                                }
                                placeholder="Enter your review comments..."
                            />

                        </div>


                        <div className="management-form-actions">

                            <button
                                type="button"
                                className="management-btn-primary"
                                disabled={
                                    actionLoading
                                }
                                onClick={() =>
                                    handleReviewAction(
                                        "reviewed"
                                    )
                                }
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : "Submit Review"}
                            </button>

                            <button
                                type="button"
                                className="management-btn-secondary"
                                disabled={
                                    actionLoading
                                }
                                onClick={handleBack}
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                Final Manager Action
            ================================================== */}

            {evaluation.status === "reviewed" && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Final Manager Action
                        </h2>

                        <p>
                            Select a rating and provide comments
                            before approving, rejecting or
                            returning the evaluation.
                        </p>

                    </div>


                    <div className="management-form">

                        <div className="management-form-field">

                            <label htmlFor="action-rating">
                                Rating
                            </label>

                            <select
                                id="action-rating"
                                value={rating}
                                onChange={(e) =>
                                    setRating(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    actionLoading
                                }
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


                        <div className="management-form-field">

                            <label htmlFor="action-comment">
                                Manager Comment
                            </label>

                            <textarea
                                id="action-comment"
                                value={comment}
                                onChange={(e) =>
                                    setComment(
                                        e.target.value
                                    )
                                }
                                rows="6"
                                disabled={
                                    actionLoading
                                }
                                placeholder="Enter your final decision comments..."
                            />

                        </div>


                        <div className="management-form-actions">

                            <button
                                type="button"
                                className="management-btn-primary"
                                disabled={
                                    actionLoading
                                }
                                onClick={() =>
                                    handleReviewAction(
                                        "approved"
                                    )
                                }
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : "Approve"}
                            </button>


                            <button
                                type="button"
                                className="action-button action-delete"
                                disabled={
                                    actionLoading
                                }
                                onClick={() =>
                                    handleReviewAction(
                                        "rejected"
                                    )
                                }
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : "Reject"}
                            </button>


                            <button
                                type="button"
                                className="action-button action-password"
                                disabled={
                                    actionLoading
                                }
                                onClick={() =>
                                    handleReviewAction(
                                        "returned"
                                    )
                                }
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : "Return"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default ReviewEvaluation;