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

    const [autoSaved, setAutoSaved] = useState(false);

    // ==========================================================
    // Reviewer Role
    // ==========================================================

    const reviewerRole = detectReviewerRole();

    const roleLabel = getRoleLabel(
        reviewerRole
    );

    // ==========================================================
    // Draft Storage Key
    // ==========================================================

    const draftStorageKey =
        `evaluation-review-draft-${id}-${reviewerRole}`;

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

            // ==================================================
            // Existing Backend Question Reviews
            // ==================================================

            const existingReviews = {};

            if (Array.isArray(data?.reviews)) {
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
                                review.rating ?? "",

                            comment:
                                review.comment || "",
                        };
                    }
                });
            }

            // ==================================================
            // Restore Local Draft
            // ==================================================

            let finalReviews = {
                ...existingReviews,
            };

            try {
                const savedDraft =
                    localStorage.getItem(
                        draftStorageKey
                    );

                if (savedDraft) {
                    const parsedDraft =
                        JSON.parse(savedDraft);

                    if (
                        parsedDraft?.reviews &&
                        typeof parsedDraft.reviews ===
                            "object"
                    ) {
                        finalReviews = {
                            ...existingReviews,
                            ...parsedDraft.reviews,
                        };
                    }
                }
            } catch (storageError) {
                console.warn(
                    "Unable to restore review draft:",
                    storageError
                );
            }

            setReviews(finalReviews);

            // ==================================================
            // Existing Overall Review
            // ==================================================

            const currentOverall =
                getOverallReviewByRole(
                    data?.reviews,
                    reviewerRole
                );

            let stageOverallRating =
                currentOverall?.rating ?? "";

            let stageOverallComment =
                currentOverall?.comment || "";

            // ==================================================
            // Fallback Overall Rating
            // ==================================================

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

            // ==================================================
            // Restore Overall Draft
            // ==================================================

            try {
                const savedDraft =
                    localStorage.getItem(
                        draftStorageKey
                    );

                if (savedDraft) {
                    const parsedDraft =
                        JSON.parse(savedDraft);

                    if (
                        parsedDraft?.overallRating !==
                            undefined &&
                        parsedDraft?.overallRating !==
                            null
                    ) {
                        stageOverallRating =
                            parsedDraft.overallRating;
                    }

                    if (
                        parsedDraft?.overallComment !==
                            undefined &&
                        parsedDraft?.overallComment !==
                            null
                    ) {
                        stageOverallComment =
                            parsedDraft.overallComment;
                    }
                }
            } catch (storageError) {
                console.warn(
                    "Unable to restore overall draft:",
                    storageError
                );
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
    // Can Current Role Review
    // ==========================================================

    const canCurrentRoleReview = () => {
        if (!evaluation) {
            return false;
        }

        // ------------------------------------------------------
        // Manager
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // HR
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // Management
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // Manager
        // ------------------------------------------------------

        if (
            reviewerRole === "Manager"
        ) {
            return (
                evaluation.status ===
                "manager_approved"
            );
        }

        // ------------------------------------------------------
        // HR
        // ------------------------------------------------------

        if (
            reviewerRole === "HR"
        ) {
            return (
                evaluation.status ===
                "hr_approved"
            );
        }

        // ------------------------------------------------------
        // Management
        // ------------------------------------------------------

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
    // Update Review
    // ==========================================================

    const updateReview = (
        questionId,
        field,
        value
    ) => {
        if (!canReview) {
            return;
        }

        setReviews((prev) => ({
            ...prev,

            [questionId]: {
                ...(prev[questionId] || {}),
                [field]: value,
            },
        }));
    };

    // ==========================================================
    // Set Review Result
    // ==========================================================

    const setReviewResult = (
        questionId,
        result
    ) => {
        if (!canReview) {
            return;
        }

        setReviews((prev) => {
            const previous =
                prev[questionId] || {};

            // ==================================================
            // ACCEPT
            //
            // Question immediately becomes reviewed.
            // Rating can then be selected.
            // ==================================================

            if (result === "okay") {
                return {
                    ...prev,

                    [questionId]: {
                        ...previous,

                        review_result:
                            "okay",

                        comment: "",
                    },
                };
            }

            // ==================================================
            // REJECT
            //
            // Question immediately becomes reviewed.
            // Comment can then be entered.
            // ==================================================

            if (result === "not_okay") {
                return {
                    ...prev,

                    [questionId]: {
                        ...previous,

                        review_result:
                            "not_okay",

                        rating: "",
                    },
                };
            }

            // ==================================================
            // IGNORE
            //
            // Question immediately becomes reviewed.
            // No rating/comment required.
            // ==================================================

            if (result === "ignore") {
                return {
                    ...prev,

                    [questionId]: {
                        ...previous,

                        review_result:
                            "ignore",

                        rating: "",

                        comment: "",
                    },
                };
            }

            return {
                ...prev,

                [questionId]: {
                    ...previous,

                    review_result:
                        result,
                },
            };
        });
    };

    // ==========================================================
    // Auto Save Draft
    // ==========================================================

    useEffect(() => {
        if (
            loading ||
            !evaluation ||
            !canReview
        ) {
            return;
        }

        const timer =
            setTimeout(() => {
                try {
                    const draft = {
                        reviews,
                        overallRating,
                        overallComment,
                        savedAt:
                            new Date().toISOString(),
                    };

                    localStorage.setItem(
                        draftStorageKey,
                        JSON.stringify(draft)
                    );

                    setAutoSaved(true);

                    setTimeout(() => {
                        setAutoSaved(false);
                    }, 1500);
                } catch (storageError) {
                    console.error(
                        "Failed to auto-save review draft:",
                        storageError
                    );
                }
            }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [
        reviews,
        overallRating,
        overallComment,
        loading,
        evaluation,
        canReview,
        draftStorageKey,
    ]);

    // ==========================================================
    // Question Reviewed
    // ==========================================================
    //
    // IMPORTANT:
    //
    // Accept / Reject / Ignore
    // যেকোনো একটি select করলেই question reviewed.
    //
    // Accept-এর rating এবং Reject-এর comment
    // final validation-এর সময় check হবে.
    //
    // ==========================================================

    const isQuestionReviewed = (review) => {
        return Boolean(
            review?.review_result
        );
    };

    // ==========================================================
    // All Questions Reviewed
    // ==========================================================

    const allQuestionsReviewed = () => {
        if (
            questions.length === 0
        ) {
            return false;
        }

        return questions.every(
            (answer) => {
                const review =
                    reviews[
                        answer.question_id
                    ] || {};

                return isQuestionReviewed(
                    review
                );
            }
        );
    };

    // ==========================================================
    // Validate Reviews
    // ==========================================================

    const validateReviews = () => {
        const errors = [];

        questions.forEach(
            (answer, index) => {
                const questionId =
                    answer.question_id;

                const review =
                    reviews[
                        questionId
                    ] || {};

                const result =
                    review.review_result;

                // ------------------------------------------------
                // No result
                // ------------------------------------------------

                if (!result) {
                    errors.push(
                        `Question ${index + 1}: Please select Accept, Reject, or Ignore.`
                    );

                    return;
                }

                // ------------------------------------------------
                // Ignore
                //
                // Nothing else is required.
                // ------------------------------------------------

                if (
                    result === "ignore"
                ) {
                    return;
                }

                // ------------------------------------------------
                // Accept
                //
                // Rating is required.
                // ------------------------------------------------

                if (
                    result === "okay"
                ) {
                    if (
                        review.rating === "" ||
                        review.rating === null ||
                        review.rating === undefined
                    ) {
                        errors.push(
                            `Question ${index + 1}: Please provide a review rating.`
                        );
                    }

                    return;
                }

                // ------------------------------------------------
                // Reject
                //
                // Comment is required.
                // ------------------------------------------------

                if (
                    result === "not_okay"
                ) {
                    if (
                        !review.comment ||
                        !review.comment.trim()
                    ) {
                        errors.push(
                            `Question ${index + 1}: Please provide a rejection comment.`
                        );
                    }

                    return;
                }
            }
        );

        // ======================================================
        // Overall Rating
        // ======================================================

        if (
            overallRating === "" ||
            overallRating === null ||
            overallRating === undefined
        ) {
            errors.push(
                "Please provide the overall rating."
            );
        }

        return errors;
    };

    // ==========================================================
    // Submit Review
    // ==========================================================

    const handleReviewAction = async (
        action
    ) => {
        setError("");

        // ======================================================
        // Validate Question Reviews
        // ======================================================

        const validationErrors =
            validateReviews();

        if (
            validationErrors.length > 0
        ) {
            setError(
                validationErrors.join("\n")
            );

            return;
        }

        // ======================================================
        // Validate All Questions
        // ======================================================

        if (
            !allQuestionsReviewed()
        ) {
            setError(
                `Please Accept, Reject or Ignore all questions before submitting the ${roleLabel} review.`
            );

            return;
        }

        try {
            setSaving(true);

            // ==================================================
            // Question Reviews
            // ==================================================

            const questionReviews =
                questions.map(
                    (answer) => {
                        const questionId =
                            answer.question_id;

                        const review =
                            reviews[
                                questionId
                            ] || {};

                        const isIgnored =
                            review.review_result ===
                            "ignore";

                        return {
                            question_id:
                                Number(
                                    questionId
                                ),

                            review_result:
                                review.review_result,

                            rating:
                                isIgnored
                                    ? null
                                    : review.rating !==
                                          "" &&
                                      review.rating !==
                                          null &&
                                      review.rating !==
                                          undefined
                                    ? Number(
                                          review.rating
                                      )
                                    : null,

                            comment:
                                String(
                                    review.comment ||
                                        ""
                                ).trim() ||
                                null,
                        };
                    }
                );

            // ==================================================
            // Payload
            // ==================================================

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

            // ==================================================
            // Submit To Backend
            // ==================================================

            await api.post(
                "/evaluation-reviews",
                payload
            );

            // ==================================================
            // Clear Local Draft
            // ==================================================

            try {
                localStorage.removeItem(
                    draftStorageKey
                );
            } catch (storageError) {
                console.warn(
                    "Failed to clear review draft:",
                    storageError
                );
            }

            // ==================================================
            // Redirect
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
    // Error Without Evaluation
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
    // Evaluation Not Found
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
    // Previous Overall Reviews
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
    // Current Question Review Status
    // ==========================================================

    const questionsReviewed =
        allQuestionsReviewed();

    // ==========================================================
    // Render
    // ==========================================================

    return (
        <div className="management-page">

            {/* ==================================================
                Page Header
            ================================================== */}

            <PageHeader
                title={`${roleLabel} Review Evaluation`}
                subtitle={
                    `Review employee self-evaluation as ${roleLabel}`
                }
            />

            {/* ==================================================
                Auto Save Status
            ================================================== */}

            {canReview &&
                autoSaved && (
                    <div className="evaluation-auto-save-status">
                        ✓ Draft saved automatically
                    </div>
                )}

            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}

            {/* ==================================================
                Employee Information
            ================================================== */}

            <EmployeeInformation
                evaluation={evaluation}
                reviewerRole={reviewerRole}
            />

            {/* ==================================================
                Employee Comment
            ================================================== */}

            <EmployeeComment
                comment={
                    evaluation.employee_comment
                }
            />

            {/* ==================================================
                Evaluation Questions
            ================================================== */}

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

            {/* ==================================================
                Overall Review
            ================================================== */}

            <OverallReviewForm
                reviewerRole={
                    reviewerRole
                }
                canReview={
                    canReview
                }
                saving={
                    saving
                }
                overallRating={
                    overallRating
                }
                overallComment={
                    overallComment
                }
                allQuestionsReviewed={
                    questionsReviewed
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

            {/* ==================================================
                Review Summary
            ================================================== */}

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

            {/* ==================================================
                Back Button
            ================================================== */}

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
