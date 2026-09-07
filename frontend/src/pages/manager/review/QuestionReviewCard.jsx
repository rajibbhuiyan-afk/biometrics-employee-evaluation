import {
    getReviewByQuestion,
} from "./reviewHelpers";

import PreviousQuestionReview from "./PreviousQuestionReview";

const QuestionReviewCard = ({
    answer,
    index,
    currentReview,
    reviewerRole,
    canReview,
    saving,
    evaluationReviews,
    onRatingChange,
    onResultChange,
    onCommentChange,
}) => {
    const question = answer?.question;
    const questionId = answer?.question_id;

    // ==========================================================
    // Previous Reviews
    // ==========================================================

    const managerReview =
        getReviewByQuestion(
            evaluationReviews,
            questionId,
            "Manager"
        );

    const hrReview =
        getReviewByQuestion(
            evaluationReviews,
            questionId,
            "HR"
        );

    const managementReview =
        getReviewByQuestion(
            evaluationReviews,
            questionId,
            "Management"
        );

    // ==========================================================
    // Required
    // ==========================================================

    const isRequired =
        question?.is_required ||
        question?.required;

    // ==========================================================
    // Current Review
    // ==========================================================

    const result =
        currentReview?.review_result || "";

    const rating =
        currentReview?.rating ?? "";

    const comment =
        currentReview?.comment || "";

    const isAccepted =
        result === "okay";

    const isRejected =
        result === "not_okay";

    const isIgnored =
        result === "ignore";

    // ==========================================================
    // Rating Options
    // ==========================================================

    const maxRating = Math.min(
        Number(
            question?.max_rating
        ) || 10,
        10
    );

    const ratingOptions =
        Array.from(
            {
                length:
                    maxRating + 1,
            },
            (_, index) =>
                index
        );

    // ==========================================================
    // Employee Answer
    // ==========================================================

    const hasEmployeeAnswer =
        answer?.answer !== null &&
        answer?.answer !== undefined &&
        String(
            answer.answer
        ).trim() !== "";

    // ==========================================================
    // Result Handler
    // ==========================================================

    const handleResultChange = (
        nextResult
    ) => {
        if (
            !canReview ||
            saving
        ) {
            return;
        }

        onResultChange(
            questionId,
            nextResult
        );
    };

    // ==========================================================
    // Rating Handler
    // ==========================================================

    const handleRatingChange = (
        event
    ) => {
        if (
            !canReview ||
            saving
        ) {
            return;
        }

        onRatingChange(
            questionId,
            event.target.value
        );
    };

    // ==========================================================
    // Comment Handler
    // ==========================================================

    const handleCommentChange = (
        event
    ) => {
        if (
            !canReview ||
            saving
        ) {
            return;
        }

        onCommentChange(
            questionId,
            event.target.value
        );
    };

    // ==========================================================
    // Previous Review
    // ==========================================================

    const renderPreviousReview = (
        title,
        review
    ) => {
        if (!review) {
            return (
                <div className="evaluation-review-empty">
                    No review available.
                </div>
            );
        }

        return (
            <PreviousQuestionReview
                title={title}
                review={review}
            />
        );
    };

    // ==========================================================
    // Render
    // ==========================================================

    return (
        <div className="evaluation-review-card">

            {/* ==================================================
                Question Header
            ================================================== */}

            <div className="evaluation-review-question">

                <span className="evaluation-review-question-number">
                    {index + 1}.
                </span>

                <strong>
                    {question?.question || "-"}
                </strong>

                {isRequired && (
                    <span
                        className="required-star"
                        title="Required question"
                    >
                        *
                    </span>
                )}

            </div>

            {/* ==================================================
                Employee Answer + Performance Rating
            ================================================== */}

            <div className="evaluation-review-main">

                {/* ==================================================
                    Employee Answer
                ================================================== */}

                <div className="evaluation-review-answer-section">

                    <div className="evaluation-review-label">
                        Employee Answer
                    </div>

                    <div className="evaluation-review-answer-box">

                        {hasEmployeeAnswer
                            ? answer.answer
                            : "-"}

                    </div>

                </div>

                {/* ==================================================
                    Employee Performance Rating
                ================================================== */}

                <div className="evaluation-review-rating-section">

                    <div className="evaluation-review-label">
                        Performance Rating
                    </div>

                    <div className="evaluation-review-employee-rating">

                        {answer?.rating !== null &&
                        answer?.rating !==
                            undefined &&
                        answer?.rating !== ""
                            ? `${answer.rating} / 10`
                            : "-"}

                    </div>

                </div>

            </div>

            {/* ==================================================
                Review Panels
            ================================================== */}

            <div className="evaluation-review-panels">

                {/* ==================================================
                    MANAGER
                ================================================== */}

                {(reviewerRole === "Manager" ||
                    reviewerRole ===
                        "Management") && (

                    <div className="evaluation-review-panel">

                        <div className="evaluation-review-panel-title">
                            Manager
                        </div>

                        {/* Management Previous Manager Review */}

                        {reviewerRole ===
                            "Management" &&
                            renderPreviousReview(
                                "Manager",
                                managerReview
                            )}

                        {/* Manager Current Review */}

                        {reviewerRole ===
                            "Manager" &&
                            canReview && (

                            <ReviewControls
                                result={
                                    result
                                }
                                rating={
                                    rating
                                }
                                comment={
                                    comment
                                }
                                isAccepted={
                                    isAccepted
                                }
                                isRejected={
                                    isRejected
                                }
                                isIgnored={
                                    isIgnored
                                }
                                canReview={
                                    canReview
                                }
                                saving={
                                    saving
                                }
                                ratingOptions={
                                    ratingOptions
                                }
                                onResultChange={
                                    handleResultChange
                                }
                                onRatingChange={
                                    handleRatingChange
                                }
                                onCommentChange={
                                    handleCommentChange
                                }
                            />
                        )}

                        {/* Manager Readonly Review */}

                        {reviewerRole ===
                            "Manager" &&
                            !canReview &&
                            managerReview && (
                            <PreviousQuestionReview
                                title="Manager"
                                review={
                                    managerReview
                                }
                            />
                        )}

                    </div>
                )}

                {/* ==================================================
                    HR
                ================================================== */}

                {(reviewerRole === "HR" ||
                    reviewerRole ===
                        "Management") && (

                    <div className="evaluation-review-panel">

                        <div className="evaluation-review-panel-title">
                            HR
                        </div>

                        {/* Management Previous HR Review */}

                        {reviewerRole ===
                            "Management" &&
                            renderPreviousReview(
                                "HR",
                                hrReview
                            )}

                        {/* HR Current Review */}

                        {reviewerRole ===
                            "HR" &&
                            canReview && (

                            <ReviewControls
                                result={
                                    result
                                }
                                rating={
                                    rating
                                }
                                comment={
                                    comment
                                }
                                isAccepted={
                                    isAccepted
                                }
                                isRejected={
                                    isRejected
                                }
                                isIgnored={
                                    isIgnored
                                }
                                canReview={
                                    canReview
                                }
                                saving={
                                    saving
                                }
                                ratingOptions={
                                    ratingOptions
                                }
                                onResultChange={
                                    handleResultChange
                                }
                                onRatingChange={
                                    handleRatingChange
                                }
                                onCommentChange={
                                    handleCommentChange
                                }
                            />
                        )}

                        {/* HR Readonly Review */}

                        {reviewerRole ===
                            "HR" &&
                            !canReview &&
                            hrReview && (
                            <PreviousQuestionReview
                                title="HR"
                                review={
                                    hrReview
                                }
                            />
                        )}

                    </div>
                )}

                {/* ==================================================
                    MANAGEMENT
                ================================================== */}

                {reviewerRole ===
                    "Management" && (

                    <div className="evaluation-review-panel">

                        <div className="evaluation-review-panel-title">
                            Management
                        </div>

                        {/* Previous Management Review */}

                        {managementReview &&
                            !canReview && (

                            <PreviousQuestionReview
                                title="Management"
                                review={
                                    managementReview
                                }
                            />
                        )}

                        {/* Current Management Review */}

                        {canReview && (

                            <ReviewControls
                                result={
                                    result
                                }
                                rating={
                                    rating
                                }
                                comment={
                                    comment
                                }
                                isAccepted={
                                    isAccepted
                                }
                                isRejected={
                                    isRejected
                                }
                                isIgnored={
                                    isIgnored
                                }
                                canReview={
                                    canReview
                                }
                                saving={
                                    saving
                                }
                                ratingOptions={
                                    ratingOptions
                                }
                                onResultChange={
                                    handleResultChange
                                }
                                onRatingChange={
                                    handleRatingChange
                                }
                                onCommentChange={
                                    handleCommentChange
                                }
                            />
                        )}

                    </div>
                )}

            </div>

        </div>
    );
};


