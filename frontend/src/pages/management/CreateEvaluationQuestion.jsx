import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateEvaluationQuestion = () => {

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

    const [loading, setLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});


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

            setCategoryLoading(true);

            const response = await api.get(
                "/evaluation-categories"
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

            setCategoryLoading(false);

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
    | Question Type Change
    |--------------------------------------------------------------------------
    */

    const handleQuestionTypeChange = (e) => {

        const value = e.target.value;

        setForm((prev) => ({
            ...prev,
            question_type: value,
            max_rating:
                value === "rating"
                    ? 5
                    : null,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");
        setValidationErrors({});


        const payload = {
            category_id: Number(form.category_id),
            question: form.question,
            question_type: form.question_type,

            max_rating:
                form.question_type === "rating"
                    ? Number(form.max_rating)
                    : null,

            weight: Number(form.weight),

            is_required: Boolean(
                form.is_required
            ),

            sort_order: Number(
                form.sort_order
            ),

            status: Boolean(
                form.status
            ),
        };


        try {

            await api.post(
                "/evaluation-questions",
                payload
            );

            alert(
                "Evaluation question created successfully."
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
                    "Failed to create evaluation question."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div style={containerStyle}>

            <h1>
                Create Evaluation Question
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
                        disabled={categoryLoading}
                    >

                        <option value="">
                            {categoryLoading
                                ? "Loading categories..."
                                : "Select Category"}
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
                        placeholder="Enter evaluation question"
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
                        name="question_type"
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
                            value={form.max_rating}
                            onChange={handleChange}
                            min="1"
                            max="100"
                        />

                        <ValidationError
                            errors={validationErrors}
                            field="max_rating"
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

                    <ValidationError
                        errors={validationErrors}
                        field="weight"
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

                    <ValidationError
                        errors={validationErrors}
                        field="sort_order"
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
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Question"}
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


/*
|--------------------------------------------------------------------------
| Validation Error
|--------------------------------------------------------------------------
*/

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
                marginTop: "5px",
            }}
        >
            {errors[field][0]}
        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

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

export default CreateEvaluationQuestion;