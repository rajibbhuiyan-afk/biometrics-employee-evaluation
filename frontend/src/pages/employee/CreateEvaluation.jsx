import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateEvaluation = () => {
    const navigate = useNavigate();

    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState("");

    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvaluationPeriods();
    }, []);

    const fetchEvaluationPeriods = async () => {
        try {
            const response = await api.get("/evaluation-periods");

            console.log("Evaluation Periods:", response.data);

            setPeriods(response.data.data || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation periods."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvaluation = async (e) => {
        e.preventDefault();

        if (!selectedPeriod) {
            setError("Please select an evaluation period.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const response = await api.post("/evaluations", {
                evaluation_period_id: Number(selectedPeriod),
                status: "draft",
                employee_comment: comment,
            });

            console.log("Evaluation Created:", response.data);

            alert("Evaluation created successfully.");

            navigate("/employee/evaluations");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to create evaluation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div>Loading evaluation periods...</div>;
    }

    return (
        <div>
            <h1>Create Evaluation</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleCreateEvaluation}>

                <div>
                    <label>
                        Evaluation Period
                    </label>

                    <br />

                    <select
                        value={selectedPeriod}
                        onChange={(e) =>
                            setSelectedPeriod(e.target.value)
                        }
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

                <br />

                <div>
                    <label>
                        Employee Comment
                    </label>

                    <br />

                    <textarea
                        value={comment}
                        onChange={(e) =>
                            setComment(e.target.value)
                        }
                        placeholder="Enter your comment"
                        rows="5"
                        cols="50"
                    />
                </div>

                <br />

                <button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? "Creating..."
                        : "Create Evaluation"}
                </button>

            </form>
        </div>
    );
};

export default CreateEvaluation;