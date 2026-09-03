import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public
import Home from "./pages/Home";
import Login from "./pages/Login";

// Common
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ManagementLayout from "./components/ManagementLayout";

// Dashboard
import ManagementDashboard from "./pages/management/ManagementDashboard";

// Employee
import CreateEvaluation from "./pages/employee/CreateEvaluation";
import MyEvaluations from "./pages/employee/MyEvaluations";
import EvaluationDetails from "./pages/employee/EvaluationDetails";

// Manager / Review
import ReviewEvaluation from "./pages/manager/ReviewEvaluation";
import ManagerDashboard from "./pages/manager/ManagerDashboard";

// HR
import HRDashboard from "./pages/hr/HRDashboard";

// Management
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

import AdminEvaluationList from "./pages/management/AdminEvaluationList";

// Profile
import MyProfile from "./pages/employee/MyProfile";
import EmployeeProfile from "./pages/employee/EmployeeProfile";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ================= PUBLIC ================= */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ================= DASHBOARD ================= */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute
                            roles={[
                                "Admin",
                                "HR",
                                "Manager",
                                "Employee",
                                "Management",
                            ]}
                        >
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ================= MANAGEMENT LAYOUT ================= */}

                <Route
                    path="/management"
                    element={
                        <ProtectedRoute
                            roles={[
                                "Admin",
                                "HR",
                                "Manager",
                                "Employee",
                                "Management",
                            ]}
                        >
                            <ManagementLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Dashboard */}

                    <Route
                        index
                        element={<ManagementDashboard />}
                    />


                    {/* ================= EMPLOYEE ================= */}

                    <Route
                        path="employee/evaluations/create"
                        element={<CreateEvaluation />}
                    />

                    <Route
                        path="employee/evaluations"
                        element={<MyEvaluations />}
                    />

                    <Route
                        path="employee/evaluations/:id"
                        element={<EvaluationDetails />}
                    />

                    <Route
                        path="employee/profile"
                        element={<MyProfile />}
                    />


                    {/* ================= EMPLOYEE PROFILE ================= */}

                    <Route
                        path="users/:id/profile"
                        element={<EmployeeProfile />}
                    />


                    {/* ================= MANAGER ================= */}

                    <Route
                        path="manager/reviews"
                        element={<ManagerDashboard />}
                    />

                    <Route
                        path="manager/evaluations/:id"
                        element={<ReviewEvaluation />}
                    />


                    {/* ================= HR ================= */}

                    <Route
                        path="hr/reviews"
                        element={<HRDashboard />}
                    />

                    <Route
                        path="hr/evaluations/:id"
                        element={<ReviewEvaluation />}
                    />


                    {/* ================= MANAGEMENT REVIEW ================= */}

                    <Route
                        path="management/evaluations/:id"
                        element={<ReviewEvaluation />}
                    />


                    {/* ================= ADMIN ================= */}

                    <Route
                        path="admin/reviews"
                        element={<AdminEvaluationList />}
                    />

                    <Route
                        path="admin/evaluations/:id"
                        element={<ReviewEvaluation />}
                    />


                    {/* ================= USERS ================= */}

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
                        path="users/:id/change-password"
                        element={<ChangePassword />}
                    />


                    {/* ================= DEPARTMENTS ================= */}

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


                    {/* ================= POSITIONS ================= */}

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


                    {/* ================= EVALUATION PERIODS ================= */}

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


                    {/* ================= EVALUATION CATEGORIES ================= */}

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


                    {/* ================= EVALUATION QUESTIONS ================= */}

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


                    {/* ================= PROBATION PERIODS ================= */}

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


                {/* ================= 404 ================= */}

                <Route
                    path="*"
                    element={<Home />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;