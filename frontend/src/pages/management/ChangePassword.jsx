import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ChangePassword = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] =
        useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (password !== passwordConfirmation) {
            setError(
                "Password and confirm password do not match."
            );
            return;
        }

        try {
            setSaving(true);

            const response = await api.post(
                "/change-password",
                {
                    password,
                    password_confirmation:
                        passwordConfirmation,
                }
            );

            console.log(
                "Change password response:",
                response.data
            );

            setPassword("");
            setPasswordConfirmation("");

            setSuccess(
                response.data?.message ||
                "Password changed successfully."
            );

        } catch (error) {
            console.error(
                "Change password error:",
                error.response || error
            );

            /*
            |--------------------------------------------------------------------------
            | Validation Errors
            |--------------------------------------------------------------------------
            */

            if (
                error.response?.status === 422 &&
                error.response?.data?.errors
            ) {
                const validationErrors =
                    Object.values(
                        error.response.data.errors
                    )
                        .flat()
                        .join(" ");

                setError(validationErrors);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Unauthorized
            |--------------------------------------------------------------------------
            */

            if (
                error.response?.status === 401
            ) {
                setError(
                    "Your session has expired. Please login again."
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Forbidden
            |--------------------------------------------------------------------------
            */

            if (
                error.response?.status === 403
            ) {
                setError(
                    error.response?.data?.message ||
                    "You do not have permission to change the password."
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Other Errors
            |--------------------------------------------------------------------------
            */

            setError(
                error.response?.data?.message ||
                "Failed to change password."
            );

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="management-form-page">

            {/* ==================================================
                Page Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Change Password
                    </h1>

                    <p className="page-header-description">
                        Update your account password.
                    </p>

                </div>

            </div>


            {/* ==================================================
                Error
            ================================================== */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                Success
            ================================================== */}

            {success && (
                <div className="management-form-success">
                    {success}
                </div>
            )}


            {/* ==================================================
                Form
            ================================================== */}

            <form
                className="management-form"
                onSubmit={handleSubmit}
            >

                {/* ==================================================
                    New Password
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="password">
                        New Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        placeholder="Enter new password"
                        minLength={8}
                        disabled={saving}
                        autoComplete="new-password"
                        required
                    />

                </div>


                {/* ==================================================
                    Confirm Password
                ================================================== */}

                <div className="management-form-field">

                    <label htmlFor="password_confirmation">
                        Confirm New Password
                    </label>

                    <input
                        id="password_confirmation"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) =>
                            setPasswordConfirmation(
                                e.target.value
                            )
                        }
                        placeholder="Confirm new password"
                        minLength={8}
                        disabled={saving}
                        autoComplete="new-password"
                        required
                    />

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
                            : "Update Password"}
                    </button>


                    <button
                        type="button"
                        className="management-btn-secondary"
                        onClick={() =>
                            navigate("/management")
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

export default ChangePassword;
