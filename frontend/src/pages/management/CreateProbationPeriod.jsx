import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateProbationPeriod = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
        employee_id: "",
        start_date: "",
        end_date: "",
        status: "active",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get("/users");

            const users = response.data.data || [];

            const employeeUsers = users.filter(
                (user) =>
                    user.role?.name?.toLowerCase() === "employee"
            );

            setEmployees(employeeUsers);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load employees."
            );

        } finally {
            setLoadingEmployees(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await api.post("/probation-periods", {
                employee_id: Number(form.employee_id),
                start_date: form.start_date,
                end_date: form.end_date,
                status: form.status,
                notes: form.notes || null,
            });

            alert("Probation period created successfully.");

            navigate("/management/probation-periods");

        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                const validationErrors =
                    error.response.data.errors;

                if (validationErrors) {
                    const messages = Object.values(
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
                    "Failed to create probation period."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-form-page">

            <h1 className="management-form-title">
                Create Probation Period
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

                {/* Employee */}

                <div className="management-form-field">

                    <label htmlFor="employee_id">
                        Employee
                    </label>

                    <select
                        id="employee_id"
                        name="employee_id"
                        value={form.employee_id}
                        onChange={handleChange}
                        required
                        disabled={loadingEmployees}
                    >
                        <option value="">
                            {loadingEmployees
                                ? "Loading employees..."
                                : "Select Employee"}
                        </option>

                        {employees.map((employee) => (
                            <option
                                key={employee.id}
                                value={employee.id}
                            >
                                {employee.name}
                                {" - "}
                                {employee.employee_id}
                            </option>
                        ))}
                    </select>

                </div>

                {/* Start Date */}

                <div className="management-form-field">

                    <label htmlFor="start_date">
                        Start Date
                    </label>

                    <input
                        id="start_date"
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                    />

                </div>

                {/* End Date */}

                <div className="management-form-field">

                    <label htmlFor="end_date">
                        End Date
                    </label>

                    <input
                        id="end_date"
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                    />

                </div>

                {/* Status */}

                <div className="management-form-field">

                    <label htmlFor="status">
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
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

                    <label htmlFor="notes">
                        Notes
                    </label>

                    <textarea
                        id="notes"
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Add any notes about this probation period..."
                    />

                </div>

                {/* Buttons */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Probation Period"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/probation-periods"
                            )
                        }
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
};

export default CreateProbationPeriod;