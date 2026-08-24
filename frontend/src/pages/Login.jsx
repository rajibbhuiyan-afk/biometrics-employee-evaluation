import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    */

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    /*
    |--------------------------------------------------------------------------
    | UI State
    |--------------------------------------------------------------------------
    */

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);


        try {

            const response = await login(
                email,
                password
            );


            /*
            |--------------------------------------------------------------------------
            | Login Failed
            |--------------------------------------------------------------------------
            */

            if (!response?.success) {

                setError(
                    response?.message ||
                    "Login failed."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | User
            |--------------------------------------------------------------------------
            */

            const loggedInUser =
                response?.data?.user;

            const role =
                loggedInUser?.role?.name;


            console.log(
                "Logged in user:",
                loggedInUser
            );

            console.log(
                "Logged in role:",
                role
            );


            /*
            |--------------------------------------------------------------------------
            | Go To Common Layout
            |--------------------------------------------------------------------------
            */

            navigate(
                "/management",
                {
                    replace: true,
                }
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (

        <div className="login-page">

            <div className="login-card">


                {/* Header */}

                <div className="login-header">

                    <h1 className="login-title">
                        Employee Evaluation System
                    </h1>

                    <p className="login-description">
                        Sign in to access your account.
                    </p>

                </div>


                {/* Error */}

                {error && (

                    <div className="login-error">
                        {error}
                    </div>

                )}


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >


                    {/* Email */}

                    <div className="login-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />

                    </div>


                    {/* Password */}

                    <div className="login-field">

                        <label htmlFor="password">
                            Password
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
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            disabled={loading}
                        />

                    </div>


                    {/* Submit */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>


                {/* Home */}

                <button
                    type="button"
                    className="login-home-button"
                    onClick={() =>
                        navigate("/")
                    }
                    disabled={loading}
                >
                    ← Back to Home
                </button>

            </div>

        </div>
    );
};


export default Login;