const PageHeader = ({
    title,
    description,
    buttonText,
    onButtonClick,
}) => {
    return (
        <div className="page-header">

            <div className="page-header-info">
                <h1 className="page-header-title">
                    {title}
                </h1>

                {description && (
                    <p className="page-header-description">
                        {description}
                    </p>
                )}
            </div>

            {buttonText && (
                <button
                    type="button"
                    className="page-header-button"
                    onClick={onButtonClick}
                >
                    {buttonText}
                </button>
            )}

        </div>
    );
};

export default PageHeader;