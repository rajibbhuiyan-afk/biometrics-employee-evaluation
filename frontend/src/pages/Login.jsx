import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login(email, password);
            
            if (response.success) {
                const role = response.data.user.role.name;                

                if (role === "Admin") {
                    navigate("/admin");
                } else if (role === "HR") {
                    navigate("/hr");
                } else if (role === "Manager") {
                    navigate("/manager");
                } else if (role === "Employee") {
                    navigate("/employee");
                }
            } else {
                setError(response.message || "Login failed.");
            }
        } catch (error) {
            console.error(error);

            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Employee Evaluation System</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                </div>

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;