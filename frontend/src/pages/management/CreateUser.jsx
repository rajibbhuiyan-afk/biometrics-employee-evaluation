import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateUser = () => {
    const navigate = useNavigate();

    // ==========================================================
    // State
    // ==========================================================

    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [managers, setManagers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [form, setForm] = useState({        
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role_id: "",
        department_id: "",
        position_id: "",
        manager_id: "",
        joining_date: "",
        status: true,
    });

    // ==========================================================
    // Fetch Form Data
    // ==========================================================

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
                managersResponse,
            ] = await Promise.all([
                api.get("/roles"),
                api.get("/departments"),
                api.get("/positions"),
                api.get("/users/managers"),
            ]);

            console.log(
                "Roles:",
                rolesResponse.data
            );

            console.log(
                "Departments:",
                departmentsResponse.data
            );

            console.log(
                "Positions:",
                positionsResponse.data
            );

            console.log(
                "Managers:",
                managersResponse.data
            );
          

            setRoles(
                rolesResponse.data.data || []
            );

            setDepartments(
                departmentsResponse.data.data || []
            );

            setPositions(
                positionsResponse.data.data || []
            );

            setManagers(
                managersResponse.data.data || []
            );

            

        } catch (error) {
            console.error(
                "Failed to load form data:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load form data."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // Handle Input Change
    // ==========================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // ==========================================================
    // Submit
    // ==========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            // --------------------------------------------------
            // Basic Validation
            // --------------------------------------------------

            if (
                form.password !==
                form.password_confirmation
            ) {
                setError(
                    "Password and confirm password do not match."
                );

                return;
            }

            // --------------------------------------------------
            // Prepare Data
            // --------------------------------------------------

            const payload = {                
                name: form.name,
                email: form.email,
                password: form.password,
                password_confirmation:
                    form.password_confirmation,

                role_id: Number(form.role_id),

                department_id:
                    form.department_id
                        ? Number(form.department_id)
                        : null,

                position_id:
                    form.position_id
                        ? Number(form.position_id)
                        : null,

                manager_id:
                    form.manager_id
                        ? Number(form.manager_id)
                        : null,
                joining_date:
                        form.joining_date
                            ? form.joining_date
                            : null,

                status: form.status,
            };

            console.log(
                "Create User Payload:",
                payload
            );

            // --------------------------------------------------
            // Create User
            // --------------------------------------------------

            const response = await api.post(
                "/users",
                payload
            );

            console.log(
                "User Created:",
                response.data
            );

            alert(
                "User created successfully."
            );

            navigate(
                "/management/users"
            );

        } catch (error) {
            console.error(
                "Create user error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            // --------------------------------------------------
            // Laravel Validation Errors
            // --------------------------------------------------

            if (
                error.response?.data?.errors
            ) {
                const validationErrors =
                    Object.values(
                        error.response.data.errors
                    )
                        .flat()
                        .join("\n");

                setError(
                    validationErrors
                );

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

    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {
        return (
            <div className="management-form-page">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Loading...
                    </div>

                    <div className="data-table-empty-message">
                        Please wait while the user
                        creation form is loading.
                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // Page
    // ==========================================================

    return (
        <div className="management-form-page">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Create User
                    </h1>

                    <p className="page-header-description">
                        Create a new employee user and
                        assign their role, department,
                        position and manager.
                    </p>

                </div>

            </div>

            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            {/* ==================================================
                Form
            ================================================== */}

            <form
                className="management-form"
                onSubmit={handleSubmit}
            >

                

                {/* ==================================================
                    Name
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="name">
                        Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={
                            handleChange
                        }
                        placeholder="Enter full name"
                        required
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Email
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={
                            handleChange
                        }
                        placeholder="Enter email address"
                        required
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Password
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={
                            handleChange
                        }
                        placeholder="Enter password"
                        minLength="8"
                        required
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Confirm Password
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="password_confirmation">
                        Confirm Password
                    </label>

                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={
                            form.password_confirmation
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="Confirm password"
                        minLength="8"
                        required
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Role
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="role_id">
                        Role
                    </label>

                    <select
                        id="role_id"
                        name="role_id"
                        value={form.role_id}
                        onChange={
                            handleChange
                        }
                        required
                        disabled={saving}
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

                {/* ==================================================
                    Department
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="department_id">
                        Department
                    </label>

                    <select
                        id="department_id"
                        name="department_id"
                        value={
                            form.department_id
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
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
                                    {
                                        department.name
                                    }
                                </option>
                            )
                        )}

                    </select>

                </div>

                {/* ==================================================
                    Position
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="position_id">
                        Position
                    </label>

                    <select
                        id="position_id"
                        name="position_id"
                        value={
                            form.position_id
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                    >

                        <option value="">
                            Select Position
                        </option>

                        {positions.map(
                            (position) => (
                                <option
                                    key={
                                        position.id
                                    }
                                    value={
                                        position.id
                                    }
                                >
                                    {
                                        position.title
                                    }
                                </option>
                            )
                        )}

                    </select>

                </div>

                {/* ==================================================
                    Manager
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="manager_id">
                        Reporting Person
                    </label>

                    <select
                        id="manager_id"
                        name="manager_id"
                        value={
                            form.manager_id
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                    >

                        <option value="">
                            Reporting Person
                        </option>

                        {managers.map(
                            (manager) => (
                                <option
                                    key={
                                        manager.id
                                    }
                                    value={
                                        manager.id
                                    }
                                >
                                    {manager.name}
                                    {" "}
                                    (
                                    {
                                        manager.employee_id
                                    }
                                    )
                                </option>
                            )
                        )}

                    </select>

                    {managers.length === 0 && (
                        <small>
                            No active managers found.
                        </small>
                    )}

                </div>

                {/* ==================================================
                    Joining Date
                ================================================== */}
                <div className="management-form-field">

                    <label htmlFor="joining_date">
                        Joining Date
                    </label>

                    <input
                        id="joining_date"
                        type="date"
                        name="joining_date"
                        value={
                            form.joining_date
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                    />

                </div>

                {/* ==================================================
                    Status
                ================================================== */}

                <div className="management-form-checkbox">

                    <input
                        id="status"
                        type="checkbox"
                        name="status"
                        checked={
                            form.status
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                    />

                    <label htmlFor="status">
                        Active
                    </label>

                </div>

                {/* ==================================================
                    Actions
                ================================================== */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Creating..."
                            : "Create User"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/users"
                            )
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
};

export default CreateUser;