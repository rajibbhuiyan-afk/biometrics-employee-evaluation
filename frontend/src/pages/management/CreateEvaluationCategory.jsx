import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateEvaluationCategory = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await api.post(
                "/evaluation-categories",
                formData
            );

            alert(
                "Evaluation category created successfully."
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
                ).flat();

                setError(messages.join(" "));
            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to create evaluation category."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Create Evaluation Category
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
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Create Category"}
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

export default CreateEvaluationCategory;