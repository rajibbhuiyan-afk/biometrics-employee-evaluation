import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditEvaluationQuestion = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        category_id: "",
        question: "",
        question_type: "rating",
        max_rating: 5,
        weight: 1,
        is_required: true,
        sort_order: 0,
        status: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});


    useEffect(() => {
        fetchData();
    }, [id]);


    /*
    |--------------------------------------------------------------------------
    | Fetch Question + Categories
    |--------------------------------------------------------------------------
    */

    const fetchData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                questionResponse,
                categoriesResponse,
            ] = await Promise.all([

                api.get(
                    `/evaluation-questions/${id}`
                ),

                api.get(
                    "/evaluation-categories"
                ),

            ]);


            const question =
                questionResponse.data.data;

            setCategories(
                categoriesResponse.data.data || []
            );


            setForm({

                category_id:
                    question.category_id || "",

                question:
                    question.question || "",

                question_type:
                    question.question_type || "rating",

                max_rating:
                    question.max_rating ?? 5,

                weight:
                    question.weight ?? 1,

                is_required:
                    Boolean(question.is_required),

                sort_order:
                    question.sort_order ?? 0,

                status:
                    Boolean(question.status),

            });

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation question."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Input Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | Boolean Change
    |--------------------------------------------------------------------------
    */

    const handleBooleanChange = (e) => {

        const { name, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: checked,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | Question Type
    |--------------------------------------------------------------------------
    */

    const handleQuestionTypeChange = (e) => {

        const value = e.target.value;

        setForm((prev) => ({
            ...prev,
            question_type: value,
            max_rating:
                value === "rating"
                    ? prev.max_rating || 5
                    : null,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setError("");
        setValidationErrors({});


        const payload = {

            category_id:
                Number(form.category_id),

            question:
                form.question,

            question_type:
                form.question_type,

            max_rating:
                form.question_type === "rating"
                    ? Number(form.max_rating)
                    : null,

            weight:
                Number(form.weight),

            is_required:
                Boolean(form.is_required),

            sort_order:
                Number(form.sort_order),

            status:
                Boolean(form.status),

        };


        try {

            await api.put(
                `/evaluation-questions/${id}`,
                payload
            );

            alert(
                "Evaluation question updated successfully."
            );

            navigate(
                "/management/evaluation-questions"
            );

        } catch (error) {

            console.error(error);

            if (error.response?.status === 422) {

                setValidationErrors(
                    error.response.data.errors || {}
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Failed to update evaluation question."
                );

            }

        } finally {

            setSaving(false);

        }
    };


    if (loading) {

        return (
            <div style={containerStyle}>
                <h2>
                    Loading Evaluation Question...
                </h2>
            </div>
        );
    }


    return (

        <div style={containerStyle}>

            <h1>
                Edit Evaluation Question
            </h1>


            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}


            <form
                onSubmit={handleSubmit}
                style={formStyle}
            >

                {/* CATEGORY */}

                <div style={fieldStyle}>

                    <label>
                        Category
                    </label>

                    <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Category
                        </option>

                        {categories.map((category) => (

                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>

                        ))}

                    </select>

                    <ValidationError
                        errors={validationErrors}
                        field="category_id"
                    />

                </div>


                {/* QUESTION */}

                <div style={fieldStyle}>

                    <label>
                        Question
                    </label>

                    <textarea
                        name="question"
                        value={form.question}
                        onChange={handleChange}
                        rows="5"
                        required
                    />

                    <ValidationError
                        errors={validationErrors}
                        field="question"
                    />

                </div>


                {/* QUESTION TYPE */}

                <div style={fieldStyle}>

                    <label>
                        Question Type
                    </label>

                    <select
                        value={form.question_type}
                        onChange={
                            handleQuestionTypeChange
                        }
                    >

                        <option value="rating">
                            Rating
                        </option>

                        <option value="text">
                            Text
                        </option>

                        <option value="yes_no">
                            Yes / No
                        </option>

                    </select>

                </div>


                {/* MAX RATING */}

                {form.question_type === "rating" && (

                    <div style={fieldStyle}>

                        <label>
                            Max Rating
                        </label>

                        <input
                            type="number"
                            name="max_rating"
                            value={form.max_rating ?? ""}
                            onChange={handleChange}
                            min="1"
                            max="100"
                        />

                    </div>

                )}


                {/* WEIGHT */}

                <div style={fieldStyle}>

                    <label>
                        Weight
                    </label>

                    <input
                        type="number"
                        name="weight"
                        value={form.weight}
                        onChange={handleChange}
                        min="0"
                        max="999.99"
                        step="0.01"
                    />

                </div>


                {/* SORT ORDER */}

                <div style={fieldStyle}>

                    <label>
                        Sort Order
                    </label>

                    <input
                        type="number"
                        name="sort_order"
                        value={form.sort_order}
                        onChange={handleChange}
                        min="0"
                    />

                </div>


                {/* REQUIRED */}

                <div style={checkboxStyle}>

                    <input
                        type="checkbox"
                        name="is_required"
                        checked={form.is_required}
                        onChange={handleBooleanChange}
                    />

                    <label>
                        Required Question
                    </label>

                </div>


                {/* STATUS */}

                <div style={checkboxStyle}>

                    <input
                        type="checkbox"
                        name="status"
                        checked={form.status}
                        onChange={handleBooleanChange}
                    />

                    <label>
                        Active
                    </label>

                </div>


                {/* BUTTONS */}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "20px",
                    }}
                >

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Question"}
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/management/evaluation-questions"
                            )
                        }
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
};


const ValidationError = ({
    errors,
    field,
}) => {

    if (!errors[field]) {
        return null;
    }

    return (
        <div
            style={{
                color: "red",
                fontSize: "13px",
            }}
        >
            {errors[field][0]}
        </div>
    );
};


const containerStyle = {
    maxWidth: "800px",
    margin: "30px auto",
    padding: "20px",
};

const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
};

const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
};

const checkboxStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
};

const errorStyle = {
    color: "red",
    background: "#ffe5e5",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
};

export default EditEvaluationQuestion;