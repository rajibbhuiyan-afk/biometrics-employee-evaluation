import { BrowserRouter, Routes, Route } from "react-router-dom";

// =========================
// Public
// =========================

import Home from "./pages/Home";
import Login from "./pages/Login";

// =========================
// Common
// =========================

import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ManagementLayout from "./components/ManagementLayout";

// =========================
// Management Dashboard
// =========================

import ManagementDashboard from "./pages/management/ManagementDashboard";

// =========================
// Employee
// =========================

import CreateEvaluation from "./pages/employee/CreateEvaluation";
import MyEvaluations from "./pages/employee/MyEvaluations";
import EvaluationDetails from "./pages/employee/EvaluationDetails";

// =========================
// Manager
// =========================

import ReviewEvaluation from "./pages/manager/ReviewEvaluation";

// =========================
// Management
// =========================

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

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import HRDashboard from "./pages/hr/HRDashboard";

import AdminEvaluationList from "./pages/management/AdminEvaluationList";

import MyProfile from "./pages/employee/MyProfile";




function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =====================================================
                    PUBLIC
                ====================================================== */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =====================================================
                    COMMON DASHBOARD
                ====================================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    MAIN APPLICATION
                    ALL LOGGED-IN USERS
                ====================================================== */}

                <Route
                    path="/management"
                    element={
                        <ProtectedRoute
                            roles={[
                                "Admin",
                                "HR",
                                "Manager",
                                "Employee",
                            ]}
                        >
                            <ManagementLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* =================================================
                        DASHBOARD
                    ================================================== */}

                    <Route
                        index
                        element={<ManagementDashboard />}
                    />


                    {/* =================================================
                        EMPLOYEE
                    ================================================== */}

                  

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
                        path="/management/employee/profile"
                        element={<MyProfile />}
                    />


                  

                   

                    {/* =================================================
                        MANAGER
                    ================================================== */}

                    <Route
                        path="manager/reviews"
                        element={<ManagerDashboard />}
                    />

                    


                    {/* =================================================
                        HR
                    ================================================== */}

                    <Route
                        path="hr/reviews"
                        element={<HRDashboard />}
                    />
                    <Route
                        path="manager/evaluations/:id"
                        element={<ReviewEvaluation />}
                    />

                    <Route
                        path="hr/evaluations/:id"
                        element={<ReviewEvaluation />}
                    />

                    <Route
                        path="admin/reviews"
                        element={<AdminEvaluationList />}
                    />

                    <Route
                        path="admin/evaluations/:id"
                        element={<ReviewEvaluation />}
                    />


                    {/* =================================================
                        USERS
                    ================================================== */}

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
                        path="change-password"
                        element={<ChangePassword />}
                    />


                    {/* =================================================
                        DEPARTMENTS
                    ================================================== */}

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


                    {/* =================================================
                        POSITIONS
                    ================================================== */}

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


                    {/* =================================================
                        EVALUATION CATEGORIES
                    ================================================== */}

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


                    {/* =================================================
                        EVALUATION QUESTIONS
                    ================================================== */}

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


                    {/* =================================================
                        EVALUATION PERIODS
                    ================================================== */}

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


                    {/* =================================================
                        PROBATION PERIODS
                    ================================================== */}

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


                {/* =====================================================
                    FALLBACK
                ====================================================== */}

                <Route
                    path="*"
                    element={<Home />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;