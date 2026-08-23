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

import ManagementDashboard from "./pages/management/ManagementDashboard";
import Users from "./pages/management/Users";

import CreateUser from "./pages/management/CreateUser";
import EditUser from "./pages/management/EditUser";

import ChangePassword from "./pages/management/ChangePassword";

import Departments from "./pages/management/Departments";
import CreateDepartment from "./pages/management/CreateDepartment";
import EditDepartment from "./pages/management/EditDepartment";

import Positions from "./pages/management/Positions";
import CreatePosition from "./pages/management/CreatePosition";
import EditPosition from "./pages/management/EditPosition";

import EvaluationPeriods from "./pages/management/EvaluationPeriods"; 
import CreateEvaluationPeriod from "./pages/management/CreateEvaluationPeriod"; 
import EditEvaluationPeriod from "./pages/management/EditEvaluationPeriod";

import EvaluationCategories from "./pages/management/EvaluationCategories";
import CreateEvaluationCategory from "./pages/management/CreateEvaluationCategory";
import EditEvaluationCategory from "./pages/management/EditEvaluationCategory";

import EvaluationQuestions from "./pages/management/EvaluationQuestions";
import CreateEvaluationQuestion from "./pages/management/CreateEvaluationQuestion";
import EditEvaluationQuestion from "./pages/management/EditEvaluationQuestion";

import ProbationPeriods from "./pages/management/ProbationPeriods";
import CreateProbationPeriod from "./pages/management/CreateProbationPeriod";
import EditProbationPeriod from "./pages/management/EditProbationPeriod";

import ManagementLayout from "./components/ManagementLayout";

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

                {/* Admin and HR */}

                <Route
                    path="/management"
                    element={
                        <ProtectedRoute roles={["Admin", "HR"]}>
                            <ManagementLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<ManagementDashboard />}
                    />

                    <Route
                        path="users"
                        element={<Users />}
                    />

                    <Route
                        path="users/create"
                        element={<CreateUser />}
                    />

                    <Route
                        path="users/:id/edit"
                        element={<EditUser />}
                    />

                    <Route
                        path="departments"
                        element={<Departments />}
                    />

                    <Route
                        path="departments/create"
                        element={<CreateDepartment />}
                    />

                    <Route
                        path="departments/:id/edit"
                        element={<EditDepartment />}
                    />

                    <Route
                        path="positions"
                        element={<Positions />}
                    />

                    <Route
                        path="positions/create"
                        element={<CreatePosition />}
                    />

                    <Route
                        path="positions/:id/edit"
                        element={<EditPosition />}
                    />

                    <Route
                        path="evaluation-categories"
                        element={<EvaluationCategories />}
                    />

                    <Route
                        path="evaluation-categories/create"
                        element={<CreateEvaluationCategory />}
                    />

                    <Route
                        path="evaluation-categories/:id/edit"
                        element={<EditEvaluationCategory />}
                    />

                    <Route
                        path="evaluation-questions"
                        element={<EvaluationQuestions />}
                    />

                    <Route
                        path="evaluation-questions/create"
                        element={<CreateEvaluationQuestion />}
                    />

                    <Route
                        path="evaluation-questions/:id/edit"
                        element={<EditEvaluationQuestion />}
                    />

                    <Route
                        path="evaluation-periods"
                        element={<EvaluationPeriods />}
                    />

                    <Route
                        path="evaluation-periods/create"
                        element={<CreateEvaluationPeriod />}
                    />

                    <Route
                        path="evaluation-periods/:id/edit"
                        element={<EditEvaluationPeriod />}
                    />

                    <Route
                        path="probation-periods"
                        element={<ProbationPeriods />}
                    />

                    <Route
                        path="probation-periods/create"
                        element={<CreateProbationPeriod />}
                    />

                    <Route
                        path="probation-periods/:id/edit"
                        element={<EditProbationPeriod />}
                    />
                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;