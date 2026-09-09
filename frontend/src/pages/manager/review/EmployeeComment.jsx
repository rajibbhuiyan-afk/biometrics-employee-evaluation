const EmployeeComment = ({
    comment,
}) => {

    const normalizedComment =
        typeof comment === "string"
            ? comment.trim()
            : comment;

    if (
        normalizedComment === null ||
        normalizedComment === undefined ||
        normalizedComment === ""
    ) {
        return null;
    }

    return (
        <div
            className="management-form-info employee-comment-info"
        >

            <span className="management-form-info-label">
                Employee Comment
            </span>

            <span className="management-form-info-value">
                {normalizedComment}
            </span>

        </div>
    );
};

export default EmployeeComment;