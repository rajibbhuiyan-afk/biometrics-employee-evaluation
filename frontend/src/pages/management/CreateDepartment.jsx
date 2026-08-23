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

        setForm({
            ...form,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        });
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

            alert(
                "Department created successfully."
            );

            navigate(
                "/management/departments"
            );

        } catch (error) {

            console.error(error);

            if (error.response?.data?.errors) {

                const errors =
                    error.response.data.errors;

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
        <div style={containerStyle}>

            <h1>Create Department</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}


            <form onSubmit={handleSubmit}>

                {/* Name */}

                <div style={fieldStyle}>

                    <label>
                        Department Name
                    </label>

                    <br />

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Finance"
                        required
                    />

                </div>


                {/* Code */}

                <div style={fieldStyle}>

                    <label>
                        Department Code
                    </label>

                    <br />

                    <input
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="e.g. FIN"
                        required
                    />

                </div>


                {/* Description */}

                <div style={fieldStyle}>

                    <label>
                        Description
                    </label>

                    <br />

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Department description"
                        rows="4"
                    />

                </div>


                {/* Status */}

                <div style={fieldStyle}>

                    <label>

                        <input
                            type="checkbox"
                            name="status"
                            checked={form.status}
                            onChange={handleChange}
                        />

                        {" "}Active

                    </label>

                </div>


                {/* Buttons */}

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Creating..."
                        : "Create Department"}
                </button>

                {" "}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/management/departments"
                        )
                    }
                >
                    Cancel
                </button>

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
};


export default CreateDepartment;