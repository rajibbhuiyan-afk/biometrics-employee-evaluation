import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

const EditEvaluationComment = () => {

    const { id } = useParams();

    const navigate = useNavigate();


    /*
    ==================================================
    State
    ==================================================
    */

    const [evaluation, setEvaluation] = useState(null);

    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    /*
    ==================================================
    Load Evaluation
    ==================================================
    */

    useEffect(() => {

        const fetchEvaluation = async () => {

            try {

                setLoading(true);

                setError("");

                const response = await api.get(
                    `/evaluations/${id}`
                );

                const data =
                    response.data?.data ||
                    response.data;


                /*
                ==========================================
                Store Evaluation
                ==========================================
                */

                setEvaluation(data);


                /*
                ==========================================
                Existing Employee Comment
                ==========================================
                */

                setComment(
                    data?.employee_comment || ""
                );


                /*
                ==========================================
                Draft Only
                ==========================================
                */

                if (
                    data?.status !== "draft"
                ) {

                    setError(
                        "Employee comment can only be edited while the evaluation is in draft status."
                    );

                }

            } catch (err) {

                console.error(
                    "Failed to load evaluation:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Failed to load evaluation."
                );

            } finally {

                setLoading(false);

            }

        };


        if (id) {

            fetchEvaluation();

        }

    }, [id]);


    /*
    ==================================================
    Handle Comment Change
    ==================================================
    */

    const handleCommentChange = (event) => {

        setComment(
            event.target.value
        );

    };


    /*
    ==================================================
    Save Comment
    ==================================================
    */

    const handleSubmit = async (event) => {

        event.preventDefault();


        /*
        ==============================================
        Evaluation Check
        ==============================================
        */

        if (!evaluation) {

            return;

        }


        /*
        ==============================================
        Draft Only
        ==============================================
        */

        if (
            evaluation.status !== "draft"
        ) {

            setError(
                "Employee comment can only be edited while the evaluation is in draft status."
            );

            return;

        }


        try {

            setSaving(true);

            setError("");

            setSuccess("");


            /*
            ==========================================
            Update Evaluation
            ==========================================
            *
            * Evaluation Period ID is NOT shown
            * in the frontend.
            *
            * Existing evaluation_period_id is sent
            * automatically so Laravel validation passes.
            *
            */

            const response = await api.put(
                `/evaluations/${id}`,
                {
                    evaluation_period_id:
                        evaluation.evaluation_period_id,

                    employee_comment:
                        comment.trim() || null,
                }
            );


            /*
            ==========================================
            Updated Evaluation
            ==========================================
            */

            const updatedEvaluation =
                response.data?.data ||
                response.data;


            setEvaluation(
                updatedEvaluation
            );


            /*
            ==========================================
            Keep Updated Comment
            ==========================================
            */

            setComment(
                updatedEvaluation?.employee_comment ||
                ""
            );


            /*
            ==========================================
            Success Message
            ==========================================
            */

            setSuccess(
                "Employee comment updated successfully."
            );


            /*
            ==========================================
            Return to Evaluation Details
            ==========================================
            */

            setTimeout(() => {

                navigate(
                    `/management/employee/evaluations/${id}`
                );

            }, 500);

        } catch (err) {

            console.error(
                "Failed to update employee comment:",
                err
            );


            console.error(
                "Validation errors:",
                err.response?.data
            );


            setError(
                err.response?.data?.message ||
                "Failed to update employee comment."
            );

        } finally {

            setSaving(false);

        }

    };


    /*
    ==================================================
    Cancel / Back
    ==================================================
    */

    const handleCancel = () => {

        navigate(
            `/management/employee/evaluations/${id}`
        );

    };


    /*
    ==================================================
    Loading State
    ==================================================
    */

    if (loading) {

        return (

            <div className="management-page">

                <PageHeader
                    title="Edit Employee Comment"
                />

                <div className="management-form">

                    <div className="management-form-field">

                        <p>
                            Loading evaluation...
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    /*
    ==================================================
    Render
    ==================================================
    */

    return (

        <div className="management-page">

            <PageHeader
                title="Edit Employee Comment"
            />


            <div className="management-form">


                {/* ==========================================
                    Error Message
                ========================================== */}

                {error && (

                    <div className="management-alert management-alert-error">

                        {error}

                    </div>

                )}


                {/* ==========================================
                    Success Message
                ========================================== */}

                {success && (

                    <div className="management-alert management-alert-success">

                        {success}

                    </div>

                )}


                {/* ==========================================
                    Draft Status
                ========================================== */}

                {evaluation?.status === "draft" ? (

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="management-form-section">


                            {/* ==================================
                                Section Header
                            ================================== */}

                            <div className="management-form-section-header">

                                <h2>
                                    Employee Comment
                                </h2>

                            </div>


                            {/* ==================================
                                Comment Field
                            ================================== */}

                            <div className="management-form-field">

                                <label
                                    htmlFor="employee-comment"
                                >
                                    Employee Comment
                                </label>


                                <textarea
                                    id="employee-comment"
                                    value={comment}
                                    onChange={
                                        handleCommentChange
                                    }
                                    placeholder="Write your comment..."
                                    rows={7}
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* ==================================
                            Form Actions
                        ================================== */}

                        <div className="management-form-actions">


                            {/* ==================================
                                Cancel
                            ================================== */}

                            <button
                                type="button"
                                className="management-button management-button-secondary"
                                onClick={
                                    handleCancel
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            {/* ==================================
                                Save
                            ================================== */}

                            <button
                                type="submit"
                                className="management-button management-button-primary"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Comment"
                                }

                            </button>

                        </div>

                    </form>

                ) : (

                    /*
                    ==========================================
                    Non-Draft
                    ==========================================
                    */

                    <div className="management-form-section">


                        <div className="management-form-field">

                            <p>
                                Employee comment cannot be
                                edited because this evaluation
                                is no longer in draft status.
                            </p>

                        </div>


                        <div className="management-form-actions">

                            <button
                                type="button"
                                className="management-button management-button-secondary"
                                onClick={
                                    handleCancel
                                }
                            >
                                Back
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

};

export default EditEvaluationComment;