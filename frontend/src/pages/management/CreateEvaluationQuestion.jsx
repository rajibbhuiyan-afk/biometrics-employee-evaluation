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

            setCategories(response.data.data || []);

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

        setForm((previous) => ({
            ...previous,
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

        setForm((previous) => ({
            ...previous,
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

        setForm((previous) => ({
            ...previous,
            question_type: value,
            max_rating: value === "rating" ? 5 : null,
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

            is_required: Boolean(form.is_required),

            sort_order: Number(form.sort_order),

            status: Boolean(form.status),
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
        <div className="management-form-page">

            <h1 className="management-form-title">
                Create Evaluation Question
            </h1>

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            <form
                className="management-form"
                onSubmit={handleSubmit}
            >

                {/* Category */}

                <div className="management-form-field">

                    <label htmlFor="category_id">
                        Category
                    </label>

                    <select
                        id="category_id"
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

                {/* Question */}

                <div className="management-form-field">

                    <label htmlFor="question">
                        Question
                    </label>

                    <textarea
                        id="question"
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

                {/* Question Type */}

                <div className="management-form-field">

                    <label htmlFor="question_type">
                        Question Type
                    </label>

                    <select
                        id="question_type"
                        name="question_type"
                        value={form.question_type}
                        onChange={handleQuestionTypeChange}
                    >
                        <option value="rating">
                            Rating
                        </option>
                        
                    </select>

                </div>

                {/* Max Rating */}

                {form.question_type === "rating" && (
                    <div className="management-form-field">

                        <label htmlFor="max_rating">
                            Max Rating
                        </label>

                        <input
                            id="max_rating"
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

                {/* Weight */}

                <div className="management-form-field">

                    <label htmlFor="weight">
                        Weight
                    </label>

                    <input
                        id="weight"
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

                {/* Sort Order */}

                <div className="management-form-field">

                    <label htmlFor="sort_order">
                        Sort Order
                    </label>

                    <input
                        id="sort_order"
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

                {/* Required */}

                <div className="management-form-checkbox">

                    <input
                        id="is_required"
                        type="checkbox"
                        name="is_required"
                        checked={form.is_required}
                        onChange={handleBooleanChange}
                    />

                    <label htmlFor="is_required">
                        Required Question
                    </label>

                </div>

                {/* Status */}

                <div className="management-form-checkbox">

                    <input
                        id="status"
                        type="checkbox"
                        name="status"
                        checked={form.status}
                        onChange={handleBooleanChange}
                    />

                    <label htmlFor="status">
                        Active
                    </label>

                </div>

                {/* Buttons */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Question"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
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

const ValidationError = ({ errors, field }) => {
    if (!errors[field]) {
        return null;
    }

    return (
        <div className="management-validation-error">
            {errors[field][0]}
        </div>
    );
};

export default CreateEvaluationQuestion;