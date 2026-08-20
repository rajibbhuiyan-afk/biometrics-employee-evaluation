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

    useEffect(() => {
        loadEvaluation();
    }, [id]);

    const loadEvaluation = async () => {
        try {
            setLoading(true);
            setError("");

            // Load evaluation
            const evaluationResponse = await api.get(
                `/evaluations/${id}`
            );

            const evaluationData = evaluationResponse.data.data;

            console.log("Evaluation:", evaluationData);

            setEvaluation(evaluationData);

            // Load questions
            const questionsResponse = await api.get(
                "/evaluation-questions"
            );

            const questionsData =
                questionsResponse.data.data || [];

            console.log("Questions:", questionsData);

            setQuestions(questionsData);

            // Load existing answers
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
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation."
            );
        } finally {
            setLoading(false);
        }
    };

    // Answer change
    const handleAnswerChange = (questionId, value) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: {
                ...previous[questionId],
                answer: value,
            },
        }));
    };

    // Rating change
    const handleRatingChange = (questionId, rating) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: {
                ...previous[questionId],
                rating: rating ? Number(rating) : "",
            },
        }));
    };

    // Save answers
    const handleSaveAnswers = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            for (const question of questions) {
                const currentAnswer = answers[question.id];

                if (
                    !currentAnswer ||
                    (
                        !currentAnswer.answer?.trim() &&
                        !currentAnswer.rating
                    )
                ) {
                    continue;
                }

                await api.post("/evaluation-answers", {
                    evaluation_id: Number(id),
                    question_id: question.id,
                    answer: currentAnswer.answer || null,
                    rating: currentAnswer.rating || null,
                });
            }

            setSuccess("Answers saved successfully.");

            // Reload so latest saved answers are available
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

    // Submit evaluation
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

            // Save answers first
            for (const question of questions) {
                const currentAnswer = answers[question.id];

                if (
                    !currentAnswer ||
                    (
                        !currentAnswer.answer?.trim() &&
                        !currentAnswer.rating
                    )
                ) {
                    continue;
                }

                await api.post("/evaluation-answers", {
                    evaluation_id: Number(id),
                    question_id: question.id,
                    answer: currentAnswer.answer || null,
                    rating: currentAnswer.rating || null,
                });
            }

            // Submit evaluation
            const response = await api.post(
                `/evaluations/${id}/submit`
            );

            console.log(
                "Evaluation Submitted:",
                response.data
            );

            setSuccess(
                "Evaluation submitted successfully."
            );

            setEvaluation(response.data.data);

            setTimeout(() => {
                navigate("/employee/evaluations");
            }, 1200);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to submit evaluation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div>
                <h2>Loading evaluation...</h2>
            </div>
        );
    }

    if (error && !evaluation) {
        return (
            <div>
                <p style={{ color: "red" }}>
                    {error}
                </p>

                <button
                    onClick={() =>
                        navigate("/employee/evaluations")
                    }
                >
                    Back to My Evaluations
                </button>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div>
                <p>Evaluation not found.</p>
            </div>
        );
    }

    const canEdit =
        evaluation.status === "draft" ||
        evaluation.status === "returned" ||
        evaluation.status === "rejected";

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "30px auto",
            }}
        >
            <h1>Evaluation Details</h1>

            {error && (
                <div
                    style={{
                        color: "red",
                        marginBottom: "15px",
                    }}
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={{
                        color: "green",
                        marginBottom: "15px",
                    }}
                >
                    {success}
                </div>
            )}

            {/* Evaluation Information */}

            <div
                style={{
                    border: "1px solid #ddd",
                    padding: "20px",
                    marginBottom: "25px",
                }}
            >
                <h2>
                    {evaluation.evaluation_period?.name}
                </h2>

                <p>
                    <strong>Evaluation ID:</strong>{" "}
                    {evaluation.id}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    {evaluation.status}
                </p>

                <p>
                    <strong>Employee Comment:</strong>{" "}
                    {evaluation.employee_comment || "-"}
                </p>
            </div>

            {/* Questions */}

            <h2>Evaluation Questions</h2>

            {questions.length === 0 ? (
                <p>
                    No evaluation questions found.
                </p>
            ) : (
                questions.map((question, index) => {
                    const currentAnswer =
                        answers[question.id] || {};

                    return (
                        <div
                            key={question.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "20px",
                                marginBottom: "20px",
                            }}
                        >
                            <label>
                                <strong>
                                    {index + 1}.{" "}
                                    {question.question}
                                </strong>
                            </label>

                            <br />
                            <br />

                            {/* Employee Answer */}

                            <textarea
                                rows="5"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                }}
                                disabled={!canEdit}
                                value={
                                    currentAnswer.answer || ""
                                }
                                onChange={(e) =>
                                    handleAnswerChange(
                                        question.id,
                                        e.target.value
                                    )
                                }
                                placeholder="Write your answer..."
                            />

                            <br />
                            <br />

                            {/* Rating */}

                            <div>
                                <label>
                                    <strong>
                                        Rating:
                                    </strong>
                                </label>

                                <br />

                                <select
                                    disabled={!canEdit}
                                    value={
                                        currentAnswer.rating || ""
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
                })
            )}

            {/* Actions */}

            {canEdit && (
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        disabled={saving || submitting}
                        onClick={handleSaveAnswers}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Answers"}
                    </button>

                    <button
                        type="button"
                        disabled={saving || submitting}
                        onClick={handleSubmitEvaluation}
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Evaluation"}
                    </button>
                </div>
            )}

            {!canEdit && (
                <p>
                    This evaluation is currently{" "}
                    <strong>
                        {evaluation.status}
                    </strong>
                    .
                </p>
            )}

            <br />

            <button
                type="button"
                onClick={() =>
                    navigate("/employee/evaluations")
                }
            >
                Back to My Evaluations
            </button>
        </div>
    );
};

export default EvaluationDetails;