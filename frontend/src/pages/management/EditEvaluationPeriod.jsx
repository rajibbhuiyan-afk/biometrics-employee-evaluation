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

        // Example:
        // 2027-06-23T00:00:00.000000Z
        // becomes:
        // 2027-06-23

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

            console.log(
                "Evaluation Period:",
                response.data
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

                description:
                    period.description || "",
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

        setForm((prev) => ({
            ...prev,
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

            const response = await api.put(
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

            console.log(
                "Updated:",
                response.data
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

                const messages = Object.values(
                    errors
                ).flat();

                setError(
                    messages.join(" ")
                );

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
            <div
                style={{
                    maxWidth: "800px",
                    margin: "30px auto",
                    padding: "20px",
                }}
            >
                <h2>
                    Loading Evaluation Period...
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
        <div
            style={{
                maxWidth: "800px",
                margin: "30px auto",
                padding: "20px",
            }}
        >

            <h1>
                Edit Evaluation Period
            </h1>

            {error && (
                <div
                    style={{
                        color: "red",
                        background: "#ffe5e5",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                    }}
                >
                    {error}
                </div>
            )}


            <form onSubmit={handleSubmit}>

                {/* Name */}

                <div style={fieldStyle}>

                    <label>
                        Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Start Date */}

                <div style={fieldStyle}>

                    <label>
                        Start Date
                    </label>

                    <input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* End Date */}

                <div style={fieldStyle}>

                    <label>
                        End Date
                    </label>

                    <input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Submission Start */}

                <div style={fieldStyle}>

                    <label>
                        Submission Start Date
                    </label>

                    <input
                        type="date"
                        name="submission_start_date"
                        value={
                            form.submission_start_date
                        }
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Submission End */}

                <div style={fieldStyle}>

                    <label>
                        Submission End Date
                    </label>

                    <input
                        type="date"
                        name="submission_end_date"
                        value={
                            form.submission_end_date
                        }
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Status */}

                <div style={fieldStyle}>

                    <label>
                        Status
                    </label>

                    <select
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

                <div style={fieldStyle}>

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="5"
                    />

                </div>


                {/* Buttons */}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "20px",
                    }}
                >

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Evaluation Period"}
                    </button>


                    <button
                        type="button"
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


const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "18px",
};


export default EditEvaluationPeriod;
