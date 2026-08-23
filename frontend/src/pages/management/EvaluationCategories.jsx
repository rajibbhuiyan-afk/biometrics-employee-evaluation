import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EvaluationCategories = () => {

    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Categories
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | Delete Category
    |--------------------------------------------------------------------------
    */

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
                        Loading Evaluation Categories...
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

            {/* Page Header */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Evaluation Categories
                    </h1>

                    <p className="page-header-description">
                        Manage evaluation categories.
                    </p>

                </div>


                <button
                    type="button"
                    className="page-header-button"
                    onClick={() =>
                        navigate(
                            "/management/evaluation-categories/create"
                        )
                    }
                >
                    + Create Category
                </button>

            </div>


            {/* Error */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}


            {/* Empty */}

            {categories.length === 0 ? (

                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No evaluation categories found.
                        </div>

                        <div className="data-table-empty-message">
                            Create a category to get started.
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
                                        Description
                                    </th>

                                    <th className="data-table-actions-header">
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

                                            <td>
                                                {category.id}
                                            </td>

                                            <td>
                                                {category.name}
                                            </td>

                                            <td>
                                                {category.description ||
                                                    "N/A"}
                                            </td>

                                            <td className="data-table-actions">

                                                <div className="table-actions">

                                                    {/* Edit */}

                                                    <button
                                                        type="button"
                                                        className="action-button action-edit"
                                                        onClick={() =>
                                                            navigate(
                                                                `/management/evaluation-categories/${category.id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    {/* Delete */}

                                                    <button
                                                        type="button"
                                                        className="action-button action-delete"
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

                </div>

            )}

        </div>
    );
};

export default EvaluationCategories;