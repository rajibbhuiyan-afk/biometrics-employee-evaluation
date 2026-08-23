import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditEvaluationPeriod = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        start_date: "",
        end_date: "",
        submission_start_date: "",
        submission_end_date: "",
        status: "draft",
        description: "",
    });

    /*
    |--------------------------------------------------------------------------
    | Convert Laravel date/datetime to HTML date format
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return date.substring(0, 10);
    };

    /*
    |--------------------------------------------------------------------------
    | Load Evaluation Period
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchEvaluationPeriod();
    }, [id]);

    const fetchEvaluationPeriod = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/evaluation-periods/${id}`
            );

            const period = response.data.data;

            setForm({
                name: period.name || "",

                start_date: formatDate(
                    period.start_date
                ),

                end_date: formatDate(
                    period.end_date
                ),

                submission_start_date: formatDate(
                    period.submission_start_date
                ),

                submission_end_date: formatDate(
                    period.submission_end_date
                ),

                status: period.status || "draft",

                description: period.description || "",
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation period."
            );

        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Handle Input Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Update Evaluation Period
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await api.put(
                `/evaluation-periods/${id}`,
                {
                    name: form.name,
                    start_date: form.start_date,
                    end_date: form.end_date,
                    submission_start_date:
                        form.submission_start_date,
                    submission_end_date:
                        form.submission_end_date,
                    status: form.status,
                    description: form.description,
                }
            );

            alert(
                "Evaluation period updated successfully."
            );

            navigate(
                "/management/evaluation-periods"
            );

        } catch (error) {
            console.error(error);

            const errors =
                error.response?.data?.errors;

            if (errors) {
                const messages = Object.values(errors)
                    .flat()
                    .join(" ");

                setError(messages);

            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to update evaluation period."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="management-form-page">
                <h2>Loading Evaluation Period...</h2>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Edit Evaluation Period
            </h1>

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            <form
                className="management-form"
                onSubmit={handleSubmit}
            >

                {/* Name */}

                <div className="management-form-field">

                    <label htmlFor="name">
                        Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                </div>

                {/* Start Date */}

                <div className="management-form-field">

                    <label htmlFor="start_date">
                        Start Date
                    </label>

                    <input
                        id="start_date"
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                    />

                </div>

                {/* End Date */}

                <div className="management-form-field">

                    <label htmlFor="end_date">
                        End Date
                    </label>

                    <input
                        id="end_date"
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                    />

                </div>

                {/* Submission Start */}

                <div className="management-form-field">

                    <label htmlFor="submission_start_date">
                        Submission Start Date
                    </label>

                    <input
                        id="submission_start_date"
                        type="date"
                        name="submission_start_date"
                        value={form.submission_start_date}
                        onChange={handleChange}
                        required
                    />

                </div>

                {/* Submission End */}

                <div className="management-form-field">

                    <label htmlFor="submission_end_date">
                        Submission End Date
                    </label>

                    <input
                        id="submission_end_date"
                        type="date"
                        name="submission_end_date"
                        value={form.submission_end_date}
                        onChange={handleChange}
                        required
                    />

                </div>

                {/* Status */}

                <div className="management-form-field">

                    <label htmlFor="status">
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="draft">
                            Draft
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="closed">
                            Closed
                        </option>
                    </select>

                </div>

                {/* Description */}

                <div className="management-form-field">

                    <label htmlFor="description">
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="5"
                    />

                </div>

                {/* Buttons */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Evaluation Period"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/evaluation-periods"
                            )
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
};

export default EditEvaluationPeriod;