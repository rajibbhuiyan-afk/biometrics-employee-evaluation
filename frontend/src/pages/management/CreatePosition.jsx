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

            const response =
                await api.get("/departments");

            setDepartments(
                response.data.data || []
            );

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

            await api.post("/positions", {
                title: form.title,
                code: form.code,
                department_id:
                    form.department_id,
                description:
                    form.description,
                status: form.status,
            });

            alert(
                "Position created successfully."
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
                    "Failed to create position."
                );
            }

        } finally {

            setSaving(false);
        }
    };


    if (loadingDepartments) {

        return (
            <div style={containerStyle}>
                <h2>
                    Loading departments...
                </h2>
            </div>
        );
    }


    return (
        <div style={containerStyle}>

            <h1>Create Position</h1>

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
                        placeholder="e.g. Software Engineer"
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
                        placeholder="e.g. SWE"
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
                        placeholder="Position description"
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
                        ? "Creating..."
                        : "Create Position"}
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


export default CreatePosition;