const EmployeeComment = ({
    comment,
}) => {
    if (!comment) {
        return null;
    }

    return (
        <div className="management-form-section">

            <div className="management-form-section-header">
                <h2>
                    Employee Comment
                </h2>
            </div>

            <div className="evaluation-review-comment">
                {comment}
            </div>

        </div>
    );
};

export default EmployeeComment;