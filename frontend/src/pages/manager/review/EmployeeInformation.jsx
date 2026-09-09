import api from "../../../api/axios";

import EmployeeComment from "./EmployeeComment";

const EmployeeInformation = ({
    evaluation,
    reviewerRole,
}) => {

    const employee = evaluation?.employee;

    const period =
        evaluation?.evaluation_period ||
        evaluation?.evaluationPeriod;

    /*
    ==================================================
    Status
    ==================================================
    */
    const formatStatus = (status) => {
        if (!status) {
            return "-";
        }

        return status
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                (char) => char.toUpperCase()
            );
    };

    /*
    ==================================================
    Status Class
    ==================================================
    */
    const getStatusClass = (status) => {
        if (!status) {
            return "";
        }

        return `evaluation-status evaluation-status-${status
            .replaceAll("_", "-")
            .toLowerCase()}`;
    };

    /*
    ==================================================
    Submitted At
    ==================================================
    */

    const submittedAt =
        evaluation?.submitted_at ||
        evaluation?.submittedAt ||
        null;

    const formatSubmittedAt = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    /*
    ==================================================
    Employee Comment
    ==================================================
    */

    const employeeComment =
        evaluation?.employee_comment ??
        evaluation?.employeeComment ??
        "";

    /*
    ==================================================
    Download PDF
    ==================================================
    */

    const handleDownloadPdf = async () => {

        if (!evaluation?.id) {
            alert("Evaluation ID not found.");
            return;
        }

        try {

            const response = await api.get(
                `/evaluations/${evaluation.id}/pdf`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob(
                [response.data],
                {
                    type: "application/pdf",
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `evaluation-${employee?.employee_id || evaluation.id}.pdf`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(
                "PDF download error:",
                error
            );

            alert(
                "Failed to download evaluation PDF."
            );
        }
    };

    return (
        <div className="management-form-section">

            <div className="management-form-section-header">
                <h2>
                    Employee Information
                </h2>
            </div>

            <div className="management-form-grid">

                {/* ==================================================
                    Employee
                ================================================== */}

                <div className="management-form-info">

                    <span className="management-form-info-label">
                        Employee
                    </span>

                    <span className="management-form-info-value">
                        {employee?.name || "-"}
                    </span>

                </div>


                {/* ==================================================
                    Employee ID
                ================================================== */}

                <div className="management-form-info">

                    <span className="management-form-info-label">
                        Employee ID
                    </span>

                    <span className="management-form-info-value">
                        {employee?.employee_id || "-"}
                    </span>

                </div>


                {/* ==================================================
                    Department
                ================================================== */}

                <div className="management-form-info">

                    <span className="management-form-info-label">
                        Department
                    </span>

                    <span className="management-form-info-value">
                        {employee?.department?.name || "-"}
                    </span>

                </div>


                {/* ==================================================
                    Position
                ================================================== */}

                <div className="management-form-info">

                    <span className="management-form-info-label">
                        Position
                    </span>

                    <span className="management-form-info-value">
                        {employee?.position?.title || "-"}
                    </span>

                </div>


                {/* ==================================================
                    Evaluation Period
                ================================================== */}

                <div className="management-form-info">

                    <span className="management-form-info-label">
                        Evaluation Period
                    </span>

                    <span className="management-form-info-value">
                        {period?.name ||
                            period?.title ||
                            "-"}
                    </span>

                </div>


                {/* ==================================================
                    Status
                ================================================== */}

                <div className="management-form-info">

                    <span className="management-form-info-label">
                        Status
                    </span>

                    <span
                        className={`management-form-info-value ${getStatusClass(
                            evaluation?.status
                        )}`}
                    >
                        {formatStatus(
                            evaluation?.status
                        )}
                    </span>

                </div>


                {/* ==================================================
                    Submitted At
                ================================================== */}

                <div className="management-form-info">

                    <span className="management-form-info-label">
                        Submitted At
                    </span>

                    <span className="management-form-info-value">
                        {formatSubmittedAt(
                            submittedAt
                        )}
                    </span>

                </div>


                {/* ==================================================
                    Employee Comment
                ================================================== */}

                <EmployeeComment
                    comment={employeeComment}
                />


                {/* ==================================================
                    Download PDF
                ================================================== */}

                {[
                    "HR",
                    "Management",
                    "Admin",
                ].includes(reviewerRole) && (

                    <div className="management-form-info">

                        <span className="management-form-info-label">
                            Download
                        </span>

                        <button
                            type="button"
                            className="evaluation-pdf-download-button"
                            onClick={handleDownloadPdf}
                        >
                            Download PDF
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
};

export default EmployeeInformation;