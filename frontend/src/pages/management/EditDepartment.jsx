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

            const response =
                await api.get(
                    `/departments/${id}`
                );

            const department =
                response.data.data;

            setForm({
                name: department.name || "",
                code: department.code || "",
                description:
                    department.description || "",
                status:
                    department.status ?? true,
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

        const {
            name,
            value,
            type,
            checked,
        } = e.target;

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

            await api.put(
                `/departments/${id}`,
                {
                    name: form.name,
                    code: form.code,
                    description:
                        form.description,
                    status: form.status,
                }
            );

            alert(
                "Department updated successfully."
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
                    "Failed to update department."
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
                    Loading department...
                </h2>
            </div>
        );
    }


    return (
        <div style={containerStyle}>

            <h1>Edit Department</h1>

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
                        ? "Updating..."
                        : "Update Department"}
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


export default EditDepartment;