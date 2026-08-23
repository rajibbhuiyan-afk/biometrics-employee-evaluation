import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";


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

            const response =
                await api.get("/evaluation-questions");

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

            setQuestions(
                (currentQuestions) =>
                    currentQuestions.filter(
                        (question) =>
                            question.id !== id
                    )
            );

            alert(
                "Evaluation question deleted successfully."
            );

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
            <div className="management-page">

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

        <div className="management-page">

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

                <div className="management-error">
                    {error}
                </div>

            )}


            {/* Empty State */}

            {questions.length === 0 ? (

                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No evaluation questions found.
                        </div>

                        <div className="data-table-empty-message">
                            Create an evaluation question
                            to get started.
                        </div>

                    </div>

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

                    data={questions.map(
                        (question) => ({

                            id:
                                question.id,

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
                                    className={
                                        question.status
                                            ? "status-badge status-active"
                                            : "status-badge status-inactive"
                                    }
                                >
                                    {question.status
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                            ),

                            actions: (
                                <div className="table-actions">

                                    <button
                                        type="button"
                                        className="action-button action-edit"
                                        onClick={() =>
                                            navigate(
                                                `/management/evaluation-questions/${question.id}/edit`
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="action-button action-delete"
                                        onClick={() =>
                                            handleDelete(question.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>
                            ),

                        })
                    )}
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


export default EvaluationQuestions;