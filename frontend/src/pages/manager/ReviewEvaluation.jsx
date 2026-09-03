import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

import EmployeeInformation from "./review/EmployeeInformation";
import EmployeeComment from "./review/EmployeeComment";
import EvaluationQuestions from "./review/EvaluationQuestions";
import OverallReviewForm from "./review/OverallReviewForm";
import ReviewSummary from "./review/ReviewSummary";

import {
    detectReviewerRole,
    getRoleLabel,
    getReviewByQuestion,
    getOverallReviewByRole,
} from "./review/reviewHelpers";

const ReviewEvaluation = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ==========================================================
    // State
    // ==========================================================

    const [evaluation, setEvaluation] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [reviews, setReviews] = useState({});

    const [overallRating, setOverallRating] = useState("");
    const [overallComment, setOverallComment] = useState("");

    // ==========================================================
    // Reviewer Role
    // ==========================================================

    const reviewerRole = detectReviewerRole();

    const roleLabel = getRoleLabel(reviewerRole);

    // ==========================================================
    // Fetch Evaluation
    // ==========================================================

    useEffect(() => {
        fetchEvaluation();
    }, [id]);

    const fetchEvaluation = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/evaluations/${id}`
            );

            const data =
                response.data?.data ||
                response.data;

            setEvaluation(data);

            // --------------------------------------------------
            // Question Reviews
            // --------------------------------------------------

            const existingReviews = {};

            if (
                Array.isArray(data?.reviews)
            ) {
                data.reviews.forEach((review) => {
                    if (
                        review.question_id !== null &&
                        review.question_id !== undefined &&
                        String(
                            review.reviewer_role
                        ).toLowerCase() ===
                            reviewerRole.toLowerCase()
                    ) {
                        existingReviews[
                            review.question_id
                        ] = {
                            review_result:
                                review.review_result ||
                                "",

                            rating:
                                review.rating ??
                                "",

                            comment:
                                review.comment ||
                                "",
                        };
                    }
                });
            }

            setReviews(existingReviews);

            // --------------------------------------------------
            // Overall Review
            // --------------------------------------------------

            const currentOverall =
                getOverallReviewByRole(
                    data?.reviews,
                    reviewerRole
                );

            let stageOverallRating =
                currentOverall?.rating ?? "";

            let stageOverallComment =
                currentOverall?.comment || "";

            // --------------------------------------------------
            // Fallback
            // --------------------------------------------------

            if (
                stageOverallRating === "" ||
                stageOverallRating === null ||
                stageOverallRating === undefined
            ) {
                if (
                    reviewerRole === "Manager"
                ) {
                    stageOverallRating =
                        data?.manager_overall_rating ??
                        "";
                }

                if (
                    reviewerRole === "HR"
                ) {
                    stageOverallRating =
                        data?.hr_overall_rating ??
                        "";
                }

                if (
                    reviewerRole === "Management"
                ) {
                    stageOverallRating =
                        data?.management_overall_rating ??
                        "";
                }
            }

            setOverallRating(
                stageOverallRating
            );

            setOverallComment(
                stageOverallComment
            );

        } catch (err) {
            console.error(
                "Failed to load evaluation:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to load evaluation."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // Questions
    // ==========================================================

    const questions =
        Array.isArray(evaluation?.answers)
            ? evaluation.answers
            : [];

    // ==========================================================
    // Review State
    // ==========================================================

    const updateReview = (
        questionId,
        field,
        value
    ) => {
        setReviews((prev) => ({
            ...prev,

            [questionId]: {
                ...(prev[questionId] || {}),
                [field]: value,
            },
        }));
    };

    const setReviewResult = (
        questionId,
        result
    ) => {
        updateReview(
            questionId,
            "review_result",
            result
        );
    };

    // ==========================================================
    // Can Review
    // ==========================================================

    const canCurrentRoleReview = () => {
        if (!evaluation) {
            return false;
        }

        if (
            reviewerRole === "Manager"
        ) {
            return [
                "submitted",
                "manager_returned",
                "manager_rejected",
            ].includes(
                evaluation.status
            );
        }

        if (
            reviewerRole === "HR"
        ) {
            return [
                "manager_approved",
                "hr_returned",
                "hr_rejected",
            ].includes(
                evaluation.status
            );
        }

        if (
            reviewerRole === "Management"
        ) {
            return [
                "hr_approved",
                "management_returned",
                "management_rejected",
            ].includes(
                evaluation.status
            );
        }

        return false;
    };

    const canReview =
        canCurrentRoleReview();

    // ==========================================================
    // Current Stage Approved
    // ==========================================================

    const isCurrentStageApproved = () => {
        if (!evaluation) {
            return false;
        }

        if (
            reviewerRole === "Manager"
        ) {
            return (
                evaluation.status ===
                "manager_approved"
            );
        }

        if (
            reviewerRole === "HR"
        ) {
            return (
                evaluation.status ===
                "hr_approved"
            );
        }

        if (
            reviewerRole === "Management"
        ) {
            return (
                evaluation.status ===
                "completed"
            );
        }

        return false;
    };

    const currentStageApproved =
        isCurrentStageApproved();

    // ==========================================================
    // Validation
    // ==========================================================

    const isQuestionReviewed = (
        questionId
    ) => {
        const review =
            reviews[questionId];

        return (
            review &&
            review.review_result &&
            review.rating !== "" &&
            review.rating !== null &&
            review.rating !== undefined
        );
    };

    const allQuestionsReviewed = () => {
        if (
            questions.length === 0
        ) {
            return false;
        }

        return questions.every(
            (answer) =>
                isQuestionReviewed(
                    answer.question_id
                )
        );
    };

    const validateReviews = () => {
        if (
            questions.length === 0
        ) {
            return "No evaluation questions found.";
        }

        for (
            const answer of questions
        ) {
            const questionId =
                answer.question_id;

            const review =
                reviews[questionId];

            if (
                !review ||
                !review.review_result
            ) {
                return `Please Accept or Reject Question ${questionId}.`;
            }

            if (
                review.rating === "" ||
                review.rating === null ||
                review.rating === undefined
            ) {
                return `Please provide a rating for Question ${questionId}.`;
            }

            const rating =
                Number(review.rating);

            if (
                Number.isNaN(rating) ||
                rating < 0 ||
                rating > 10
            ) {
                return `Rating for Question ${questionId} must be between 0 and 10.`;
            }

            if (
                review.review_result ===
                    "not_okay" &&
                !String(
                    review.comment || ""
                ).trim()
            ) {
                return `Please provide a comment for rejected Question ${questionId}.`;
            }
        }

        if (
            overallRating === "" ||
            overallRating === null ||
            overallRating === undefined
        ) {
            return `Please provide the overall ${roleLabel.toLowerCase()} rating.`;
        }

        const overall =
            Number(overallRating);

        if (
            Number.isNaN(overall) ||
            overall < 0 ||
            overall > 10
        ) {
            return "Overall rating must be between 0 and 10.";
        }

        return null;
    };

    // ==========================================================
    // Submit Review
    // ==========================================================

    const handleReviewAction = async (
        action
    ) => {
        setError("");

        const validationError =
            validateReviews();

        if (validationError) {
            setError(
                validationError
            );

            return;
        }

        if (
            !allQuestionsReviewed()
        ) {
            setError(
                `Please Accept or Reject all questions before submitting the ${roleLabel} review.`
            );

            return;
        }

        try {
            setSaving(true);

            const questionReviews =
                questions.map(
                    (answer) => {
                        const questionId =
                            answer.question_id;

                        const review =
                            reviews[
                                questionId
                            ];

                        return {
                            question_id:
                                Number(
                                    questionId
                                ),

                            review_result:
                                review.review_result,

                            rating:
                                Number(
                                    review.rating
                                ),

                            comment:
                                String(
                                    review.comment ||
                                        ""
                                ).trim() ||
                                null,
                        };
                    }
                );

            const payload = {
                evaluation_id:
                    Number(id),

                reviews:
                    questionReviews,

                overall_rating:
                    Number(
                        overallRating
                    ),

                overall_comment:
                    String(
                        overallComment ||
                            ""
                    ).trim() ||
                    null,

                action,

                reviewed_at:
                    new Date().toISOString(),
            };

            console.log(
                `${reviewerRole} Review Payload:`,
                payload
            );

            await api.post(
                "/evaluation-reviews",
                payload
            );

            // ==================================================
            // Correct Redirect
            // ==================================================

            if (
                reviewerRole === "Manager"
            ) {
                navigate(
                    "/management/manager/reviews"
                );

                return;
            }

            if (
                reviewerRole === "HR"
            ) {
                navigate(
                    "/management/hr/reviews"
                );

                return;
            }

            if (
                reviewerRole === "Management"
            ) {
                navigate(
                    "/management"
                );

                return;
            }

        } catch (err) {
            console.error(
                "Failed to submit review:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to submit evaluation review."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {
        return (
            <div className="management-page">

                <PageHeader
                    title={`${roleLabel} Review Evaluation`}
                />

                <div className="management-form-section">
                    <p>
                        Loading evaluation...
                    </p>
                </div>

            </div>
        );
    }

    // ==========================================================
    // Error
    // ==========================================================

    if (
        error &&
        !evaluation
    ) {
        return (
            <div className="management-page">

                <PageHeader
                    title={`${roleLabel} Review Evaluation`}
                />

                <div className="management-form-section">

                    <div className="management-error">
                        {error}
                    </div>

                    <button
                        type="button"
                        className="evaluation-back-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        ← Back
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Not Found
    // ==========================================================

    if (!evaluation) {
        return (
            <div className="management-page">

                <PageHeader
                    title={`${roleLabel} Review Evaluation`}
                />

                <div className="management-form-section">

                    <p>
                        Evaluation not found.
                    </p>

                    <button
                        type="button"
                        className="evaluation-back-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        ← Back
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Previous Reviews
    // ==========================================================

    const managerOverall =
        getOverallReviewByRole(
            evaluation.reviews,
            "Manager"
        );

    const hrOverall =
        getOverallReviewByRole(
            evaluation.reviews,
            "HR"
        );

    const managementOverall =
        getOverallReviewByRole(
            evaluation.reviews,
            "Management"
        );

    // ==========================================================
    // Render
    // ==========================================================

    return (
        <div className="management-page">

            <PageHeader
                title={`${roleLabel} Review Evaluation`}
                subtitle={`Review employee self-evaluation as ${roleLabel}`}
            />

            {/* Error */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}

            {/* Employee Information */}

            <EmployeeInformation
                evaluation={evaluation}
            />

            {/* Employee Comment */}

            <EmployeeComment
                comment={
                    evaluation.employee_comment
                }
            />

            {/* Questions */}

            <EvaluationQuestions
                questions={questions}
                reviews={reviews}
                reviewerRole={reviewerRole}
                canReview={canReview}
                saving={saving}
                evaluationReviews={
                    evaluation.reviews
                }
                onRatingChange={(
                    questionId,
                    value
                ) =>
                    updateReview(
                        questionId,
                        "rating",
                        value
                    )
                }
                onResultChange={
                    setReviewResult
                }
                onCommentChange={(
                    questionId,
                    value
                ) =>
                    updateReview(
                        questionId,
                        "comment",
                        value
                    )
                }
            />

            {/* Current Overall Review */}

            <OverallReviewForm
                reviewerRole={reviewerRole}
                canReview={canReview}
                saving={saving}
                overallRating={
                    overallRating
                }
                overallComment={
                    overallComment
                }
                allQuestionsReviewed={
                    allQuestionsReviewed()
                }
                onRatingChange={
                    setOverallRating
                }
                onCommentChange={
                    setOverallComment
                }
                onAction={
                    handleReviewAction
                }
            />

            {/* Review Summary */}

            <ReviewSummary
                reviewerRole={
                    reviewerRole
                }
                currentStageApproved={
                    currentStageApproved
                }
                currentOverallReview={
                    getOverallReviewByRole(
                        evaluation.reviews,
                        reviewerRole
                    )
                }
                overallRating={
                    overallRating
                }
                overallComment={
                    overallComment
                }
                managerOverall={
                    managerOverall
                }
                hrOverall={
                    hrOverall
                }
                managementOverall={
                    managementOverall
                }
            />

            {/* Back */}

            <div className="management-form-actions">

                <button
                    type="button"
                    className="evaluation-back-button"
                    onClick={() =>
                        navigate(-1)
                    }
                    disabled={saving}
                >
                    ← Back
                </button>

            </div>

        </div>
    );
};

export default ReviewEvaluation;