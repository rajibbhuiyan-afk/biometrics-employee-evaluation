import {
    getReviewByQuestion,
} from "./reviewHelpers";

import PreviousQuestionReview from "./PreviousQuestionReview";
import CurrentQuestionReview from "./CurrentQuestionReview";

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

    const managerReview = getReviewByQuestion(
        evaluationReviews,
        questionId,
        "Manager"
    );

    const hrReview = getReviewByQuestion(
        evaluationReviews,
        questionId,
        "HR"
    );

    const managementReview = getReviewByQuestion(
        evaluationReviews,
        questionId,
        "Management"
    );

    const isRequired =
        question?.is_required ||
        question?.required;

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

                {/* ==============================
                    Employee Answer
                ============================== */}

                <div className="evaluation-review-answer-section">

                    <div className="evaluation-review-label">
                        Employee Answer
                    </div>

                    <div className="evaluation-review-answer-box">
                        {answer?.answer !== null &&
                        answer?.answer !== undefined &&
                        String(answer.answer).trim() !== ""
                            ? answer.answer
                            : "-"}
                    </div>

                </div>


                {/* ==============================
                    Performance Rating
                ============================== */}

                <div className="evaluation-review-rating-section">

                    <div className="evaluation-review-label">
                        Performance Rating
                    </div>

                    <div className="evaluation-review-employee-rating">
                        {answer?.rating !== null &&
                        answer?.rating !== undefined &&
                        answer?.rating !== ""
                            ? `${answer.rating} / 10`
                            : "-"}
                    </div>

                </div>

            </div>


            {/* ==================================================
                REVIEW SECTION
            ================================================== */}

            <div className="evaluation-review-panels">

                {/* ==================================================
                    MANAGER
                ================================================== */}

                {(reviewerRole === "Manager" ||
                    reviewerRole === "Management") && (

                    <div className="evaluation-review-panel">

                        <div className="evaluation-review-panel-title">
                            Manager
                        </div>

                        {reviewerRole === "Management" &&
                            managerReview && (

                            <PreviousQuestionReview
                                title="Manager"
                                review={managerReview}
                            />

                        )}

                        {reviewerRole === "Manager" &&
                            canReview && (

                            <CurrentQuestionReview
                                questionId={questionId}
                                reviewerRole="Manager"
                                currentReview={
                                    currentReview
                                }
                                saving={saving}
                                onRatingChange={
                                    onRatingChange
                                }
                                onResultChange={
                                    onResultChange
                                }
                                onCommentChange={
                                    onCommentChange
                                }
                            />

                        )}

                        {reviewerRole === "Manager" &&
                            !canReview &&
                            managerReview && (

                            <PreviousQuestionReview
                                title="Manager"
                                review={managerReview}
                            />

                        )}

                    </div>

                )}


                {/* ==================================================
                    HR
                ================================================== */}

                {(reviewerRole === "HR" ||
                    reviewerRole === "Management") && (

                    <div className="evaluation-review-panel">

                        <div className="evaluation-review-panel-title">
                            HR
                        </div>

                        {reviewerRole === "Management" &&
                            hrReview && (

                            <PreviousQuestionReview
                                title="HR"
                                review={hrReview}
                            />

                        )}

                        {reviewerRole === "HR" &&
                            canReview && (

                            <CurrentQuestionReview
                                questionId={questionId}
                                reviewerRole="HR"
                                currentReview={
                                    currentReview
                                }
                                saving={saving}
                                onRatingChange={
                                    onRatingChange
                                }
                                onResultChange={
                                    onResultChange
                                }
                                onCommentChange={
                                    onCommentChange
                                }
                            />

                        )}

                        {reviewerRole === "HR" &&
                            !canReview &&
                            hrReview && (

                            <PreviousQuestionReview
                                title="HR"
                                review={hrReview}
                            />

                        )}

                    </div>

                )}


                {/* ==================================================
                    MANAGEMENT
                ================================================== */}

                {reviewerRole === "Management" && (

                    <div className="evaluation-review-panel">

                        <div className="evaluation-review-panel-title">
                            Management
                        </div>

                        {managementReview &&
                            !canReview && (

                            <PreviousQuestionReview
                                title="Management"
                                review={
                                    managementReview
                                }
                            />

                        )}

                        {canReview && (

                            <CurrentQuestionReview
                                questionId={questionId}
                                reviewerRole="Management"
                                currentReview={
                                    currentReview
                                }
                                saving={saving}
                                onRatingChange={
                                    onRatingChange
                                }
                                onResultChange={
                                    onResultChange
                                }
                                onCommentChange={
                                    onCommentChange
                                }
                            />

                        )}

                    </div>

                )}

            </div>

        </div>
    );
};

export default QuestionReviewCard;