// =============================================================
// Review Controls
// =============================================================

const ReviewControls = ({
    result,
    rating,
    comment,
    isAccepted,
    isRejected,
    isIgnored,
    canReview,
    saving,
    ratingOptions,
    onResultChange,
    onRatingChange,
    onCommentChange,
}) => {
    return (
        <div className="question-review-controls">

            {/* ==================================================
                REVIEW RESULT
            ================================================== */}

            <div className="question-review-result-section">

                <div className="evaluation-review-label">
                    Review Result
                </div>

                <div className="question-review-result-buttons">

                    {/* ACCEPT */}

                    <button
                        type="button"
                        className={
                            `question-review-result-button ${
                                isAccepted
                                    ? "active accept"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            onResultChange(
                                "okay"
                            )
                        }
                        disabled={
                            !canReview ||
                            saving
                        }
                    >
                        ✓ Accept
                    </button>

                    {/* REJECT */}

                    <button
                        type="button"
                        className={
                            `question-review-result-button ${
                                isRejected
                                    ? "active reject"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            onResultChange(
                                "not_okay"
                            )
                        }
                        disabled={
                            !canReview ||
                            saving
                        }
                    >
                        ✕ Reject
                    </button>

                    {/* IGNORE */}

                    <button
                        type="button"
                        className={
                            `question-review-result-button ${
                                isIgnored
                                    ? "active ignore"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            onResultChange(
                                "ignore"
                            )
                        }
                        disabled={
                            !canReview ||
                            saving
                        }
                    >
                        — Ignore
                    </button>

                </div>

            </div>

            {/* ==================================================
                ACCEPT
                Only Rating
            ================================================== */}

            {isAccepted && (
                <div className="question-review-rating-input">

                    <label>
                        Review Rating
                        <span className="required-star">
                            *
                        </span>
                    </label>

                    <select
                        value={
                            rating
                        }
                        onChange={
                            onRatingChange
                        }
                        disabled={
                            !canReview ||
                            saving
                        }
                    >
                        <option value="">
                            Select Rating
                        </option>

                        {ratingOptions.map(
                            (value) => (
                                <option
                                    key={
                                        value
                                    }
                                    value={
                                        value
                                    }
                                >
                                    {value}
                                </option>
                            )
                        )}

                    </select>

                </div>
            )}

            {/* ==================================================
                REJECT
                Only Comment
            ================================================== */}

            {isRejected && (
                <div className="question-review-comment-section">

                    <label>
                        Rejection Comment
                        <span className="required-star">
                            *
                        </span>
                    </label>

                    <textarea
                        value={
                            comment
                        }
                        onChange={
                            onCommentChange
                        }
                        placeholder="Please explain why this question is rejected..."
                        rows={4}
                        disabled={
                            !canReview ||
                            saving
                        }
                    />

                </div>
            )}

            {/* ==================================================
                IGNORE
                Only Message
            ================================================== */}

            {isIgnored && (
                <div className="question-review-ignore-message">
                    This question has been ignored.
                </div>
            )}

            {/* ==================================================
                Saving
            ================================================== */}

            {saving && (
                <div className="question-review-saving">
                    Saving...
                </div>
            )}

        </div>
    );
};

export default QuestionReviewCard;