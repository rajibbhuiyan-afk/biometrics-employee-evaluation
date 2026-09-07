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

    const reviewResult =
        currentReview?.review_result || "";

    const isAccepted =
        reviewResult === "okay";

    const isRejected =
        reviewResult === "not_okay";

    const isIgnored =
        reviewResult === "ignored";

    const ratingLabels = {
        0: "0 - Not Rated",
        1: "1 - Very Poor",
        2: "2 - Poor",
        3: "3 - Needs Improvement",
        4: "4 - Below Expectations",
        5: "5 - Meets Expectations",
        6: "6 - Satisfactory",
        7: "7 - Good",
        8: "8 - Very Good",
        9: "9 - Excellent",
        10: "10 - Outstanding",
    };

    return (
        <div className="evaluation-current-review">

            {/* ==================================================
                Accept / Reject / Ignore
            ================================================== */}

            <div className="evaluation-review-decision">

                {/* Accept */}
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

                {/* Reject */}
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

                {/* Ignore */}
                <button
                    type="button"
                    className={
                        isIgnored
                            ? "evaluation-review-ignore active"
                            : "evaluation-review-ignore"
                    }
                    onClick={() =>
                        onResultChange(
                            questionId,
                            "ignored"
                        )
                    }
                    disabled={saving}
                >
                    — Ignore
                </button>

            </div>


            {/* ==================================================
                Accept -> Rating
            ================================================== */}

            {isAccepted && (
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
                            Select Rating
                        </option>

                        {Array.from(
                            { length: 11 },
                            (_, index) => index
                        ).map((rating) => (
                            <option
                                key={rating}
                                value={rating}
                            >
                                {ratingLabels[rating]}
                            </option>
                        ))}
                    </select>

                </div>
            )}


            {/* ==================================================
                Reject -> Comment
            ================================================== */}

            {isRejected && (
                <div className="evaluation-review-form-group">

                    <label>
                        {roleLabel} Comment
                        <span className="required-star">
                            *
                        </span>
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
                        placeholder="Reason for rejection..."
                        disabled={saving}
                        rows="3"
                    />

                </div>
            )}


            {/* ==================================================
                Ignore -> Nothing
            ================================================== */}

            {isIgnored && (
                <div className="evaluation-review-ignored-message">
                    This question is ignored.
                </div>
            )}

        </div>
    );
};

export default CurrentQuestionReview;
