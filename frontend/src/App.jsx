import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import CreateEvaluation from "./pages/employee/CreateEvaluation";
import MyEvaluations from "./pages/employee/MyEvaluations";

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ReviewEvaluation from "./pages/manager/ReviewEvaluation";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import EvaluationDetails from "./pages/employee/EvaluationDetails";

import HRDashboard from "./pages/hr/HRDashboard";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public */}
                <Route path="/login" element={<Login />} />


                {/* Common Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* Employee */}
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute roles={["Employee"]}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/evaluations/create"
                    element={
                        <ProtectedRoute roles={["Employee"]}>
                            <CreateEvaluation />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/evaluations"
                    element={
                        <ProtectedRoute roles={["Employee"]}>
                            <MyEvaluations />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/evaluations/:id"
                    element={
                        <ProtectedRoute roles={["Employee"]}>
                            <EvaluationDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Manager */}                

                <Route
                    path="/manager"
                    element={
                        <ProtectedRoute roles={["Manager"]}>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/dashboard"
                    element={
                        <ProtectedRoute roles={["Manager"]}>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/evaluations/:id"
                    element={
                        <ProtectedRoute roles={["Manager"]}>
                            <ReviewEvaluation />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/reviews"
                    element={
                        <ProtectedRoute roles={["Manager"]}>
                            <ReviewEvaluation />
                        </ProtectedRoute>
                    }
                />

                {/* HR */}

                <Route
                    path="/hr"
                    element={
                        <ProtectedRoute roles={["HR"]}>
                            <HRDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/dashboard"
                    element={
                        <ProtectedRoute roles={["HR"]}>
                            <HRDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/evaluations/:id"
                    element={
                        <ProtectedRoute roles={["HR"]}>
                            <ReviewEvaluation />
                        </ProtectedRoute>
                    }
                />


                {/* Admin */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute roles={["Admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;