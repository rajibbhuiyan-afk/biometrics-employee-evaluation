import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EvaluationPeriods = () => {
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

            const response = await api.get("/evaluation-periods");

            console.log("Evaluation Periods:", response.data);

            setPeriods(response.data.data || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation periods."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return String(date).substring(0, 10);
    };

    /*
    |--------------------------------------------------------------------------
    | Format Status
    |--------------------------------------------------------------------------
    */

    const formatStatus = (status) => {
        if (status === null || status === undefined) {
            return "N/A";
        }

        return String(status)
            .charAt(0)
            .toUpperCase() +
            String(status).slice(1);
    };

    /*
    |--------------------------------------------------------------------------
    | Status Color
    |--------------------------------------------------------------------------
    */

    const getStatusStyle = (status) => {
        const value = String(status || "").toLowerCase();

        if (value === "active") {
            return {
                backgroundColor: "#d4edda",
                color: "#155724",
            };
        }

        if (value === "closed") {
            return {
                backgroundColor: "#f8d7da",
                color: "#721c24",
            };
        }

        return {
            backgroundColor: "#fff3cd",
            color: "#856404",
        };
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this evaluation period?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/evaluation-periods/${id}`);

            alert(
                "Evaluation period deleted successfully."
            );

            fetchPeriods();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete evaluation period."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div
                // style={{
                //     maxWidth: "1200px",
                //     margin: "30px auto",
                //     padding: "20px",
                // }}
            >
                <h2>Loading Evaluation Periods...</h2>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div
            style={{
                // maxWidth: "1200px",
                // margin: "30px auto",
                // padding: "20px",
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >

                <h1>
                    Evaluation Periods
                </h1>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/management/evaluation-periods/create"
                        )
                    }
                >
                    + Create Evaluation Period
                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div
                    style={{
                        color: "red",
                        background: "#ffe5e5",
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* EMPTY */}

            {periods.length === 0 ? (

                <p>
                    No evaluation periods found.
                </p>

            ) : (

                <div
                    style={{
                        overflowX: "auto",
                    }}
                >

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >

                        <thead>
                            <tr>

                                <th style={thStyle}>
                                    ID
                                </th>

                                <th style={thStyle}>
                                    Name
                                </th>

                                <th style={thStyle}>
                                    Period Start
                                </th>

                                <th style={thStyle}>
                                    Period End
                                </th>

                                <th style={thStyle}>
                                    Submission Start
                                </th>

                                <th style={thStyle}>
                                    Submission End
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

                                const statusStyle =
                                    getStatusStyle(
                                        period.status
                                    );

                                return (
                                    <tr key={period.id}>

                                        <td style={tdStyle}>
                                            {period.id}
                                        </td>

                                        <td style={tdStyle}>
                                            {period.name}
                                        </td>

                                        <td style={tdStyle}>
                                            {formatDate(
                                                period.start_date
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {formatDate(
                                                period.end_date
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {formatDate(
                                                period.submission_start_date
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {formatDate(
                                                period.submission_end_date
                                            )}
                                        </td>

                                        {/* STATUS */}

                                        <td style={tdStyle}>

                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    padding: "5px 10px",
                                                    borderRadius: "12px",
                                                    fontSize: "13px",
                                                    fontWeight: "bold",
                                                    backgroundColor:
                                                        statusStyle.backgroundColor,
                                                    color:
                                                        statusStyle.color,
                                                }}
                                            >
                                                {formatStatus(
                                                    period.status
                                                )}
                                            </span>

                                        </td>

                                        {/* ACTIONS */}

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
                                                            `/management/evaluation-periods/${period.id}/edit`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            period.id
                                                        )
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

export default EvaluationPeriods;