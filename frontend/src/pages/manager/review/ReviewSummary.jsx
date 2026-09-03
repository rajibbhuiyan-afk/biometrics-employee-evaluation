const ReviewSummary = ({
    reviewerRole,
    currentStageApproved,
    currentOverallReview,
    overallRating,
    overallComment,
    managerOverall,
    hrOverall,
    managementOverall,
}) => {
    const renderOverallReview = (
        title,
        review
    ) => {
        if (!review) {
            return null;
        }

        return (
            <div className="management-form-section">

                <div className="management-form-section-header">
                    <h2>
                        {title} Overall Review
                    </h2>
                </div>


                <div className="evaluation-review-answer">

                    <span className="evaluation-review-label">
                        {title} Overall Rating
                    </span>

                    <p>
                        {review.rating !== null &&
                        review.rating !== undefined &&
                        review.rating !== ""
                            ? `${review.rating} / 10`
                            : "-"}
                    </p>

                </div>


                <div className="evaluation-review-answer">

                    <span className="evaluation-review-label">
                        {title} Overall Comment
                    </span>

                    <p>
                        {review.comment ||
                            "-"}
                    </p>

                </div>


                <div className="evaluation-review-answer">

                    <span className="evaluation-review-label">
                        {title} Decision
                    </span>

                    <p>
                        {review.action ===
                            "approved"
                            ? "✓ Approved"
                            : review.action ===
                                "returned"
                            ? "↩ Returned"
                            : review.action ===
                                "rejected"
                            ? "✕ Rejected"
                            : "-"}
                    </p>

                </div>

            </div>
        );
    };


    return (
        <>

            {/* ==================================================
                Current Role Approved
            ================================================== */}

            {currentStageApproved && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            {reviewerRole} Review
                        </h2>

                    </div>

                    <div className="evaluation-locked-message">

                        This evaluation has already been
                        approved by {reviewerRole}.
                        You can view the review data,
                        but cannot modify anything.

                    </div>


                    <div className="evaluation-review-answer">

                        <span className="evaluation-review-label">
                            Overall {reviewerRole} Rating
                        </span>

                        <p>
                            {currentOverallReview?.rating !==
                                null &&
                            currentOverallReview?.rating !==
                                undefined &&
                            currentOverallReview?.rating !==
                                ""
                                ? `${currentOverallReview.rating} / 10`
                                : overallRating !==
                                      null &&
                                  overallRating !==
                                      undefined &&
                                  overallRating !==
                                      ""
                                ? `${overallRating} / 10`
                                : "-"}
                        </p>

                    </div>


                    <div className="evaluation-review-answer">

                        <span className="evaluation-review-label">
                            Overall {reviewerRole} Comment
                        </span>

                        <p>
                            {currentOverallReview?.comment ||
                                overallComment ||
                                "-"}
                        </p>

                    </div>

                </div>
            )}


            {/* ==================================================
                Management sees Manager + HR
            ================================================== */}

            {reviewerRole ===
                "Management" && (
                <>

                    {renderOverallReview(
                        "Manager",
                        managerOverall
                    )}

                    {renderOverallReview(
                        "HR",
                        hrOverall
                    )}

                    {currentStageApproved &&
                        renderOverallReview(
                            "Management",
                            managementOverall
                        )}

                </>
            )}

        </>
    );
};

export default ReviewSummary;