import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreatePosition = () => {
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);

    const [form, setForm] = useState({
        title: "",
        code: "",
        department_id: "",
        description: "",
        status: true,
    });

    const [loadingDepartments, setLoadingDepartments] =
        useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get("/departments");

            setDepartments(response.data.data || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load departments."
            );

        } finally {
            setLoadingDepartments(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await api.post("/positions", {
                title: form.title,
                code: form.code,
                department_id: form.department_id,
                description: form.description,
                status: form.status,
            });

            alert("Position created successfully.");

            navigate("/management/positions");

        } catch (error) {
            console.error(error);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;

                setError(
                    Object.values(errors)
                        .flat()
                        .join(" ")
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

    if (loadingDepartments) {
        return (
            <div className="management-form-page">
                <h2>Loading departments...</h2>
            </div>
        );
    }

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Create Position
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

                {/* Position Title */}

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
                    />

                </div>

                {/* Position Code */}

                <div className="management-form-field">

                    <label htmlFor="code">
                        Position Code
                    </label>

                    <input
                        id="code"
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="e.g. SWE"
                        required
                    />

                </div>

                {/* Department */}

                <div className="management-form-field">

                    <label htmlFor="department_id">
                        Department
                    </label>

                    <select
                        id="department_id"
                        name="department_id"
                        value={form.department_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Department
                        </option>

                        {departments.map((department) => (
                            <option
                                key={department.id}
                                value={department.id}
                            >
                                {department.name}
                            </option>
                        ))}
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
                        placeholder="Position description"
                        rows="4"
                    />

                </div>

                {/* Status */}

                <div className="management-form-checkbox">

                    <input
                        id="status"
                        type="checkbox"
                        name="status"
                        checked={form.status}
                        onChange={handleChange}
                    />

                    <label htmlFor="status">
                        Active
                    </label>

                </div>

                {/* Buttons */}

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
                            navigate("/management/positions")
                        }
                    >
                        Cancel
                    </button>

                </div>

            </form>
        </div>
    );
};

export default CreatePosition;