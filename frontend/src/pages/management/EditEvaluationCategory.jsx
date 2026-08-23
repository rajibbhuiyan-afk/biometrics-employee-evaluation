import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditEvaluationCategory = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCategory();
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/evaluation-categories/${id}`
            );

            const category = response.data.data;

            setFormData({
                name: category.name || "",
                description: category.description || "",
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation category."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await api.put(
                `/evaluation-categories/${id}`,
                formData
            );

            alert(
                "Evaluation category updated successfully."
            );

            navigate(
                "/management/evaluation-categories"
            );

        } catch (error) {
            console.error(error);

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const messages = Object.values(
                    validationErrors
                )
                    .flat()
                    .join(" ");

                setError(messages);

            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to update evaluation category."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="management-form-page">
                <h2>Loading Evaluation Category...</h2>
            </div>
        );
    }

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Edit Evaluation Category
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

                {/* Category Name */}

                <div className="management-form-field">

                    <label htmlFor="name">
                        Category Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter category name"
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
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter category description"
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
                            : "Update Category"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/evaluation-categories"
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

export default EditEvaluationCategory;