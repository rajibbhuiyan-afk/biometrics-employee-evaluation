import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

const Positions = () => {
    const navigate = useNavigate();

    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Fetch Positions
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/positions");

            console.log("Positions:", response.data);

            setPositions(response.data.data || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load positions."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Position
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this position?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/positions/${id}`);

            setPositions((currentPositions) =>
                currentPositions.filter(
                    (position) => position.id !== id
                )
            );

            alert("Position deleted successfully.");
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete position."
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
                <h2>Loading positions...</h2>
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
                title="Position Management"
                description="Create, view, edit and manage positions."
                buttonText="+ Create Position"
                onButtonClick={() =>
                    navigate("/management/positions/create")
                }
            />

            {/* Error */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}

            {/* Empty State */}

            {positions.length === 0 ? (
                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No positions found.
                        </div>

                        <div className="data-table-empty-message">
                            Create a position to get started.
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
                            key: "title",
                            label: "Title",
                        },
                        {
                            key: "code",
                            label: "Code",
                        },
                        {
                            key: "department",
                            label: "Department",
                        },
                        {
                            key: "description",
                            label: "Description",
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

                    data={positions.map((position) => ({
                        id: position.id,

                        title:
                            position.title ||
                            "N/A",

                        code:
                            position.code ||
                            "N/A",

                        department:
                            position.department?.name ||
                            "N/A",

                        description:
                            position.description ||
                            "N/A",

                        status: (
                            <span
                                className={
                                    position.status
                                        ? "status-badge status-active"
                                        : "status-badge status-inactive"
                                }
                            >
                                {position.status
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        ),

                        actions: (
                            <div className="table-actions">

                                <button
                                    type="button"
                                    className="action-button action-edit"
                                    onClick={() =>
                                        navigate(
                                            `/management/positions/${position.id}/edit`
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="action-button action-delete"
                                    onClick={() =>
                                        handleDelete(position.id)
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        ),
                    }))}
                />
            )}

        </div>
    );
};

export default Positions;