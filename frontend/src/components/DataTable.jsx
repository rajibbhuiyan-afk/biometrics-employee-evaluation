const DataTable = ({
    columns,
    data,
    emptyMessage = "No records found.",
}) => {
    return (
        <div
            style={{
                overflowX: "auto",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
            }}
        >
            {data.length === 0 ? (
                <div
                    style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "#666",
                    }}
                >
                    {emptyMessage}
                </div>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    style={thStyle}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, index) => (
                            <tr key={row.id ?? index}>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        style={tdStyle}
                                    >
                                        {column.render
                                            ? column.render(row)
                                            : row[column.key] ?? "N/A"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const thStyle = {
    borderBottom: "1px solid #ddd",
    padding: "12px",
    textAlign: "left",
    backgroundColor: "#f5f6f8",
    fontWeight: "600",
};

const tdStyle = {
    borderBottom: "1px solid #eee",
    padding: "12px",
};

export default DataTable;