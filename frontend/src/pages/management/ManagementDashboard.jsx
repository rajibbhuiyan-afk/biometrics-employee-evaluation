import { useAuth } from "../../context/AuthContext";

import EmployeeDashboard from "../employee/EmployeeDashboard";
import ManagerDashboard from "../manager/ManagerDashboard";
import HRDashboard from "../hr/HRDashboard";
import AdminDashboard from "../admin/AdminDashboard";


const ManagementDashboard = () => {

    const { user } = useAuth();

    const role = user?.role?.name;


    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    if (role === "Admin") {
        return <AdminDashboard />;
    }


    /*
    |--------------------------------------------------------------------------
    | HR
    |--------------------------------------------------------------------------
    */

    if (role === "HR") {
        return <HRDashboard />;
    }


    /*
    |--------------------------------------------------------------------------
    | Manager
    |--------------------------------------------------------------------------
    */

    if (role === "Manager") {
        return <ManagerDashboard />;
    }


    /*
    |--------------------------------------------------------------------------
    | Employee
    |--------------------------------------------------------------------------
    */

    if (role === "Employee") {
        return <EmployeeDashboard />;
    }


    /*
    |--------------------------------------------------------------------------
    | Unknown Role
    |--------------------------------------------------------------------------
    */

    return (

        <div className="management-page">

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Dashboard
                    </h1>

                    <p className="page-header-description">
                        Unable to determine your user role.
                    </p>

                </div>

            </div>

        </div>
    );
};


export default ManagementDashboard;