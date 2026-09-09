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
    */

    useEffect(() => {

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }

    }, [
        currentPage,
        totalPages,
    ]);


    /*
    ==================================================
    Page Size Change
    ==================================================
    */

    const handleItemsPerPageChange = (event) => {

        setItemsPerPage(
            Number(event.target.value)
        );

        setCurrentPage(1);
    };


    /*
    ==================================================
    Current Page Data
    ==================================================
    */

    const paginatedData = useMemo(() => {

        const startIndex =
            (currentPage - 1) *
            itemsPerPage;

        const endIndex =
            startIndex +
            itemsPerPage;

        return data.slice(
            startIndex,
            endIndex
        );

    }, [
        data,
        currentPage,
        itemsPerPage,
    ]);


    /*
    ==================================================
    Page Numbers
    ==================================================
    */

    const pageNumbers = useMemo(() => {

        const pages = [];

        let startPage = 1;

        let endPage = Math.min(
            totalPages,
            currentPage + 2
        );


        /*
        Current page 1
        */

        if (currentPage === 1) {

            endPage = Math.min(
                totalPages,
                3
            );
        }


        /*
        Current page 2
        */

        if (currentPage === 2) {

            endPage = Math.min(
                totalPages,
                4
            );
        }


        /*
        Near the last page
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

            setCurrentPage(
                (previousPage) =>
                    previousPage - 1
            );
        }
    };


    const handleNext = () => {

        if (currentPage < totalPages) {

            setCurrentPage(
                (previousPage) =>
                    previousPage + 1
            );
        }
    };


    const handlePageChange = (page) => {

        setCurrentPage(page);
    };


    /*
    ==================================================
    Column Class Helper
    ==================================================
    
    Supports:
    
    className: "evaluation-question-column"
    
    This allows individual columns to have
    custom width / styling.
    */

    const getColumnClassName = (
        column
    ) => {

        return [
            column.key === "actions"
                ? "data-table-actions-header"
                : "",

            column.className || "",
        ]
            .filter(Boolean)
            .join(" ");
    };


    /*
    ==================================================
    Render
    ==================================================
    */

    return (

        <div className="data-table-container">

            {data.length === 0 ? (

                /*
                ==========================================
                Empty State
                ==========================================
                */

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

                    {/* ======================================
                        Table
                    ====================================== */}

                    <div className="data-table-wrapper">

                        <table className="data-table">

                            {/* ==================================
                                Table Header
                            ================================== */}

                            <thead>

                                <tr>

                                    {columns.map(
                                        (column) => (

                                            <th
                                                key={
                                                    column.key
                                                }
                                                className={
                                                    getColumnClassName(
                                                        column
                                                    )
                                                }
                                            >
                                                {column.label}
                                            </th>

                                        )
                                    )}

                                </tr>

                            </thead>


                            {/* ==================================
                                Table Body
                            ================================== */}

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
                                                        className={
                                                            column.className ||
                                                            ""
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


                    {/* ======================================
                        Pagination
                    ====================================== */}

                    <div className="data-table-pagination">

                        {/* ==================================
                            Rows Per Page
                        ================================== */}

                        <div className="data-table-page-size">

                            <span>
                                Show
                            </span>

                            <select
                                value={
                                    itemsPerPage
                                }
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


                        {/* ==================================
                            Pagination Buttons
                        ================================== */}

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