const EmployeeInformation = ({
    evaluation,
}) => {
    const employee =
        evaluation?.employee;

    const period =
        evaluation?.evaluation_period ||
        evaluation?.evaluationPeriod;

    const formatStatus = (status) => {
        if (!status) {
            return "-";
        }

        return status
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                (char) =>
                    char.toUpperCase()
            );
    };

    const getStatusClass = (status) => {
        if (!status) {
            return "";
        }

        return `evaluation-status evaluation-status-${status
            .replaceAll("_", "-")
            .toLowerCase()}`;
    };

    return (
        <div className="management-form-section">

            <div className="management-form-section-header">
                <h2>
                    Employee Information
                </h2>
            </div>

            <div className="management-form-grid">

                <div className="management-form-info">
                    <span className="management-form-info-label">
                        Employee
                    </span>

                    <span className="management-form-info-value">
                        {employee?.name || "-"}
                    </span>
                </div>


                <div className="management-form-info">
                    <span className="management-form-info-label">
                        Employee ID
                    </span>

                    <span className="management-form-info-value">
                        {employee?.employee_id || "-"}
                    </span>
                </div>


                <div className="management-form-info">
                    <span className="management-form-info-label">
                        Department
                    </span>

                    <span className="management-form-info-value">
                        {employee?.department?.name || "-"}
                    </span>
                </div>


                <div className="management-form-info">
                    <span className="management-form-info-label">
                        Position
                    </span>

                    <span className="management-form-info-value">
                        {employee?.position?.name || "-"}
                    </span>
                </div>


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


                <div className="management-form-info">
                    <span className="management-form-info-label">
                        Status
                    </span>

                    <span
                        className={getStatusClass(
                            evaluation.status
                        )}
                    >
                        {formatStatus(
                            evaluation.status
                        )}
                    </span>
                </div>

            </div>

        </div>
    );
};

export default EmployeeInformation;