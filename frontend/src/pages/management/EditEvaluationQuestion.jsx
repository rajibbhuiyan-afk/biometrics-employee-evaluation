import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";

const EditEvaluationQuestion = () => {
    const { id } = useParams();
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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    /*
    |--------------------------------------------------------------------------
    | Load Question + Categories + Departments + Positions + Roles
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                questionResponse,
                categoriesResponse,
                departmentsResponse,
                positionsResponse,
                rolesResponse,
            ] = await Promise.all([
                api.get(`/evaluation-questions/${id}`),
                api.get("/evaluation-categories"),
                api.get("/departments"),
                api.get("/positions"),
                api.get("/roles"),
            ]);

            const question =
                questionResponse.data.data;

            setCategories(
                categoriesResponse.data.data || []
            );

            setDepartments(
                departmentsResponse.data.data || []
            );

            setPositions(
                positionsResponse.data.data || []
            );

            setRoles(
                rolesResponse.data.data || []
            );

            /*
            |--------------------------------------------------------------------------
            | Existing Reviewer Roles
            |--------------------------------------------------------------------------
            */

            const existingReviewerRoleIds =
                question.reviewer_role_ids ||
                question.reviewers?.map(
                    (role) => role.id
                ) ||
                [];

            /*
            |--------------------------------------------------------------------------
            | Set Form
            |--------------------------------------------------------------------------
            */

            setForm({
                category_id:
                    question.category_id ?? "",

                department_id:
                    question.department_id ?? "",

                position_id:
                    question.position_id ?? "",

                question:
                    question.question ?? "",

                question_type:
                    question.question_type ?? "rating",

                max_rating:
                    question.max_rating ?? 5,

                max_answer_words:
                    question.max_answer_words ?? 30,

                weight:
                    question.weight ?? 1,

                is_required:
                    Boolean(question.is_required),

                sort_order:
                    question.sort_order ?? 0,

                status:
                    Boolean(question.status),

                reviewer_role_ids:
                    existingReviewerRoleIds.map(
                        (roleId) => Number(roleId)
                    ),
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
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        if (name === "department_id") {
            setForm((prev) => ({
                ...prev,
                department_id: value,
                position_id: "",
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
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
                    ? prev.max_rating || 5
                    : null,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Reviewer Role Change
    |--------------------------------------------------------------------------
    */

    const handleReviewerRoleChange = (roleId) => {
        const numericRoleId = Number(roleId);

        setForm((prev) => {
            const currentRoles =
                prev.reviewer_role_ids || [];

            const alreadySelected =
                currentRoles.includes(
                    numericRoleId
                );

            return {
                ...prev,

                reviewer_role_ids:
                    alreadySelected
                        ? currentRoles.filter(
                              (currentRoleId) =>
                                  currentRoleId !==
                                  numericRoleId
                          )
                        : [
                              ...currentRoles,
                              numericRoleId,
                          ],
            };
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Filter Positions By Department
    |--------------------------------------------------------------------------
    */

    const filteredPositions =
        form.department_id === ""
            ? positions
            : positions.filter(
                  (position) =>
                      Number(
                          position.department_id
                      ) ===
                      Number(
                          form.department_id
                      )
              );

    /*
    |--------------------------------------------------------------------------
    | Reviewer Roles
    |--------------------------------------------------------------------------
    */

    const reviewerRoles = roles.filter(
        (role) =>
            [
                "Employee",
                "Manager",
                "HR",
                "Management",
            ].includes(role.name)
    );

    /*
    |--------------------------------------------------------------------------
    | Submit
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

            department_id:
                form.department_id === ""
                    ? null
                    : Number(form.department_id),

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
                    ? Number(
                          form.max_answer_words
                      )
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

            if (
                error.response?.status ===
                422
            ) {
                setValidationErrors(
                    error.response.data.errors ||
                        {}
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

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="management-form-page">

                <h2>
                    Loading Evaluation Question...
                </h2>

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

            <h1>
                Edit Evaluation Question
            </h1>

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="management-form"
            >

                {/* ==================================================
                    Category
                ================================================== */}

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

                {/* ==================================================
                    Department
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="department_id">
                        Department
                    </label>

                    <select
                        id="department_id"
                        name="department_id"
                        value={
                            form.department_id
                        }
                        onChange={handleChange}
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
                                    {department.name}
                                </option>
                            )
                        )}
                    </select>

                    <small className="management-form-help-text">
                        Leave empty to make this
                        question applicable to all
                        departments.
                    </small>

                    <ValidationError
                        errors={validationErrors}
                        field="department_id"
                    />

                </div>

                {/* ==================================================
                    Position
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="position_id">
                        Position
                    </label>

                    <select
                        id="position_id"
                        name="position_id"
                        value={
                            form.position_id
                        }
                        onChange={handleChange}
                    >
                        <option value="">
                            All Positions
                        </option>

                        {filteredPositions.map(
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
                        )}
                    </select>

                    <small className="management-form-help-text">
                        Leave empty to make this
                        question applicable to all
                        positions.
                    </small>

                    <ValidationError
                        errors={validationErrors}
                        field="position_id"
                    />

                </div>

                {/* ==================================================
                    Question
                ================================================== */}

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

                {/* ==================================================
                    Question Type
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="question_type">
                        Question Type
                        <span className="required-star">
                            *
                        </span>
                    </label>

                    <select
                        id="question_type"
                        name="question_type"
                        value={
                            form.question_type
                        }
                        onChange={
                            handleQuestionTypeChange
                        }
                        required
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

                {/* ==================================================
                    Max Rating
                ================================================== */}

                {form.question_type ===
                    "rating" && (

                    <div className="management-form-field">

                        <label htmlFor="max_rating">
                            Max Rating
                            <span className="required-star">
                                *
                            </span>
                        </label>

                        <input
                            id="max_rating"
                            type="number"
                            name="max_rating"
                            value={
                                form.max_rating ??
                                ""
                            }
                            onChange={
                                handleChange
                            }
                            min="1"
                            max="100"
                            required
                        />

                        <ValidationError
                            errors={
                                validationErrors
                            }
                            field="max_rating"
                        />

                    </div>
                )}

                {/* ==================================================
                    Maximum Answer Words
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="max_answer_words">
                        Maximum Answer Words
                        <span className="required-star">
                            *
                        </span>
                    </label>

                    <input
                        id="max_answer_words"
                        type="number"
                        name="max_answer_words"
                        value={
                            form.max_answer_words ??
                            ""
                        }
                        onChange={handleChange}
                        min="1"
                        max="10000"
                        placeholder="e.g. 30"
                        required
                    />

                    <small className="management-form-help-text">
                        Maximum number of words
                        allowed for this answer.
                    </small>

                    <ValidationError
                        errors={
                            validationErrors
                        }
                        field="max_answer_words"
                    />

                </div>

                {/* ==================================================
                    Weight
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="weight">
                        Weight
                        <span className="required-star">
                            *
                        </span>
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
                        required
                    />

                    <ValidationError
                        errors={validationErrors}
                        field="weight"
                    />

                </div>

                {/* ==================================================
                    Sort Order
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="sort_order">
                        Sort Order
                        <span className="required-star">
                            *
                        </span>
                    </label>

                    <input
                        id="sort_order"
                        type="number"
                        name="sort_order"
                        value={
                            form.sort_order
                        }
                        onChange={handleChange}
                        min="0"
                        required
                    />

                    <ValidationError
                        errors={validationErrors}
                        field="sort_order"
                    />

                </div>

                {/* ==================================================
                    Reviewer Roles
                ================================================== */}

                <div className="management-form-field">

                    <label>
                        Reviewer Roles
                    </label>

                    <small className="management-form-help-text">
                        Select which roles are
                        allowed to review this
                        question.
                    </small>

                    <div className="reviewer-role-list">

                        {reviewerRoles.length ===
                        0 ? (
                            <small className="management-form-help-text">
                                No reviewer roles
                                available.
                            </small>
                        ) : (
                            reviewerRoles.map(
                                (role) => (
                                    <label
                                        key={
                                            role.id
                                        }
                                        className="reviewer-role-item"
                                    >

                                        <input
                                            type="checkbox"
                                            checked={(
                                                form.reviewer_role_ids ||
                                                []
                                            ).includes(
                                                Number(
                                                    role.id
                                                )
                                            )}
                                            onChange={() =>
                                                handleReviewerRoleChange(
                                                    role.id
                                                )
                                            }
                                        />

                                        <span>
                                            {
                                                role.name
                                            }
                                        </span>

                                    </label>
                                )
                            )
                        )}

                    </div>

                    <ValidationError
                        errors={
                            validationErrors
                        }
                        field="reviewer_role_ids"
                    />

                </div>

                {/* ==================================================
                    Required
                ================================================== */}

                <div className="management-form-checkbox">

                    <input
                        id="is_required"
                        type="checkbox"
                        name="is_required"
                        checked={
                            form.is_required
                        }
                        onChange={handleChange}
                    />

                    <label htmlFor="is_required">
                        Required Question
                    </label>

                </div>

                {/* ==================================================
                    Status
                ================================================== */}

                <div className="management-form-checkbox">

                    <input
                        id="status"
                        type="checkbox"
                        name="status"
                        checked={form.status}
                        onChange={handleChange}
                    />

                    <label htmlFor="status">
                        Active
                    </label>

                </div>

                {/* ==================================================
                    Actions
                ================================================== */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Question"}
                    </button>

                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/management/evaluation-questions"
                            )
                        }
                        disabled={saving}
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
        <div className="management-form-validation-error">
            {errors[field][0]}
        </div>
    );
};

export default EditEvaluationQuestion;
