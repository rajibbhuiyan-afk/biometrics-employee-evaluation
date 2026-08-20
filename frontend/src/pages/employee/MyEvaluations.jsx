import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const MyEvaluations = () => {

    const navigate = useNavigate();

    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

                <p>
                    No evaluations found.
                </p>

            ) : (

                <table border="1" cellPadding="10">

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Evaluation Period</th>
                            <th>Status</th>
                            <th>Comment</th>
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
                                    {evaluation.evaluation_period?.name}
                                </td>

                                <td>
                                    {evaluation.status}
                                </td>

                                <td>
                                    {evaluation.employee_comment || "-"}
                                </td>

                                <td>

                                    {evaluation.status === "draft" && (
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/employee/evaluations/${evaluation.id}`
                                                )
                                            }
                                        >
                                            Continue
                                        </button>
                                    )}

                                    {evaluation.status === "submitted" && (
                                        <span>
                                            Submitted
                                        </span>
                                    )}

                                    {evaluation.status === "reviewed" && (
                                        <span>
                                            Reviewed
                                        </span>
                                    )}

                                    {evaluation.status === "approved" && (
                                        <span>
                                            Approved
                                        </span>
                                    )}

                                    {evaluation.status === "rejected" && (
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/employee/evaluations/${evaluation.id}`
                                                )
                                            }
                                        >
                                            Edit & Resubmit
                                        </button>
                                    )}

                                    {evaluation.status === "returned" && (
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/employee/evaluations/${evaluation.id}`
                                                )
                                            }
                                        >
                                            Edit & Resubmit
                                        </button>
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