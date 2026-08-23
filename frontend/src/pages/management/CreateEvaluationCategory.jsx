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

                setError(
                    messages.join(" ")
                );

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
        <div style={containerStyle}>

            <h1>
                Create Evaluation Category
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
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Create Category"}
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

export default CreateEvaluationCategory;
