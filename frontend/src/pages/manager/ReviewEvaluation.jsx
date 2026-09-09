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

    const { user } = useAuth();


    // ==========================================================
    // State
    // ==========================================================

    const [evaluation, setEvaluation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [reviews, setReviews] =
        useState({});

    const [overallRating, setOverallRating] =
        useState("");

    const [overallComment, setOverallComment] =
        useState("");

    const [autoSaved, setAutoSaved] =
        useState(false);


    // ==========================================================
    // Logged In Role
    // ==========================================================

    const loggedInRole =
        user?.role?.name ||
        user?.role ||
        "";


    const reviewerRole =
        String(loggedInRole).trim() !== ""
            ? String(loggedInRole).trim()
            : detectReviewerRole();


    const normalizedReviewerRole =
        String(reviewerRole || "")
            .trim()
            .toLowerCase();


    const roleLabel =
        getRoleLabel(reviewerRole);


    // ==========================================================
    // Draft Storage Key
    // ==========================================================

    const draftStorageKey =
        `evaluation-review-draft-${id}-${reviewerRole}`;


    // ==========================================================
    // Save Draft
    // ==========================================================

    const saveDraftToLocalStorage = (
        nextReviews,
        nextOverallRating,
        nextOverallComment
    ) => {

        try {

            const draft = {

                reviews:
                    nextReviews || {},

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


            const response =
                await api.get(
                    `/evaluations/${id}`
                );


            const data =
                response.data?.data ||
                response.data;


            setEvaluation(data);


            // ==================================================
            // Existing Reviews
            // ==================================================

            const existingReviews = {};


            if (
                Array.isArray(
                    data?.reviews
                )
            ) {

                data.reviews.forEach(
                    (review) => {

                        if (
                            review.question_id !== null &&
                            review.question_id !== undefined &&
                            String(
                                review.reviewer_role || ""
                            )
                                .trim()
                                .toLowerCase() ===
                                normalizedReviewerRole
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
                    }
                );
            }


            // ==================================================
            // Restore Draft
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
            // Role Specific Overall Rating
            // ==================================================

            if (
                stageOverallRating === "" ||
                stageOverallRating === null ||
                stageOverallRating === undefined
            ) {

                if (
                    normalizedReviewerRole ===
                    "employee"
                ) {

                    stageOverallRating =
                        data?.employee_overall_rating ??
                        "";
                }


                if (
                    normalizedReviewerRole ===
                    "manager"
                ) {

                    stageOverallRating =
                        data?.manager_overall_rating ??
                        "";
                }


                if (
                    normalizedReviewerRole ===
                    "hr"
                ) {

                    stageOverallRating =
                        data?.hr_overall_rating ??
                        "";
                }


                if (
                    normalizedReviewerRole ===
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
    // All Questions
    // ==========================================================
    //
    // evaluation.answers contains ALL employee questions.
    //
    // Management/Admin:
    //     ALL questions
    //
    // Manager:
    //     Only Manager assigned questions
    //
    // HR:
    //     Only HR assigned questions
    //
    // ==========================================================

    const allQuestions =
        Array.isArray(
            evaluation?.answers
        )
            ? evaluation.answers
            : [];


    // ==========================================================
    // Filter Questions By Reviewer Role
    // ==========================================================

    const questions =
        allQuestions.filter(
            (answer) => {

                // ==================================================
                // Management
                // ==================================================

                if (
                    normalizedReviewerRole ===
                    "management"
                ) {

                    return true;
                }


                // ==================================================
                // Admin
                // ==================================================

                if (
                    normalizedReviewerRole ===
                    "admin"
                ) {

                    return true;
                }


                // ==================================================
                // Manager / HR
                // ==================================================

                const assignedReviewers =
                    answer
                        ?.question
                        ?.reviewers;


                if (
                    !Array.isArray(
                        assignedReviewers
                    )
                ) {

                    return false;
                }


                return assignedReviewers.some(
                    (reviewer) => {

                        const assignedRole =
                            String(
                                reviewer?.name ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        return (
                            assignedRole ===
                            normalizedReviewerRole
                        );
                    }
                );
            }
        );


    // ==========================================================
    // Employee Role
    // ==========================================================

    const employeeRole =
        evaluation
            ?.employee
            ?.role
            ?.name || null;


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
    // HR Self Evaluation
    // ==========================================================

    const isHrSelfEvaluation =
        String(
            employeeRole || ""
        )
            .trim()
            .toLowerCase() ===
        "hr";


    // ==========================================================
    // Direct Management Evaluation
    // ==========================================================

    const reportsDirectlyToManagement =
        String(
            reportingToRole || ""
        )
            .trim()
            .toLowerCase() ===
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
            )
                .trim()
                .toLowerCase();


        // ======================================================
        // Employee
        // ======================================================

        if (
            normalizedReviewerRole ===
            "employee"
        ) {

            return (
                status ===
                "submitted"
            );
        }


        // ======================================================
        // Manager
        // ======================================================

        if (
            normalizedReviewerRole ===
            "manager"
        ) {

            return (
                status ===
                    "submitted" &&
                (
                    String(
                        reportingToRole || ""
                    )
                        .trim()
                        .toLowerCase() ===
                        "manager" ||
                    String(
                        reportingToRole || ""
                    ).trim() === ""
                )
            );
        }


        // ======================================================
        // HR
        // ======================================================

        if (
            normalizedReviewerRole ===
            "hr"
        ) {

            if (
                isHrSelfEvaluation
            ) {

                return false;
            }


            return (
                (
                    status ===
                        "submitted" &&
                    String(
                        reportingToRole || ""
                    )
                        .trim()
                        .toLowerCase() ===
                        "hr"
                ) ||
                status ===
                    "employee_approved" ||
                status ===
                    "manager_approved"
            );
        }


        // ======================================================
        // Management
        // ======================================================

        if (
            normalizedReviewerRole ===
            "management"
        ) {

            // Normal workflow:
            // HR approved -> Management

            if (
                status ===
                "hr_approved"
            ) {

                return true;
            }


            // HR self evaluation

            if (
                status ===
                    "submitted" &&
                isHrSelfEvaluation
            ) {

                return true;
            }


            // Employee directly reports to Management

            if (
                status ===
                    "submitted" &&
                reportsDirectlyToManagement
            ) {

                return true;
            }


            return false;
        }


        // ======================================================
        // Admin
        // ======================================================
        //
        // Admin is software administrator.
        // If Admin opens a review page, allow all questions.
        //
        // ======================================================

        if (
            normalizedReviewerRole ===
            "admin"
        ) {

            return true;
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


        const status =
            String(
                evaluation.status || ""
            )
                .trim()
                .toLowerCase();


        if (
            normalizedReviewerRole ===
            "employee"
        ) {

            return (
                status ===
                "employee_approved"
            );
        }


        if (
            normalizedReviewerRole ===
            "manager"
        ) {

            return (
                status ===
                "manager_approved"
            );
        }


        if (
            normalizedReviewerRole ===
            "hr"
        ) {

            return (
                status ===
                "hr_approved"
            );
        }


        if (
            normalizedReviewerRole ===
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


        setReviews((previousReviews) => {

            const nextReviews = {

                ...previousReviews,

                [questionId]: {

                    ...(previousReviews[
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


        setReviews((previousReviews) => {

            const previous =
                previousReviews[
                    questionId
                ] || {};


            let nextReview;


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

                ...previousReviews,

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
    // Overall Rating
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
    // Overall Comment
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
    // Auto Save
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

                } catch (storageError) {

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
    // Check Question Review
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


                    if (!result) {

                        errors.push(
                            `Question ${index + 1}: Please select Accept, Reject, or Ignore.`
                        );

                        return;
                    }


                    if (
                        result ===
                        "ignore"
                    ) {

                        return;
                    }


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
                ].includes(action)
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

                setSaving(true);


                // ==================================================
                // Build Question Reviews
                // ==================================================
                //
                // IMPORTANT:
                //
                // questions is already filtered.
                //
                // Management/Admin:
                //     all questions
                //
                // Manager/HR:
                //     assigned questions only
                //
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


                            const question =
                                answer.question;


                            const maxRating =
                                Number(
                                    question?.max_rating
                                ) || 10;


                            const isIgnored =
                                review.review_result ===
                                "ignore";


                            let rating =
                                null;


                            if (
                                !isIgnored &&
                                review.rating !== "" &&
                                review.rating !== null &&
                                review.rating !== undefined
                            ) {

                                rating =
                                    Number(
                                        review.rating
                                    );


                                // ----------------------------------
                                // Protect against invalid rating
                                // ----------------------------------

                                if (
                                    Number.isNaN(
                                        rating
                                    )
                                ) {

                                    rating =
                                        null;

                                } else {

                                    if (
                                        rating <
                                        0
                                    ) {

                                        rating =
                                            0;
                                    }


                                    if (
                                        rating >
                                        maxRating
                                    ) {

                                        rating =
                                            maxRating;
                                    }
                                }
                            }


                            return {

                                question_id:
                                    Number(
                                        questionId
                                    ),

                                review_result:
                                    review.review_result,

                                rating,

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
                    "Review Payload:",
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
                // Clear Draft
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
                    normalizedReviewerRole ===
                    "employee"
                ) {

                    navigate(
                        "/management/employee/reviews"
                    );

                    return;
                }


                if (
                    normalizedReviewerRole ===
                    "manager"
                ) {

                    navigate(
                        "/management/manager/reviews"
                    );

                    return;
                }


                if (
                    normalizedReviewerRole ===
                    "hr"
                ) {

                    navigate(
                        "/management/hr/reviews"
                    );

                    return;
                }


                if (
                    normalizedReviewerRole ===
                    "management"
                ) {

                    navigate(
                        "/management"
                    );

                    return;
                }


                if (
                    normalizedReviewerRole ===
                    "admin"
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
    // Overall Reviews
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
    // Question Review Status
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
                Auto Save
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
                evaluation={
                    evaluation
                }
                reviewerRole={
                    reviewerRole
                }
            />


            {/* ==================================================
                No Assigned Questions
                Only Manager / HR can reach here.
                Management/Admin ALWAYS have all questions.
            ================================================== */}

            {canReview &&
                questions.length === 0 &&
                normalizedReviewerRole !== "management" &&
                normalizedReviewerRole !== "admin" && (

                    <div className="management-form-section">

                        <div className="management-error">

                            No evaluation questions are assigned
                            to your reviewer role.

                        </div>

                    </div>
                )}


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
                Back
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