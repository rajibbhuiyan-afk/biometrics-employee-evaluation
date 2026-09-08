import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

import EmployeeInformation from "./review/EmployeeInformation";

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
    // Auth User
    // ==========================================================

    const { user } = useAuth();

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
    //
    // IMPORTANT:
    // Reviewer role comes from logged-in user's actual role.
    //
    // Employee    -> Employee
    // Manager     -> Manager
    // HR          -> HR
    // Management  -> Management
    //
    // URL is used only as fallback.
    // ==========================================================

    const loggedInRole =
        user?.role?.name ||
        user?.role ||
        "";

    const reviewerRole =
        String(loggedInRole).trim() !== ""
            ? String(loggedInRole).trim()
            : detectReviewerRole();

    const roleLabel =
        getRoleLabel(reviewerRole);

    // ==========================================================
    // Draft Storage Key
    // ==========================================================

    const draftStorageKey =
        `evaluation-review-draft-${id}-${reviewerRole}`;

    // ==========================================================
    // Save Draft To LocalStorage
    // ==========================================================

    const saveDraftToLocalStorage = (
        nextReviews,
        nextOverallRating,
        nextOverallComment
    ) => {
        try {
            const draft = {
                reviews: nextReviews || {},

                overallRating:
                    nextOverallRating ?? "",

                overallComment:
                    nextOverallComment ?? "",

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
                "Failed to save review draft:",
                storageError
            );
        }
    };

    // ==========================================================
    // Fetch Evaluation
    // ==========================================================

    useEffect(() => {
        fetchEvaluation();
    }, [id, reviewerRole]);

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
                            review.reviewer_role || ""
                        ).trim().toLowerCase() ===
                            String(
                                reviewerRole || ""
                            ).trim().toLowerCase()
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

            // ==================================================
            // Restore Local Draft
            // ==================================================

            let finalReviews = {
                ...existingReviews,
            };

            let savedDraft = null;

            try {

                const storedDraft =
                    localStorage.getItem(
                        draftStorageKey
                    );

                if (storedDraft) {

                    savedDraft =
                        JSON.parse(
                            storedDraft
                        );
                }

            } catch (storageError) {

                console.warn(
                    "Unable to parse review draft:",
                    storageError
                );
            }

            if (
                savedDraft?.reviews &&
                typeof savedDraft.reviews ===
                    "object"
            ) {

                finalReviews = {
                    ...existingReviews,
                    ...savedDraft.reviews,
                };
            }

            setReviews(
                finalReviews
            );

            // ==================================================
            // Existing Overall Review
            // ==================================================

            const currentOverall =
                getOverallReviewByRole(
                    data?.reviews,
                    reviewerRole
                );

            let stageOverallRating =
                currentOverall?.rating ??
                "";

            let stageOverallComment =
                currentOverall?.comment ||
                "";

            // ==================================================
            // Fallback Overall Rating
            // ==================================================

            if (
                stageOverallRating === "" ||
                stageOverallRating === null ||
                stageOverallRating === undefined
            ) {

                const normalizedRole =
                    String(
                        reviewerRole || ""
                    ).trim().toLowerCase();

                if (
                    normalizedRole ===
                    "employee"
                ) {

                    stageOverallRating =
                        data?.employee_overall_rating ??
                        "";
                }

                if (
                    normalizedRole ===
                    "manager"
                ) {

                    stageOverallRating =
                        data?.manager_overall_rating ??
                        "";
                }

                if (
                    normalizedRole ===
                    "hr"
                ) {

                    stageOverallRating =
                        data?.hr_overall_rating ??
                        "";
                }

                if (
                    normalizedRole ===
                    "management"
                ) {

                    stageOverallRating =
                        data?.management_overall_rating ??
                        "";
                }
            }

            // ==================================================
            // Restore Overall Draft
            // ==================================================

            if (
                savedDraft &&
                savedDraft.overallRating !==
                    undefined &&
                savedDraft.overallRating !==
                    null
            ) {

                stageOverallRating =
                    savedDraft.overallRating;
            }

            if (
                savedDraft &&
                savedDraft.overallComment !==
                    undefined &&
                savedDraft.overallComment !==
                    null
            ) {

                stageOverallComment =
                    savedDraft.overallComment;
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
    // Reporting To Role
    // ==========================================================

    const reportingToRole =
        evaluation
            ?.employee
            ?.manager
            ?.role
            ?.name || null;

    // ==========================================================
    // Employee Role
    // ==========================================================

    const employeeRole =
        evaluation
            ?.employee
            ?.role
            ?.name || null;

    // ==========================================================
    // HR Self Evaluation
    // ==========================================================

    const isHrSelfEvaluation =
        String(
            employeeRole || ""
        ).trim().toLowerCase() ===
        "hr";

    // ==========================================================
    // Direct Management Evaluation
    // ==========================================================

    const reportsDirectlyToManagement =
        String(
            reportingToRole || ""
        ).trim().toLowerCase() ===
        "management";

    // ==========================================================
    // Can Current Role Review
    // ==========================================================

    const canCurrentRoleReview = () => {

        if (!evaluation) {
            return false;
        }

        const status =
            String(
                evaluation.status || ""
            ).trim().toLowerCase();

        const currentReviewerRole =
            String(
                reviewerRole || ""
            ).trim().toLowerCase();

        const currentReportingToRole =
            String(
                reportingToRole || ""
            ).trim().toLowerCase();

        // ======================================================
        // EMPLOYEE REVIEWER
        // ======================================================
        //
        // Employee B reviews Employee A.
        //
        // Employee reviewer can review a submitted evaluation.
        // Backend will verify actual reviewer ownership.
        // ======================================================

        if (
            currentReviewerRole ===
            "employee"
        ) {

            return (
                status ===
                "submitted"
            );
        }

        // ======================================================
        // MANAGER REVIEWER
        // ======================================================

        if (
            currentReviewerRole ===
            "manager"
        ) {

            return (
                status ===
                    "submitted" &&
                (
                    currentReportingToRole ===
                        "manager" ||
                    currentReportingToRole ===
                        ""
                )
            );
        }

        // ======================================================
        // HR REVIEWER
        // ======================================================

        if (
            currentReviewerRole ===
            "hr"
        ) {

            // HR cannot review own evaluation
            if (
                isHrSelfEvaluation
            ) {
                return false;
            }

            return (
                (
                    status ===
                        "submitted" &&
                    currentReportingToRole ===
                        "hr"
                ) ||
                status ===
                    "employee_approved" ||
                status ===
                    "manager_approved"
            );
        }

        // ======================================================
        // MANAGEMENT REVIEWER
        // ======================================================

        if (
            currentReviewerRole ===
            "management"
        ) {

            // --------------------------------------------------
            // Normal workflow
            // HR approved -> Management
            // --------------------------------------------------

            if (
                status ===
                "hr_approved"
            ) {
                return true;
            }

            // --------------------------------------------------
            // HR self evaluation
            // HR -> Management directly
            // --------------------------------------------------

            if (
                status === "submitted" &&
                isHrSelfEvaluation
            ) {

                return true;
            }

            // --------------------------------------------------
            // Directly reports to Management
            // --------------------------------------------------

            if (
                status === "submitted" &&
                reportsDirectlyToManagement
            ) {

                return true;
            }

            return false;
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

        const currentReviewerRole =
            String(
                reviewerRole || ""
            ).trim().toLowerCase();

        const status =
            String(
                evaluation.status || ""
            ).trim().toLowerCase();

        // ======================================================
        // Employee
        // ======================================================

        if (
            currentReviewerRole ===
            "employee"
        ) {

            return (
                status ===
                "employee_approved"
            );
        }

        // ======================================================
        // Manager
        // ======================================================

        if (
            currentReviewerRole ===
            "manager"
        ) {

            return (
                status ===
                "manager_approved"
            );
        }

        // ======================================================
        // HR
        // ======================================================

        if (
            currentReviewerRole ===
            "hr"
        ) {

            return (
                status ===
                "hr_approved"
            );
        }

        // ======================================================
        // Management
        // ======================================================

        if (
            currentReviewerRole ===
            "management"
        ) {

            return (
                status ===
                "completed"
            );
        }

        return false;
    };

    const currentStageApproved =
        isCurrentStageApproved();

    // ==========================================================
    // Update Question Review
    // ==========================================================

    const updateReview = (
        questionId,
        field,
        value
    ) => {

        if (!canReview) {
            return;
        }

        setReviews((prev) => {

            const nextReviews = {
                ...prev,

                [questionId]: {
                    ...(prev[
                        questionId
                    ] || {}),

                    [field]:
                        value,
                },
            };

            saveDraftToLocalStorage(
                nextReviews,
                overallRating,
                overallComment
            );

            return nextReviews;
        });
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
                prev[
                    questionId
                ] || {};

            let nextReview;

            // ==================================================
            // ACCEPT
            // ==================================================

            if (
                result ===
                "okay"
            ) {

                nextReview = {
                    ...previous,

                    review_result:
                        "okay",

                    comment: "",
                };
            }

            // ==================================================
            // REJECT
            // ==================================================

            else if (
                result ===
                "not_okay"
            ) {

                nextReview = {
                    ...previous,

                    review_result:
                        "not_okay",

                    rating: "",
                };
            }

            // ==================================================
            // IGNORE
            // ==================================================

            else if (
                result ===
                "ignore"
            ) {

                nextReview = {
                    ...previous,

                    review_result:
                        "ignore",

                    rating: "",

                    comment: "",
                };
            }

            else {

                nextReview = {
                    ...previous,

                    review_result:
                        result,
                };
            }

            const nextReviews = {
                ...prev,

                [questionId]:
                    nextReview,
            };

            saveDraftToLocalStorage(
                nextReviews,
                overallRating,
                overallComment
            );

            return nextReviews;
        });
    };

    // ==========================================================
    // Overall Rating Change
    // ==========================================================

    const handleOverallRatingChange = (
        value
    ) => {

        if (!canReview) {
            return;
        }

        setOverallRating(
            value
        );

        saveDraftToLocalStorage(
            reviews,
            value,
            overallComment
        );
    };

    // ==========================================================
    // Overall Comment Change
    // ==========================================================

    const handleOverallCommentChange = (
        value
    ) => {

        if (!canReview) {
            return;
        }

        setOverallComment(
            value
        );

        saveDraftToLocalStorage(
            reviews,
            overallRating,
            value
        );
    };

    // ==========================================================
    // Backup Auto Save
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
                        JSON.stringify(
                            draft
                        )
                    );

                } catch (
                    storageError
                ) {

                    console.error(
                        "Failed to auto-save review draft:",
                        storageError
                    );
                }

            }, 500);

        return () => {
            clearTimeout(
                timer
            );
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

    const isQuestionReviewed = (
        review
    ) => {

        return Boolean(
            review?.review_result
        );
    };

    // ==========================================================
    // All Questions Reviewed
    // ==========================================================

    const allQuestionsReviewed =
        () => {

            if (
                questions.length ===
                0
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

    const validateReviews =
        () => {

            const errors = [];

            questions.forEach(
                (
                    answer,
                    index
                ) => {

                    const questionId =
                        answer.question_id;

                    const review =
                        reviews[
                            questionId
                        ] || {};

                    const result =
                        review.review_result;

                    // ------------------------------------------------
                    // No Result
                    // ------------------------------------------------

                    if (!result) {

                        errors.push(
                            `Question ${index + 1}: Please select Accept, Reject, or Ignore.`
                        );

                        return;
                    }

                    // ------------------------------------------------
                    // Ignore
                    // ------------------------------------------------

                    if (
                        result ===
                        "ignore"
                    ) {
                        return;
                    }

                    // ------------------------------------------------
                    // Accept
                    // ------------------------------------------------

                    if (
                        result ===
                        "okay"
                    ) {

                        if (
                            review.rating ===
                                "" ||
                            review.rating ===
                                null ||
                            review.rating ===
                                undefined
                        ) {

                            errors.push(
                                `Question ${index + 1}: Please provide a review rating.`
                            );
                        }

                        return;
                    }

                    // ------------------------------------------------
                    // Reject
                    // ------------------------------------------------

                    if (
                        result ===
                        "not_okay"
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
                overallRating ===
                    "" ||
                overallRating ===
                    null ||
                overallRating ===
                    undefined
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

    const handleReviewAction =
        async (
            action
        ) => {

            setError("");

            if (!canReview) {

                setError(
                    "You are not allowed to review this evaluation at this stage."
                );

                return;
            }

            if (
                ![
                    "approved",
                    "rejected",
                ].includes(
                    action
                )
            ) {

                setError(
                    "Invalid review action."
                );

                return;
            }

            const validationErrors =
                validateReviews();

            if (
                validationErrors.length >
                0
            ) {

                setError(
                    validationErrors.join(
                        "\n"
                    )
                );

                return;
            }

            if (
                !allQuestionsReviewed()
            ) {

                setError(
                    `Please Accept, Reject or Ignore all questions before submitting the ${roleLabel} review.`
                );

                return;
            }

            try {

                setSaving(
                    true
                );

                // ==================================================
                // Question Reviews
                // ==================================================

                const questionReviews =
                    questions.map(
                        (
                            answer
                        ) => {

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
                // Submit Backend
                // ==================================================

                await api.post(
                    "/evaluation-reviews",
                    payload
                );

                // ==================================================
                // Clear Draft
                // ==================================================

                try {

                    localStorage.removeItem(
                        draftStorageKey
                    );

                } catch (
                    storageError
                ) {

                    console.warn(
                        "Failed to clear review draft:",
                        storageError
                    );
                }

                // ==================================================
                // Redirect
                // ==================================================

                const normalizedRole =
                    String(
                        reviewerRole || ""
                    ).trim().toLowerCase();

                if (
                    normalizedRole ===
                    "employee"
                ) {

                    navigate(
                        "/management/employee/reviews"
                    );

                    return;
                }

                if (
                    normalizedRole ===
                    "manager"
                ) {

                    navigate(
                        "/management/manager/reviews"
                    );

                    return;
                }

                if (
                    normalizedRole ===
                    "hr"
                ) {

                    navigate(
                        "/management/hr/reviews"
                    );

                    return;
                }

                if (
                    normalizedRole ===
                    "management"
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

                setSaving(
                    false
                );
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

    const employeeOverall =
        getOverallReviewByRole(
            evaluation.reviews,
            "Employee"
        );

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
    // Debug
    // ==========================================================

    console.log(
        "Review Evaluation:",
        {
            evaluationId: id,

            loggedInUser:
                user,

            loggedInRole:
                loggedInRole,

            reviewerRole:
                reviewerRole,

            status:
                evaluation.status,

            employeeRole:
                employeeRole,

            reportingToRole:
                reportingToRole,

            isHrSelfEvaluation:
                isHrSelfEvaluation,

            reportsDirectlyToManagement:
                reportsDirectlyToManagement,

            canReview:
                canReview,

            employee:
                evaluation?.employee,

            manager:
                evaluation?.employee?.manager,

            managerRole:
                evaluation?.employee?.manager?.role?.name,
        }
    );

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
                Employee Reviewer Notice
            ================================================== */}

            {String(
                reviewerRole || ""
            ).trim().toLowerCase() ===
                "employee" &&
                evaluation.status ===
                    "submitted" &&
                canReview && (
                    <div className="evaluation-review-info">
                        This employee evaluation is submitted
                        and ready for your review.
                    </div>
                )}

            {/* ==================================================
                HR Self Evaluation Notice
            ================================================== */}

            {String(
                reviewerRole || ""
            ).trim().toLowerCase() ===
                "management" &&
                isHrSelfEvaluation &&
                evaluation.status ===
                    "submitted" && (
                    <div className="evaluation-review-info">
                        HR self-evaluation submitted directly
                        to Management for review.
                    </div>
                )}

            {/* ==================================================
                Employee Information
            ================================================== */}

            <EmployeeInformation
                evaluation={
                    evaluation
                }
                reviewerRole={
                    reviewerRole
                }
            />

        

            {/* ==================================================
                Evaluation Questions
            ================================================== */}

            <EvaluationQuestions
                questions={
                    questions
                }
                reviews={
                    reviews
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
                    handleOverallRatingChange
                }
                onCommentChange={
                    handleOverallCommentChange
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
                employeeOverall={
                    employeeOverall
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