import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

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

    /*
    |--------------------------------------------------------------------------
    | Current reviewer's question-wise reviews
    |--------------------------------------------------------------------------
    |
    | Manager      => Manager review
    | HR           => HR review
    | Management   => Management review
    |
    */

    const [reviews, setReviews] = useState({});

    const [overallRating, setOverallRating] = useState("");
    const [overallComment, setOverallComment] = useState("");

    // ==========================================================
    // Detect Reviewer Role
    // ==========================================================

    const detectReviewerRole = () => {
        const path = window.location.pathname.toLowerCase();

        /*
        |--------------------------------------------------------------------------
        | HR
        |--------------------------------------------------------------------------
        */

        if (path.includes("/hr/")) {
            return "HR";
        }

        /*
        |--------------------------------------------------------------------------
        | Management
        |--------------------------------------------------------------------------
        */

        if (
            path.includes("/management/management/") ||
            path.includes("/management/review/") ||
            path.includes("/management/evaluations/")
        ) {
            return "Management";
        }

        /*
        |--------------------------------------------------------------------------
        | Manager
        |--------------------------------------------------------------------------
        */

        return "Manager";
    };

    const reviewerRole = detectReviewerRole();

    // ==========================================================
    // Role Label
    // ==========================================================

    const getRoleLabel = () => {
        if (reviewerRole === "HR") {
            return "HR";
        }

        if (reviewerRole === "Management") {
            return "Management";
        }

        return "Manager";
    };

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

            // ======================================================
            // Current Role Reviews
            // ======================================================

            const existingReviews = {};

            if (
                data?.reviews &&
                Array.isArray(data.reviews)
            ) {
                data.reviews.forEach((review) => {
                    if (
                        review.question_id !== null &&
                        review.question_id !== undefined &&
                        String(review.reviewer_role).toLowerCase() ===
                            reviewerRole.toLowerCase()
                    ) {
                        existingReviews[
                            review.question_id
                        ] = {
                            review_result:
                                review.review_result ||
                                "",

                            rating:
                                review.rating !== null &&
                                review.rating !== undefined
                                    ? review.rating
                                    : "",

                            comment:
                                review.comment || "",
                        };
                    }
                });
            }

            setReviews(existingReviews);

            // ======================================================
            // Current Role Overall Review
            // ======================================================

            let stageOverallRating = "";
            let stageOverallComment = "";

            if (
                data?.reviews &&
                Array.isArray(data.reviews)
            ) {
                const stageReview =
                    data.reviews
                        .filter(
                            (review) =>
                                String(
                                    review.reviewer_role
                                ).toLowerCase() ===
                                    reviewerRole.toLowerCase() &&
                                (
                                    review.question_id ===
                                        null ||
                                    review.question_id ===
                                        undefined
                                )
                        )
                        .sort(
                            (a, b) =>
                                new Date(
                                    b.reviewed_at
                                ) -
                                new Date(
                                    a.reviewed_at
                                )
                        )[0];

                if (stageReview) {
                    stageOverallRating =
                        stageReview.rating ?? "";

                    stageOverallComment =
                        stageReview.comment || "";
                }
            }

            // ======================================================
            // Fallback Overall Rating
            // ======================================================

            if (
                stageOverallRating === "" ||
                stageOverallRating === null ||
                stageOverallRating === undefined
            ) {
                if (reviewerRole === "Manager") {
                    stageOverallRating =
                        data?.manager_overall_rating ??
                        "";
                }

                if (reviewerRole === "HR") {
                    stageOverallRating =
                        data?.hr_overall_rating ??
                        "";
                }

                if (reviewerRole === "Management") {
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

    const getQuestions = () => {
        if (
            !evaluation ||
            !Array.isArray(
                evaluation.answers
            )
        ) {
            return [];
        }

        return evaluation.answers;
    };

    // ==========================================================
    // Update Review
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

    // ==========================================================
    // Accept / Reject
    // ==========================================================

    const setReviewResult = (
        questionId,
        result
    ) => {
        setReviews((prev) => ({
            ...prev,

            [questionId]: {
                ...(prev[questionId] || {}),
                review_result: result,
            },
        }));
    };

    // ==========================================================
    // Rating
    // ==========================================================

    const handleRatingChange = (
        questionId,
        value
    ) => {
        updateReview(
            questionId,
            "rating",
            value
        );
    };

    // ==========================================================
    // Comment
    // ==========================================================

    const handleCommentChange = (
        questionId,
        value
    ) => {
        updateReview(
            questionId,
            "comment",
            value
        );
    };

    // ==========================================================
    // Question Reviewed
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

    // ==========================================================
    // All Questions Reviewed
    // ==========================================================

    const allQuestionsReviewed = () => {
        const questions =
            getQuestions();

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

    // ==========================================================
    // Validation
    // ==========================================================

    const validateReviews = () => {
        const questions =
            getQuestions();

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

            // --------------------------------------------------
            // Accept / Reject required
            // --------------------------------------------------

            if (
                !review ||
                !review.review_result
            ) {
                return `Please Accept or Reject Question ${questionId}.`;
            }

            // --------------------------------------------------
            // Rating required
            // --------------------------------------------------

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

            // --------------------------------------------------
            // Rejected question requires comment
            // --------------------------------------------------

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

        // ======================================================
        // Overall Rating
        // ======================================================

        if (
            overallRating === "" ||
            overallRating === null ||
            overallRating === undefined
        ) {
            return `Please provide the overall ${getRoleLabel().toLowerCase()} rating.`;
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
    // Can Current Role Review?
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

    // ==========================================================
    // Get Review By Role
    // ==========================================================

    const getReview = (
        questionId,
        role
    ) => {
        if (
            !evaluation?.reviews ||
            !Array.isArray(
                evaluation.reviews
            )
        ) {
            return null;
        }

        const roleReviews =
            evaluation.reviews
                .filter(
                    (review) =>
                        Number(
                            review.question_id
                        ) ===
                            Number(questionId) &&
                        String(
                            review.reviewer_role
                        ).toLowerCase() ===
                            role.toLowerCase()
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.reviewed_at
                        ) -
                        new Date(
                            a.reviewed_at
                        )
                );

        return (
            roleReviews[0] ||
            null
        );
    };

    // ==========================================================
    // Get Overall Review By Role
    // ==========================================================

    const getOverallReview = (
        role
    ) => {
        if (
            !evaluation?.reviews ||
            !Array.isArray(
                evaluation.reviews
            )
        ) {
            return null;
        }

        const stageReviews =
            evaluation.reviews
                .filter(
                    (review) =>
                        String(
                            review.reviewer_role
                        ).toLowerCase() ===
                            role.toLowerCase() &&
                        (
                            review.question_id ===
                                null ||
                            review.question_id ===
                                undefined
                        )
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.reviewed_at
                        ) -
                        new Date(
                            a.reviewed_at
                        )
                );

        return (
            stageReviews[0] ||
            null
        );
    };

    // ==========================================================
    // Review Action
    // ==========================================================

    const handleReviewAction = async (
        action
    ) => {
        setError("");

        // ------------------------------------------------------
        // Validate
        // ------------------------------------------------------

        const validationError =
            validateReviews();

        if (validationError) {
            setError(
                validationError
            );

            return;
        }

        // ------------------------------------------------------
        // All Questions Reviewed
        // ------------------------------------------------------

        if (
            !allQuestionsReviewed()
        ) {
            setError(
                `Please Accept or Reject all questions before submitting the ${getRoleLabel()} review.`
            );

            return;
        }

        try {
            setSaving(true);

            // ==================================================
            // Question Reviews
            // ==================================================

            const questionReviews =
                getQuestions().map(
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
            // Submit
            // ==================================================

            await api.post(
                "/evaluation-reviews",
                payload
            );

            // ==================================================
            // Redirect
            // ==================================================

            if (
                reviewerRole === "Manager"
            ) {
                navigate(
                    "/manager/evaluations"
                );

                return;
            }

            if (
                reviewerRole === "HR"
            ) {
                navigate(
                    "/hr/evaluations"
                );

                return;
            }

            if (
                reviewerRole === "Management"
            ) {
                navigate(
                    "/management/evaluations"
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
    // Status Class
    // ==========================================================

    const getStatusClass = (
        status
    ) => {
        if (!status) {
            return "";
        }

        return `evaluation-status evaluation-status-${status
            .replaceAll("_", "-")
            .toLowerCase()}`;
    };

    // ==========================================================
    // Format Status
    // ==========================================================

    const formatStatus = (
        status
    ) => {
        if (!status) {
            return "-";
        }

        return status
            .replaceAll(
                "_",
                " "
            )
            .replace(
                /\b\w/g,
                (char) =>
                    char.toUpperCase()
            );
    };

    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {
        return (
            <div className="management-page">

                <PageHeader
                    title={`${getRoleLabel()} Review Evaluation`}
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
                    title={`${getRoleLabel()} Review Evaluation`}
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
                    title={`${getRoleLabel()} Review Evaluation`}
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
    // Data
    // ==========================================================

    const employee =
        evaluation.employee;

    const questions =
        getQuestions();

    const canReview =
        canCurrentRoleReview();

    const currentStageApproved =
        isCurrentStageApproved();

    // ==========================================================
    // Overall Reviews
    // ==========================================================

    const managerOverall =
        getOverallReview(
            "Manager"
        );

    const hrOverall =
        getOverallReview(
            "HR"
        );

    const managementOverall =
        getOverallReview(
            "Management"
        );

    const currentOverallReview =
        getOverallReview(
            reviewerRole
        );

    // ==========================================================
    // Page
    // ==========================================================

    return (
        <div className="management-page">

            <PageHeader
                title={`${getRoleLabel()} Review Evaluation`}
                subtitle={`Review employee self-evaluation as ${getRoleLabel()}`}
            />

            {/* =====================================================
                Error
            ===================================================== */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}

            {/* =====================================================
                Employee Information
            ===================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Employee Information
                    </h2>

                </div>

                <div className="management-form-grid">

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Employee
                        </span>

                        <span className="management-form-info-value">
                            {employee?.name || "-"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Employee ID
                        </span>

                        <span className="management-form-info-value">
                            {employee?.employee_id || "-"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Department
                        </span>

                        <span className="management-form-info-value">
                            {employee?.department?.name || "-"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Position
                        </span>

                        <span className="management-form-info-value">
                            {employee?.position?.name || "-"}
                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Evaluation Period
                        </span>

                        <span className="management-form-info-value">

                            {evaluation
                                ?.evaluation_period
                                ?.name ||
                                evaluation
                                    ?.evaluationPeriod
                                    ?.name ||
                                evaluation
                                    ?.evaluation_period
                                    ?.title ||
                                evaluation
                                    ?.evaluationPeriod
                                    ?.title ||
                                "-"}

                        </span>

                    </div>

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Status
                        </span>

                        <span
                            className={getStatusClass(
                                evaluation.status
                            )}
                        >
                            {formatStatus(
                                evaluation.status
                            )}
                        </span>

                    </div>

                </div>

            </div>

            {/* =====================================================
                Employee Comment
            ===================================================== */}

            {evaluation.employee_comment && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Employee Comment
                        </h2>

                    </div>

                    <div className="evaluation-review-comment">

                        {evaluation.employee_comment}

                    </div>

                </div>

            )}

            {/* =====================================================
                Evaluation Questions
            ===================================================== */}

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
                            ) => {

                                const question =
                                    answer.question;

                                const questionId =
                                    answer.question_id;

                                /*
                                |--------------------------------------------------------------------------
                                | Current Role Review
                                |--------------------------------------------------------------------------
                                */

                                const currentReview =
                                    reviews[
                                        questionId
                                    ] || {};

                                /*
                                |--------------------------------------------------------------------------
                                | Previous Role Reviews
                                |--------------------------------------------------------------------------
                                */

                                const managerReview =
                                    getReview(
                                        questionId,
                                        "Manager"
                                    );

                                const hrReview =
                                    getReview(
                                        questionId,
                                        "HR"
                                    );

                                const managementReview =
                                    getReview(
                                        questionId,
                                        "Management"
                                    );

                                const isAccepted =
                                    currentReview.review_result ===
                                    "okay";

                                const isRejected =
                                    currentReview.review_result ===
                                    "not_okay";

                                return (

                                    <div
                                        className="evaluation-review-card"
                                        key={
                                            questionId
                                        }
                                    >

                                        {/* =================================================
                                            Question
                                        ================================================= */}

                                        <div className="evaluation-review-question">

                                            <span>
                                                {index + 1}.
                                            </span>

                                            <strong>
                                                {
                                                    question?.question ||
                                                    "-"
                                                }
                                            </strong>

                                            {question?.required && (
                                                <span className="required-star">
                                                    *
                                                </span>
                                            )}

                                        </div>

                                        {/* =================================================
                                            Employee Answer
                                        ================================================= */}

                                        <div className="evaluation-review-answer">

                                            <span className="evaluation-review-label">
                                                Employee Answer
                                            </span>

                                            <p>
                                                {answer.answer ??
                                                    answer.value ??
                                                    "-"}
                                            </p>

                                        </div>

                                        {/* =================================================
                                            Employee Rating
                                        ================================================= */}

                                        <div className="evaluation-review-answer">

                                            <span className="evaluation-review-label">
                                                Employee Rating
                                            </span>

                                            <p>

                                                {answer.rating !==
                                                    null &&
                                                answer.rating !==
                                                    undefined &&
                                                answer.rating !==
                                                    ""
                                                    ? `${answer.rating} / 10`
                                                    : "-"}

                                            </p>

                                        </div>

                                        {/* =================================================
                                            MANAGER REVIEW
                                            Only Management can see it
                                        ================================================= */}

                                        {reviewerRole ===
                                            "Management" &&
                                            managerReview && (

                                                <div className="evaluation-review-manager evaluation-review-manager-view">

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Manager Rating
                                                        </span>

                                                        <p>
                                                            {managerReview.rating !==
                                                                null &&
                                                            managerReview.rating !==
                                                                undefined &&
                                                            managerReview.rating !==
                                                                ""
                                                                ? `${managerReview.rating} / 10`
                                                                : "-"}
                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Manager Decision
                                                        </span>

                                                        <p>

                                                            {managerReview.review_result ===
                                                                "okay"
                                                                ? "✓ Accept"
                                                                : managerReview.review_result ===
                                                                    "not_okay"
                                                                ? "✕ Reject"
                                                                : "-"}

                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Manager Comment
                                                        </span>

                                                        <p>
                                                            {managerReview.comment ||
                                                                "-"}
                                                        </p>

                                                    </div>

                                                </div>
                                            )}

                                        {/* =================================================
                                            HR REVIEW
                                            Only Management can see it
                                        ================================================= */}

                                        {reviewerRole ===
                                            "Management" &&
                                            hrReview && (

                                                <div className="evaluation-review-manager evaluation-review-manager-view">

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            HR Rating
                                                        </span>

                                                        <p>
                                                            {hrReview.rating !==
                                                                null &&
                                                            hrReview.rating !==
                                                                undefined &&
                                                            hrReview.rating !==
                                                                ""
                                                                ? `${hrReview.rating} / 10`
                                                                : "-"}
                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            HR Decision
                                                        </span>

                                                        <p>

                                                            {hrReview.review_result ===
                                                                "okay"
                                                                ? "✓ Accept"
                                                                : hrReview.review_result ===
                                                                    "not_okay"
                                                                ? "✕ Reject"
                                                                : "-"}

                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            HR Comment
                                                        </span>

                                                        <p>
                                                            {hrReview.comment ||
                                                                "-"}
                                                        </p>

                                                    </div>

                                                </div>
                                            )}

                                        {/* =================================================
                                            MANAGEMENT PREVIOUS REVIEW
                                            Only show when management is NOT currently
                                            editing a new review
                                        ================================================= */}

                                        {reviewerRole ===
                                            "Management" &&
                                            managementReview &&
                                            !canReview && (

                                                <div className="evaluation-review-manager evaluation-review-manager-view">

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Management Rating
                                                        </span>

                                                        <p>
                                                            {managementReview.rating !==
                                                                null &&
                                                            managementReview.rating !==
                                                                undefined &&
                                                            managementReview.rating !==
                                                                ""
                                                                ? `${managementReview.rating} / 10`
                                                                : "-"}
                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Management Decision
                                                        </span>

                                                        <p>

                                                            {managementReview.review_result ===
                                                                "okay"
                                                                ? "✓ Accept"
                                                                : managementReview.review_result ===
                                                                    "not_okay"
                                                                ? "✕ Reject"
                                                                : "-"}

                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Management Comment
                                                        </span>

                                                        <p>
                                                            {managementReview.comment ||
                                                                "-"}
                                                        </p>

                                                    </div>

                                                </div>
                                            )}

                                        {/* =================================================
                                            HR OWN REVIEW - VIEW MODE
                                        ================================================= */}

                                        {reviewerRole ===
                                            "HR" &&
                                            hrReview &&
                                            !canReview && (

                                                <div className="evaluation-review-manager evaluation-review-manager-view">

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            HR Rating
                                                        </span>

                                                        <p>
                                                            {hrReview.rating !==
                                                                null &&
                                                            hrReview.rating !==
                                                                undefined &&
                                                            hrReview.rating !==
                                                                ""
                                                                ? `${hrReview.rating} / 10`
                                                                : "-"}
                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            HR Decision
                                                        </span>

                                                        <p>

                                                            {hrReview.review_result ===
                                                                "okay"
                                                                ? "✓ Accept"
                                                                : hrReview.review_result ===
                                                                    "not_okay"
                                                                ? "✕ Reject"
                                                                : "-"}

                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            HR Comment
                                                        </span>

                                                        <p>
                                                            {hrReview.comment ||
                                                                "-"}
                                                        </p>

                                                    </div>

                                                </div>
                                            )}

                                        {/* =================================================
                                            MANAGER OWN REVIEW - VIEW MODE
                                        ================================================= */}

                                        {reviewerRole ===
                                            "Manager" &&
                                            managerReview &&
                                            !canReview && (

                                                <div className="evaluation-review-manager evaluation-review-manager-view">

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Manager Rating
                                                        </span>

                                                        <p>
                                                            {managerReview.rating !==
                                                                null &&
                                                            managerReview.rating !==
                                                                undefined &&
                                                            managerReview.rating !==
                                                                ""
                                                                ? `${managerReview.rating} / 10`
                                                                : "-"}
                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Manager Decision
                                                        </span>

                                                        <p>

                                                            {managerReview.review_result ===
                                                                "okay"
                                                                ? "✓ Accept"
                                                                : managerReview.review_result ===
                                                                    "not_okay"
                                                                ? "✕ Reject"
                                                                : "-"}

                                                        </p>

                                                    </div>

                                                    <div className="evaluation-review-answer">

                                                        <span className="evaluation-review-label">
                                                            Manager Comment
                                                        </span>

                                                        <p>
                                                            {managerReview.comment ||
                                                                "-"}
                                                        </p>

                                                    </div>

                                                </div>
                                            )}

                                        {/* =================================================
                                            CURRENT ROLE EDIT MODE
                                        ================================================= */}

                                        {canReview && (

                                            <div className="evaluation-review-manager">

                                                {/* -----------------------------------------
                                                    Current Role Rating
                                                ----------------------------------------- */}

                                                <div className="evaluation-review-rating">

                                                    <label className="evaluation-review-label">

                                                        {getRoleLabel()} Rating

                                                        <span className="required-star">
                                                            *
                                                        </span>

                                                    </label>

                                                    <select
                                                        value={
                                                            currentReview.rating ??
                                                            ""
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleRatingChange(
                                                                questionId,
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >

                                                        <option value="">
                                                            Select Rating
                                                        </option>

                                                        {Array.from(
                                                            {
                                                                length: 11,
                                                            },
                                                            (
                                                                _,
                                                                rating
                                                            ) => (

                                                                <option
                                                                    key={
                                                                        rating
                                                                    }
                                                                    value={
                                                                        rating
                                                                    }
                                                                >
                                                                    {
                                                                        rating
                                                                    }{" "}
                                                                    / 10
                                                                </option>

                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                                {/* -----------------------------------------
                                                    Accept / Reject
                                                ----------------------------------------- */}

                                                <div className="evaluation-review-actions">

                                                    <button
                                                        type="button"
                                                        className={
                                                            isAccepted
                                                                ? "management-btn-primary evaluation-review-action active"
                                                                : "management-btn-secondary evaluation-review-action"
                                                        }
                                                        onClick={() =>
                                                            setReviewResult(
                                                                questionId,
                                                                "okay"
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >
                                                        ✓ Accept
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            isRejected
                                                                ? "action-button action-delete evaluation-review-action active"
                                                                : "action-button action-delete evaluation-review-action"
                                                        }
                                                        onClick={() =>
                                                            setReviewResult(
                                                                questionId,
                                                                "not_okay"
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >
                                                        ✕ Reject
                                                    </button>

                                                </div>

                                                {/* -----------------------------------------
                                                    Comment
                                                ----------------------------------------- */}

                                                <div className="management-form-field">

                                                    <label>

                                                        {isRejected
                                                            ? `${getRoleLabel()} Rejection Comment`
                                                            : `${getRoleLabel()} Comment`}

                                                        {isRejected && (
                                                            <span className="required-star">
                                                                *
                                                            </span>
                                                        )}

                                                    </label>

                                                    <textarea
                                                        value={
                                                            currentReview.comment ||
                                                            ""
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleCommentChange(
                                                                questionId,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={
                                                            isRejected
                                                                ? `Please explain why this answer is rejected...`
                                                                : `Optional ${getRoleLabel().toLowerCase()} comment...`
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    />

                                                </div>

                                            </div>

                                        )}

                                    </div>
                                );
                            }
                        )
                    )}

                </div>

            </div>

            {/* =====================================================
                CURRENT ROLE OVERALL REVIEW - EDIT
            ===================================================== */}

            {canReview && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Overall {getRoleLabel()} Review
                        </h2>

                    </div>

                    <div className="management-form">

                        {/* Overall Rating */}

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
                                onChange={(
                                    e
                                ) =>
                                    setOverallRating(
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
                                    (
                                        _,
                                        rating
                                    ) => (

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

                        {/* Overall Comment */}

                        <div className="management-form-field">

                            <label>
                                Overall Comment
                            </label>

                            <textarea
                                value={
                                    overallComment
                                }
                                onChange={(
                                    e
                                ) =>
                                    setOverallComment(
                                        e.target.value
                                    )
                                }
                                placeholder={`Enter overall ${getRoleLabel().toLowerCase()} comment...`}
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
                                    handleReviewAction(
                                        "approved"
                                    )
                                }
                                disabled={
                                    saving ||
                                    !allQuestionsReviewed()
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
                                    handleReviewAction(
                                        "returned"
                                    )
                                }
                                disabled={
                                    saving ||
                                    !allQuestionsReviewed()
                                }
                            >
                                Return
                            </button>

                            <button
                                type="button"
                                className="action-button action-delete"
                                onClick={() =>
                                    handleReviewAction(
                                        "rejected"
                                    )
                                }
                                disabled={
                                    saving ||
                                    !allQuestionsReviewed()
                                }
                            >
                                Reject Evaluation
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
                CURRENT ROLE APPROVED - VIEW
            ===================================================== */}

            {currentStageApproved && (

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            {getRoleLabel()} Review
                        </h2>

                    </div>

                    <div className="evaluation-locked-message">

                        This evaluation has already been
                        approved by {getRoleLabel()}.
                        You can view the review data, but
                        cannot modify anything.

                    </div>

                    {/* Overall Rating */}

                    <div className="evaluation-review-answer">

                        <span className="evaluation-review-label">
                            Overall {getRoleLabel()} Rating
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

                    {/* Overall Comment */}

                    <div className="evaluation-review-answer">

                        <span className="evaluation-review-label">
                            Overall {getRoleLabel()} Comment
                        </span>

                        <p>

                            {currentOverallReview?.comment ||
                                overallComment ||
                                "-"}

                        </p>

                    </div>

                </div>

            )}

            {/* =====================================================
                MANAGEMENT - PREVIOUS OVERALL REVIEWS
                Management can see Manager + HR
            ===================================================== */}

            {reviewerRole ===
                "Management" && (

                <>

                    {/* =================================================
                        Manager Overall
                    ================================================= */}

                    {managerOverall && (

                        <div className="management-form-section">

                            <div className="management-form-section-header">

                                <h2>
                                    Manager Overall Review
                                </h2>

                            </div>

                            <div className="evaluation-review-answer">

                                <span className="evaluation-review-label">
                                    Manager Overall Rating
                                </span>

                                <p>
                                    {managerOverall.rating !==
                                        null &&
                                    managerOverall.rating !==
                                        undefined &&
                                    managerOverall.rating !==
                                        ""
                                        ? `${managerOverall.rating} / 10`
                                        : "-"}
                                </p>

                            </div>

                            <div className="evaluation-review-answer">

                                <span className="evaluation-review-label">
                                    Manager Overall Comment
                                </span>

                                <p>
                                    {managerOverall.comment ||
                                        "-"}
                                </p>

                            </div>

                            <div className="evaluation-review-answer">

                                <span className="evaluation-review-label">
                                    Manager Decision
                                </span>

                                <p>

                                    {managerOverall.action ===
                                        "approved"
                                        ? "✓ Approved"
                                        : managerOverall.action ===
                                            "returned"
                                        ? "↩ Returned"
                                        : managerOverall.action ===
                                            "rejected"
                                        ? "✕ Rejected"
                                        : "-"}

                                </p>

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        HR Overall
                    ================================================= */}

                    {hrOverall && (

                        <div className="management-form-section">

                            <div className="management-form-section-header">

                                <h2>
                                    HR Overall Review
                                </h2>

                            </div>

                            <div className="evaluation-review-answer">

                                <span className="evaluation-review-label">
                                    HR Overall Rating
                                </span>

                                <p>
                                    {hrOverall.rating !==
                                        null &&
                                    hrOverall.rating !==
                                        undefined &&
                                    hrOverall.rating !==
                                        ""
                                        ? `${hrOverall.rating} / 10`
                                        : "-"}
                                </p>

                            </div>

                            <div className="evaluation-review-answer">

                                <span className="evaluation-review-label">
                                    HR Overall Comment
                                </span>

                                <p>
                                    {hrOverall.comment ||
                                        "-"}
                                </p>

                            </div>

                            <div className="evaluation-review-answer">

                                <span className="evaluation-review-label">
                                    HR Decision
                                </span>

                                <p>

                                    {hrOverall.action ===
                                        "approved"
                                        ? "✓ Approved"
                                        : hrOverall.action ===
                                            "returned"
                                        ? "↩ Returned"
                                        : hrOverall.action ===
                                            "rejected"
                                        ? "✕ Rejected"
                                        : "-"}

                                </p>

                            </div>

                        </div>

                    )}

                </>
            )}

            {/* =====================================================
                MANAGEMENT OWN OVERALL REVIEW
                If already completed
            ===================================================== */}

            {reviewerRole ===
                "Management" &&
                currentStageApproved &&
                managementOverall && (

                    <div className="management-form-section">

                        <div className="management-form-section-header">

                            <h2>
                                Management Overall Review
                            </h2>

                        </div>

                        <div className="evaluation-review-answer">

                            <span className="evaluation-review-label">
                                Management Overall Rating
                            </span>

                            <p>
                                {managementOverall.rating !==
                                    null &&
                                managementOverall.rating !==
                                    undefined &&
                                managementOverall.rating !==
                                    ""
                                    ? `${managementOverall.rating} / 10`
                                    : "-"}
                            </p>

                        </div>

                        <div className="evaluation-review-answer">

                            <span className="evaluation-review-label">
                                Management Overall Comment
                            </span>

                            <p>
                                {managementOverall.comment ||
                                    "-"}
                            </p>

                        </div>

                        <div className="evaluation-review-answer">

                            <span className="evaluation-review-label">
                                Management Decision
                            </span>

                            <p>

                                {managementOverall.action ===
                                    "approved"
                                    ? "✓ Approved"
                                    : managementOverall.action ===
                                        "returned"
                                    ? "↩ Returned"
                                    : managementOverall.action ===
                                        "rejected"
                                    ? "✕ Rejected"
                                    : "-"}

                            </p>

                        </div>

                    </div>
                )}

            {/* =====================================================
                Back Button
            ===================================================== */}

            <div className="management-form-actions">

                <button
                    type="button"
                    className="evaluation-back-button"
                    onClick={() =>
                        navigate(-1)
                    }
                    disabled={
                        saving
                    }
                >
                    ← Back
                </button>

            </div>

        </div>
    );
};

export default ReviewEvaluation;
