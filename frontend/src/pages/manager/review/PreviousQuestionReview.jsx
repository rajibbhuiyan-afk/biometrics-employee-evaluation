const PreviousQuestionReview = ({
    title,
    review,
}) => {
    if (!review) {
        return null;
    }

    const getRatingLabel = (rating) => {
        const labels = {
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

        return labels[rating] ?? `${rating}`;
    };

    const hasRating =
        review.rating !== null &&
        review.rating !== undefined &&
        review.rating !== "";

    return (
        <div className="evaluation-previous-review">

            {/* Rating */}
            <div className="evaluation-previous-review-row">

                <span className="evaluation-review-label">
                    Rating
                </span>

                <strong>
                    {hasRating
                        ? getRatingLabel(
                              Number(review.rating)
                          )
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
                            : review.review_result === "not_okay"
                            ? "review-decision-rejected"
                            : ""
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