import { useEffect, useState } from "react";
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
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // Load Evaluation
    // =========================================================

    useEffect(() => {
        loadEvaluation();
    }, [id]);

    const loadEvaluation = async () => {
        try {
            setLoading(true);
            setError("");

            const evaluationResponse = await api.get(
                `/evaluations/${id}`
            );

            const evaluationData =
                evaluationResponse.data.data;

            setEvaluation(evaluationData);

            const questionsResponse = await api.get(
                "/evaluation-questions"
            );

            const questionsData =
                questionsResponse.data.data || [];

            setQuestions(questionsData);

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

    // =========================================================
    // Answer Change
    // =========================================================

    const handleAnswerChange = (questionId, value) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: {
                ...previous[questionId],
                answer: value,
            },
        }));
    };

    // =========================================================
    // Rating Change
    // =========================================================

    const handleRatingChange = (questionId, value) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: {
                ...previous[questionId],
                rating: value ? Number(value) : "",
            },
        }));
    };

    // =========================================================
    // Check Required Questions
    // =========================================================

    const validateRequiredQuestions = () => {

        const missingQuestions = [];

        questions.forEach((question, index) => {

            // Only required questions
            if (!question.is_required) {
                return;
            }

            const currentAnswer =
                answers[question.id];

            const hasAnswer =
                currentAnswer?.answer &&
                currentAnswer.answer.trim() !== "";

            const hasRating =
                currentAnswer?.rating !== "" &&
                currentAnswer?.rating !== null &&
                currentAnswer?.rating !== undefined;

            // Required question must have
            // either answer or rating
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
    // Save Answers
    // =========================================================

    const saveAnswers = async () => {

        for (const question of questions) {

            const currentAnswer =
                answers[question.id];

            // No answer object
            if (!currentAnswer) {
                continue;
            }

            const hasAnswer =
                currentAnswer.answer &&
                currentAnswer.answer.trim() !== "";

            const hasRating =
                currentAnswer.rating !== "" &&
                currentAnswer.rating !== null &&
                currentAnswer.rating !== undefined;

            // Skip completely empty optional questions
            if (!hasAnswer && !hasRating) {
                continue;
            }

            await api.post(
                "/evaluation-answers",
                {
                    evaluation_id: Number(id),
                    question_id: question.id,

                    answer:
                        hasAnswer
                            ? currentAnswer.answer.trim()
                            : null,

                    rating:
                        hasRating
                            ? currentAnswer.rating
                            : null,
                }
            );
        }
    };

    // =========================================================
    // Save
    // =========================================================

    const handleSaveAnswers = async () => {

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            await saveAnswers();

            setSuccess(
                "Your answers have been saved successfully."
            );

            await loadEvaluation();

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to save answers."
            );

        } finally {

            setSaving(false);

        }
    };

    // =========================================================
    // Submit
    // =========================================================

    const handleSubmitEvaluation = async () => {

        setError("");
        setSuccess("");

        // =====================================================
        // Validate Required Questions
        // =====================================================

        const missingQuestions =
            validateRequiredQuestions();

        if (missingQuestions.length > 0) {

            const questionNumbers =
                missingQuestions
                    .map((item) => item.number)
                    .join(", ");

            setError(
                `Please answer all required questions. Missing question(s): ${questionNumbers}.`
            );

            return;
        }

        // =====================================================
        // Confirmation
        // =====================================================

        const confirmed = window.confirm(
            "Are you sure you want to submit this evaluation? You will not be able to edit it after submission."
        );

        if (!confirmed) {
            return;
        }

        // =====================================================
        // Submit
        // =====================================================

        try {

            setSubmitting(true);

            setError("");
            setSuccess("");

            // Save all provided answers first
            await saveAnswers();

            // Submit evaluation
            const response = await api.post(
                `/evaluations/${id}/submit`
            );

            setEvaluation(response.data.data);

            setSuccess(
                "Your evaluation has been submitted successfully."
            );

            setTimeout(() => {

                navigate(
                    "/management/employee/evaluations"
                );

            }, 1200);

        } catch (error) {

            console.error(error);

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
                            Please wait while the evaluation
                            details are being loaded.
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
                            The requested evaluation could not
                            be found.
                        </div>

                    </div>

                </div>

            </div>
        );
    }

    // =========================================================
    // Edit Permission
    // =========================================================

    const canEdit =
            evaluation.status === "draft" ||
            evaluation.status === "manager_returned" ||
            evaluation.status === "manager_rejected" ||
            evaluation.status === "admin_returned" ||
            evaluation.status === "admin_rejected";

    // =========================================================
    // Status Class
    // =========================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "approved":
            case "admin_approved":
                return "evaluation-status approved";

            case "submitted":
                return "evaluation-status submitted";

            case "reviewed":
            case "manager_approved":
                return "evaluation-status reviewed";

            case "rejected":
            case "manager_rejected":
            case "admin_rejected":
                return "evaluation-status rejected";

            case "returned":
            case "manager_returned":
            case "admin_returned":
                return "evaluation-status returned";

            default:
                return "evaluation-status draft";
        }
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
                        Complete your self-evaluation and submit
                        it for review.
                    </p>

                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={() =>
                        navigate(
                            "/management/employee/evaluations"
                        )
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
                Evaluation Summary
            ================================================= */}

            <div className="evaluation-summary">

                <div className="evaluation-summary-header">

                    <div>

                        <span className="evaluation-summary-label">
                            Evaluation Period
                        </span>

                        <h2>
                            {evaluation.evaluation_period?.name ||
                                evaluation.evaluationPeriod?.name ||
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
                            Please answer all required questions
                            and provide a rating from 1 to 5.
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
                            There are currently no evaluation
                            questions available.
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

                                        {/* Question Header */}

                                        <div className="evaluation-question-header">

                                            <div className="evaluation-question-number">
                                                {index + 1}
                                            </div>

                                            <div className="evaluation-question-title">

                                                {question.question}
                                                
                                                {
                                                    console.log(
                                                    "Question:",
                                                    question.question,
                                                    "is_required:",
                                                    question.is_required,
                                                    "Type:",
                                                    typeof question.is_required
                                                )
                                                }
                                                {/* Required Star */}

                                               {/* {Number */}
                                               {(question.is_required) === true && (
                                                    <span
                                                        className="required-star"
                                                        title="Required question"
                                                    >
                                                        {" "}*
                                                    </span>
                                                )}
                                                

                                            </div>

                                        </div>


                                        {/* Answer */}

                                        <div className="management-form-field">

                                            <label
                                                htmlFor={`answer-${question.id}`}
                                            >
                                                Your Answer

                                                {/* {question.is_required && (
                                                    <span
                                                        className="required-star"
                                                        title="Required"
                                                    >
                                                        {" "}*
                                                    </span>
                                                )} */}

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
                                                placeholder="Write your answer here..."
                                            />

                                        </div>


                                        {/* Rating */}

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
                                                        {" "}*
                                                    </span>
                                                )}

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


            {/* =================================================
                Actions
            ================================================= */}

            <div className="evaluation-actions">

                {canEdit ? (

                    <>

                        <button
                            type="button"
                            className="evaluation-save-button"
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
                            className="evaluation-submit-button"
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

                ) : (

                    <div className="evaluation-locked-message">

                        This evaluation is currently{" "}

                        <strong>
                            {evaluation.status}
                        </strong>

                        .

                    </div>

                )}


                <button
                    type="button"
                    className="evaluation-back-button"
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
                    Back
                </button>

            </div>

        </div>
    );
};

export default EvaluationDetails;