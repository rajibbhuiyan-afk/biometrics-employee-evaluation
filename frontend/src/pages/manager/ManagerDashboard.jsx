import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ManagerDashboard = () => {
    const navigate = useNavigate();

    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        try {
            const response = await api.get("/evaluations");

            console.log("Evaluations:", response.data);

            const data = response.data.data || [];

            // Manager-এর জন্য submitted/reviewed evaluation দেখানো
            const filtered = data.filter(
                (evaluation) =>
                    evaluation.status === "submitted" ||
                    evaluation.status === "reviewed"
            );

            setEvaluations(filtered);

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

    if (loading) {
        return <div>Loading evaluations...</div>;
    }

    return (
        <div>
            <h1>Manager Dashboard</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {evaluations.length === 0 ? (
                <p>No submitted evaluations found.</p>
            ) : (
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Evaluation ID</th>
                            <th>Employee</th>
                            <th>Evaluation Period</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {evaluations.map((evaluation) => (
                            <tr key={evaluation.id}>
                                <td>{evaluation.id}</td>

                                <td>
                                    {evaluation.employee?.name ||
                                        "Unknown"}
                                </td>

                                <td>
                                    {evaluation.evaluation_period?.name ||
                                        "Unknown"}
                                </td>

                                <td>
                                    {evaluation.status}
                                </td>

                                <td>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/manager/evaluations/${evaluation.id}`
                                            )
                                        }
                                    >
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManagerDashboard;