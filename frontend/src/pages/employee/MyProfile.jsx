import { useEffect, useState } from "react";
import api from "../../api/axios";

const MyProfile = () => {

    // ==========================================================
    // State
    // ==========================================================

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [educations, setEducations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [educationSaving, setEducationSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================================
    // Profile Form
    // ==========================================================

    const [form, setForm] = useState({
        father_name: "",
        mother_name: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        nationality: "",
        religion: "",
        marital_status: "",
        nid: "",
        passport_number: "",
        driving_license_number: "",

        personal_email: "",
        mobile_number: "",
        emergency_contact_number: "",
        emergency_contact_person: "",
        emergency_contact_relationship: "",
        present_address: "",
        permanent_address: "",
    });

    // ==========================================================
    // Education Form
    // ==========================================================

    const emptyEducation = {
        id: null,
        degree: "",
        institution_name: "",
        subject: "",
        board_university: "",
        passing_year: "",
        result: "",
        certificate_number: "",
        achievement: "",
    };

    const [educationForm, setEducationForm] =
        useState(emptyEducation);

    const [editingEducationId, setEditingEducationId] =
        useState(null);


    // ==========================================================
    // Fetch Profile
    // ==========================================================

    useEffect(() => {
        fetchProfile();
    }, []);


    const fetchProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/profile"
            );

            console.log(
                "Profile:",
                response.data
            );

            if (!response.data.success) {

                setError(
                    response.data.message ||
                    "Failed to load profile."
                );

                return;
            }

            const data = response.data.data;

            setUser(data.user);
            setProfile(data.profile);

            // ==================================================
            // Profile Data
            // ==================================================

            const profileData =
                data.profile || {};

            setForm({

                father_name:
                    profileData.father_name || "",

                mother_name:
                    profileData.mother_name || "",

                date_of_birth:
                    profileData.date_of_birth
                        ? profileData.date_of_birth.substring(0, 10)
                        : "",

                gender:
                    profileData.gender || "",

                blood_group:
                    profileData.blood_group || "",

                nationality:
                    profileData.nationality || "",

                religion:
                    profileData.religion || "",

                marital_status:
                    profileData.marital_status || "",

                nid:
                    profileData.nid || "",

                passport_number:
                    profileData.passport_number || "",

                driving_license_number:
                    profileData.driving_license_number || "",

                personal_email:
                    profileData.personal_email || "",

                mobile_number:
                    profileData.mobile_number || "",

                emergency_contact_number:
                    profileData.emergency_contact_number || "",

                emergency_contact_person:
                    profileData.emergency_contact_person || "",

                emergency_contact_relationship:
                    profileData.emergency_contact_relationship || "",

                present_address:
                    profileData.present_address || "",

                permanent_address:
                    profileData.permanent_address || "",
            });


            // ==================================================
            // Education
            // ==================================================

            /*
             * If backend returns educations inside /profile
             */
            if (data.educations) {

                setEducations(
                    data.educations || []
                );

            } else {

                /*
                 * Otherwise load from separate endpoint.
                 */
                await fetchEducations();

            }

        } catch (error) {

            console.error(
                "Fetch profile error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load profile."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // Fetch Education Records
    // ==========================================================

    const fetchEducations = async () => {

        try {

            const response = await api.get(
                "/profile/educations"
            );

            console.log(
                "Educations:",
                response.data
            );

            if (response.data.success) {

                setEducations(
                    response.data.data || []
                );

            } else {

                setEducations([]);

            }

        } catch (error) {

            console.error(
                "Fetch education error:",
                error
            );

            /*
             * Do not completely break profile page
             * if education API is unavailable.
             */
            setEducations([]);

        }
    };


    // ==========================================================
    // Handle Profile Input
    // ==========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // ==========================================================
    // Save Profile
    // ==========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const response = await api.put(
                "/profile",
                form
            );

            console.log(
                "Update profile:",
                response.data
            );

            if (!response.data.success) {

                setError(
                    response.data.message ||
                    "Failed to update profile."
                );

                return;
            }

            setSuccess(
                response.data.message ||
                "Profile updated successfully."
            );

            setProfile(
                response.data.data.profile
            );

        } catch (error) {

            console.error(
                "Update profile error:",
                error
            );

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {

                const firstError =
                    Object.values(validationErrors)
                        .flat()[0];

                setError(
                    firstError ||
                    "Validation failed."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Failed to update profile."
                );

            }

        } finally {

            setSaving(false);

        }
    };


    // ==========================================================
    // Education Input Change
    // ==========================================================

    const handleEducationChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setEducationForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // ==========================================================
    // Reset Education Form
    // ==========================================================

    const resetEducationForm = () => {

        setEducationForm({
            ...emptyEducation,
        });

        setEditingEducationId(null);
    };


    // ==========================================================
    // Add / Update Education
    // ==========================================================

    const handleEducationSubmit = async (e) => {

        e.preventDefault();

        try {

            setEducationSaving(true);
            setError("");
            setSuccess("");

            let response;

            const payload = {
                degree:
                    educationForm.degree,

                institution_name:
                    educationForm.institution_name,

                subject:
                    educationForm.subject,

                board_university:
                    educationForm.board_university,

                passing_year:
                    educationForm.passing_year,

                result:
                    educationForm.result,

                certificate_number:
                    educationForm.certificate_number,

                achievement:
                    educationForm.achievement,
            };


            // ==================================================
            // UPDATE
            // ==================================================

            if (editingEducationId) {

                response = await api.put(
                    `/profile/educations/${editingEducationId}`,
                    payload
                );

            }

            // ==================================================
            // CREATE
            // ==================================================

            else {

                response = await api.post(
                    "/profile/educations",
                    payload
                );

            }


            console.log(
                "Education response:",
                response.data
            );


            if (!response.data.success) {

                setError(
                    response.data.message ||
                    "Failed to save education."
                );

                return;
            }


            setSuccess(
                response.data.message ||
                (
                    editingEducationId
                        ? "Education updated successfully."
                        : "Education added successfully."
                )
            );


            // ==================================================
            // Refresh education list
            // ==================================================

            await fetchEducations();


            // ==================================================
            // Reset
            // ==================================================

            resetEducationForm();

        } catch (error) {

            console.error(
                "Education save error:",
                error
            );

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {

                const firstError =
                    Object.values(validationErrors)
                        .flat()[0];

                setError(
                    firstError ||
                    "Validation failed."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Failed to save education."
                );

            }

        } finally {

            setEducationSaving(false);

        }
    };


    // ==========================================================
    // Edit Education
    // ==========================================================

    const handleEditEducation = (education) => {

        setEditingEducationId(
            education.id
        );

        setEducationForm({

            id:
                education.id,

            degree:
                education.degree || "",

            institution_name:
                education.institution_name || "",

            subject:
                education.subject || "",

            board_university:
                education.board_university || "",

            passing_year:
                education.passing_year || "",

            result:
                education.result || "",

            certificate_number:
                education.certificate_number || "",

            achievement:
                education.achievement || "",
        });


        // Scroll to education form
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });

    };


    // ==========================================================
    // Delete Education
    // ==========================================================

    const handleDeleteEducation = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this education record?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");
            setSuccess("");

            const response = await api.delete(
                `/profile/educations/${id}`
            );

            console.log(
                "Delete education:",
                response.data
            );

            if (!response.data.success) {

                setError(
                    response.data.message ||
                    "Failed to delete education."
                );

                return;
            }

            setSuccess(
                response.data.message ||
                "Education deleted successfully."
            );

            await fetchEducations();

        } catch (error) {

            console.error(
                "Delete education error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete education."
            );

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
                            Loading Profile...
                        </div>

                        <div className="data-table-empty-message">
                            Please wait while your profile
                            is being loaded.
                        </div>

                    </div>

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
                        My Profile
                    </h1>

                    <p className="page-header-description">
                        View and update your personal,
                        contact and education information.
                    </p>

                </div>

            </div>


            {/* ==================================================
                Messages
            ================================================== */}

            {error && (
                <div className="management-form-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="management-form-success">
                    {success}
                </div>
            )}


            <form onSubmit={handleSubmit}>

                {/* ==================================================
                    EMPLOYEE INFORMATION
                ================================================== */}

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Employee Information
                        </h2>

                        <p>
                            Your official employment information.
                        </p>

                    </div>


                    <div className="management-form-grid">

                        {/* Employee ID */}

                        <div className="management-form-info">

                            <span className="management-form-info-label">
                                Employee ID
                            </span>

                            <span className="management-form-info-value">
                                {user?.employee_id || "-"}
                            </span>

                        </div>


                        {/* Full Name */}

                        <div className="management-form-info">

                            <span className="management-form-info-label">
                                Full Name
                            </span>

                            <span className="management-form-info-value">
                                {user?.name || "-"}
                            </span>

                        </div>


                        {/* Official Email */}

                        <div className="management-form-info">

                            <span className="management-form-info-label">
                                Official Email
                            </span>

                            <span className="management-form-info-value">
                                {user?.email || "-"}
                            </span>

                        </div>


                        {/* Department */}

                        <div className="management-form-info">

                            <span className="management-form-info-label">
                                Department
                            </span>

                            <span className="management-form-info-value">
                                {user?.department?.name || "-"}
                            </span>

                        </div>


                        {/* Position */}

                        <div className="management-form-info">

                            <span className="management-form-info-label">
                                Position
                            </span>

                            <span className="management-form-info-value">
                                {user?.position?.title || "-"}
                            </span>

                        </div>


                        {/* Manager */}

                        <div className="management-form-info">

                            <span className="management-form-info-label">
                                Reporting Manager
                            </span>

                            <span className="management-form-info-value">
                                {user?.manager?.name || "-"}
                            </span>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    PERSONAL INFORMATION
                ================================================== */}

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Personal Information
                        </h2>

                        <p>
                            Update your personal information.
                        </p>

                    </div>


                    <div className="management-form-grid">

                        {/* Father's Name */}

                        <div className="management-form-field">

                            <label htmlFor="father_name">
                                Father's Name
                            </label>

                            <input
                                id="father_name"
                                name="father_name"
                                type="text"
                                value={form.father_name}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Mother's Name */}

                        <div className="management-form-field">

                            <label htmlFor="mother_name">
                                Mother's Name
                            </label>

                            <input
                                id="mother_name"
                                name="mother_name"
                                type="text"
                                value={form.mother_name}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Date of Birth */}

                        <div className="management-form-field">

                            <label htmlFor="date_of_birth">
                                Date of Birth
                            </label>

                            <input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                value={form.date_of_birth}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Gender */}

                        <div className="management-form-field">

                            <label htmlFor="gender">
                                Gender
                            </label>

                            <select
                                id="gender"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* Blood Group */}

                        <div className="management-form-field">

                            <label htmlFor="blood_group">
                                Blood Group
                            </label>

                            <select
                                id="blood_group"
                                name="blood_group"
                                value={form.blood_group}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Blood Group
                                </option>

                                <option value="A+">
                                    A+
                                </option>

                                <option value="A-">
                                    A-
                                </option>

                                <option value="B+">
                                    B+
                                </option>

                                <option value="B-">
                                    B-
                                </option>

                                <option value="AB+">
                                    AB+
                                </option>

                                <option value="AB-">
                                    AB-
                                </option>

                                <option value="O+">
                                    O+
                                </option>

                                <option value="O-">
                                    O-
                                </option>

                            </select>

                        </div>


                        {/* Nationality */}

                        <div className="management-form-field">

                            <label htmlFor="nationality">
                                Nationality
                            </label>

                            <input
                                id="nationality"
                                name="nationality"
                                type="text"
                                value={form.nationality}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Religion */}

                        <div className="management-form-field">

                            <label htmlFor="religion">
                                Religion
                            </label>

                            <input
                                id="religion"
                                name="religion"
                                type="text"
                                value={form.religion}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Marital Status */}

                        <div className="management-form-field">

                            <label htmlFor="marital_status">
                                Marital Status
                            </label>

                            <select
                                id="marital_status"
                                name="marital_status"
                                value={form.marital_status}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Status
                                </option>

                                <option value="Single">
                                    Single
                                </option>

                                <option value="Married">
                                    Married
                                </option>

                                <option value="Divorced">
                                    Divorced
                                </option>

                                <option value="Widowed">
                                    Widowed
                                </option>

                            </select>

                        </div>


                        {/* NID */}

                        <div className="management-form-field">

                            <label htmlFor="nid">
                                National ID (NID)
                            </label>

                            <input
                                id="nid"
                                name="nid"
                                type="text"
                                value={form.nid}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Passport */}

                        <div className="management-form-field">

                            <label htmlFor="passport_number">
                                Passport Number
                            </label>

                            <input
                                id="passport_number"
                                name="passport_number"
                                type="text"
                                value={form.passport_number}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Driving License */}

                        <div className="management-form-field">

                            <label htmlFor="driving_license_number">
                                Driving License Number
                            </label>

                            <input
                                id="driving_license_number"
                                name="driving_license_number"
                                type="text"
                                value={
                                    form.driving_license_number
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    CONTACT INFORMATION
                ================================================== */}

                <div className="management-form-section">

                    <div className="management-form-section-header">

                        <h2>
                            Contact Information
                        </h2>

                        <p>
                            Update your contact and emergency
                            contact information.
                        </p>

                    </div>


                    <div className="management-form-grid">

                        {/* Personal Email */}

                        <div className="management-form-field">

                            <label htmlFor="personal_email">
                                Personal Email
                            </label>

                            <input
                                id="personal_email"
                                name="personal_email"
                                type="email"
                                value={form.personal_email}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Mobile */}

                        <div className="management-form-field">

                            <label htmlFor="mobile_number">
                                Mobile Number
                            </label>

                            <input
                                id="mobile_number"
                                name="mobile_number"
                                type="text"
                                value={form.mobile_number}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Emergency Number */}

                        <div className="management-form-field">

                            <label htmlFor="emergency_contact_number">
                                Emergency Contact Number
                            </label>

                            <input
                                id="emergency_contact_number"
                                name="emergency_contact_number"
                                type="text"
                                value={
                                    form.emergency_contact_number
                                }
                                onChange={handleChange}
                            />

                        </div>


                        {/* Emergency Person */}

                        <div className="management-form-field">

                            <label htmlFor="emergency_contact_person">
                                Emergency Contact Person
                            </label>

                            <input
                                id="emergency_contact_person"
                                name="emergency_contact_person"
                                type="text"
                                value={
                                    form.emergency_contact_person
                                }
                                onChange={handleChange}
                            />

                        </div>


                        {/* Relationship */}

                        <div className="management-form-field">

                            <label htmlFor="emergency_contact_relationship">
                                Relationship
                            </label>

                            <input
                                id="emergency_contact_relationship"
                                name="emergency_contact_relationship"
                                type="text"
                                value={
                                    form.emergency_contact_relationship
                                }
                                onChange={handleChange}
                            />

                        </div>


                        {/* Present Address */}

                        <div className="management-form-field">

                            <label htmlFor="present_address">
                                Present Address
                            </label>

                            <textarea
                                id="present_address"
                                name="present_address"
                                rows="4"
                                value={form.present_address}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Permanent Address */}

                        <div className="management-form-field">

                            <label htmlFor="permanent_address">
                                Permanent Address
                            </label>

                            <textarea
                                id="permanent_address"
                                name="permanent_address"
                                rows="4"
                                value={form.permanent_address}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    SAVE PROFILE
                ================================================== */}

                <div className="management-form-actions">

                    <button
                        type="submit"
                        className="management-btn-primary"
                        disabled={saving}
                    >

                        {saving
                            ? "Saving..."
                            : "Save Profile"}

                    </button>

                </div>

            </form>

            <br/>   


            {/* ==================================================
                EDUCATION INFORMATION
            ================================================== */}

            <div className="management-form-section">

                <div className="management-form-section-header">

                    <h2>
                        Education Information
                    </h2>

                    <p>
                        Add and manage your educational
                        qualifications.
                    </p>

                </div>


                {/* ==================================================
                    Existing Education Records
                ================================================== */}

                {educations.length > 0 && (

                    <div className="data-table-container">

                        <div className="data-table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Degree / Certificate
                                        </th>

                                        <th>
                                            Institution
                                        </th>

                                        <th>
                                            Subject / Major
                                        </th>

                                        <th>
                                            Passing Year
                                        </th>

                                        <th>
                                            Result / CGPA
                                        </th>

                                        <th>
                                            Action
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
                                                    {
                                                        education.degree ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        education.institution_name ||
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
                                                        education.passing_year ||
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

                                                    <div className="table-actions">

                                                        <button
                                                            type="button"
                                                            className="action-button action-edit"
                                                            onClick={() =>
                                                                handleEditEducation(
                                                                    education
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="action-button action-delete"
                                                            onClick={() =>
                                                                handleDeleteEducation(
                                                                    education.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}
                <br/>   


                {/* ==================================================
                    Education Form
                ================================================== */}

                <form
                    onSubmit={
                        handleEducationSubmit
                    }
                    // className="management-form"
                >

                    <div className="management-form-grid">


                        {/* Degree */}

                        <div className="management-form-field">

                            <label htmlFor="degree">
                                Degree / Certificate
                            </label>

                            <input
                                id="degree"
                                name="degree"
                                type="text"
                                value={
                                    educationForm.degree
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="e.g. B.Sc. in Computer Science"
                                required
                            />

                        </div>


                        {/* Institution */}

                        <div className="management-form-field">

                            <label htmlFor="institution_name">
                                Institution Name
                            </label>

                            <input
                                id="institution_name"
                                name="institution_name"
                                type="text"
                                value={
                                    educationForm.institution_name
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="Enter institution name"
                                required
                            />

                        </div>


                        {/* Subject */}

                        <div className="management-form-field">

                            <label htmlFor="subject">
                                Subject / Major
                            </label>

                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                value={
                                    educationForm.subject
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="e.g. Computer Science"
                            />

                        </div>


                        {/* Board / University */}

                        <div className="management-form-field">

                            <label htmlFor="board_university">
                                Board / University
                            </label>

                            <input
                                id="board_university"
                                name="board_university"
                                type="text"
                                value={
                                    educationForm.board_university
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="Enter board or university"
                            />

                        </div>


                        {/* Passing Year */}

                        <div className="management-form-field">

                            <label htmlFor="passing_year">
                                Passing Year
                            </label>

                            <input
                                id="passing_year"
                                name="passing_year"
                                type="number"
                                min="1900"
                                max="2100"
                                value={
                                    educationForm.passing_year
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="e.g. 2024"
                            />

                        </div>


                        {/* Result / CGPA */}

                        <div className="management-form-field">

                            <label htmlFor="result">
                                Result
                            </label>

                            <input
                                id="result"
                                name="result"
                                type="text"
                                value={
                                    educationForm.result
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="e.g. 3.75 / 4.00"
                            />

                        </div>


                        {/* Certificate Number */}

                        <div className="management-form-field">

                            <label htmlFor="certificate_number">
                                Certificate Number
                            </label>

                            <input
                                id="certificate_number"
                                name="certificate_number"
                                type="text"
                                value={
                                    educationForm.certificate_number
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="Enter certificate number"
                            />

                        </div>


                        {/* Achievement */}

                        <div className="management-form-field">

                            <label htmlFor="achievement">
                                Achievement
                            </label>

                            <textarea
                                id="achievement"
                                name="achievement"
                                rows="4"
                                value={
                                    educationForm.achievement
                                }
                                onChange={
                                    handleEducationChange
                                }
                                placeholder="Enter any academic achievement"
                            />

                        </div>

                    </div>


                    {/* ==================================================
                        Education Actions
                    ================================================== */}

                    <div className="management-form-actions">

                        <button
                            type="submit"
                            className="management-btn-primary"
                            disabled={educationSaving}
                        >

                            {educationSaving
                                ? "Saving..."
                                : editingEducationId
                                    ? "Update Education"
                                    : "Add Education"}

                        </button>


                        {editingEducationId && (

                            <button
                                type="button"
                                className="management-btn-secondary"
                                disabled={educationSaving}
                                onClick={
                                    resetEducationForm
                                }
                            >
                                Cancel Edit
                            </button>

                        )}

                    </div>

                </form>

            </div>

        </div>
    );
};

export default MyProfile;