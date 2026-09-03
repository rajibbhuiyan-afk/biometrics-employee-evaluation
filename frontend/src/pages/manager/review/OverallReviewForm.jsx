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
    if (!canReview) {
        return null;
    }

    const roleLabel =
        getRoleLabel(
            reviewerRole
        );

    return (
        <div className="management-form-section">

            <div className="management-form-section-header">

                <h2>
                    Overall {roleLabel} Review
                </h2>

            </div>

            <div className="management-form">

                {/* Rating */}

                <div className="management-form-field">

                    <label>

                        Overall Rating

                        <span className="required-star">
                            *
                        </span>

                    </label>

                    <select
                        value={
                            overallRating
                        }
                        onChange={(e) =>
                            onRatingChange(
                                e.target.value
                            )
                        }
                        disabled={
                            saving
                        }
                    >

                        <option value="">
                            Select Overall Rating
                        </option>

                        {Array.from(
                            {
                                length: 11,
                            },
                            (_, rating) => (
                                <option
                                    key={
                                        rating
                                    }
                                    value={
                                        rating
                                    }
                                >
                                    {rating} / 10
                                </option>
                            )
                        )}

                    </select>

                </div>


                {/* Comment */}

                <div className="management-form-field">

                    <label>
                        Overall Comment
                    </label>

                    <textarea
                        value={
                            overallComment
                        }
                        onChange={(e) =>
                            onCommentChange(
                                e.target.value
                            )
                        }
                        placeholder={`Enter overall ${roleLabel.toLowerCase()} comment...`}
                        disabled={
                            saving
                        }
                    />

                </div>


                {/* Actions */}

                <div className="management-form-actions">

                    <button
                        type="button"
                        className="management-btn-primary"
                        onClick={() =>
                            onAction(
                                "approved"
                            )
                        }
                        disabled={
                            saving ||
                            !allQuestionsReviewed
                        }
                    >
                        {saving
                            ? "Processing..."
                            : "Approve"}
                    </button>


                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            onAction(
                                "returned"
                            )
                        }
                        disabled={
                            saving ||
                            !allQuestionsReviewed
                        }
                    >
                        Return
                    </button>


                    <button
                        type="button"
                        className="action-button action-delete"
                        onClick={() =>
                            onAction(
                                "rejected"
                            )
                        }
                        disabled={
                            saving ||
                            !allQuestionsReviewed
                        }
                    >
                        Reject Evaluation
                    </button>

                </div>

            </div>

        </div>
    );
};

export default OverallReviewForm;