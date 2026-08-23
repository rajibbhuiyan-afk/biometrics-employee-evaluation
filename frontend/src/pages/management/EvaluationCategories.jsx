import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EvaluationCategories = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/evaluation-categories"
            );

            console.log(
                "Evaluation Categories:",
                response.data
            );

            setCategories(
                response.data.data || []
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation categories."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this evaluation category?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/evaluation-categories/${id}`
            );

            alert(
                "Evaluation category deleted successfully."
            );

            fetchCategories();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete evaluation category."
            );
        }
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <h2>Loading Evaluation Categories...</h2>
            </div>
        );
    }

    return (
        <div style={containerStyle}>

            {/* HEADER */}

            <div style={headerStyle}>

                <h1>
                    Evaluation Categories
                </h1>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/management/evaluation-categories/create"
                        )
                    }
                >
                    + Create Category
                </button>

            </div>


            {/* ERROR */}

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}


            {/* EMPTY */}

            {categories.length === 0 ? (

                <p>
                    No evaluation categories found.
                </p>

            ) : (

                <div
                    style={{
                        overflowX: "auto",
                    }}
                >

                    <table style={tableStyle}>

                        <thead>

                            <tr>

                                <th style={thStyle}>
                                    ID
                                </th>

                                <th style={thStyle}>
                                    Name
                                </th>

                                <th style={thStyle}>
                                    Description
                                </th>

                                <th style={thStyle}>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {categories.map(
                                (category) => (

                                    <tr
                                        key={category.id}
                                    >

                                        <td style={tdStyle}>
                                            {category.id}
                                        </td>

                                        <td style={tdStyle}>
                                            {category.name}
                                        </td>

                                        <td style={tdStyle}>
                                            {category.description ||
                                                "N/A"}
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
                                                            `/management/evaluation-categories/${category.id}/edit`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id
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

export default EvaluationCategories;
