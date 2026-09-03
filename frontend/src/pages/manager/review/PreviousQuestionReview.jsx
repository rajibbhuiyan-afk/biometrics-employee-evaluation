const PreviousQuestionReview = ({
    title,
    review,
}) => {
    if (!review) {
        return null;
    }

    return (
        <div className="evaluation-previous-review">

            {/* Rating */}

            <div className="evaluation-previous-review-row">

                <span className="evaluation-review-label">
                    Rating
                </span>

                <strong>
                    {review.rating !== null &&
                    review.rating !== undefined &&
                    review.rating !== ""
                        ? `${review.rating} / 10`
                        : "-"}
                </strong>

            </div>


            {/* Decision */}

            <div className="evaluation-previous-review-row">

                <span className="evaluation-review-label">
                    Decision
                </span>

                <strong
                    className={
                        review.review_result === "okay"
                            ? "review-decision-accepted"
                            : "review-decision-rejected"
                    }
                >
                    {review.review_result === "okay"
                        ? "✓ Accept"
                        : review.review_result === "not_okay"
                        ? "✕ Reject"
                        : "-"}
                </strong>

            </div>


            {/* Comment */}

            {review.comment && (
                <div className="evaluation-previous-review-comment">

                    <span className="evaluation-review-label">
                        Comment
                    </span>

                    <p>
                        {review.comment}
                    </p>

                </div>
            )}

        </div>
    );
};

export default PreviousQuestionReview;