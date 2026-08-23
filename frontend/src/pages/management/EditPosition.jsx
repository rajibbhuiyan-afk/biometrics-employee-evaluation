import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditPosition = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [departments, setDepartments] =
        useState([]);

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


    useEffect(() => {
        fetchData();
    }, [id]);


    const fetchData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                positionResponse,
                departmentResponse,
            ] = await Promise.all([
                api.get(`/positions/${id}`),
                api.get("/departments"),
            ]);

            const position =
                positionResponse.data.data;

            setDepartments(
                departmentResponse.data.data || []
            );

            setForm({
                title: position.title || "",
                code: position.code || "",
                department_id:
                    position.department_id || "",
                description:
                    position.description || "",
                status:
                    position.status ?? true,
            });

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load position."
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
                `/positions/${id}`,
                {
                    title: form.title,
                    code: form.code,
                    department_id:
                        form.department_id,
                    description:
                        form.description,
                    status: form.status,
                }
            );

            alert(
                "Position updated successfully."
            );

            navigate(
                "/management/positions"
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
                    "Failed to update position."
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
                    Loading position...
                </h2>
            </div>
        );
    }


    return (
        <div style={containerStyle}>

            <h1>Edit Position</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}


            <form onSubmit={handleSubmit}>

                {/* Title */}

                <div style={fieldStyle}>

                    <label>
                        Position Title
                    </label>

                    <br />

                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Code */}

                <div style={fieldStyle}>

                    <label>
                        Position Code
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


                {/* Department */}

                <div style={fieldStyle}>

                    <label>
                        Department
                    </label>

                    <br />

                    <select
                        name="department_id"
                        value={
                            form.department_id
                        }
                        onChange={handleChange}
                        required
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
                                    {department.name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* Description */}

                <div style={fieldStyle}>

                    <label>
                        Description
                    </label>

                    <br />

                    <textarea
                        name="description"
                        value={
                            form.description
                        }
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
                            checked={
                                form.status
                            }
                            onChange={handleChange}
                        />

                        {" "}Active

                    </label>

                </div>


                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Updating..."
                        : "Update Position"}
                </button>

                {" "}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/management/positions"
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


export default EditPosition;