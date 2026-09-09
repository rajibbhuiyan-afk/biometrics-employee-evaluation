import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import DataTable from "../../components/DataTable";

const EvaluationPeriods = () => {

    const navigate = useNavigate();

    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Fetch Evaluation Periods
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
    | DataTable Columns
    |--------------------------------------------------------------------------
    */

    const columns = [

        {
            key: "id",
            label: "ID",
        },

        {
            key: "name",
            label: "Name",
        },

        {
            key: "start_date",
            label: "Period Start",

            render: (period) =>
                formatDate(
                    period.start_date
                ),
        },

        {
            key: "end_date",
            label: "Period End",

            render: (period) =>
                formatDate(
                    period.end_date
                ),
        },

        {
            key: "submission_start_date",
            label: "Submission Start",

            render: (period) =>
                formatDate(
                    period.submission_start_date
                ),
        },

        {
            key: "submission_end_date",
            label: "Submission End",

            render: (period) =>
                formatDate(
                    period.submission_end_date
                ),
        },

        {
            key: "status",
            label: "Status",

            render: (period) => (

                <span
                    className={getStatusClass(
                        period.status
                    )}
                >
                    {formatStatus(
                        period.status
                    )}
                </span>

            ),
        },

        {
            key: "actions",
            label: "Actions",

            render: (period) => (

                <div className="table-actions">

                    {/* Edit */}

                    <button
                        type="button"
                        className="action-button action-edit"
                        onClick={(event) => {

                            /*
                            Prevent any parent row click
                            */

                            event.stopPropagation();

                            navigate(
                                `/management/evaluation-periods/${period.id}/edit`
                            );

                        }}
                    >
                        Edit
                    </button>


                    {/* Delete */}

                    <button
                        type="button"
                        className="action-button action-delete"
                        onClick={(event) => {

                            /*
                            Prevent any parent row click
                            */

                            event.stopPropagation();

                            handleDelete(
                                period.id
                            );

                        }}
                    >
                        Delete
                    </button>

                </div>

            ),
        },
    ];


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="management-page">

                <div className="data-table-empty">

                    <div className="data-table-empty-title">
                        Loading Evaluation Periods...
                    </div>

                </div>

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

            {/* ==================================================
                Page Header
            ================================================== */}

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


            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                Data Table
            ================================================== */}

            <DataTable
                columns={columns}
                data={periods}
                emptyMessage="Create an evaluation period to get started."
            />

        </div>
    );
};

export default EvaluationPeriods;