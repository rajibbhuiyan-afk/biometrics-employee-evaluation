import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const HRDashboard = () => {
    const navigate = useNavigate();

    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/evaluations");

            console.log("HR Evaluations:", response.data);

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

    if (loading) {
        return <div>Loading evaluations...</div>;
    }

    return (
        <div>
            <h1>HR Dashboard</h1>

            <button
                type="button"
                onClick={() => navigate("/management")}
                style={{
                    marginBottom: "30px",
                    padding: "10px 20px",
                    cursor: "pointer",
                }}
            >
                Management
            </button>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {evaluations.length === 0 ? (
                <p>No evaluations found.</p>
            ) : (
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Evaluation ID</th>
                            <th>Employee</th>
                            <th>Employee ID</th>
                            <th>Department</th>
                            <th>Evaluation Period</th>
                            <th>Status</th>
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
                                    {evaluation.employee?.name || "Unknown"}
                                </td>

                                <td>
                                    {evaluation.employee?.employee_id || "N/A"}
                                </td>

                                <td>
                                    {evaluation.employee?.department?.name || "N/A"}
                                </td>

                                <td>
                                    {evaluation.evaluation_period?.name || "N/A"}
                                </td>

                                <td>
                                    {evaluation.status}
                                </td>

                                <td>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/hr/evaluations/${evaluation.id}`
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

export default HRDashboard;