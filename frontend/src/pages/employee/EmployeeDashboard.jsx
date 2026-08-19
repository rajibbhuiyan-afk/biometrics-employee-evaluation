import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EmployeeDashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1>Employee Dashboard</h1>

            <h2>Welcome, {user?.name}</h2>

            <p>Email: {user?.email}</p>
            <p>Role: {user?.role?.name}</p>

            <hr />

            <div>
                <Link to="/employee/evaluations/create">
                    <button>Create Evaluation</button>
                </Link>

                {" "}

                <Link to="/employee/evaluations">
                    <button>My Evaluations</button>
                </Link>
            </div>
        </div>
    );
};

export default EmployeeDashboard;