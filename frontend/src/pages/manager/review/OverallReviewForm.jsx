import { getRoleLabel } from "./reviewHelpers";

const OverallReviewForm = ({
    reviewerRole,
    canReview,
    saving,
    overallRating,
    overallComment,
    allQuestionsReviewed,
    onRatingChange,
    onCommentChange,
    onAction,
}) => {
    // ----------------------------------------------------------
    // Only show this form when current reviewer can review
    // ----------------------------------------------------------

    if (!canReview) {
        return null;
    }

    const roleLabel = getRoleLabel(reviewerRole);

    // ----------------------------------------------------------
    // Button State
    // ----------------------------------------------------------

    const actionsDisabled =
        saving || !allQuestionsReviewed;

    return (
        <div className="management-form-section">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="management-form-section-header">

                <h2>
                    Overall {roleLabel} Review
                </h2>

            </div>

            <div className="management-form">

                {/* ==================================================
                    Overall Rating
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="overall-rating">

                        Overall Rating

                        <span className="required-star">
                            *
                        </span>

                    </label>

                    <select
                        id="overall-rating"
                        value={overallRating}
                        onChange={(e) =>
                            onRatingChange(
                                e.target.value
                            )
                        }
                        disabled={saving}
                    >

                        <option value="">
                            Select Overall Rating
                        </option>

                        {Array.from(
                            { length: 11 },
                            (_, rating) => (
                                <option
                                    key={rating}
                                    value={rating}
                                >
                                    {rating} / 10
                                </option>
                            )
                        )}

                    </select>

                </div>

                {/* ==================================================
                    Overall Comment
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="overall-comment">
                        Overall Comment
                    </label>

                    <textarea
                        id="overall-comment"
                        value={overallComment}
                        onChange={(e) =>
                            onCommentChange(
                                e.target.value
                            )
                        }
                        placeholder={
                            `Enter overall ${roleLabel.toLowerCase()} comment...`
                        }
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Review Actions
                ================================================== */}

                <div className="management-form-actions">

                    {/* ------------------------------------------------
                        Approve
                    ------------------------------------------------ */}

                    <button
                        type="button"
                        className="management-btn-primary"
                        onClick={() =>
                            onAction("approved")
                        }
                        disabled={actionsDisabled}
                    >
                        {saving
                            ? "Processing..."
                            : "Approve"}
                    </button>

                    {/* ------------------------------------------------
                        Return
                    ------------------------------------------------ */}

                    {/* <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            onAction("returned")
                        }
                        disabled={actionsDisabled}
                    >
                        Return
                    </button> */}

                    {/* ------------------------------------------------
                        Reject
                    ------------------------------------------------ */}

                    <button
                        type="button"
                        className="action-button action-delete"
                        onClick={() =>
                            onAction("rejected")
                        }
                        disabled={actionsDisabled}
                    >
                        Reject Evaluation
                    </button>

                </div>

                {/* ==================================================
                    Review Progress Message
                ================================================== */}

                {!allQuestionsReviewed && !saving && (
                    <div className="management-error">
                        Please Accept, Reject or Ignore all
                        questions before submitting the review.
                    </div>
                )}

                {allQuestionsReviewed && !saving && (
                    <div className="evaluation-review-ready-message">
                        ✓ All questions have been reviewed.
                        You can now Approve or Reject
                        the evaluation.
                    </div>
                )}

            </div>

        </div>
    );
};

export default OverallReviewForm;
