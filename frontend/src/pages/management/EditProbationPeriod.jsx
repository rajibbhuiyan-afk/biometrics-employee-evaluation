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

    useEffect(() => {
        fetchData();
    }, [id]);

    const formatDateForInput = (date) => {

        if (!date) {
            return "";
        }

        return String(date).substring(0, 10);
    };

    const fetchData = async () => {

        try {

            setLoading(true);
            setError("");

            const [periodResponse, usersResponse] =
                await Promise.all([
                    api.get(`/probation-periods/${id}`),
                    api.get("/users"),
                ]);

            const period =
                periodResponse.data.data;

            const users =
                usersResponse.data.data || [];

            const employeeUsers = users.filter(
                (user) =>
                    user.role?.name?.toLowerCase() === "employee"
            );

            setEmployees(employeeUsers);

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

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");

            await api.put(
                `/probation-periods/${id}`,
                {
                    employee_id: Number(form.employee_id),
                    start_date: form.start_date,
                    end_date: form.end_date,
                    status: form.status,
                    notes: form.notes || null,
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

    if (loading) {

        return (
            <div style={containerStyle}>
                <h2>
                    Loading Probation Period...
                </h2>
            </div>
        );
    }

    return (
        <div style={containerStyle}>

            <h1>
                Edit Probation Period
            </h1>

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* Employee */}

                <div style={fieldStyle}>

                    <label>
                        Employee
                    </label>

                    <select
                        name="employee_id"
                        value={form.employee_id}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >

                        <option value="">
                            Select Employee
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

                <div style={fieldStyle}>

                    <label>
                        Start Date
                    </label>

                    <input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                </div>


                {/* End Date */}

                <div style={fieldStyle}>

                    <label>
                        End Date
                    </label>

                    <input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                </div>


                {/* Status */}

                <div style={fieldStyle}>

                    <label>
                        Status
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        style={inputStyle}
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

                <div style={fieldStyle}>

                    <label>
                        Notes
                    </label>

                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows="4"
                        style={inputStyle}
                    />

                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "20px",
                    }}
                >

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Probation Period"}
                    </button>

                    <button
                        type="button"
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

const containerStyle = {
    maxWidth: "700px",
    margin: "30px auto",
    padding: "20px",
};

const fieldStyle = {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
};

const inputStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
};

const errorStyle = {
    color: "red",
    background: "#ffe5e5",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
    whiteSpace: "pre-line",
};

export default EditProbationPeriod;