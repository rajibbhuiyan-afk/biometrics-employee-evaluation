import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateEvaluationQuestion = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);

    const [form, setForm] = useState({
        category_id: "",
        department_id: "",
        position_id: "",
        question: "",
        question_type: "rating",
        max_rating: 10,
        max_answer_words: 30,
        weight: 1,
        is_required: true,
        sort_order: 0,
        status: true,
        reviewer_role_ids: [],
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    /*
    |--------------------------------------------------------------------------
    | Load Initial Data
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setPageLoading(true);
            setError("");

            const [
                categoriesResponse,
                departmentsResponse,
                positionsResponse,
                rolesResponse,
            ] = await Promise.all([
                api.get("/evaluation-categories"),
                api.get("/departments"),
                api.get("/positions"),
                api.get("/roles"),
            ]);

            setCategories(
                categoriesResponse.data?.data || []
            );

            setDepartments(
                departmentsResponse.data?.data || []
            );

            setPositions(
                positionsResponse.data?.data || []
            );

            setRoles(
                rolesResponse.data?.data || []
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load evaluation question data."
            );

        } finally {
            setPageLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Filter Positions
    |--------------------------------------------------------------------------
    |
    | Empty department = All Departments
    |
    */

    const filteredPositions = useMemo(() => {

        // All Departments
        if (
            form.department_id === "" ||
            form.department_id === null ||
            form.department_id === undefined
        ) {
            return positions;
        }

        return positions.filter(
            (position) =>
                Number(position.department_id) ===
                Number(form.department_id)
        );

    }, [
        positions,
        form.department_id,
    ]);

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

        // Clear individual validation error
        if (validationErrors[name]) {
            setValidationErrors((previous) => ({
                ...previous,
                [name]: undefined,
            }));
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Department Change
    |--------------------------------------------------------------------------
    */

    const handleDepartmentChange = (e) => {
        const value = e.target.value;

        setForm((previous) => ({
            ...previous,

            department_id: value,

            // Department change হলে position reset
            position_id: "",
        }));

        setValidationErrors((previous) => ({
            ...previous,
            department_id: undefined,
            position_id: undefined,
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
    | Reviewer Role Change
    |--------------------------------------------------------------------------
    */

    const handleReviewerRoleChange = (e) => {
        const roleId = Number(e.target.value);
        const checked = e.target.checked;

        setForm((previous) => {

            let reviewerRoleIds = [
                ...(previous.reviewer_role_ids || []),
            ];

            if (checked) {

                if (
                    !reviewerRoleIds.includes(roleId)
                ) {
                    reviewerRoleIds.push(roleId);
                }

            } else {

                reviewerRoleIds =
                    reviewerRoleIds.filter(
                        (id) => id !== roleId
                    );
            }

            return {
                ...previous,
                reviewer_role_ids: reviewerRoleIds,
            };
        });
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

            category_id:
                Number(form.category_id),

            /*
            |--------------------------------------------------------------------------
            | Department
            |--------------------------------------------------------------------------
            |
            | Empty = null = common/all departments
            |
            */

            department_id:
                form.department_id === ""
                    ? null
                    : Number(form.department_id),

            /*
            |--------------------------------------------------------------------------
            | Position
            |--------------------------------------------------------------------------
            |
            | Empty = null = all positions under selected department
            |
            */

            position_id:
                form.position_id === ""
                    ? null
                    : Number(form.position_id),

            question:
                form.question,

            question_type:
                form.question_type,

            max_rating:
                form.question_type === "rating"
                    ? Number(form.max_rating)
                    : null,

            max_answer_words:
                form.max_answer_words
                    ? Number(form.max_answer_words)
                    : 30,

            weight:
                Number(form.weight),

            is_required:
                Boolean(form.is_required),

            sort_order:
                Number(form.sort_order),

            status:
                Boolean(form.status),

            reviewer_role_ids:
                form.reviewer_role_ids || [],
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

            if (
                error.response?.status === 422
            ) {

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

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (pageLoading) {
        return (
            <div className="management-form-page">

                <h1 className="management-form-title">
                    Create Evaluation Question
                </h1>

                <div className="management-form">
                    Loading...
                </div>

            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

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

                {/* ==========================================================
                    Category
                ========================================================== */}

                <div className="management-form-field">

                    <label htmlFor="category_id">
                        Category
                        <span className="required-star">
                            *
                        </span>
                    </label>

                    <select
                        id="category_id"
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Category
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            )
                        )}

                    </select>

                    <ValidationError
                        errors={validationErrors}
                        field="category_id"
                    />

                </div>


                {/* ==========================================================
                    Department
                ========================================================== */}

                <div className="management-form-field">

                    <label htmlFor="department_id">
                        Department
                    </label>

                    <select
                        id="department_id"
                        name="department_id"
                        value={form.department_id}
                        onChange={handleDepartmentChange}
                    >

                        <option value="">
                            All Departments
                        </option>

                        {departments.map(
                            (department) => (
                                <option
                                    key={department.id}
                                    value={department.id}
                                >
                                    {department.name ||
                                        department.title}
                                </option>
                            )
                        )}

                    </select>

                    <small>
                        Select a department or keep
                        "All Departments" for a common question.
                    </small>

                    <ValidationError
                        errors={validationErrors}
                        field="department_id"
                    />

                </div>


                {/* ==========================================================
                    Position
                ========================================================== */}

                <div className="management-form-field">

                    <label htmlFor="position_id">
                        Position
                    </label>

                    <select
                        id="position_id"
                        name="position_id"
                        value={form.position_id}
                        onChange={handleChange}
                    >

                        <option value="">
                            All Positions
                        </option>

                        {filteredPositions.length > 0 ? (

                            filteredPositions.map(
                                (position) => (
                                    <option
                                        key={position.id}
                                        value={position.id}
                                    >
                                        {position.title}
                                        {position.code
                                            ? ` (${position.code})`
                                            : ""}
                                    </option>
                                )
                            )

                        ) : (

                            <option
                                value=""
                                disabled
                            >
                                No positions available
                            </option>

                        )}

                    </select>

                    <small>
                        {form.department_id === ""
                            ? "All positions are available."
                            : "Only positions under the selected department are shown."}
                    </small>

                    <ValidationError
                        errors={validationErrors}
                        field="position_id"
                    />

                </div>


                {/* ==========================================================
                    Question
                ========================================================== */}

                <div className="management-form-field">

                    <label htmlFor="question">
                        Question
                        <span className="required-star">
                            *
                        </span>
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


                {/* ==========================================================
                    Question Type
                ========================================================== */}

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

                        <option value="text">
                            Text
                        </option>

                        <option value="yes_no">
                            Yes / No
                        </option>

                    </select>

                    <ValidationError
                        errors={validationErrors}
                        field="question_type"
                    />

                </div>


                {/* ==========================================================
                    Max Rating
                ========================================================== */}

                {form.question_type === "rating" && (

                    <div className="management-form-field">

                        <label htmlFor="max_rating">
                            Max Rating
                        </label>

                        <input
                            id="max_rating"
                            type="number"
                            name="max_rating"
                            value={form.max_rating ?? ""}
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


                {/* ==========================================================
                    Maximum Answer Words
                ========================================================== */}

                <div className="management-form-field">

                    <label htmlFor="max_answer_words">
                        Maximum Answer Words
                    </label>

                    <input
                        id="max_answer_words"
                        type="number"
                        name="max_answer_words"
                        value={form.max_answer_words}
                        onChange={handleChange}
                        min="1"
                        max="10000"
                        placeholder="e.g. 30"
                    />

                    <small>
                        Maximum number of words allowed
                        for this answer.
                    </small>

                    <ValidationError
                        errors={validationErrors}
                        field="max_answer_words"
                    />

                </div>


                {/* ==========================================================
                    Weight
                ========================================================== */}

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


                {/* ==========================================================
                    Sort Order
                ========================================================== */}

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


                {/* ==========================================================
                    Reviewer Roles
                ========================================================== */}

                <div className="management-form-field">

                    <label>
                        Who Can Review This Question?
                    </label>

                    <div className="management-form-checkbox-group">

                        {roles.map(
                            (role) => (

                                <div
                                    className="management-form-checkbox"
                                    key={role.id}
                                >

                                    <input
                                        id={`reviewer-role-${role.id}`}
                                        type="checkbox"
                                        value={role.id}
                                        checked={
                                            form.reviewer_role_ids.includes(
                                                Number(role.id)
                                            )
                                        }
                                        onChange={
                                            handleReviewerRoleChange
                                        }
                                    />

                                    <label
                                        htmlFor={`reviewer-role-${role.id}`}
                                    >
                                        {role.name}
                                    </label>

                                </div>

                            )
                        )}

                    </div>

                    <small>
                        Select one or more roles that can
                        review this question.
                    </small>

                    <ValidationError
                        errors={validationErrors}
                        field="reviewer_role_ids"
                    />

                </div>


                {/* ==========================================================
                    Required
                ========================================================== */}

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


                {/* ==========================================================
                    Status
                ========================================================== */}

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


                {/* ==========================================================
                    Buttons
                ========================================================== */}

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
                        disabled={loading}
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
        <div className="management-validation-error">
            {errors[field][0]}
        </div>
    );
};


export default CreateEvaluationQuestion;
