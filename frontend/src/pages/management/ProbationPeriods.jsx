import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ProbationPeriods = () => {
    const navigate = useNavigate();

    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/probation-periods");

            console.log("Probation Periods:", response.data);

            setPeriods(response.data.data || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load probation periods."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return String(date).substring(0, 10);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this probation period?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/probation-periods/${id}`);

            alert("Probation period deleted successfully.");

            fetchPeriods();
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete probation period."
            );
        }
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <h2>Loading Probation Periods...</h2>
            </div>
        );
    }

    return (
        <div style={containerStyle}>

            <div style={headerStyle}>

                <h1>Probation Periods</h1>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/management/probation-periods/create"
                        )
                    }
                >
                    + Create Probation Period
                </button>

            </div>

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            {periods.length === 0 ? (
                <p>No probation periods found.</p>
            ) : (
                <div style={{ overflowX: "auto" }}>

                    <table style={tableStyle}>

                        <thead>
                            <tr>

                                <th style={thStyle}>
                                    ID
                                </th>

                                <th style={thStyle}>
                                    Employee
                                </th>

                                <th style={thStyle}>
                                    Employee ID
                                </th>

                                <th style={thStyle}>
                                    Start Date
                                </th>

                                <th style={thStyle}>
                                    End Date
                                </th>

                                <th style={thStyle}>
                                    Status
                                </th>

                                <th style={thStyle}>
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {periods.map((period) => {

                                const status =
                                    typeof period.status === "string"
                                        ? period.status
                                        : "";

                                return (
                                    <tr key={period.id}>

                                        <td style={tdStyle}>
                                            {period.id}
                                        </td>

                                        <td style={tdStyle}>
                                            {period.employee?.name || "N/A"}
                                        </td>

                                        <td style={tdStyle}>
                                            {period.employee?.employee_id || "N/A"}
                                        </td>

                                        <td style={tdStyle}>
                                            {formatDate(period.start_date)}
                                        </td>

                                        <td style={tdStyle}>
                                            {formatDate(period.end_date)}
                                        </td>

                                        <td style={tdStyle}>

                                            <span
                                                style={{
                                                    ...statusStyle,
                                                    backgroundColor:
                                                        status === "active"
                                                            ? "#d4edda"
                                                            : status === "completed"
                                                                ? "#d1ecf1"
                                                                : status === "extended"
                                                                    ? "#fff3cd"
                                                                    : "#f8d7da",
                                                    color:
                                                        status === "active"
                                                            ? "#155724"
                                                            : status === "completed"
                                                                ? "#0c5460"
                                                                : status === "extended"
                                                                    ? "#856404"
                                                                    : "#721c24",
                                                }}
                                            >
                                                {status
                                                    ? status.charAt(0).toUpperCase() +
                                                      status.slice(1)
                                                    : "N/A"}
                                            </span>

                                        </td>

                                        <td style={tdStyle}>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/management/probation-periods/${period.id}/edit`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(period.id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                );
                            })}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
};

const containerStyle = {
    // maxWidth: "1200px",
    // margin: "30px auto",
    // padding: "20px",
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
};

const errorStyle = {
    color: "red",
    background: "#ffe5e5",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
};

const thStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#f5f5f5",
};

const tdStyle = {
    border: "1px solid #ddd",
    padding: "10px",
};

const statusStyle = {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "bold",
};

export default ProbationPeriods;