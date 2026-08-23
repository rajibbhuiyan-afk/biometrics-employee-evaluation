import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const ChangePassword = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

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

            await api.post(
                `/users/${id}/change-password`,
                {
                    password: password,
                    password_confirmation:
                        passwordConfirmation,
                }
            );

            setSuccess(
                "Password changed successfully."
            );

            setPassword("");
            setPasswordConfirmation("");

        } catch (error) {

            console.error(error);

            if (error.response?.data?.errors) {

                const errors =
                    error.response.data.errors;

                setError(
                    Object.values(errors)
                        .flat()
                        .join(" ")
                );

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
        <div
            style={{
                maxWidth: "500px",
                margin: "40px auto",
                padding: "25px",
                border: "1px solid #ddd",
                borderRadius: "8px",
            }}
        >

            <h1>Change Password</h1>

            <p>
                Change password for user ID: {id}
            </p>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {success && (
                <p style={{ color: "green" }}>
                    {success}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                {/* New Password */}

                <div style={{ marginBottom: "20px" }}>

                    <label>
                        New Password
                    </label>

                    <br />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        placeholder="Enter new password"
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                        required
                    />

                </div>


                {/* Confirm Password */}

                <div style={{ marginBottom: "20px" }}>

                    <label>
                        Confirm New Password
                    </label>

                    <br />

                    <input
                        type="password"
                        value={
                            passwordConfirmation
                        }
                        onChange={(e) =>
                            setPasswordConfirmation(
                                e.target.value
                            )
                        }
                        placeholder="Confirm new password"
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                        required
                    />

                </div>


                {/* Buttons */}

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Updating..."
                        : "Update Password"}
                </button>

                {" "}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/management/users/${id}/edit`
                        )
                    }
                >
                    Back to Edit
                </button>

            </form>

        </div>
    );
};

export default ChangePassword;