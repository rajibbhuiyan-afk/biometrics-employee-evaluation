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

            console.log(
                "Evaluation Category:",
                response.data
            );

            const category =
                response.data.data;

            setFormData({
                name: category.name || "",
                description:
                    category.description || "",
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

        setFormData((prev) => ({
            ...prev,
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
                ).flat();

                setError(
                    messages.join(" ")
                );

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
            <div style={containerStyle}>
                <h2>
                    Loading Evaluation Category...
                </h2>
            </div>
        );
    }

    return (
        <div style={containerStyle}>

            <h1>
                Edit Evaluation Category
            </h1>

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* NAME */}

                <div style={fieldStyle}>

                    <label>
                        Category Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter category name"
                        required
                        style={inputStyle}
                    />

                </div>


                {/* DESCRIPTION */}

                <div style={fieldStyle}>

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter category description"
                        rows="5"
                        style={inputStyle}
                    />

                </div>


                {/* BUTTONS */}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                    }}
                >

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Category"}
                    </button>

                    <button
                        type="button"
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


const containerStyle = {
    maxWidth: "700px",
    margin: "30px auto",
    padding: "20px",
};

const fieldStyle = {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
};

const inputStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "15px",
};

const errorStyle = {
    color: "red",
    background: "#ffe5e5",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
};

export default EditEvaluationCategory;
