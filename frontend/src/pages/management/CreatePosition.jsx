import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreatePosition = () => {
    const navigate = useNavigate();

    // ==========================================================
    // State
    // ==========================================================

    const [departments, setDepartments] = useState([]);

    const [form, setForm] = useState({
        title: "",
        code: "",
        department_id: "",
        description: "",
        status: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // ==========================================================
    // Fetch Departments
    // ==========================================================

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/departments");

            setDepartments(response.data.data || []);
        } catch (error) {
            console.error(
                "Failed to load departments:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load departments."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // Handle Input Change
    // ==========================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // ==========================================================
    // Submit
    // ==========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const payload = {
                title: form.title,
                code: form.code,
                department_id: Number(
                    form.department_id
                ),
                description: form.description,
                status: form.status,
            };

            console.log(
                "Create Position Payload:",
                payload
            );

            await api.post(
                "/positions",
                payload
            );

            alert(
                "Position created successfully."
            );

            navigate(
                "/management/positions"
            );
        } catch (error) {
            console.error(
                "Create position error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            if (
                error.response?.data?.errors
            ) {
                const validationErrors =
                    Object.values(
                        error.response.data.errors
                    )
                        .flat()
                        .join("\n");

                setError(
                    validationErrors
                );
            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to create position."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // ==========================================================
    // Loading State
    // ==========================================================

    if (loading) {
        return (
            <div className="management-form-page">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Loading...
                    </div>

                    <div className="data-table-empty-message">
                        Please wait while departments
                        are being loaded.
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Page
    // ==========================================================

    return (
        <div className="management-form-page">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Create Position
                    </h1>

                    <p className="page-header-description">
                        Create a new position and assign
                        it to a department.
                    </p>

                </div>

            </div>

            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            {/* ==================================================
                Form
            ================================================== */}

            <form
                className="management-form"
                onSubmit={handleSubmit}
            >

                {/* ==================================================
                    Position Title
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="title">
                        Position Title
                    </label>

                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Software Engineer"
                        required
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Position Code
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="code">
                        Position Code (Short Name)
                    </label>

                    <input
                        id="code"
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="e.g. SWE"
                        required
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Department
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="department_id">
                        Department
                    </label>

                    <select
                        id="department_id"
                        name="department_id"
                        value={
                            form.department_id
                        }
                        onChange={handleChange}
                        required
                        disabled={saving}
                    >

                        <option value="">
                            Select Department
                        </option>

                        {departments.map(
                            (department) => (
                                <option
                                    key={
                                        department.id
                                    }
                                    value={
                                        department.id
                                    }
                                >
                                    {
                                        department.name
                                    }
                                </option>
                            )
                        )}

                    </select>

                </div>

                {/* ==================================================
                    Description
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="description">
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={
                            form.description
                        }
                        onChange={handleChange}
                        placeholder="Enter position description"
                        rows={5}
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Status
                ================================================== */}

                <div className="management-form-checkbox">

                    <input
                        id="status"
                        type="checkbox"
                        name="status"
                        checked={form.status}
                        onChange={handleChange}
                        disabled={saving}
                    />

                    <label htmlFor="status">
                        Active
                    </label>

                </div>

                {/* ==================================================
                    Actions
                ================================================== */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Creating..."
                            : "Create Position"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/positions"
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

export default CreatePosition;
