import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditPosition = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);

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


    /*
    |--------------------------------------------------------------------------
    | Load Position + Departments
    |--------------------------------------------------------------------------
    */

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
                    Boolean(position.status),
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


    /*
    |--------------------------------------------------------------------------
    | Handle Input Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

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
                        Number(form.department_id),
                    description:
                        form.description,
                    status:
                        Boolean(form.status),
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


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="management-form-page">

                <h2>
                    Loading position...
                </h2>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (

        <div className="management-form-page">

            <h1 className="management-form-title">
                Edit Position
            </h1>


            {/* Error */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}


            <form
                className="management-form"
                onSubmit={handleSubmit}
            >


                {/* Title */}

                <div className="management-form-field">

                    <label>
                        Position Title
                    </label>

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

                <div className="management-form-field">

                    <label>
                        Position Code (Short Name )
                    </label>

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

                <div className="management-form-field">

                    <label>
                        Department
                    </label>

                    <select
                        name="department_id"
                        value={form.department_id}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Department
                        </option>

                        {departments.map(
                            (department) => (

                                <option
                                    key={department.id}
                                    value={department.id}
                                >
                                    {department.name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* Description */}

                <div className="management-form-field">

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Position description"
                        rows="4"
                    />

                </div>


                {/* Status */}

                <div className="management-form-checkbox">

                    <input
                        type="checkbox"
                        name="status"
                        checked={form.status}
                        onChange={handleChange}
                    />

                    <label>
                        Active
                    </label>

                </div>


                {/* Buttons */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Position"}
                    </button>


                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/positions"
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

export default EditPosition;