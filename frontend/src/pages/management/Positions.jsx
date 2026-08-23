import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Positions = () => {
    const navigate = useNavigate();

    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return (
            <div style={containerStyle}>
                <h2>Loading positions...</h2>
            </div>
        );
    }

    return (
        <div style={containerStyle}>

            <div style={headerStyle}>

                <div>
                    <h1>Position Management</h1>

                    <p>
                        Create, view, edit and manage positions.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/management/positions/create")
                    }
                >
                    + Create Position
                </button>

            </div>


            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}


            {positions.length === 0 ? (

                <p>No positions found.</p>

            ) : (

                <table
                    border="1"
                    cellPadding="10"
                    cellSpacing="0"
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Code</th>
                            <th>Department</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        {positions.map((position) => (

                            <tr key={position.id}>

                                <td>
                                    {position.id}
                                </td>

                                <td>
                                    {position.title}
                                </td>

                                <td>
                                    {position.code}
                                </td>

                                <td>
                                    {position.department?.name ||
                                        "N/A"}
                                </td>

                                <td>
                                    {position.description ||
                                        "N/A"}
                                </td>

                                <td>

                                    {position.status ? (
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
                                                `/management/positions/${position.id}/edit`
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
                                                position.id
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


export default Positions;