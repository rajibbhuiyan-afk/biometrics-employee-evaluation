import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

const CreateEvaluation = () => {
    const navigate = useNavigate();

    // ==========================================================
    // State
    // ==========================================================

    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    // ==========================================================
    // Fetch Active Evaluation Periods
    // ==========================================================

    useEffect(() => {
        fetchEvaluationPeriods();
    }, []);

    const fetchEvaluationPeriods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/evaluation-periods/active"
            );

            console.log(
                "Active Evaluation Periods:",
                response.data
            );

            setPeriods(
                response.data.data || []
            );

        } catch (error) {
            console.error(
                "Failed to load evaluation periods:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation periods."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // Create Evaluation
    // ==========================================================

    const handleCreateEvaluation = async (e) => {
        e.preventDefault();

        setError("");

        if (!selectedPeriod) {
            setError(
                "Please select an evaluation period."
            );

            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post(
                "/evaluations",
                {
                    evaluation_period_id:
                        Number(selectedPeriod),

                    employee_comment:
                        comment.trim() || null,
                }
            );

            console.log(
                "Evaluation Created:",
                response.data
            );

            navigate(
                "/management/employee/evaluations"
            );

        } catch (error) {
            console.error(
                "Failed to create evaluation:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create evaluation."
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
            <div className="management-form-page">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Loading Evaluation Periods...
                    </div>

                    <div className="data-table-empty-message">
                        Please wait while active evaluation
                        periods are being loaded.
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Page
    // ==========================================================

    return (
        <div className="management-form-page">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Create Evaluation
                    </h1>

                    <p className="page-header-description">
                        Start a new employee self-evaluation
                        for an active evaluation period.
                    </p>

                </div>

            </div>


            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                Form
            ================================================== */}

            <form
                onSubmit={handleCreateEvaluation}
                className="management-form"
            >

                {/* ==================================================
                    Evaluation Period
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="evaluation_period">
                        Evaluation Period
                    </label>

                    <select
                        id="evaluation_period"
                        value={selectedPeriod}
                        onChange={(e) =>
                            setSelectedPeriod(
                                e.target.value
                            )
                        }
                        required
                        disabled={submitting}
                    >

                        <option value="">
                            Select Evaluation Period
                        </option>

                        {periods.map((period) => (
                            <option
                                key={period.id}
                                value={period.id}
                            >
                                {period.name}
                            </option>
                        ))}

                    </select>

                </div>


                {/* ==================================================
                    Employee Comment
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="employee_comment">
                        Employee Comment
                    </label>

                    <textarea
                        id="employee_comment"
                        value={comment}
                        onChange={(e) =>
                            setComment(
                                e.target.value
                            )
                        }
                        placeholder="Enter your comment..."
                        rows="6"
                        disabled={submitting}
                    />

                    <small
                        style={{
                            color: "#6b7280",
                            fontSize: "13px",
                        }}
                    >
                        You can provide any additional
                        information about your evaluation.
                    </small>

                </div>


                {/* ==================================================
                    Actions
                ================================================== */}

                <div className="management-form-actions">

                    {/* Create Button */}

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating..."
                            : "Create Evaluation"}
                    </button>


                    {/* Cancel Button */}

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/employee/evaluations"
                            )
                        }
                        disabled={submitting}
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
};

export default CreateEvaluation;