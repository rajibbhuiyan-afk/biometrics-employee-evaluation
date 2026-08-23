import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

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
            <div style={containerStyle}>
                <h2>Loading departments...</h2>
            </div>
        );
    }

    return (
        <div style={containerStyle}>

            <div style={headerStyle}>

                <div>
                    <h1>Department Management</h1>

                    <p>
                        Create, view, edit and manage departments.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/management/departments/create")
                    }
                >
                    + Create Department
                </button>

            </div>


            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}


            {departments.length === 0 ? (

                <div>
                    <p>No departments found.</p>
                </div>

            ) : (

                <table
                    border="1"
                    cellPadding="10"
                    cellSpacing="0"
                    style={{
                        width: "100%",
                        marginTop: "20px",
                        borderCollapse: "collapse",
                    }}
                >

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        {departments.map((department) => (

                            <tr key={department.id}>

                                <td>
                                    {department.id}
                                </td>

                                <td>
                                    {department.name}
                                </td>

                                <td>
                                    {department.code}
                                </td>

                                <td>
                                    {department.description || "N/A"}
                                </td>

                                <td>

                                    {department.status ? (
                                        <span
                                            style={{
                                                color: "green",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Active
                                        </span>
                                    ) : (
                                        <span
                                            style={{
                                                color: "red",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Inactive
                                        </span>
                                    )}

                                </td>


                                <td>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/management/departments/${department.id}/edit`
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                department.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

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
    marginBottom: "20px",
};


export default Departments;