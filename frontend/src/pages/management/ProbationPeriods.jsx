import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

const ProbationPeriods = () => {
    const navigate = useNavigate();

    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Fetch Probation Periods
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/probation-periods"
            );

            console.log(
                "Probation Periods:",
                response.data
            );

            setPeriods(
                response.data.data || []
            );
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
        if (!status) {
            return "N/A";
        }

        return (
            String(status).charAt(0).toUpperCase() +
            String(status).slice(1)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Status Class
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (status) => {
        switch (
            String(status || "").toLowerCase()
        ) {
            case "active":
                return "status-active";

            case "completed":
                return "status-completed";

            case "extended":
                return "status-extended";

            case "terminated":
                return "status-inactive";

            default:
                return "status-inactive";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Probation Period
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this probation period?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/probation-periods/${id}`
            );

            setPeriods(
                (currentPeriods) =>
                    currentPeriods.filter(
                        (period) =>
                            period.id !== id
                    )
            );

            alert(
                "Probation period deleted successfully."
            );
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete probation period."
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
            <div className="management-page">
                <h2>
                    Loading Probation Periods...
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
        <div className="management-page">

            {/* Page Header */}

            <PageHeader
                title="Probation Period Management"
                description="Create, view, edit and manage employee probation periods."
                buttonText="+ Create Probation Period"
                onButtonClick={() =>
                    navigate(
                        "/management/probation-periods/create"
                    )
                }
            />

            {/* Error */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}

            {/* Empty State */}

            {periods.length === 0 ? (
                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No probation periods found.
                        </div>

                        <div className="data-table-empty-message">
                            Create a probation period to get started.
                        </div>

                    </div>

                </div>
            ) : (
                <DataTable
                    columns={[
                        {
                            key: "id",
                            label: "ID",
                        },
                        {
                            key: "employee",
                            label: "Employee",
                        },
                        {
                            key: "employee_id",
                            label: "Employee ID",
                        },
                        {
                            key: "start_date",
                            label: "Start Date",
                        },
                        {
                            key: "end_date",
                            label: "End Date",
                        },
                        {
                            key: "status",
                            label: "Status",
                        },
                        {
                            key: "actions",
                            label: "Actions",
                        },
                    ]}

                    data={periods.map((period) => {
                        const status = String(
                            period.status || ""
                        ).toLowerCase();

                        return {
                            id: period.id,

                            employee:
                                period.employee?.name ||
                                "N/A",

                            employee_id:
                                period.employee?.employee_id ||
                                "N/A",

                            start_date:
                                formatDate(
                                    period.start_date
                                ),

                            end_date:
                                formatDate(
                                    period.end_date
                                ),

                            status: (
                                <span
                                    className={`status-badge ${getStatusClass(
                                        status
                                    )}`}
                                >
                                    {formatStatus(status)}
                                </span>
                            ),

                            actions: (
                                <div className="table-actions">

                                    <button
                                        type="button"
                                        className="action-button action-edit"
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
                                        className="action-button action-delete"
                                        onClick={() =>
                                            handleDelete(
                                                period.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>
                            ),
                        };
                    })}
                />
            )}

        </div>
    );
};

export default ProbationPeriods;