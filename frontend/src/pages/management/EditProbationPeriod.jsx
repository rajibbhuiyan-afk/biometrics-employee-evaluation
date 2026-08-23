import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditProbationPeriod = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
        employee_id: "",
        start_date: "",
        end_date: "",
        status: "active",
        notes: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Probation Period + Employees
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchData();
    }, [id]);


    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDateForInput = (date) => {

        if (!date) {
            return "";
        }

        return String(date).substring(0, 10);
    };


    /*
    |--------------------------------------------------------------------------
    | Fetch Data
    |--------------------------------------------------------------------------
    */

    const fetchData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                periodResponse,
                usersResponse,
            ] = await Promise.all([
                api.get(`/probation-periods/${id}`),
                api.get("/users"),
            ]);

            const period =
                periodResponse.data.data;

            const users =
                usersResponse.data.data || [];


            /*
            | Only Employee Users
            */

            const employeeUsers = users.filter(
                (user) =>
                    user.role?.name?.toLowerCase() === "employee"
            );

            setEmployees(employeeUsers);


            /*
            | Set Existing Data
            */

            setForm({
                employee_id:
                    period.employee_id || "",

                start_date:
                    formatDateForInput(
                        period.start_date
                    ),

                end_date:
                    formatDateForInput(
                        period.end_date
                    ),

                status:
                    typeof period.status === "string"
                        ? period.status
                        : "active",

                notes:
                    period.notes || "",
            });

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load probation period."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Handle Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
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
                `/probation-periods/${id}`,
                {
                    employee_id:
                        Number(form.employee_id),

                    start_date:
                        form.start_date,

                    end_date:
                        form.end_date,

                    status:
                        form.status,

                    notes:
                        form.notes || null,
                }
            );

            alert(
                "Probation period updated successfully."
            );

            navigate(
                "/management/probation-periods"
            );

        } catch (error) {

            console.error(error);


            /*
            | Validation Error
            */

            if (error.response?.status === 422) {

                const validationErrors =
                    error.response.data.errors;

                if (validationErrors) {

                    const messages =
                        Object.values(
                            validationErrors
                        )
                            .flat()
                            .join("\n");

                    setError(messages);

                } else {

                    setError(
                        error.response.data.message ||
                        "Validation failed."
                    );
                }

            } else {

                setError(
                    error.response?.data?.message ||
                    "Failed to update probation period."
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
                    Loading Probation Period...
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
                Edit Probation Period
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


                {/* Employee */}

                <div className="management-form-field">

                    <label>
                        Employee
                    </label>

                    <select
                        name="employee_id"
                        value={form.employee_id}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    >

                        <option value="">
                            Select Employee
                        </option>

                        {employees.map(
                            (employee) => (

                                <option
                                    key={employee.id}
                                    value={employee.id}
                                >
                                    {employee.name}
                                    {" - "}
                                    {employee.employee_id}
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* Start Date */}

                <div className="management-form-field">

                    <label>
                        Start Date
                    </label>

                    <input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />

                </div>


                {/* End Date */}

                <div className="management-form-field">

                    <label>
                        End Date
                    </label>

                    <input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />

                </div>


                {/* Status */}

                <div className="management-form-field">

                    <label>
                        Status
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        disabled={saving}
                    >

                        <option value="active">
                            Active
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="extended">
                            Extended
                        </option>

                        <option value="terminated">
                            Terminated
                        </option>

                    </select>

                </div>


                {/* Notes */}

                <div className="management-form-field">

                    <label>
                        Notes
                    </label>

                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows="4"
                        disabled={saving}
                        placeholder="Enter notes"
                    />

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
                            : "Update Probation Period"}
                    </button>


                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/probation-periods"
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

export default EditProbationPeriod;