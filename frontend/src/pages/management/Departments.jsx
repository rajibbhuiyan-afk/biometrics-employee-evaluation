import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

const Departments = () => {
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/departments");

            console.log("Departments:", response.data);

            setDepartments(response.data.data || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load departments."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/departments/${id}`);

            alert("Department deleted successfully.");

            fetchDepartments();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete department."
            );
        }
    };

    if (loading) {
        return (
            <div className="management-page">
                <h2>Loading departments...</h2>
            </div>
        );
    }

    return (
        <div className="management-page">

            <PageHeader
                title="Department Management"
                description="Create, view, edit and manage departments."
                buttonText="+ Create Department"
                onButtonClick={() =>
                    navigate("/management/departments/create")
                }
            />

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}

            <DataTable
                columns={[
                    {
                        key: "id",
                        label: "ID",
                    },
                    {
                        key: "name",
                        label: "Name",
                    },
                    {
                        key: "code",
                        label: "Code",
                    },
                    {
                        key: "description",
                        label: "Description",
                        render: (department) =>
                            department.description || "N/A",
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (department) => (
                            <span
                                className={
                                    department.status
                                        ? "status-badge status-active"
                                        : "status-badge status-inactive"
                                }
                            >
                                {department.status
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        render: (department) => (
                            <div className="table-actions">

                                <button
                                    type="button"
                                    className="action-button action-edit"
                                    onClick={() =>
                                        navigate(
                                            `/management/departments/${department.id}/edit`
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
                                            department.id
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        ),
                    },
                ]}
                data={departments}
                emptyMessage="No departments found."
            />

        </div>
    );
};

export default Departments;