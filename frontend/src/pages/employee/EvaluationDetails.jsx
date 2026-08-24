import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";

const EvaluationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ==========================================================
    // State
    // ==========================================================

    const [evaluation, setEvaluation] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================================
    // Load Evaluation
    // ==========================================================

    useEffect(() => {
        loadEvaluation();
    }, [id]);

    const loadEvaluation = async () => {
        try {
            setLoading(true);
            setError("");

            // --------------------------------------------------
            // Evaluation
            // --------------------------------------------------

            const evaluationResponse = await api.get(
                `/evaluations/${id}`
            );

            const evaluationData =
                evaluationResponse.data.data;

            setEvaluation(evaluationData);

            // --------------------------------------------------
            // Questions
            // --------------------------------------------------

            const questionsResponse = await api.get(
                "/evaluation-questions"
            );

            const questionsData =
                questionsResponse.data.data || [];

            setQuestions(questionsData);

            // --------------------------------------------------
            // Existing Answers
            // --------------------------------------------------

            const existingAnswers = {};

            if (evaluationData.answers) {
                evaluationData.answers.forEach((item) => {
                    existingAnswers[item.question_id] = {
                        answer: item.answer || "",
                        rating:
                            item.rating !== null &&
                            item.rating !== undefined
                                ? Number(item.rating)
                                : "",
                    };
                });
            }

            setAnswers(existingAnswers);

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

    // ==========================================================
    // Answer Handlers
    // ==========================================================

    const handleAnswerChange = (
        questionId,
        value
    ) => {
        setAnswers((previous) => ({
            ...previous,

            [questionId]: {
                ...previous[questionId],
                answer: value,
            },
        }));
    };

    const handleRatingChange = (
        questionId,
        value
    ) => {
        setAnswers((previous) => ({
            ...previous,

            [questionId]: {
                ...previous[questionId],
                rating: value
                    ? Number(value)
                    : "",
            },
        }));
    };

    // ==========================================================
    // Save Answers
    // ==========================================================

    const saveAnswers = async () => {
        for (const question of questions) {
            const currentAnswer =
                answers[question.id];

            // Skip unanswered questions
            if (
                !currentAnswer ||
                (
                    !currentAnswer.answer?.trim() &&
                    !currentAnswer.rating
                )
            ) {
                continue;
            }

            await api.post(
                "/evaluation-answers",
                {
                    evaluation_id: Number(id),
                    question_id: question.id,
                    answer:
                        currentAnswer.answer || null,
                    rating:
                        currentAnswer.rating || null,
                }
            );
        }
    };

    // ==========================================================
    // Save Button
    // ==========================================================

    const handleSaveAnswers = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await saveAnswers();

            setSuccess(
                "Answers saved successfully."
            );

            // Reload latest data
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
        } finally {
            setSaving(false);
        }
    };

    // ==========================================================
    // Submit Evaluation
    // ==========================================================

    const handleSubmitEvaluation = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to submit this evaluation? You cannot edit it after submission."
        );

        if (!confirmed) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            // --------------------------------------------------
            // Save answers first
            // --------------------------------------------------

            await saveAnswers();

            // --------------------------------------------------
            // Submit evaluation
            // --------------------------------------------------

            const response = await api.post(
                `/evaluations/${id}/submit`
            );

            setEvaluation(
                response.data.data
            );

            setSuccess(
                "Evaluation submitted successfully."
            );

            // Redirect after success
            setTimeout(() => {
                navigate(
                    "/management/employee/evaluations"
                );
            }, 1200);

        } catch (error) {
            console.error(
                "Failed to submit evaluation:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to submit evaluation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {
        return (
            <div className="management-form-container">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Loading Evaluation...
                    </div>

                    <div className="data-table-empty-message">
                        Please wait while the evaluation
                        details are being loaded.
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Error Without Evaluation
    // ==========================================================

    if (error && !evaluation) {
        return (
            <div className="management-form-container">

                <div className="management-form-error">
                    {error}
                </div>

                <div className="management-form-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/management/employee/evaluations"
                            )
                        }
                    >
                        Back to My Evaluations
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
            <div className="management-form-container">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Evaluation Not Found
                    </div>

                    <div className="data-table-empty-message">
                        The requested evaluation could not
                        be found.
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Edit Permission
    // ==========================================================

    const canEdit =
        evaluation.status === "draft" ||
        evaluation.status === "returned" ||
        evaluation.status === "rejected";

    // ==========================================================
    // Page
    // ==========================================================

    return (
        <div className="management-form-container">

            {/* ==================================================
                Page Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Evaluation Details
                    </h1>

                    <p className="page-header-description">
                        Complete and submit your employee
                        self-evaluation.
                    </p>

                </div>

            </div>


            {/* ==================================================
                Messages
            ================================================== */}

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


            {/* ==================================================
                Evaluation Information
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Evaluation Information
                    </h2>

                </div>

                <div className="management-form-grid">

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Evaluation Period
                        </span>

                        <span className="management-form-info-value">
                            {evaluation.evaluation_period?.name ||
                                "-"}
                        </span>

                    </div>


                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Evaluation ID
                        </span>

                        <span className="management-form-info-value">
                            #{evaluation.id}
                        </span>

                    </div>


                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Status
                        </span>

                        <span className="management-form-info-value">
                            {evaluation.status}
                        </span>

                    </div>


                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Employee Comment
                        </span>

                        <span className="management-form-info-value">
                            {evaluation.employee_comment ||
                                "-"}
                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Evaluation Questions
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Evaluation Questions
                    </h2>

                    <p>
                        Answer each question and provide
                        an appropriate rating.
                    </p>

                </div>


                {questions.length === 0 ? (

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Questions Found
                        </div>

                        <div className="data-table-empty-message">
                            No evaluation questions are
                            currently available.
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
                                        key={question.id}
                                        className="evaluation-question-card"
                                    >

                                        {/* Question */}

                                        <div className="evaluation-question-title">

                                            <span>
                                                {index + 1}.
                                            </span>

                                            <strong>
                                                {question.question}
                                            </strong>

                                        </div>


                                        {/* Answer */}

                                        <div className="management-form-field">

                                            <label
                                                htmlFor={`answer-${question.id}`}
                                            >
                                                Your Answer
                                            </label>

                                            <textarea
                                                id={`answer-${question.id}`}
                                                rows="5"
                                                value={
                                                    currentAnswer.answer ||
                                                    ""
                                                }
                                                disabled={
                                                    !canEdit ||
                                                    saving ||
                                                    submitting
                                                }
                                                onChange={(e) =>
                                                    handleAnswerChange(
                                                        question.id,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Write your answer..."
                                            />

                                        </div>


                                        {/* Rating */}

                                        <div className="management-form-field">

                                            <label
                                                htmlFor={`rating-${question.id}`}
                                            >
                                                Rating
                                            </label>

                                            <select
                                                id={`rating-${question.id}`}
                                                value={
                                                    currentAnswer.rating ||
                                                    ""
                                                }
                                                disabled={
                                                    !canEdit ||
                                                    saving ||
                                                    submitting
                                                }
                                                onChange={(e) =>
                                                    handleRatingChange(
                                                        question.id,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Select Rating
                                                </option>

                                                <option value="1">
                                                    1 - Poor
                                                </option>

                                                <option value="2">
                                                    2 - Needs Improvement
                                                </option>

                                                <option value="3">
                                                    3 - Meets Expectations
                                                </option>

                                                <option value="4">
                                                    4 - Very Good
                                                </option>

                                                <option value="5">
                                                    5 - Excellent
                                                </option>

                                            </select>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>


            {/* ==================================================
                Actions
            ================================================== */}

            <div className="management-form-actions">

                {canEdit && (

                    <>

                        <button
                            type="button"
                            disabled={
                                saving ||
                                submitting
                            }
                            onClick={
                                handleSaveAnswers
                            }
                        >
                            {saving
                                ? "Saving..."
                                : "Save Answers"}
                        </button>


                        <button
                            type="button"
                            disabled={
                                saving ||
                                submitting
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
                )}


                {!canEdit && (
                    <div className="management-form-info-message">
                        This evaluation is currently{" "}
                        <strong>
                            {evaluation.status}
                        </strong>
                        .
                    </div>
                )}


                <button
                    type="button"
                    disabled={
                        saving ||
                        submitting
                    }
                    onClick={() =>
                        navigate(
                            "/management/employee/evaluations"
                        )
                    }
                >
                    Back to My Evaluations
                </button>

            </div>

        </div>
    );
};

export default EvaluationDetails;