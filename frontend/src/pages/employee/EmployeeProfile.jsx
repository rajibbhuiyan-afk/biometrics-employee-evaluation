import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";

const EmployeeProfile = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [educations, setEducations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================================
    // Fetch Employee Profile
    // ==========================================================

    useEffect(() => {
        fetchEmployeeProfile();
    }, [id]);


    const fetchEmployeeProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/employees/${id}/profile`
            );

            console.log(
                "Employee Profile:",
                response.data
            );

            if (!response.data.success) {

                setError(
                    response.data.message ||
                    "Failed to load employee profile."
                );

                return;
            }

            const data = response.data.data;

            setUser(data.user);
            setProfile(data.profile);
            setEducations(data.educations || []);

        } catch (error) {

            console.error(
                "Fetch employee profile error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load employee profile."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {

        return (
            <div className="management-page">

                <div className="data-table-container">

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            Loading Employee Profile...
                        </div>

                        <div className="data-table-empty-message">
                            Please wait while the employee
                            profile is being loaded.
                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================================
    // Error
    // ==========================================================

    if (error) {

        return (
            <div className="management-page">

                <div className="management-form-error">
                    {error}
                </div>

            </div>
        );
    }


    // ==========================================================
    // Page
    // ==========================================================

    return (

        <div className="management-page">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="page-header">

                <div className="page-header-info">

                    <h1 className="page-header-title">
                        Employee Profile
                    </h1>

                    <p className="page-header-description">
                        View employee personal, contact,
                        employment and education information.
                    </p>

                </div>


                <button
                    type="button"
                    className="page-header-button"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>

            </div>


            {/* ==================================================
                Employee Information
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Employee Information
                    </h2>

                    <p>
                        Official employment information.
                    </p>

                </div>


                <div className="management-form-grid">

                    <InfoField
                        label="Employee ID"
                        value={user?.employee_id}
                    />

                    <InfoField
                        label="Full Name"
                        value={user?.name}
                    />

                    <InfoField
                        label="Official Email"
                        value={user?.email}
                    />

                    <InfoField
                        label="Joining Date"
                        value={user?.joining_date}
                    />

                    <InfoField
                        label="Department"
                        value={user?.department?.name}
                    />

                    <InfoField
                        label="Position"
                        value={user?.position?.title}
                    />

                    <InfoField
                        label="Reporting Manager"
                        value={user?.manager?.name}
                    />

                    <InfoField
                        label="Employment Status"
                        value={
                            user?.status
                                ? "Active"
                                : "Inactive"
                        }
                    />

                </div>

            </div>


            {/* ==================================================
                Personal Information
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Personal Information
                    </h2>

                    <p>
                        Employee personal information.
                    </p>

                </div>


                <div className="management-form-grid">

                    <InfoField
                        label="Father's Name"
                        value={profile?.father_name}
                    />

                    <InfoField
                        label="Mother's Name"
                        value={profile?.mother_name}
                    />

                    <InfoField
                        label="Date of Birth"
                        value={formatDate(
                            profile?.date_of_birth
                        )}
                    />

                    <InfoField
                        label="Gender"
                        value={profile?.gender}
                    />

                    <InfoField
                        label="Blood Group"
                        value={profile?.blood_group}
                    />

                    <InfoField
                        label="Nationality"
                        value={profile?.nationality}
                    />

                    <InfoField
                        label="Religion"
                        value={profile?.religion}
                    />

                    <InfoField
                        label="Marital Status"
                        value={profile?.marital_status}
                    />

                    <InfoField
                        label="National ID (NID)"
                        value={profile?.nid}
                    />

                    <InfoField
                        label="Passport Number"
                        value={profile?.passport_number}
                    />

                    <InfoField
                        label="Driving License Number"
                        value={
                            profile?.driving_license_number
                        }
                    />

                </div>

            </div>


            {/* ==================================================
                Contact Information
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Contact Information
                    </h2>

                    <p>
                        Employee contact information.
                    </p>

                </div>


                <div className="management-form-grid">

                    <InfoField
                        label="Personal Email"
                        value={profile?.personal_email}
                    />

                    <InfoField
                        label="Mobile Number"
                        value={profile?.mobile_number}
                    />

                    <InfoField
                        label="Emergency Contact Number"
                        value={
                            profile?.emergency_contact_number
                        }
                    />

                    <InfoField
                        label="Emergency Contact Person"
                        value={
                            profile?.emergency_contact_person
                        }
                    />

                    <InfoField
                        label="Relationship"
                        value={
                            profile?.emergency_contact_relationship
                        }
                    />

                    <InfoField
                        label="Present Address"
                        value={profile?.present_address}
                    />

                    <InfoField
                        label="Permanent Address"
                        value={profile?.permanent_address}
                    />

                </div>

            </div>


            {/* ==================================================
                Education Information
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Education Information
                    </h2>

                    <p>
                        Employee educational qualifications.
                    </p>

                </div>


                {educations.length === 0 ? (

                    <div className="data-table-empty">

                        <div className="data-table-empty-title">
                            No Education Records
                        </div>

                        <div className="data-table-empty-message">
                            No education information has been
                            added for this employee.
                        </div>

                    </div>

                ) : (

                    <div className="data-table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Degree
                                    </th>

                                    <th>
                                        Institution
                                    </th>

                                    <th>
                                        Subject
                                    </th>

                                    <th>
                                        Board / University
                                    </th>

                                    <th>
                                        Passing Year
                                    </th>

                                    <th>
                                        Result / CGPA
                                    </th>

                                    <th>
                                        Certificate Number
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {educations.map(
                                    (education) => (

                                        <tr
                                            key={
                                                education.id
                                            }
                                        >

                                            <td>
                                                {education.degree ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {
                                                    education
                                                        .institution_name ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    education.subject ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    education
                                                        .board_university ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    education
                                                        .passing_year ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    education.result ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    education
                                                        .certificate_number ||
                                                    "-"
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};


// ==========================================================
// Info Field
// ==========================================================

const InfoField = ({
    label,
    value
}) => {

    return (
        <div className="management-form-info">

            <span className="management-form-info-label">
                {label}
            </span>

            <span className="management-form-info-value">
                {value || "-"}
            </span>

        </div>
    );
};


// ==========================================================
// Date Formatter
// ==========================================================

const formatDate = (date) => {

    if (!date) {
        return "-";
    }

    return String(date).substring(0, 10);
};


export default EmployeeProfile;