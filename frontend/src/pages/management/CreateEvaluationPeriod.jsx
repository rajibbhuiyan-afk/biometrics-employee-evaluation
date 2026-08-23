import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateEvaluationPeriod = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        start_date: "",
        end_date: "",
        submission_start_date: "",
        submission_end_date: "",
        status: "draft",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await api.post("/evaluation-periods", form);

            alert("Evaluation period created successfully.");

            navigate("/management/evaluation-periods");

        } catch (error) {
            console.error(error);

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const messages = Object.values(validationErrors)
                    .flat()
                    .join("\n");

                setError(messages);
            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to create evaluation period."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Create Evaluation Period
            </h1>

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            <form
                className="management-form"
                onSubmit={handleSubmit}
            >

                {/* Evaluation Period Name */}

                <div className="management-form-field">
                    <label htmlFor="name">
                        Evaluation Period Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="2026 Annual Performance Evaluation"
                        required
                    />
                </div>

                {/* Period Start Date */}

                <div className="management-form-field">
                    <label htmlFor="start_date">
                        Period Start Date
                    </label>

                    <input
                        id="start_date"
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Period End Date */}

                <div className="management-form-field">
                    <label htmlFor="end_date">
                        Period End Date
                    </label>

                    <input
                        id="end_date"
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Submission Start Date */}

                <div className="management-form-field">
                    <label htmlFor="submission_start_date">
                        Submission Start Date
                    </label>

                    <input
                        id="submission_start_date"
                        type="date"
                        name="submission_start_date"
                        value={form.submission_start_date}
                        onChange={handleChange}
                        min={form.start_date || undefined}
                        max={form.end_date || undefined}
                        required
                    />
                </div>

                {/* Submission End Date */}

                <div className="management-form-field">
                    <label htmlFor="submission_end_date">
                        Submission End Date
                    </label>

                    <input
                        id="submission_end_date"
                        type="date"
                        name="submission_end_date"
                        value={form.submission_end_date}
                        onChange={handleChange}
                        min={
                            form.submission_start_date ||
                            form.start_date ||
                            undefined
                        }
                        max={form.end_date || undefined}
                        required
                    />
                </div>

                {/* Status */}

                <div className="management-form-field">
                    <label htmlFor="status">
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="draft">
                            Draft
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="closed">
                            Closed
                        </option>
                    </select>
                </div>

                {/* Description */}

                <div className="management-form-field">
                    <label htmlFor="description">
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Evaluation period description..."
                    />
                </div>

                {/* Buttons */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Evaluation Period"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/evaluation-periods"
                            )
                        }
                    >
                        Cancel
                    </button>

                </div>

            </form>
        </div>
    );
};

export default CreateEvaluationPeriod;