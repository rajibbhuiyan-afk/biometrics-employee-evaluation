import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EvaluationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [evaluation, setEvaluation] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [saveStatus, setSaveStatus] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // Refs
    // =========================================================

    const answersRef = useRef({});
    const autoSaveTimersRef = useRef({});
    const autoSavePromisesRef = useRef({});

    // Keep latest answers available without stale closure problems
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // =========================================================
    // Load Evaluation
    // =========================================================

    useEffect(() => {
        loadEvaluation();

        return () => {
            Object.values(autoSaveTimersRef.current).forEach(
                (timer) => clearTimeout(timer)
            );
        };
    }, [id]);

    const loadEvaluation = async () => {
        try {
            setLoading(true);
            setError("");
            setSaveStatus("");

            const evaluationResponse = await api.get(
                `/evaluations/${id}`
            );

            const evaluationData =
                evaluationResponse.data.data;

            setEvaluation(evaluationData);

            // =====================================================
            // IMPORTANT:
            // Use questions attached to this evaluation.
            // This preserves historical questions even if a
            // question is currently inactive.
            // =====================================================

            let evaluationQuestions = [];

            if (
                Array.isArray(evaluationData.answers) &&
                evaluationData.answers.length > 0
            ) {
                evaluationQuestions =
                    evaluationData.answers
                        .map((item) => item.question)
                        .filter(Boolean)
                        .sort(
                            (a, b) =>
                                (a.sort_order || 0) -
                                (b.sort_order || 0)
                        );
            }

            // Fallback only if backend does not return
            // answer.question relationship.
            if (evaluationQuestions.length === 0) {
                const questionsResponse = await api.get(
                    "/evaluation-questions"
                );

                evaluationQuestions =
                    questionsResponse.data.data || [];
            }

            setQuestions(evaluationQuestions);

            // =====================================================
            // Existing Answers
            // =====================================================

            const existingAnswers = {};

            if (Array.isArray(evaluationData.answers)) {
                evaluationData.answers.forEach((item) => {
                    existingAnswers[item.question_id] = {
                        id: item.id,

                        answer:
                            item.answer !== null &&
                            item.answer !== undefined
                                ? item.answer
                                : "",

                        rating:
                            item.rating !== null &&
                            item.rating !== undefined
                                ? Number(item.rating)
                                : "",

                        comment:
                            item.comment !== null &&
                            item.comment !== undefined
                                ? item.comment
                                : "",
                    };
                });
            }

            setAnswers(existingAnswers);
            answersRef.current = existingAnswers;
        } catch (error) {
            console.error(
                "Failed to load evaluation:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load evaluation."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // Get Current Answer
    // =========================================================

    const getCurrentAnswer = (questionId) => {
        return (
            answersRef.current[questionId] || {
                answer: "",
                rating: "",
                comment: "",
            }
        );
    };

    // =========================================================
    // Save Single Answer
    // =========================================================

    const saveSingleAnswer = async (
        questionId,
        answerData = null
    ) => {
        // Extra protection:
        // Never save an answer if evaluation is not draft.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        const currentAnswer =
            answerData || getCurrentAnswer(questionId);

        const answer =
            currentAnswer.answer !== null &&
            currentAnswer.answer !== undefined
                ? String(currentAnswer.answer).trim()
                : "";

        const rating =
            currentAnswer.rating !== null &&
            currentAnswer.rating !== undefined &&
            currentAnswer.rating !== ""
                ? Number(currentAnswer.rating)
                : null;

        const comment =
            currentAnswer.comment !== null &&
            currentAnswer.comment !== undefined
                ? String(currentAnswer.comment).trim()
                : "";

        const promise = api.post(
            "/evaluation-answers",
            {
                evaluation_id: Number(id),
                question_id: Number(questionId),

                // Send null when cleared.
                answer: answer !== "" ? answer : null,

                rating: rating,

                comment:
                    comment !== ""
                        ? comment
                        : null,
            }
        );

        autoSavePromisesRef.current[questionId] =
            promise;

        try {
            await promise;
        } finally {
            delete autoSavePromisesRef.current[
                questionId
            ];
        }
    };

    // =========================================================
    // Auto Save
    // =========================================================

    const scheduleAutoSave = (
        questionId,
        answerData
    ) => {
        // Extra protection:
        // Do not schedule auto-save for read-only evaluation.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        // Store latest payload immediately.
        answersRef.current = {
            ...answersRef.current,
            [questionId]: answerData,
        };

        // Cancel previous timer for this question.
        if (autoSaveTimersRef.current[questionId]) {
            clearTimeout(
                autoSaveTimersRef.current[questionId]
            );
        }

        setSaveStatus("Unsaved changes...");

        // Debounce: wait 800ms after user stops typing.
        autoSaveTimersRef.current[questionId] =
            setTimeout(async () => {
                try {
                    // Check again before saving.
                    if (
                        !evaluation ||
                        evaluation.status !== "draft"
                    ) {
                        return;
                    }

                    setAutoSaving(true);
                    setSaveStatus("Saving...");

                    await saveSingleAnswer(
                        questionId,
                        answersRef.current[questionId]
                    );

                    setSaveStatus("Saved");
                } catch (error) {
                    console.error(
                        "Auto-save failed:",
                        error
                    );

                    setSaveStatus("Auto-save failed");

                    setError(
                        error.response?.data?.message ||
                            "Failed to auto-save answer."
                    );
                } finally {
                    setAutoSaving(false);

                    delete autoSaveTimersRef.current[
                        questionId
                    ];
                }
            }, 800);
    };

    // =========================================================
    // Flush Pending Auto Saves
    // =========================================================

    const flushPendingAutoSaves = async () => {
        // Never flush/save if evaluation is not editable.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        const questionIds = Object.keys(
            autoSaveTimersRef.current
        );

        // Cancel all debounce timers.
        questionIds.forEach((questionId) => {
            clearTimeout(
                autoSaveTimersRef.current[questionId]
            );

            delete autoSaveTimersRef.current[
                questionId
            ];
        });

        // Save latest pending values immediately.
        const pendingSaves = questionIds.map(
            async (questionId) => {
                const currentAnswer =
                    answersRef.current[questionId];

                if (!currentAnswer) {
                    return;
                }

                // If an API request is already running,
                // wait for that request.
                const existingPromise =
                    autoSavePromisesRef.current[
                        questionId
                    ];

                if (existingPromise) {
                    await existingPromise;
                    return;
                }

                await saveSingleAnswer(
                    questionId,
                    currentAnswer
                );
            }
        );

        if (pendingSaves.length > 0) {
            setAutoSaving(true);
            setSaveStatus("Saving...");

            try {
                await Promise.all(pendingSaves);
                setSaveStatus("Saved");
            } finally {
                setAutoSaving(false);
            }
        }
    };

    // =========================================================
    // Answer Change
    // =========================================================

    const handleAnswerChange = (
        questionId,
        value
    ) => {
        // Extra frontend protection.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        setAnswers((previous) => {
            const updatedAnswer = {
                ...previous[questionId],
                answer: value,
            };

            const updatedAnswers = {
                ...previous,
                [questionId]: updatedAnswer,
            };

            answersRef.current = updatedAnswers;

            scheduleAutoSave(
                questionId,
                updatedAnswer
            );

            return updatedAnswers;
        });
    };

    // =========================================================
    // Rating Change
    // =========================================================

    const handleRatingChange = (
        questionId,
        value
    ) => {
        // Extra frontend protection.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        setAnswers((previous) => {
            const updatedAnswer = {
                ...previous[questionId],
                rating:
                    value !== ""
                        ? Number(value)
                        : "",
            };

            const updatedAnswers = {
                ...previous,
                [questionId]: updatedAnswer,
            };

            answersRef.current = updatedAnswers;

            scheduleAutoSave(
                questionId,
                updatedAnswer
            );

            return updatedAnswers;
        });
    };

    // =========================================================
    // Check Required Questions
    // =========================================================

    const validateRequiredQuestions = () => {
        const missingQuestions = [];

        questions.forEach((question, index) => {
            if (!question.is_required) {
                return;
            }

            const currentAnswer =
                answersRef.current[question.id];

            const hasAnswer =
                currentAnswer?.answer &&
                String(
                    currentAnswer.answer
                ).trim() !== "";

            const hasRating =
                currentAnswer?.rating !== "" &&
                currentAnswer?.rating !== null &&
                currentAnswer?.rating !== undefined;

            // Rating or text answer is accepted.
            if (!hasAnswer && !hasRating) {
                missingQuestions.push({
                    number: index + 1,
                    question: question.question,
                });
            }
        });

        return missingQuestions;
    };

    // =========================================================
    // Save All Answers
    // =========================================================

    const saveAnswers = async () => {
        // Never save submitted/locked evaluation.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        // First flush any pending debounce saves.
        await flushPendingAutoSaves();

        const currentAnswers =
            answersRef.current;

        for (const question of questions) {
            const currentAnswer =
                currentAnswers[question.id];

            if (!currentAnswer) {
                continue;
            }

            await saveSingleAnswer(
                question.id,
                currentAnswer
            );
        }
    };

    // =========================================================
    // Manual Save
    // =========================================================

    const handleSaveAnswers = async () => {
        // Do nothing if evaluation is read-only.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");
            setSaveStatus("Saving...");

            await saveAnswers();

            setSuccess(
                "Your answers have been saved successfully."
            );

            setSaveStatus("Saved");

            // Reload from server so UI reflects
            // actual database values.
            await loadEvaluation();
        } catch (error) {
            console.error(
                "Failed to save answers:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to save answers."
            );

            setSaveStatus("Save failed");
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // Submit Evaluation
    // =========================================================

    const handleSubmitEvaluation = async () => {
        // Do nothing if evaluation is already submitted/locked.
        if (!evaluation || evaluation.status !== "draft") {
            return;
        }

        setError("");
        setSuccess("");

        try {
            setSubmitting(true);
            setSaveStatus("Saving...");

            // First save anything waiting for auto-save.
            await flushPendingAutoSaves();

            // =================================================
            // Validate Required Questions
            // =================================================

            const missingQuestions =
                validateRequiredQuestions();

            if (missingQuestions.length > 0) {
                const questionNumbers =
                    missingQuestions
                        .map(
                            (item) => item.number
                        )
                        .join(", ");

                setError(
                    `Please answer all required questions. Missing question(s): ${questionNumbers}.`
                );

                return;
            }

            // =================================================
            // Confirmation
            // =================================================

            const confirmed = window.confirm(
                "Are you sure you want to submit this evaluation? You will not be able to edit it after submission."
            );

            if (!confirmed) {
                return;
            }

            // =================================================
            // Save all answers
            // =================================================

            await saveAnswers();

            // =================================================
            // Submit Evaluation
            // =================================================

            const response = await api.post(
                `/evaluations/${id}/submit`
            );

            setEvaluation(response.data.data);

            setSuccess(
                "Your evaluation has been submitted successfully."
            );

            setSaveStatus("Submitted");

            // Clear any remaining auto-save timers.
            Object.values(
                autoSaveTimersRef.current
            ).forEach((timer) =>
                clearTimeout(timer)
            );

            autoSaveTimersRef.current = {};

            setTimeout(() => {
                navigate(
                    "/management/employee/evaluations"
                );
            }, 1200);
        } catch (error) {
            console.error(
                "Submit error:",
                error
            );

            console.error(
                "Submit response:",
                error.response?.data
            );

            setError(
                error.response?.data?.message ||
                    "Failed to submit evaluation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // Back
    // =========================================================

    const handleBack = async () => {
        try {
            setError("");

            // Only save pending changes if still editable.
            if (
                evaluation &&
                evaluation.status === "draft"
            ) {
                await flushPendingAutoSaves();
            }

            navigate(
                "/management/employee/evaluations"
            );
        } catch (error) {
            console.error(
                "Failed to save before leaving:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to save your latest changes."
            );
        }
    };

    // =========================================================
    // Loading
    // =========================================================

    if (loading) {
        return (
            <div className="management-page">
                <div className="data-table-container">
                    <div className="data-table-empty">
                        <div className="data-table-empty-title">
                            Loading Evaluation...
                        </div>

                        <div className="data-table-empty-message">
                            Please wait while the
                            evaluation details are
                            being loaded.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // Error
    // =========================================================

    if (error && !evaluation) {
        return (
            <div className="management-page">
                <div className="management-error">
                    {error}
                </div>

                <button
                    type="button"
                    className="management-btn-secondary"
                    onClick={() =>
                        navigate(
                            "/management/employee/evaluations"
                        )
                    }
                >
                    Back to My Evaluations
                </button>
            </div>
        );
    }

    // =========================================================
    // Not Found
    // =========================================================

    if (!evaluation) {
        return (
            <div className="management-page">
                <div className="data-table-container">
                    <div className="data-table-empty">
                        <div className="data-table-empty-title">
                            Evaluation Not Found
                        </div>

                        <div className="data-table-empty-message">
                            The requested evaluation
                            could not be found.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // Edit Permission
    // =========================================================
    //
    // IMPORTANT:
    // Employee can edit ONLY while evaluation is draft.
    //
    // Once submitted, approved, returned, rejected, etc.
    // employee can ONLY VIEW the evaluation.
    //
    // =========================================================

    const canEdit =
        evaluation.status === "draft";

    const isReadOnly = !canEdit;

    // =========================================================
    // Status Class
    // =========================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "completed":
                return "evaluation-status approved";

            case "submitted":
                return "evaluation-status submitted";

            case "manager_approved":
            case "hr_approved":
                return "evaluation-status reviewed";

            case "manager_rejected":
            case "hr_rejected":
            case "management_rejected":
                return "evaluation-status rejected";

            case "manager_returned":
            case "hr_returned":
            case "management_returned":
                return "evaluation-status returned";

            case "draft":
            default:
                return "evaluation-status draft";
        }
    };

    // =========================================================
    // Rating Options
    // =========================================================

    const getRatingOptions = (question) => {
        const maxRating = Math.min(
            Number(question.max_rating) || 10,
            10
        );

        const options = [];

        for (
            let rating = 0;
            rating <= maxRating;
            rating++
        ) {
            let label = `${rating}`;

            if (rating === 0) {
                label = "0 - Not Rated";
            } else if (rating === 1) {
                label = "1 - Very Poor";
            } else if (rating === 2) {
                label = "2 - Poor";
            } else if (rating === 3) {
                label = "3 - Needs Improvement";
            } else if (rating === 4) {
                label = "4 - Below Expectations";
            } else if (rating === 5) {
                label = "5 - Meets Expectations";
            } else if (rating === 6) {
                label = "6 - Satisfactory";
            } else if (rating === 7) {
                label = "7 - Good";
            } else if (rating === 8) {
                label = "8 - Very Good";
            } else if (rating === 9) {
                label = "9 - Excellent";
            } else if (rating === 10) {
                label = "10 - Outstanding";
            }

            options.push({
                value: rating,
                label,
            });
        }

        return options;
    };

    // =========================================================
    // Page
    // =========================================================

    return (
        <div className="management-page">

            {/* =================================================
                Page Header
            ================================================= */}

            <div className="page-header">
                <div className="page-header-info">
                    <h1 className="page-header-title">
                        Evaluation Details
                    </h1>

                    <p className="page-header-description">
                        {canEdit
                            ? "Complete your self-evaluation and submit it for review."
                            : "View your submitted evaluation and its current status."}
                    </p>
                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={handleBack}
                    disabled={
                        saving ||
                        submitting ||
                        autoSaving
                    }
                >
                    My Evaluations
                </button>
            </div>

            {/* =================================================
                Messages
            ================================================= */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="management-form-success">
                    {success}
                </div>
            )}

            {/* =================================================
                Read Only Notice
            ================================================= */}

            {isReadOnly && (
                <div
                    className="management-form-success"
                    style={{
                        marginBottom: "16px",
                    }}
                >
                    This evaluation is read-only. You can
                    view your answers, but you cannot edit,
                    save, or submit them.
                </div>
            )}

            {/* =================================================
                Auto Save Status
            ================================================= */}

            {canEdit && saveStatus && (
                <div
                    className="evaluation-save-status"
                    style={{
                        marginBottom: "16px",
                        fontSize: "14px",
                    }}
                >
                    {autoSaving
                        ? "Saving..."
                        : saveStatus}
                </div>
            )}

            {/* =================================================
                Evaluation Summary
            ================================================= */}

            <div className="evaluation-summary">
                <div className="evaluation-summary-header">
                    <div>
                        <span className="evaluation-summary-label">
                            Evaluation Period
                        </span>

                        <h2>
                            {evaluation
                                .evaluation_period
                                ?.name ||
                                evaluation
                                    .evaluationPeriod
                                    ?.name ||
                                "Evaluation"}
                        </h2>
                    </div>

                    <span
                        className={getStatusClass(
                            evaluation.status
                        )}
                    >
                        {evaluation.status}
                    </span>
                </div>

                <div className="evaluation-summary-grid">

                    <div className="evaluation-summary-item">
                        <span>
                            Evaluation ID
                        </span>

                        <strong>
                            #{evaluation.id}
                        </strong>
                    </div>

                    <div className="evaluation-summary-item">
                        <span>
                            Status
                        </span>

                        <strong>
                            {evaluation.status}
                        </strong>
                    </div>

                    <div className="evaluation-summary-item">
                        <span>
                            Employee Comment
                        </span>

                        <strong>
                            {evaluation.employee_comment ||
                                "No comment provided"}
                        </strong>
                    </div>

                </div>
            </div>

            {/* =================================================
                Questions
            ================================================= */}

            <div className="evaluation-section">

                <div className="evaluation-section-header">

                    <div>
                        <h2>
                            Self-Evaluation
                        </h2>

                        <p>
                            {canEdit
                                ? "Please answer all required questions and provide a rating from 0 to 10."
                                : "Your submitted answers are shown below in read-only mode."}
                        </p>
                    </div>

                    <span className="evaluation-question-count">
                        {questions.length} Questions
                    </span>

                </div>

                {questions.length === 0 ? (
                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Questions Found
                        </div>

                        <div className="data-table-empty-message">
                            There are currently no
                            evaluation questions
                            available.
                        </div>

                    </div>
                ) : (
                    <div className="evaluation-question-list">

                        {questions.map(
                            (question, index) => {
                                const currentAnswer =
                                    answers[
                                        question.id
                                    ] || {};

                                return (
                                    <div
                                        key={
                                            question.id
                                        }
                                        className="evaluation-question-card"
                                    >

                                        {/* =========================
                                            Question Header
                                        ========================= */}

                                        <div className="evaluation-question-header">

                                            <div className="evaluation-question-number">
                                                {index + 1}
                                            </div>

                                            <div className="evaluation-question-title">

                                                {question.question}

                                                {question.is_required && (
                                                    <span
                                                        className="required-star"
                                                        title="Required question"
                                                    >
                                                        {" "}
                                                        *
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                        {/* =========================
                                            Answer
                                        ========================= */}

                                        <div className="management-form-field">

                                            <label
                                                htmlFor={`answer-${question.id}`}
                                            >
                                                Your Answer

                                                {question.is_required && (
                                                    <span
                                                        className="required-star"
                                                        title="Required"
                                                    >
                                                        {" "}
                                                        *
                                                    </span>
                                                )}
                                            </label>

                                            <textarea
                                                id={`answer-${question.id}`}
                                                rows="5"
                                                value={
                                                    currentAnswer.answer ||
                                                    ""
                                                }
                                                disabled={
                                                    isReadOnly ||
                                                    submitting
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleAnswerChange(
                                                        question.id,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={
                                                    canEdit
                                                        ? "Write your answer here..."
                                                        : ""
                                                }
                                            />

                                            {question.max_answer_words && (
                                                <small>
                                                    Maximum{" "}
                                                    {
                                                        question.max_answer_words
                                                    }{" "}
                                                    words
                                                </small>
                                            )}

                                        </div>

                                        {/* =========================
                                            Rating
                                        ========================= */}

                                        <div className="management-form-field">

                                            <label
                                                htmlFor={`rating-${question.id}`}
                                            >
                                                Performance Rating

                                                {question.is_required && (
                                                    <span
                                                        className="required-star"
                                                        title="Required"
                                                    >
                                                        {" "}
                                                        *
                                                    </span>
                                                )}
                                            </label>

                                            <select
                                                id={`rating-${question.id}`}
                                                value={
                                                    currentAnswer.rating !==
                                                        "" &&
                                                    currentAnswer.rating !==
                                                        null &&
                                                    currentAnswer.rating !==
                                                        undefined
                                                        ? currentAnswer.rating
                                                        : ""
                                                }
                                                disabled={
                                                    isReadOnly ||
                                                    submitting
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleRatingChange(
                                                        question.id,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Select Rating
                                                </option>

                                                {getRatingOptions(
                                                    question
                                                ).map(
                                                    (
                                                        option
                                                    ) => (
                                                        <option
                                                            key={
                                                                option.value
                                                            }
                                                            value={
                                                                option.value
                                                            }
                                                        >
                                                            {
                                                                option.label
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

            {/* =================================================
                Actions
            ================================================= */}

            <div className="evaluation-actions">

                {canEdit ? (
                    <>
                        {/* ===============================
                            Manual Save
                        =============================== */}

                        <button
                            type="button"
                            className="evaluation-save-button"
                            disabled={
                                saving ||
                                submitting ||
                                autoSaving
                            }
                            onClick={
                                handleSaveAnswers
                            }
                        >
                            {saving
                                ? "Saving..."
                                : "Save Answers"}
                        </button>

                        {/* ===============================
                            Submit
                        =============================== */}

                        <button
                            type="button"
                            className="evaluation-submit-button"
                            disabled={
                                saving ||
                                submitting ||
                                autoSaving
                            }
                            onClick={
                                handleSubmitEvaluation
                            }
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Evaluation"}
                        </button>
                    </>
                ) : (
                    <div className="evaluation-locked-message">
                        This evaluation is{" "}
                        <strong>
                            {evaluation.status}
                        </strong>
                        {" "}and is currently{" "}
                        <strong>
                            read-only
                        </strong>
                        .
                    </div>
                )}

                {/* ===============================
                    Back
                =============================== */}

                <button
                    type="button"
                    className="evaluation-back-button"
                    disabled={
                        saving ||
                        submitting ||
                        autoSaving
                    }
                    onClick={handleBack}
                >
                    Back
                </button>

            </div>

        </div>
    );
};

export default EvaluationDetails;
