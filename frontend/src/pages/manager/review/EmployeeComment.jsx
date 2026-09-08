const EmployeeComment = ({
    comment,
}) => {
    if (!comment) {
        return null;
    }

    return (  
        <div className="management-form-info">
            <span className="management-form-info-label">
                Employee Comment
            </span>

            <span className="management-form-info-value">
            {comment}
            </span>
        </div>        
    );
};

export default EmployeeComment;