import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateDepartment = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: "",
        status: true,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

            await api.post("/departments", {
                name: form.name,
                code: form.code,
                description: form.description,
                status: form.status,
            });

            alert("Department created successfully.");

            navigate("/management/departments");

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
                    "Failed to create department."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Create Department
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

                {/* Department Name */}

                <div className="management-form-field">
                    <label htmlFor="name">
                        Department Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Finance"
                        required
                    />
                </div>

                {/* Department Code */}

                <div className="management-form-field">
                    <label htmlFor="code">
                        Department Code
                    </label>

                    <input
                        id="code"
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="e.g. FIN"
                        required
                    />
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
                        placeholder="Department description"
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
                            : "Create Department"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/departments"
                            )
                        }
                    >
                        Cancel
                    </button>

                </div>

            </form>
        </div>
    );
};

export default CreateDepartment;