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

            const [
                rolesResponse,
                departmentsResponse,
                positionsResponse,
            ] = await Promise.all([
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
        return (
            <div className="management-form-page">
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Create User
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

                <div className="management-form-field">
                    <label htmlFor="employee_id">
                        Employee ID
                    </label>

                    <input
                        id="employee_id"
                        type="text"
                        name="employee_id"
                        value={form.employee_id}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="management-form-field">
                    <label htmlFor="name">
                        Name
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

                <div className="management-form-field">
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="management-form-field">
                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="management-form-field">
                    <label htmlFor="password_confirmation">
                        Confirm Password
                    </label>

                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="management-form-field">
                    <label htmlFor="role_id">
                        Role
                    </label>

                    <select
                        id="role_id"
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

                <div className="management-form-field">
                    <label htmlFor="department_id">
                        Department
                    </label>

                    <select
                        id="department_id"
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

                <div className="management-form-field">
                    <label htmlFor="position_id">
                        Position
                    </label>

                    <select
                        id="position_id"
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

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >
                        {saving ? "Creating..." : "Create User"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate("/management/users")
                        }
                    >
                        Cancel
                    </button>

                </div>

            </form>
        </div>
    );
};

export default CreateUser;