export const detectReviewerRole = () => {
    const path =
        window.location.pathname.toLowerCase();

    if (path.includes("/hr/")) {
        return "HR";
    }

    if (
        path.includes("/management/management/") ||
        path.includes("/management/review/") ||
        path.includes("/management/evaluations/")
    ) {
        return "Management";
    }

    return "Manager";
};


export const getRoleLabel = (
    reviewerRole
) => {
    if (reviewerRole === "HR") {
        return "HR";
    }

    if (
        reviewerRole === "Management"
    ) {
        return "Management";
    }

    return "Manager";
};


export const getReviewByQuestion = (
    reviews,
    questionId,
    role
) => {
    if (
        !Array.isArray(reviews)
    ) {
        return null;
    }

    return (
        reviews
            .filter(
                (review) =>
                    Number(
                        review.question_id
                    ) ===
                        Number(questionId) &&
                    String(
                        review.reviewer_role
                    ).toLowerCase() ===
                        role.toLowerCase()
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.reviewed_at
                    ) -
                    new Date(
                        a.reviewed_at
                    )
            )[0] || null
    );
};


export const getOverallReviewByRole = (
    reviews,
    role
) => {
    if (
        !Array.isArray(reviews)
    ) {
        return null;
    }

    return (
        reviews
            .filter(
                (review) =>
                    String(
                        review.reviewer_role
                    ).toLowerCase() ===
                        role.toLowerCase() &&
                    (
                        review.question_id ===
                            null ||
                        review.question_id ===
                            undefined
                    )
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.reviewed_at
                    ) -
                    new Date(
                        a.reviewed_at
                    )
            )[0] || null
    );
};