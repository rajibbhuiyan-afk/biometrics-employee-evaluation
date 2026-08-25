import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditUser = () => {

    const { id } = useParams();

    const navigate = useNavigate();


    // ==========================================================
    // State
    // ==========================================================

    const [user, setUser] = useState(null);

    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [managers, setManagers] = useState([]);


    const [form, setForm] = useState({

        name: "",

        email: "",

        employee_id: "",

        gender: "",

        employee_type: "regular",

        role_id: "",

        department_id: "",

        position_id: "",

        manager_id: "",

        status: true,

        joining_date: "",

    });


    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    // ==========================================================
    // Load Data
    // ==========================================================

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
                managersResponse,
            ] = await Promise.all([

                api.get(`/users/${id}`),

                api.get("/roles"),

                api.get("/departments"),

                api.get("/positions"),

                api.get("/users/managers"),

            ]);


            // ==================================================
            // User
            // ==================================================

            const userData =
                userResponse.data.data;


            setUser(userData);


            setForm({

                name:
                    userData.name || "",

                email:
                    userData.email || "",

                employee_id:
                    userData.employee_id || "",

                gender:
                    userData.gender || "",

                employee_type:
                    userData.employee_type ||
                    "regular",

                role_id:
                    userData.role_id
                        ? String(userData.role_id)
                        : "",

                department_id:
                    userData.department_id
                        ? String(userData.department_id)
                        : "",

                position_id:
                    userData.position_id
                        ? String(userData.position_id)
                        : "",

                manager_id:
                    userData.manager_id
                        ? String(userData.manager_id)
                        : "",

                status:
                    userData.status ?? true,

                joining_date:
                    userData.joining_date
                        ? userData.joining_date.substring(
                              0,
                              10
                          )
                        : "",

            });


            // ==================================================
            // Dropdown Data
            // ==================================================

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
                "Failed to load edit user data:",
                error
            );


            setError(

                error.response?.data?.message ||

                "Failed to load user."

            );


        } finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // Handle Change
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


            // ==================================================
            // Prepare Payload
            // ==================================================

            const payload = {

                name:
                    form.name,

                email:
                    form.email,

                employee_id:
                    form.employee_id,

                gender:
                    form.gender,

                employee_type:
                    form.employee_type,

                role_id:
                    Number(form.role_id),

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

                status:
                    form.status,

                joining_date:
                    form.joining_date || null,

            };


            console.log(
                "Update User Payload:",
                payload
            );


            // ==================================================
            // API
            // ==================================================

            const response =
                await api.put(
                    `/users/${id}`,
                    payload
                );


            console.log(
                "Update User Response:",
                response.data
            );


            if (response.data.success) {

                alert(
                    "User updated successfully."
                );


                navigate(
                    "/management/users"
                );

            }


        } catch (error) {

            console.error(
                "Update user error:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            // ==================================================
            // Validation Errors
            // ==================================================

            if (
                error.response?.data?.errors
            ) {

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

                    "Failed to update user."

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

                <h2>
                    Loading user...
                </h2>

            </div>

        );

    }


    // ==========================================================
    // User Not Found
    // ==========================================================

    if (!user) {

        return (

            <div className="management-form-page">

                <h2>
                    User not found.
                </h2>


                <button
                    type="button"
                    className="management-btn-secondary"
                    onClick={() =>
                        navigate(
                            "/management/users"
                        )
                    }
                >
                    Back to Users
                </button>

            </div>

        );

    }


    // ==========================================================
    // Page
    // ==========================================================

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


                {/* ==================================================
                    Employee ID
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="employee_id">

                        Employee ID

                    </label>


                    <input
                        type="text"
                        id="employee_id"
                        name="employee_id"
                        value={
                            form.employee_id
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                        required
                    />

                </div>


                {/* ==================================================
                    Gender
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="gender">

                        Gender

                    </label>


                    <select
                        id="gender"
                        name="gender"
                        value={
                            form.gender
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                        required
                    >

                        <option value="">
                            Select Gender
                        </option>


                        <option value="male">
                            Male
                        </option>


                        <option value="female">
                            Female
                        </option>

                    </select>

                </div>


                {/* ==================================================
                    Employee Type
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="employee_type">

                        Employee Type

                    </label>


                    <select
                        id="employee_type"
                        name="employee_type"
                        value={
                            form.employee_type
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                        required
                    >

                        <option value="regular">
                            Regular Employee
                        </option>


                        <option value="support_staff">
                            Support Staff
                        </option>


                        <option value="cpa">
                            CPA Employee
                        </option>

                    </select>

                </div>


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
                        value={
                            form.name
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                        required
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
                        value={
                            form.email
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                        required
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
                        value={
                            form.role_id
                        }
                        onChange={
                            handleChange
                        }
                        disabled={saving}
                        required
                    >

                        <option value="">
                            Select Role
                        </option>


                        {roles.map(
                            (role) => (

                                <option
                                    key={
                                        role.id
                                    }
                                    value={
                                        role.id
                                    }
                                >

                                    {role.name}

                                </option>

                            )
                        )}

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
                    Reporting Person
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="manager_id">

                        Reports To

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
                            No Reporting Person
                        </option>


                        {managers

                            .filter(
                                (manager) =>
                                    Number(
                                        manager.id
                                    ) !==
                                    Number(id)
                            )

                            .map(
                                (manager) => (

                                    <option
                                        key={
                                            manager.id
                                        }
                                        value={
                                            manager.id
                                        }
                                    >

                                        {
                                            manager.name
                                        }

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
                            ? "Updating..."
                            : "Update User"}

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


export default EditUser;