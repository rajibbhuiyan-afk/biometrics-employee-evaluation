import QuestionReviewCard from "./QuestionReviewCard";

const EvaluationQuestions = ({
    questions,
    reviews,
    reviewerRole,
    canReview,
    saving,
    evaluationReviews,
    onRatingChange,
    onResultChange,
    onCommentChange,
}) => {
    return (
        <div className="management-form-section">

            <div className="management-form-section-header">
                <h2>
                    Evaluation Questions
                </h2>
            </div>

            <div className="evaluation-review-list">

                {questions.length === 0 ? (
                    <p>
                        No questions found.
                    </p>
                ) : (
                    questions.map(
                        (
                            answer,
                            index
                        ) => (
                            <QuestionReviewCard
                                key={
                                    answer.question_id
                                }
                                answer={
                                    answer
                                }
                                index={
                                    index
                                }
                                currentReview={
                                    reviews[
                                        answer.question_id
                                    ] || {}
                                }
                                reviewerRole={
                                    reviewerRole
                                }
                                canReview={
                                    canReview
                                }
                                saving={
                                    saving
                                }
                                evaluationReviews={
                                    evaluationReviews
                                }
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
                        )
                    )
                )}

            </div>

        </div>
    );
};

export default EvaluationQuestions;