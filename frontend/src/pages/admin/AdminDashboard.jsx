import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/admin/dashboard");

            console.log("Admin Dashboard:", response.data);

            setDashboard(response.data.data);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load admin dashboard."
            );

        } finally {

            setLoading(false);

        }
    };


    if (loading) {
        return (
            <div>
                <h2>Loading Admin Dashboard...</h2>
            </div>
        );
    }


    if (error) {
        return (
            <div>

                <h1>Admin Dashboard</h1>

                <p style={{ color: "red" }}>
                    {error}
                </p>

                <button onClick={fetchDashboard}>
                    Retry
                </button>

            </div>
        );
    }


    if (!dashboard) {
        return (
            <div>
                <h1>Admin Dashboard</h1>
                <p>No dashboard data found.</p>
            </div>
        );
    }


    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "30px auto",
                padding: "20px",
            }}
        >

            <h1>Admin Dashboard</h1>

            <br />

            {/* ================================
                USER SUMMARY
            ================================= */}

            <h2>User Summary</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(3, 1fr)",
                    gap: "20px",
                    marginBottom: "40px",
                }}
            >

                <div style={cardStyle}>
                    <h3>Employees</h3>
                    <p style={numberStyle}>
                        {dashboard.employees}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>Managers</h3>
                    <p style={numberStyle}>
                        {dashboard.managers}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>HR</h3>
                    <p style={numberStyle}>
                        {dashboard.hr}
                    </p>
                </div>

            </div>


            {/* ================================
                EVALUATION SUMMARY
            ================================= */}

            <h2>Evaluation Summary</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(3, 1fr)",
                    gap: "20px",
                    marginBottom: "40px",
                }}
            >

                <div style={cardStyle}>
                    <h3>Total Evaluations</h3>
                    <p style={numberStyle}>
                        {dashboard.total_evaluations}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>Draft</h3>
                    <p style={numberStyle}>
                        {dashboard.draft}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>Submitted</h3>
                    <p style={numberStyle}>
                        {dashboard.submitted}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>Reviewed</h3>
                    <p style={numberStyle}>
                        {dashboard.reviewed}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>Approved</h3>
                    <p style={numberStyle}>
                        {dashboard.approved}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>Rejected</h3>
                    <p style={numberStyle}>
                        {dashboard.rejected}
                    </p>
                </div>


                <div style={cardStyle}>
                    <h3>Returned</h3>
                    <p style={numberStyle}>
                        {dashboard.returned}
                    </p>
                </div>

            </div>


            {/* ================================
                REFRESH
            ================================= */}

            <button
                type="button"
                onClick={fetchDashboard}
            >
                Refresh Dashboard
            </button>

        </div>
    );
};


const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fff",
};


const numberStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "10px 0 0 0",
};


export default AdminDashboard;