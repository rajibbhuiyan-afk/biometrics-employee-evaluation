import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateUser = () => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        employee_id: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role_id: "",
        department_id: "",
        position_id: "",
        status: true,
    });

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            setLoading(true);
            setError("");

            const [rolesResponse, departmentsResponse, positionsResponse] =
                await Promise.all([
                    api.get("/roles"),
                    api.get("/departments"),
                    api.get("/positions"),
                ]);

            setRoles(rolesResponse.data.data || []);
            setDepartments(departmentsResponse.data.data || []);
            setPositions(positionsResponse.data.data || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load form data."
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

            await api.post("/users", form);

            alert("User created successfully.");

            navigate("/management/users");

        } catch (error) {
            console.error(error);

            if (error.response?.data?.errors) {
                const validationErrors =
                    Object.values(error.response.data.errors)
                        .flat()
                        .join("\n");

                setError(validationErrors);
            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to create user."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div
            style={{
                maxWidth: "700px",
                margin: "30px auto",
                padding: "20px",
            }}
        >
            <h1>Create User</h1>

            {error && (
                <div
                    style={{
                        color: "red",
                        marginBottom: "20px",
                        whiteSpace: "pre-line",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <div style={fieldStyle}>
                    <label>Employee ID</label>

                    <input
                        type="text"
                        name="employee_id"
                        value={form.employee_id}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={fieldStyle}>
                    <label>Name</label>

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={fieldStyle}>
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={fieldStyle}>
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={fieldStyle}>
                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={fieldStyle}>
                    <label>Role</label>

                    <select
                        name="role_id"
                        value={form.role_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Role
                        </option>

                        {roles.map((role) => (
                            <option
                                key={role.id}
                                value={role.id}
                            >
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={fieldStyle}>
                    <label>Department</label>

                    <select
                        name="department_id"
                        value={form.department_id}
                        onChange={handleChange}
                    >
                        <option value="">
                            Select Department
                        </option>

                        {departments.map((department) => (
                            <option
                                key={department.id}
                                value={department.id}
                            >
                                {department.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={fieldStyle}>
                    <label>Position</label>

                    <select
                        name="position_id"
                        value={form.position_id}
                        onChange={handleChange}
                    >
                        <option value="">
                            Select Position
                        </option>

                        {positions.map((position) => (
                            <option
                                key={position.id}
                                value={position.id}
                            >
                                {position.title}
                            </option>
                        ))}
                    </select>
                </div>

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

                <div style={{ marginTop: "20px" }}>

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Creating..." : "Create User"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/management/users")
                        }
                        style={{
                            marginLeft: "10px",
                        }}
                    >
                        Cancel
                    </button>

                </div>

            </form>
        </div>
    );
};

const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
    gap: "5px",
};

export default CreateUser;