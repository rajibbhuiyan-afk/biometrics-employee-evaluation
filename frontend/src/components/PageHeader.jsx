const PageHeader = ({
    title,
    description,
    buttonText,
    onButtonClick,
}) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
            }}
        >
            <div>
                <h1 style={{ margin: 0 }}>
                    {title}
                </h1>

                {description && (
                    <p
                        style={{
                            marginTop: "8px",
                            color: "#666",
                        }}
                    >
                        {description}
                    </p>
                )}
            </div>

            {buttonText && (
                <button
                    type="button"
                    onClick={onButtonClick}
                    style={{
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        cursor: "pointer",
                    }}
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default PageHeader;