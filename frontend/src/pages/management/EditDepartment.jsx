import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditDepartment = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: "",
        status: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDepartment();
    }, [id]);

    const fetchDepartment = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/departments/${id}`
            );

            const department = response.data.data;

            setForm({
                name: department.name || "",
                code: department.code || "",
                description: department.description || "",
                status: department.status ?? true,
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load department."
            );

        } finally {
            setLoading(false);
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

            await api.put(`/departments/${id}`, {
                name: form.name,
                code: form.code,
                description: form.description,
                status: form.status,
            });

            alert("Department updated successfully.");

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
                    "Failed to update department."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="management-form-page">
                <h2>Loading department...</h2>
            </div>
        );
    }

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Edit Department
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
                            ? "Updating..."
                            : "Update Department"}
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

export default EditDepartment;