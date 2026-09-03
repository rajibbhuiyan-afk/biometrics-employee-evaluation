import { getRoleLabel } from "./reviewHelpers";

const CurrentQuestionReview = ({
    questionId,
    reviewerRole,
    currentReview,
    saving,
    onRatingChange,
    onResultChange,
    onCommentChange,
}) => {
    const roleLabel = getRoleLabel(reviewerRole);

    const isAccepted =
        currentReview?.review_result === "okay";

    const isRejected =
        currentReview?.review_result === "not_okay";

    return (
        <div className="evaluation-current-review">

            {/* Rating */}

            <div className="evaluation-review-form-group">

                <label>
                    Rating
                    <span className="required-star">
                        *
                    </span>
                </label>

                <select
                    value={
                        currentReview?.rating ?? ""
                    }
                    onChange={(e) =>
                        onRatingChange(
                            questionId,
                            e.target.value
                        )
                    }
                    disabled={saving}
                >
                    <option value="">
                        Select
                    </option>

                    {Array.from(
                        { length: 11 },
                        (_, rating) => (
                            <option
                                key={rating}
                                value={rating}
                            >
                                {rating}
                            </option>
                        )
                    )}
                </select>

            </div>


            {/* Accept / Reject */}

            <div className="evaluation-review-decision">

                <button
                    type="button"
                    className={
                        isAccepted
                            ? "evaluation-review-accept active"
                            : "evaluation-review-accept"
                    }
                    onClick={() =>
                        onResultChange(
                            questionId,
                            "okay"
                        )
                    }
                    disabled={saving}
                >
                    ✓ Accept
                </button>

                <button
                    type="button"
                    className={
                        isRejected
                            ? "evaluation-review-reject active"
                            : "evaluation-review-reject"
                    }
                    onClick={() =>
                        onResultChange(
                            questionId,
                            "not_okay"
                        )
                    }
                    disabled={saving}
                >
                    ✕ Reject
                </button>

            </div>


            {/* Comment */}

            <div className="evaluation-review-form-group">

                <label>
                    {isRejected
                        ? `${roleLabel} Comment`
                        : "Comment"}

                    {isRejected && (
                        <span className="required-star">
                            *
                        </span>
                    )}
                </label>

                <textarea
                    value={
                        currentReview?.comment || ""
                    }
                    onChange={(e) =>
                        onCommentChange(
                            questionId,
                            e.target.value
                        )
                    }
                    placeholder={
                        isRejected
                            ? "Reason for rejection..."
                            : "Optional comment..."
                    }
                    disabled={saving}
                    rows="3"
                />

            </div>

        </div>
    );
};

export default CurrentQuestionReview;