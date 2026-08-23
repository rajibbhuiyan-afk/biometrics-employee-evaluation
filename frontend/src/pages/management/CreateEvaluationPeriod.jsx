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
        <div
            style={{
                maxWidth: "700px",
                margin: "30px auto",
                padding: "20px",
            }}
        >
            <h1>Create Evaluation Period</h1>

            {error && (
                <pre
                    style={{
                        color: "red",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {error}
                </pre>
            )}

            <form onSubmit={handleSubmit}>

                {/* Name */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Evaluation Period Name</label>

                    <br />

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="2026 Annual Performance Evaluation"
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                        }}
                    />
                </div>


                {/* Period Start Date */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Period Start Date</label>

                    <br />

                    <input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                        }}
                    />
                </div>


                {/* Period End Date */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Period End Date</label>

                    <br />

                    <input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                        }}
                    />
                </div>


                {/* Submission Start Date */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Submission Start Date</label>

                    <br />

                    <input
                        type="date"
                        name="submission_start_date"
                        value={form.submission_start_date}
                        onChange={handleChange}
                        min={form.start_date || undefined}
                        max={form.end_date || undefined}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                        }}
                    />
                </div>


                {/* Submission End Date */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Submission End Date</label>

                    <br />

                    <input
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
                        style={{
                            width: "100%",
                            padding: "10px",
                        }}
                    />
                </div>


                {/* Status */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Status</label>

                    <br />

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "10px",
                        }}
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
                <div style={{ marginBottom: "20px" }}>
                    <label>Description</label>

                    <br />

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Evaluation period description..."
                        style={{
                            width: "100%",
                            padding: "10px",
                        }}
                    />
                </div>


                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "10px 20px",
                        marginRight: "10px",
                    }}
                >
                    {loading
                        ? "Creating..."
                        : "Create Evaluation Period"}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/management/evaluation-periods")
                    }
                    style={{
                        padding: "10px 20px",
                    }}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
};

export default CreateEvaluationPeriod;
