import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import DataTable from "../../components/DataTable";

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
    | Table Columns
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
            key: "description",
            label: "Description",

            render: (category) =>
                category.description || "N/A",
        },

        {
            key: "actions",
            label: "Actions",

            render: (category) => (
                <div className="table-actions">

                    {/* Edit */}

                    <button
                        type="button"
                        className="action-button action-edit"
                        onClick={(event) => {

                            /*
                            Prevent DataTable row click
                            */

                            event.stopPropagation();

                            navigate(
                                `/management/evaluation-categories/${category.id}/edit`
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
                            Prevent DataTable row click
                            */

                            event.stopPropagation();

                            handleDelete(
                                category.id
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

            {/* ==================================================
                Page Header
            ================================================== */}

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
                data={categories}
                emptyMessage="Create a category to get started."
            />

        </div>
    );
};

export default EvaluationCategories;