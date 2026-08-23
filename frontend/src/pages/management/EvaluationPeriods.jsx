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

    /*
    |--------------------------------------------------------------------------
    | Fetch Evaluation Periods
    |--------------------------------------------------------------------------
    */

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/evaluation-periods"
            );

            console.log(
                "Evaluation Periods:",
                response.data
            );

            setPeriods(
                response.data.data || []
            );

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
        if (
            status === null ||
            status === undefined
        ) {
            return "N/A";
        }

        const value = String(status);

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Status Class
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (status) => {
        const value = String(
            status || ""
        ).toLowerCase();

        if (value === "active") {
            return "status-badge status-active";
        }

        if (value === "closed") {
            return "status-badge status-inactive";
        }

        return "status-badge status-draft";
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Evaluation Period
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
            await api.delete(
                `/evaluation-periods/${id}`
            );

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
            <div className="management-page">
                <h2>
                    Loading Evaluation Periods...
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

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Evaluation Periods
                    </h1>

                    <p className="page-header-description">
                        Manage employee evaluation periods
                        and submission schedules.
                    </p>

                </div>

                <button
                    type="button"
                    className="page-header-button"
                    onClick={() =>
                        navigate(
                            "/management/evaluation-periods/create"
                        )
                    }
                >
                    + Create Evaluation Period
                </button>

            </div>


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
                            No evaluation periods found
                        </div>

                        <div className="data-table-empty-message">
                            Create an evaluation period
                            to get started.
                        </div>

                    </div>

                </div>

            ) : (

                /* Table */

                <div className="data-table-container">

                    <div className="data-table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Period Start
                                    </th>

                                    <th>
                                        Period End
                                    </th>

                                    <th>
                                        Submission Start
                                    </th>

                                    <th>
                                        Submission End
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th className="data-table-actions-header">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {periods.map(
                                    (period) => (

                                        <tr
                                            key={period.id}
                                        >

                                            <td>
                                                {period.id}
                                            </td>

                                            <td>
                                                {period.name}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    period.start_date
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    period.end_date
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    period.submission_start_date
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    period.submission_end_date
                                                )}
                                            </td>

                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={getStatusClass(
                                                        period.status
                                                    )}
                                                >
                                                    {formatStatus(
                                                        period.status
                                                    )}
                                                </span>

                                            </td>

                                            {/* Actions */}

                                            <td className="data-table-actions">

                                                <div className="table-actions">

                                                    <button
                                                        type="button"
                                                        className="action-button action-edit"
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

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
};

export default EvaluationPeriods;