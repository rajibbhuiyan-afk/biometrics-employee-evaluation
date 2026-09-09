import { useEffect, useMemo, useState } from "react";

const DataTable = ({
    columns,
    data = [],
    emptyMessage = "No records found.",
    onRowClick,
}) => {
    /*
    ==================================================
    Pagination State
    ==================================================
    */

    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [currentPage, setCurrentPage] = useState(1);

    /*
    ==================================================
    Total Pages
    ==================================================
    */

    const totalPages = Math.max(
        1,
        Math.ceil(data.length / itemsPerPage)
    );

    /*
    ==================================================
    Reset / Correct Current Page
    ==================================================
    
    Data change হলে যদি current page আর available না থাকে,
    তাহলে last available page-এ নিয়ে যাবে।
    */

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    /*
    ==================================================
    Page Size Change
    ==================================================
    
    10 -> 20 -> 50 করলে আবার page 1 হবে।
    */

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    /*
    ==================================================
    Current Page Data
    ==================================================
    */

    const paginatedData = useMemo(() => {
        const startIndex =
            (currentPage - 1) * itemsPerPage;

        const endIndex =
            startIndex + itemsPerPage;

        return data.slice(startIndex, endIndex);
    }, [
        data,
        currentPage,
        itemsPerPage,
    ]);

    /*
    ==================================================
    Page Numbers
    ==================================================
    
    Example:

    Page 1:
    Previous 1 2 3 Next

    Page 2:
    Previous 1 2 3 4 Next

    Page 3:
    Previous 1 2 3 4 5 Next

    যতগুলো page আছে তার বেশি দেখাবে না।
    */

    const pageNumbers = useMemo(() => {
        const pages = [];

        /*
        Always start from page 1
        */

        let startPage = 1;

        /*
        Current page অনুযায়ী maximum
        4 pages পর্যন্ত সামনে দেখাবে।
        */

        let endPage = Math.min(
            totalPages,
            currentPage + 2
        );

        /*
        Current page যদি 1 হয়,
        তাহলে 1, 2, 3
        */

        if (currentPage === 1) {
            endPage = Math.min(
                totalPages,
                3
            );
        }

        /*
        Current page 2 হলে
        1, 2, 3, 4
        */

        if (currentPage === 2) {
            endPage = Math.min(
                totalPages,
                4
            );
        }

        /*
        যদি শেষের দিকে চলে যাই,
        তাহলে শেষ page পর্যন্ত দেখাবে।

        Example:
        Total = 5
        Current = 4

        1 2 3 4 5
        */

        if (
            currentPage >= totalPages - 1 &&
            totalPages > 4
        ) {
            startPage = Math.max(
                1,
                totalPages - 4
            );

            endPage = totalPages;
        }

        for (
            let page = startPage;
            page <= endPage;
            page++
        ) {
            pages.push(page);
        }

        return pages;
    }, [
        currentPage,
        totalPages,
    ]);

    /*
    ==================================================
    Pagination Handlers
    ==================================================
    */

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((previousPage) =>
                previousPage - 1
            );
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((previousPage) =>
                previousPage + 1
            );
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    /*
    ==================================================
    Render
    ==================================================
    */

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
                <>
                    {/* ==========================================
                        Table
                    ========================================== */}

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

                                {paginatedData.map(
                                    (row, index) => (

                                        <tr
                                            key={
                                                row.id ||
                                                index
                                            }
                                            onClick={() => {

                                                if (
                                                    onRowClick
                                                ) {
                                                    onRowClick(
                                                        row
                                                    );
                                                }

                                            }}
                                            className={
                                                onRowClick
                                                    ? "data-table-clickable-row"
                                                    : ""
                                            }
                                        >

                                            {columns.map(
                                                (column) => (

                                                    <td
                                                        key={
                                                            column.key
                                                        }
                                                    >

                                                        {column.render
                                                            ? column.render(
                                                                row
                                                            )
                                                            : row[
                                                                column.key
                                                            ] ?? "-"
                                                        }

                                                    </td>

                                                )
                                            )}

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* ==========================================
                        Pagination
                    ========================================== */}

                    <div className="data-table-pagination">

                        {/* ======================================
                            Rows Per Page
                        ====================================== */}

                        <div className="data-table-page-size">

                            <span>
                                Show
                            </span>

                            <select
                                value={itemsPerPage}
                                onChange={
                                    handleItemsPerPageChange
                                }
                            >

                                <option value={10}>
                                    10
                                </option>

                                <option value={20}>
                                    20
                                </option>

                                <option value={50}>
                                    50
                                </option>

                            </select>

                            <span>
                                entries
                            </span>

                        </div>

                        {/* ======================================
                            Pagination Buttons
                        ====================================== */}

                        <div className="data-table-pagination-buttons">

                            {/* Previous */}

                            <button
                                type="button"
                                className="data-table-pagination-button"
                                onClick={
                                    handlePrevious
                                }
                                disabled={
                                    currentPage === 1
                                }
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}

                            {pageNumbers.map(
                                (page) => (

                                    <button
                                        key={page}
                                        type="button"
                                        className={`data-table-pagination-button ${
                                            currentPage ===
                                            page
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handlePageChange(
                                                page
                                            )
                                        }
                                    >
                                        {page}
                                    </button>

                                )
                            )}

                            {/* Next */}

                            <button
                                type="button"
                                className="data-table-pagination-button"
                                onClick={
                                    handleNext
                                }
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                            >
                                Next
                            </button>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
};

export default DataTable;