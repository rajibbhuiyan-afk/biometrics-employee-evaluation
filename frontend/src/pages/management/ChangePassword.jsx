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

            await api.post("/change-password", {
                password,
                password_confirmation: passwordConfirmation,
            });

            setSuccess(
                "Password changed successfully."
            );

            setPassword("");
            setPasswordConfirmation("");

        } catch (error) {
            console.error(
                "Change password error:",
                error
            );

            if (error.response?.data?.errors) {
                const validationErrors =
                    Object.values(
                        error.response.data.errors
                    )
                        .flat()
                        .join(" ");

                setError(validationErrors);

            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to change password."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="management-form-page">

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

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="management-form-success">
                    {success}
                </div>
            )}

            <form
                className="management-form"
                onSubmit={handleSubmit}
            >

                {/* New Password */}

                <div className="management-form-field">

                    <label htmlFor="password">
                        New Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter new password"
                        minLength={8}
                        disabled={saving}
                        required
                    />

                </div>


                {/* Confirm Password */}

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
                        required
                    />

                </div>


                {/* Actions */}

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
