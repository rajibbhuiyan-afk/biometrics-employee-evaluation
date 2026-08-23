import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import ActionButtons from "../../components/ActionButtons";

const EvaluationQuestions = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Fetch Questions
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/evaluation-questions");

            console.log(
                "Evaluation Questions:",
                response.data
            );

            setQuestions(
                response.data.data || []
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation questions."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Question
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this evaluation question?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/evaluation-questions/${id}`
            );

            alert(
                "Evaluation question deleted successfully."
            );

            fetchQuestions();
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete evaluation question."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div style={containerStyle}>
                <h2>
                    Loading Evaluation Questions...
                </h2>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div style={containerStyle}>

            {/* Page Header */}

            <PageHeader
                title="Evaluation Question Management"
                description="Create, view, edit and manage evaluation questions."
                buttonText="+ Create Evaluation Question"
                onButtonClick={() =>
                    navigate(
                        "/management/evaluation-questions/create"
                    )
                }
            />

            {/* Error */}

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            {/* Empty State */}

            {questions.length === 0 ? (
                <div style={emptyStyle}>

                    <p>
                        No evaluation questions found.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/management/evaluation-questions/create"
                            )
                        }
                    >
                        Create First Question
                    </button>

                </div>
            ) : (

                <DataTable
                    columns={[
                        {
                            key: "id",
                            label: "ID",
                        },
                        {
                            key: "category",
                            label: "Category",
                        },
                        {
                            key: "question",
                            label: "Question",
                        },
                        {
                            key: "question_type",
                            label: "Type",
                        },
                        {
                            key: "max_rating",
                            label: "Max Rating",
                        },
                        {
                            key: "weight",
                            label: "Weight",
                        },
                        {
                            key: "is_required",
                            label: "Required",
                        },
                        {
                            key: "sort_order",
                            label: "Sort Order",
                        },
                        {
                            key: "status",
                            label: "Status",
                        },
                        {
                            key: "actions",
                            label: "Actions",
                        },
                    ]}

                    data={questions.map((question) => ({

                        id: question.id,

                        category:
                            question.category?.name ||
                            "N/A",

                        question:
                            question.question ||
                            "N/A",

                        question_type:
                            formatQuestionType(
                                question.question_type
                            ),

                        max_rating:
                            question.question_type === "rating"
                                ? question.max_rating
                                : "N/A",

                        weight:
                            question.weight ??
                            "N/A",

                        is_required:
                            question.is_required
                                ? "Yes"
                                : "No",

                        sort_order:
                            question.sort_order ??
                            0,

                        status: (
                            <span
                                style={{
                                    ...statusStyle,
                                    backgroundColor:
                                        question.status
                                            ? "#d4edda"
                                            : "#f8d7da",
                                    color:
                                        question.status
                                            ? "#155724"
                                            : "#721c24",
                                }}
                            >
                                {question.status
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        ),

                        actions: (
                            <ActionButtons
                                onEdit={() =>
                                    navigate(
                                        `/management/evaluation-questions/${question.id}/edit`
                                    )
                                }

                                onDelete={() =>
                                    handleDelete(
                                        question.id
                                    )
                                }
                            />
                        ),

                    }))}
                />

            )}

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Format Question Type
|--------------------------------------------------------------------------
*/

const formatQuestionType = (type) => {
    switch (type) {

        case "rating":
            return "Rating";

        case "text":
            return "Text";

        case "yes_no":
            return "Yes / No";

        default:
            return type || "N/A";
    }
};


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const containerStyle = {
    maxWidth: "1400px",
    margin: "30px auto",
    padding: "20px",
};

const errorStyle = {
    color: "red",
    background: "#ffe5e5",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
};

const emptyStyle = {
    padding: "30px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
};

const statusStyle = {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "bold",
};

export default EvaluationQuestions;