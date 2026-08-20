import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const ReviewEvaluation = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [evaluation, setEvaluation] = useState(null);
    const [answers, setAnswers] = useState([]);

    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            fetchEvaluation();
        }
    }, [id]);

    const fetchEvaluation = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/evaluations/${id}`);

            console.log("Evaluation Details:", response.data);

            if (response.data.success) {
                const data = response.data.data;

                setEvaluation(data);
                setAnswers(data.answers || []);

                // Existing manager review থাকলে
                if (data.reviews && data.reviews.length > 0) {
                    const latestReview =
                        data.reviews[data.reviews.length - 1];

                    setRating(
                        latestReview.rating
                            ? String(latestReview.rating)
                            : ""
                    );

                    setComment(
                        latestReview.comment || ""
                    );
                }
            } else {
                setError(
                    response.data.message ||
                    "Failed to load evaluation."
                );
            }
        } catch (error) {
            console.error("Fetch evaluation error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation."
            );
        } finally {
            setLoading(false);
        }
    };
    const handleReviewAction = async (action) => {

        console.log("ACTION:", action);
        console.log("EVALUATION ID:", id);
        console.log("RATING:", rating);
        console.log("COMMENT:", comment);

        /*
        |--------------------------------------------------------------------------
        | Validate Rating & Comment
        |--------------------------------------------------------------------------
        */

        if (!rating) {
            setError("Please select a rating.");
            return;
        }

        if (!comment.trim()) {
            setError("Please enter a comment.");
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Confirmation
        |--------------------------------------------------------------------------
        */

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this evaluation?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            if (!user?.id) {
                setError("Logged-in user information not found.");
                return;
            }

            const reviewerId = user.id;

            console.log("Reviewer ID:", reviewerId);

            const response = await api.post(
                "/evaluation-reviews",
                {
                    evaluation_id: Number(id),
                    reviewer_id: reviewerId,
                    rating: Number(rating),
                    comment: comment,
                    action: action,
                }
            );

            console.log(
                "Review Action Response:",
                response.data
            );

            if (response.data.success) {
                setSuccess(
                    response.data.message ||
                    `Evaluation ${action} successfully.`
                );

                await fetchEvaluation();

                setRating("");
                setComment("");
            }

        } catch (error) {
            console.error(
                "Review action error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            setError(
                error.response?.data?.message ||
                "Failed to process evaluation."
            );

        } finally {
            setActionLoading(false);
        }
    };
    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Loading Evaluation...</h2>
            </div>
        );
    }

    if (error && !evaluation) {
        return (
            <div style={{ padding: "30px" }}>
                <p style={{ color: "red" }}>
                    {error}
                </p>

                <button onClick={handleBack}>
                    {user?.role?.name === "HR"
                        ? "Back to HR Dashboard"
                        : "Back to Manager Dashboard"}
                </button>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div style={{ padding: "30px" }}>
                <p>Evaluation not found.</p>

                <button onClick={handleBack}>
                    {user?.role?.name === "HR"
                        ? "Back to HR Dashboard"
                        : "Back to Manager Dashboard"}
                </button>
            </div>
        );
    }

    const employee = evaluation.employee;
    const evaluationPeriod =
        evaluation.evaluation_period;

    const handleBack = () => {
        if (user?.role?.name === "HR") {
            navigate("/hr/dashboard");
            return;
        }

        navigate("/manager/dashboard");
    };

    return (
        <div
            style={{
                maxWidth: "1000px",
                margin: "0 auto",
                padding: "30px",
            }}
        >
            <h1>Review Evaluation</h1>

            {error && (
                <div
                    style={{
                        color: "red",
                        background: "#ffe5e5",
                        padding: "10px",
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={{
                        color: "green",
                        background: "#e5ffe5",
                        padding: "10px",
                        marginBottom: "20px",
                    }}
                >
                    {success}
                </div>
            )}

            <hr />

            {/* Evaluation Information */}

            <h2>
                {evaluationPeriod?.name ||
                    "Evaluation Period"}
            </h2>

            <p>
                <strong>Evaluation ID:</strong>{" "}
                {evaluation.id}
            </p>

            <p>
                <strong>Employee:</strong>{" "}
                {employee?.name || "N/A"}
            </p>

            <p>
                <strong>Employee ID:</strong>{" "}
                {employee?.employee_id || "N/A"}
            </p>

            <p>
                <strong>Email:</strong>{" "}
                {employee?.email || "N/A"}
            </p>

            <p>
                <strong>Department:</strong>{" "}
                {employee?.department?.name || "N/A"}
            </p>

            <p>
                <strong>Position:</strong>{" "}
                {employee?.position?.title || "N/A"}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {evaluation.status}
            </p>

            <p>
                <strong>Employee Comment:</strong>
            </p>

            <div
                style={{
                    padding: "15px",
                    background: "#f5f5f5",
                    border: "1px solid #ddd",
                    marginBottom: "30px",
                }}
            >
                {evaluation.employee_comment ||
                    "No comment provided."}
            </div>

            <hr />

            {/* Evaluation Questions */}

            <h2>Evaluation Questions</h2>

            {answers.length === 0 ? (
                <p>No questions/answers found.</p>
            ) : (
                answers.map((item, index) => (
                    <div
                        key={item.id || index}
                        style={{
                            marginBottom: "20px",
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                        }}
                    >
                        <p>
                            <strong>
                                {index + 1}.{" "}
                                {item.question?.question ||
                                    "Question not found"}
                            </strong>
                        </p>

                        <p>
                            <strong>
                                Employee Answer:
                            </strong>{" "}
                            {item.answer ||
                                "No answer"}
                        </p>

                        <p>
                            <strong>
                                Employee Rating:
                            </strong>{" "}
                            {item.rating !== null &&
                            item.rating !== undefined
                                ? item.rating
                                : "Not provided"}
                        </p>

                        {item.comment && (
                            <p>
                                <strong>
                                    Employee Comment:
                                </strong>{" "}
                                {item.comment}
                            </p>
                        )}
                    </div>
                ))
            )}

            <hr />

            {/* Existing Reviews */}

            <h2>Manager Review History</h2>

            {evaluation.reviews &&
            evaluation.reviews.length > 0 ? (
                evaluation.reviews.map((review) => (
                    <div
                        key={review.id}
                        style={{
                            padding: "15px",
                            border: "1px solid #ddd",
                            marginBottom: "15px",
                        }}
                    >
                        <p>
                            <strong>
                                Rating:
                            </strong>{" "}
                            {review.rating}
                        </p>

                        <p>
                            <strong>
                                Comment:
                            </strong>{" "}
                            {review.comment}
                        </p>

                        <p>
                            <strong>
                                Action:
                            </strong>{" "}
                            {review.action}
                        </p>

                        <p>
                            <strong>
                                Reviewed At:
                            </strong>{" "}
                            {review.reviewed_at}
                        </p>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}

            <hr />

            {/* ==================================================
                FIRST REVIEW
            ================================================== */}

            {evaluation.status === "submitted" && (
                <>
                    <h2>Manager Review</h2>

                    <div>
                        <label>
                            <strong>Rating:</strong>
                        </label>

                        <br />

                        <select
                            value={rating}
                            onChange={(e) =>
                                setRating(
                                    e.target.value
                                )
                            }
                            disabled={actionLoading}
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

                    <br />

                    <div>
                        <label>
                            <strong>
                                Comment:
                            </strong>
                        </label>

                        <br />

                        <textarea
                            value={comment}
                            onChange={(e) =>
                                setComment(
                                    e.target.value
                                )
                            }
                            rows="5"
                            cols="50"
                            disabled={actionLoading}
                            placeholder="Enter manager comment..."
                        />
                    </div>

                    <br />

                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                            handleReviewAction(
                                "reviewed"
                            )
                        }
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Review"}
                    </button>
                </>
            )}

            {/* ==================================================
                APPROVE / REJECT / RETURN
            ================================================== */}

            {evaluation.status === "reviewed" && (
                <>
                    <h2>Manager Action</h2>

                    <div>
                        <label>
                            <strong>Rating:</strong>
                        </label>

                        <br />

                        <select
                            value={rating}
                            onChange={(e) =>
                                setRating(
                                    e.target.value
                                )
                            }
                            disabled={actionLoading}
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

                    <br />

                    <div>
                        <label>
                            <strong>
                                Comment:
                            </strong>
                        </label>

                        <br />

                        <textarea
                            value={comment}
                            onChange={(e) =>
                                setComment(
                                    e.target.value
                                )
                            }
                            rows="5"
                            cols="50"
                            disabled={actionLoading}
                            placeholder="Enter manager comment..."
                        />
                    </div>

                    <br />

                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                            handleReviewAction(
                                "approved"
                            )
                        }
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Approve"}
                    </button>

                    {" "}

                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                            handleReviewAction(
                                "rejected"
                            )
                        }
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Reject"}
                    </button>

                    {" "}

                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                            handleReviewAction(
                                "returned"
                            )
                        }
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Return"}
                    </button>
                </>
            )}

            <br />
            <br />

            <button onClick={handleBack}>
                {user?.role?.name === "HR"
                    ? "Back to HR Dashboard"
                    : "Back to Manager Dashboard"}
            </button>
        </div>
    );
};

export default ReviewEvaluation;