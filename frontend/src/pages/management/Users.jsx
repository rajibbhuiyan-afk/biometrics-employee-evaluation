import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Fetch Users
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");

            console.log("Users:", response.data);

            setUsers(response.data.data || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete User
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await api.delete(`/users/${id}`);

            alert("User deleted successfully.");

            fetchUsers();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete user."
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
            <div style={containerStyle}>
                <h2>Loading Users...</h2>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <div style={containerStyle}>

            {/* Page Header */}

            <PageHeader
                title="User Management"
                description="Create, view, edit and manage system users."
                buttonText="+ Create User"
                onButtonClick={() =>
                    navigate("/management/users/create")
                }
            />

            {/* Error */}

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            {/* Users Table */}

            <DataTable
                columns={[
                    {
                        key: "id",
                        label: "ID",
                    },

                    {
                        key: "employee_id",
                        label: "Employee ID",
                    },

                    {
                        key: "name",
                        label: "Name",
                    },

                    {
                        key: "email",
                        label: "Email",
                    },

                    {
                        key: "role",
                        label: "Role",

                        render: (user) =>
                            user.role?.name || "N/A",
                    },

                    {
                        key: "department",
                        label: "Department",

                        render: (user) =>
                            user.department?.name || "N/A",
                    },

                    {
                        key: "position",
                        label: "Position",

                        render: (user) =>
                            user.position?.title || "N/A",
                    },

                    {
                        key: "status",
                        label: "Status",

                        render: (user) => (
                            <span
                                style={{
                                    display: "inline-block",
                                    padding: "5px 10px",
                                    borderRadius: "12px",
                                    fontSize: "13px",
                                    fontWeight: "600",

                                    backgroundColor:
                                        user.status
                                            ? "#d4edda"
                                            : "#f8d7da",

                                    color:
                                        user.status
                                            ? "#155724"
                                            : "#721c24",
                                }}
                            >
                                {user.status
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        ),
                    },

                    {
                        key: "actions",
                        label: "Actions",

                        render: (user) => (
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                }}
                            >

                                {/* Edit */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/management/users/${user.id}/edit`
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                {/* Change Password */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/management/users/${user.id}/change-password`
                                        )
                                    }
                                >
                                    Change Password
                                </button>

                                {/* Delete */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(user.id)
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        ),
                    },
                ]}
                data={users}
                emptyMessage="No users found."
            />

        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const containerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
};

const errorStyle = {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    padding: "12px 15px",
    marginBottom: "20px",
};

export default Users;