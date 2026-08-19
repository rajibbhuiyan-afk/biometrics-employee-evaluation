import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const MyEvaluations = () => {
    const navigate = useNavigate();

    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submittingId, setSubmittingId] = useState(null);

    useEffect(() => {
        fetchMyEvaluations();
    }, []);

    const fetchMyEvaluations = async () => {
        try {
            const response = await api.get("/evaluations");

            console.log("My Evaluations:", response.data);

            setEvaluations(response.data.data || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluations."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (evaluationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to submit this evaluation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSubmittingId(evaluationId);
            setError("");

            const response = await api.post(
                `/evaluations/${evaluationId}/submit`
            );

            console.log("Evaluation Submitted:", response.data);

            alert("Evaluation submitted successfully.");

            await fetchMyEvaluations();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to submit evaluation."
            );
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) {
        return <div>Loading evaluations...</div>;
    }

    return (
        <div>
            <h1>My Evaluations</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={() =>
                    navigate("/employee/evaluations/create")
                }
            >
                Create New Evaluation
            </button>

            <br />
            <br />

            {evaluations.length === 0 ? (
                <p>No evaluations found.</p>
            ) : (
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Evaluation Period</th>
                            <th>Comment</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {evaluations.map((evaluation) => (
                            <tr key={evaluation.id}>
                                <td>
                                    {evaluation.id}
                                </td>

                                <td>
                                    {evaluation.evaluation_period?.name ||
                                        "N/A"}
                                </td>

                                <td>
                                    {evaluation.employee_comment ||
                                        "No comment"}
                                </td>

                                <td>
                                    {evaluation.status}
                                </td>

                                <td>
                                    {evaluation.created_at
                                        ? new Date(
                                            evaluation.created_at
                                        ).toLocaleDateString()
                                        : "N/A"}
                                </td>

                                <td>
                                    {evaluation.status === "draft" ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSubmit(
                                                    evaluation.id
                                                )
                                            }
                                            disabled={
                                                submittingId ===
                                                evaluation.id
                                            }
                                        >
                                            {submittingId ===
                                            evaluation.id
                                                ? "Submitting..."
                                                : "Submit"}
                                        </button>
                                    ) : (
                                        <span>No action</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyEvaluations;