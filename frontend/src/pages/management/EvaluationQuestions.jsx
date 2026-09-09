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
                (response.data.data || []).sort(
                    (a, b) =>
                        new Date(b.created_at) -
                        new Date(a.created_at)
                )
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
    | Format Date Time
    |--------------------------------------------------------------------------
    */

    const formatDateTime = (date) => {

        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
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

            {/* ==================================================
                Page Header
            ================================================== */}

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


            {/* ==================================================
                Error
            ================================================== */}

            {error && (

                <div className="management-error">
                    {error}
                </div>

            )}


            {/* ==================================================
                Empty State
            ================================================== */}

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

                        /*
                        ==========================================
                        ID
                        ==========================================
                        */

                        {
                            key: "id",
                            label: "ID",
                        },


                        /*
                        ==========================================
                        Category
                        ==========================================
                        */

                        {
                            key: "category",
                            label: "Category",
                        },


                        /*
                        ==========================================
                        Question
                        ==========================================
                        */

                        {
                            key: "question",
                            label: "Question",
                            className:
                                "evaluation-question-column",
                        },


                        /*
                        ==========================================
                        Department
                        ==========================================
                        */

                        {
                            key: "department",
                            label: "Dep",
                        },


                        /*
                        ==========================================
                        Position
                        ==========================================
                        */

                        {
                            key: "position",
                            label: "Position",
                        },


                        /*
                        ==========================================
                        Max Rating
                        ==========================================
                        */

                        {
                            key: "max_rating",
                            label: "Max Rating",
                            className:
                                "evaluation-max-rating-column",
                        },


                        /*
                        ==========================================
                        Max Answer Words
                        ==========================================
                        */

                        {
                            key: "max_answer_words",
                            label: "Max Words",
                            className:
                                "evaluation-max-words-column",
                        },


                        /*
                        ==========================================
                        Required
                        ==========================================
                        */

                        {
                            key: "is_required",
                            label: "Required",
                        },


                        /*
                        ==========================================
                        Create Time
                        ==========================================
                        */

                        // {
                        //     key: "created_at",
                        //     label: "Created",
                        // },


                        /*
                        ==========================================
                        Update Time
                        ==========================================
                        */

                        // {
                        //     key: "updated_at",
                        //     label: "Updated",
                        // },


                        /*
                        ==========================================
                        Status
                        ==========================================
                        */

                        {
                            key: "status",
                            label: "Status",
                        },


                        /*
                        ==========================================
                        Actions
                        ==========================================
                        */

                        {
                            key: "actions",
                            label: "Actions",
                        },

                    ]}


                    data={questions.map(
                        (question) => ({

                            /*
                            ==========================================
                            ID
                            ==========================================
                            */

                            id:
                                question.id,


                            /*
                            ==========================================
                            Category
                            ==========================================
                            */

                            category:
                                question.category?.name ||
                                "N/A",


                            /*
                            ==========================================
                            Question
                            ==========================================
                            */

                            question: (

                                <div
                                    className="evaluation-question-text"
                                    title={
                                        question.question ||
                                        ""
                                    }
                                >
                                    {
                                        question.question ||
                                        "N/A"
                                    }
                                </div>

                            ),


                            /*
                            ==========================================
                            Department
                            ==========================================
                            */

                            department:
                                question.department?.name ||
                                "All Departments",


                            /*
                            ==========================================
                            Position
                            ==========================================
                            */

                            position:
                                question.position?.title ||
                                "All Positions",


                            /*
                            ==========================================
                            Max Rating
                            ==========================================
                            */

                            max_rating:
                                question.max_rating ??
                                "N/A",


                            /*
                            ==========================================
                            Max Answer Words
                            ==========================================
                            */

                            max_answer_words:
                                question.max_answer_words ??
                                "N/A",


                            /*
                            ==========================================
                            Required
                            ==========================================
                            */

                            is_required:
                                question.is_required
                                    ? "Yes"
                                    : "No",


                            /*
                            ==========================================
                            Create Time
                            ==========================================
                            */

                            // created_at:
                            //     formatDateTime(
                            //         question.created_at
                            //     ),


                            /*
                            ==========================================
                            Update Time
                            ==========================================
                            */

                            // updated_at:
                            //     formatDateTime(
                            //         question.updated_at
                            //     ),


                            /*
                            ==========================================
                            Status
                            ==========================================
                            */

                            status: (

                                <span
                                    className={
                                        question.status
                                            ? "status-badge status-active"
                                            : "status-badge status-inactive"
                                    }
                                >
                                    {
                                        question.status
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>

                            ),


                            /*
                            ==========================================
                            Actions
                            ==========================================
                            */

                            actions: (

                                <div className="table-actions">

                                    <button
                                        type="button"
                                        className="action-button action-edit"
                                        onClick={(event) => {

                                            event.stopPropagation();

                                            navigate(
                                                `/management/evaluation-questions/${question.id}/edit`
                                            );

                                        }}
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        className="action-button action-delete"
                                        onClick={(event) => {

                                            event.stopPropagation();

                                            handleDelete(
                                                question.id
                                            );

                                        }}
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


export default EvaluationQuestions;