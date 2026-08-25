const DataTable = ({
    columns,
    data,
    emptyMessage = "No records found.",
    onRowClick,
}) => {
    return (
        <div className="data-table-container">

            {data.length === 0 ? (
                <div className="data-table-empty">
                    <div className="data-table-empty-title">
                        No Data
                    </div>

                    <div className="data-table-empty-message">
                        {emptyMessage}
                    </div>
                </div>
            ) : (
                <div className="data-table-wrapper">
                    <table className="data-table">

                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={
                                            column.key === "actions"
                                                ? "data-table-actions-header"
                                                : ""
                                        }
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>

                            {data.map((row, index) => (

                                <tr
                                    key={row.id || index}
                                    onClick={() => {
                                        if (onRowClick) {
                                            onRowClick(row);
                                        }
                                    }}
                                    className={
                                        onRowClick
                                            ? "data-table-clickable-row"
                                            : ""
                                    }
                                >

                                    {columns.map((column) => (

                                        <td key={column.key}>

                                            {column.render
                                                ? column.render(row)
                                                : row[column.key] ?? "-"
                                            }

                                        </td>

                                    ))}

                                </tr>

                            ))}

                        </tbody>

                    </table>
                </div>
            )}

        </div>
    );
};

export default DataTable;