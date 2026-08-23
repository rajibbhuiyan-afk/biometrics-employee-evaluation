import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);

    const [form, setForm] = useState({
        employee_id: "",
        name: "",
        email: "",
        role_id: "",
        department_id: "",
        position_id: "",
        status: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                userResponse,
                rolesResponse,
                departmentsResponse,
                positionsResponse,
            ] = await Promise.all([
                api.get(`/users/${id}`),
                api.get("/roles"),
                api.get("/departments"),
                api.get("/positions"),
            ]);

            const userData = userResponse.data.data;

            setUser(userData);

            setForm({
                employee_id: userData.employee_id || "",
                name: userData.name || "",
                email: userData.email || "",
                role_id: userData.role_id || "",
                department_id: userData.department_id || "",
                position_id: userData.position_id || "",
                status: userData.status ?? true,
            });

            setRoles(rolesResponse.data.data || []);
            setDepartments(departmentsResponse.data.data || []);
            setPositions(positionsResponse.data.data || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load user."
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

            await api.put(`/users/${id}`, {
                employee_id: form.employee_id,
                name: form.name,
                email: form.email,
                role_id: Number(form.role_id),
                department_id: form.department_id
                    ? Number(form.department_id)
                    : null,
                position_id: form.position_id
                    ? Number(form.position_id)
                    : null,
                status: form.status,
            });

            alert("User updated successfully.");

            navigate("/management/users");

        } catch (error) {
            console.error(error);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;

                setError(
                    Object.values(errors)
                        .flat()
                        .join(" ")
                );
            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to update user."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="management-form-page">
                <h2>Loading user...</h2>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="management-form-page">
                <h2>User not found.</h2>

                <button
                    type="button"
                    className="management-btn-secondary"
                    onClick={() =>
                        navigate("/management/users")
                    }
                >
                    Back to Users
                </button>
            </div>
        );
    }

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Edit User
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

                {/* Employee ID */}

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

                {/* Name */}

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

                {/* Email */}

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

                {/* Role */}

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

                {/* Department */}

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

                {/* Position */}

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

                {/* Status */}

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

                {/* Actions */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update User"}
                    </button>

                    {/* <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                `/management/users/${id}/change-password`
                            )
                        }
                    >
                        Change Password
                    </button> */}

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

export default EditUser;