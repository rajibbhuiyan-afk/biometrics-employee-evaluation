<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <title>Employee Self Evaluation</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 9mm 9mm 9mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #222;
            margin: 0;
            padding: 0;
        }

        .page {
            width: 100%;
        }

        /* =========================
           TITLE
        ========================== */

        .title-section {
            text-align: center;
            margin-bottom: 7px;
        }

        .title {
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
        }

        .period {
            font-size: 9px;
            margin-top: 2px;
            color: #555;
        }

        /* =========================
           COMMON SECTION
        ========================== */

        .section {
            border: 1px solid #bfc4ca;
            margin-bottom: 6px;
            width: 100%;
        }

        .section-title {
            background: #f1f3f5;
            border-bottom: 1px solid #bfc4ca;
            padding: 4px 6px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .section-body {
            padding: 5px 6px;
        }

        /* =========================
           EMPLOYEE INFORMATION
        ========================== */

        .employee-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .employee-table td {
            padding: 2px 3px;
            vertical-align: middle;
            font-size: 9px;
            line-height: 1.25;
        }

        .employee-label {
            font-weight: bold;
            color: #444;
            white-space: nowrap;
        }

        /* =========================
           EVALUATION SUMMARY
        ========================== */

        .summary-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .summary-table td {
            padding: 3px 3px;
            font-size: 8.5px;
            vertical-align: middle;
            white-space: nowrap;
        }

        .summary-label {
            font-weight: bold;
            color: #444;
        }

        .status {
            font-weight: bold;
            text-transform: capitalize;
        }

        /* =========================
           QUESTIONS
        ========================== */

        .questions-section {
            border: 1px solid #bfc4ca;
            margin-bottom: 6px;
        }

        .questions-title {
            background: #f1f3f5;
            border-bottom: 1px solid #bfc4ca;
            padding: 4px 6px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .questions-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .questions-table th,
        .questions-table td {
            border: 1px solid #d5d9dd;
            padding: 2.5px 3px;
            vertical-align: middle;
        }

        .questions-table th {
            background: #f8f9fa;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            line-height: 1.2;
        }

        .questions-table td {
            font-size: 8px;
            line-height: 1.2;
        }

        .col-number {
            width: 4%;
            text-align: center;
        }

        .col-question {
            width: 27%;
        }

        .col-answer {
            width: 37%;
        }

        .col-rating {
            width: 8%;
            text-align: center;
        }

        .question-text {
            line-height: 1.2;
            word-wrap: break-word;
        }

        .answer-text {
            line-height: 1.2;
            word-wrap: break-word;
        }

        .rating {
            text-align: center;
            font-weight: bold;
        }

        /* =========================
           REVIEW SUMMARY
        ========================== */

        .review-summary-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .review-summary-table td {
            padding: 3px 4px;
            text-align: center;
            font-size: 9px;
        }

        .review-role {
            font-weight: bold;
        }

        .review-rating {
            font-weight: bold;
            margin-top: 1px;
        }

        /* =========================
           SIGNATURE
        ========================== */

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-top: 7px;
        }

        .signature-table td {
            width: 33.33%;
            text-align: center;
            vertical-align: bottom;
            padding: 4px 15px;
        }

        .signature-line {
            border-top: 1px solid #333;
            padding-top: 3px;
            margin-top: 13px;
            font-size: 8px;
        }

        .signature-role {
            font-weight: bold;
            font-size: 9px;
        }

        .no-break {
            page-break-inside: avoid;
        }
    </style>
</head>

<body>

<div class="page">

    @php

        /*
        |--------------------------------------------------------------------------
        | Latest overall review for each stage
        |--------------------------------------------------------------------------
        */

        $managementOverall = $stageReviews
            ->where('reviewer_role', 'Management')
            ->sortByDesc('reviewed_at')
            ->first();

        $hrOverall = $stageReviews
            ->where('reviewer_role', 'HR')
            ->sortByDesc('reviewed_at')
            ->first();

        $managerOverall = $stageReviews
            ->where('reviewer_role', 'Manager')
            ->sortByDesc('reviewed_at')
            ->first();


        /*
        |--------------------------------------------------------------------------
        | Final Overall Rating
        |--------------------------------------------------------------------------
        | Priority:
        | Management -> HR -> Manager
        |--------------------------------------------------------------------------
        */

        $finalOverallReview =
            $managementOverall ??
            $hrOverall ??
            $managerOverall;

        $finalOverallRating =
            $finalOverallReview?->rating;


        /*
        |--------------------------------------------------------------------------
        | Completed Date
        |--------------------------------------------------------------------------
        | Current schema does not have completed_at.
        | So updated_at is used temporarily.
        |--------------------------------------------------------------------------
        */

        $completedDate = null;

        if (($evaluation->status ?? null) === 'completed') {
            $completedDate = $evaluation->updated_at;
        }


        

    @endphp


    <!-- =========================================================
         TITLE
    ========================================================== -->

    <div class="title-section">

        <div class="title">
            Employee Self Evaluation
        </div>

        <div class="period">
            {{ $evaluation->evaluationPeriod->name ?? '-' }}
        </div>

    </div>


    <!-- =========================================================
         EMPLOYEE INFORMATION
    ========================================================== -->

    <div class="section no-break">

        <div class="section-title">
            Employee Information
        </div>

        <div class="section-body">

            <table class="employee-table">

                <!-- LINE 1 -->

                <tr>

                    <td class="employee-label" style="width: 12%;">
                        Employee ID
                    </td>

                    <td style="width: 21%;">
                        {{ $evaluation->employee->employee_id ?? '-' }}
                    </td>

                    <td class="employee-label" style="width: 8%;">
                        Name
                    </td>

                    <td style="width: 24%;">
                        {{ $evaluation->employee->name ?? '-' }}
                    </td>

                    <td class="employee-label" style="width: 8%;">
                        Gender
                    </td>

                    <td style="width: 27%;">
                        {{ ucfirst($evaluation->employee->gender ?? '-') }}
                    </td>

                </tr>


                <!-- LINE 2 -->

                <tr>

                    <td class="employee-label">
                        Department
                    </td>

                    <td>
                        {{ $evaluation->employee->department->name ?? '-' }}
                    </td>

                    <td class="employee-label">
                        Position
                    </td>

                    <td>
                        {{ $evaluation->employee->position->title ?? '-' }}
                    </td>

                    <td class="employee-label">
                        Mobile
                    </td>

                    <td>                    
                        {{ $evaluation->employee->employeeProfile->mobile_number ?? '-' }}
                    </td>

                </tr>

            </table>

        </div>

    </div>


    <!-- =========================================================
         EVALUATION SUMMARY
    ========================================================== -->

    <div class="section no-break">

        <div class="section-title">
            Evaluation Summary
        </div>

        <div class="section-body">

            <table class="summary-table">

                <tr>

                    <!-- Overall Rating -->

                    <td class="summary-label" style="width: 13%;">
                        Overall Rating
                    </td>

                    <td style="width: 15%;">

                        @if($finalOverallRating !== null)

                            {{ number_format(
                                (float) $finalOverallRating,
                                2
                            ) }} / 10

                        @else

                            -

                        @endif

                    </td>


                    <!-- Status -->

                    <td class="summary-label" style="width: 7%;">
                        Status
                    </td>

                    <td style="width: 16%;">

                        <span class="status">
                            {{ str_replace(
                                '_',
                                ' ',
                                $evaluation->status ?? '-'
                            ) }}
                        </span>

                    </td>


                    <!-- Completed Date -->

                    <td class="summary-label" style="width: 14%;">
                        Completed Date
                    </td>

                    <td style="width: 14%;">

                        @if($completedDate)

                            {{ $completedDate->format('d M Y') }}

                        @else

                            -

                        @endif

                    </td>


                   

                </tr>

            </table>

        </div>

    </div>


    <!-- =========================================================
         QUESTIONS & RATINGS
    ========================================================== -->

    <div class="questions-section">

        <div class="questions-title">
            Questions & Ratings
        </div>

        <table class="questions-table">

            <thead>

                <tr>

                    <th class="col-number">
                        #
                    </th>

                    <th class="col-question">
                        Question
                    </th>

                    <th class="col-answer">
                        Answer
                    </th>

                    <th class="col-rating">
                        Self
                    </th>

                    <th class="col-rating">
                        Manager
                    </th>

                    <th class="col-rating">
                        HR
                    </th>

                    <th class="col-rating">
                        Mgmt
                    </th>

                </tr>

            </thead>


            <tbody>

                @foreach($evaluation->answers as $index => $answer)

                    @php

                        $question = $answer->question;


                        /*
                        |--------------------------------------------------------------------------
                        | Employee Self Rating
                        |--------------------------------------------------------------------------
                        */

                        $selfRating = $answer->rating ?? null;


                        /*
                        |--------------------------------------------------------------------------
                        | Manager Question Review
                        |--------------------------------------------------------------------------
                        */

                        $managerReview = $questionReviews
                            ->where(
                                'question_id',
                                $answer->question_id
                            )
                            ->where(
                                'reviewer_role',
                                'Manager'
                            )
                            ->sortByDesc('reviewed_at')
                            ->first();


                        /*
                        |--------------------------------------------------------------------------
                        | HR Question Review
                        |--------------------------------------------------------------------------
                        */

                        $hrReview = $questionReviews
                            ->where(
                                'question_id',
                                $answer->question_id
                            )
                            ->where(
                                'reviewer_role',
                                'HR'
                            )
                            ->sortByDesc('reviewed_at')
                            ->first();


                        /*
                        |--------------------------------------------------------------------------
                        | Management Question Review
                        |--------------------------------------------------------------------------
                        */

                        $managementReview = $questionReviews
                            ->where(
                                'question_id',
                                $answer->question_id
                            )
                            ->where(
                                'reviewer_role',
                                'Management'
                            )
                            ->sortByDesc('reviewed_at')
                            ->first();

                    @endphp


                    <tr>

                        <!-- Number -->

                        <td class="col-number">
                            {{ $index + 1 }}
                        </td>


                        <!-- Question -->

                        <td class="question-text">
                            {{ $question->question ?? '-' }}
                        </td>


                        <!-- Answer -->

                        <td class="answer-text">
                            {{ $answer->answer ?? '-' }}
                        </td>


                        <!-- Self Rating -->

                        <td class="rating">

                            @if($selfRating !== null)

                                {{ $selfRating }}

                            @else

                                -

                            @endif

                        </td>


                        <!-- Manager Rating -->

                        <td class="rating">

                            @if($managerReview?->rating !== null)

                                {{ $managerReview->rating }}

                            @else

                                -

                            @endif

                        </td>


                        <!-- HR Rating -->

                        <td class="rating">

                            @if($hrReview?->rating !== null)

                                {{ $hrReview->rating }}

                            @else

                                -

                            @endif

                        </td>


                        <!-- Management Rating -->

                        <td class="rating">

                            @if($managementReview?->rating !== null)

                                {{ $managementReview->rating }}

                            @else

                                -

                            @endif

                        </td>

                    </tr>

                @endforeach

            </tbody>

        </table>

    </div>


    <!-- =========================================================
         REVIEW SUMMARY
    ========================================================== -->

    <div class="section no-break">

        <div class="section-title">
            Review Summary
        </div>

        <div class="section-body">

            <table class="review-summary-table">

                <tr>

                    <!-- Manager -->

                    <td>

                        <div class="review-role">
                            Manager
                        </div>

                        <div class="review-rating">

                            @if($managerOverall?->rating !== null)

                                {{ number_format(
                                    (float) $managerOverall->rating,
                                    2
                                ) }} / 10

                            @else

                                -

                            @endif

                        </div>

                    </td>


                    <!-- HR -->

                    <td>

                        <div class="review-role">
                            HR
                        </div>

                        <div class="review-rating">

                            @if($hrOverall?->rating !== null)

                                {{ number_format(
                                    (float) $hrOverall->rating,
                                    2
                                ) }} / 10

                            @else

                                -

                            @endif

                        </div>

                    </td>


                    <!-- Management -->

                    <td>

                        <div class="review-role">
                            Management
                        </div>

                        <div class="review-rating">

                            @if($managementOverall?->rating !== null)

                                {{ number_format(
                                    (float) $managementOverall->rating,
                                    2
                                ) }} / 10

                            @else

                                -

                            @endif

                        </div>

                    </td>

                </tr>

            </table>


            <!-- =================================================
                 SIGNATURES
            ================================================== -->

            <table class="signature-table">

                <tr>

                    <!-- Manager -->

                    <td>

                        <div class="signature-line">

                            <div class="signature-role">
                                Manager
                            </div>

                            Signature

                        </div>

                    </td>


                    <!-- HR -->

                    <td>

                        <div class="signature-line">

                            <div class="signature-role">
                                HR
                            </div>

                            Signature

                        </div>

                    </td>


                    <!-- Management -->

                    <td>

                        <div class="signature-line">

                            <div class="signature-role">
                                Management
                            </div>

                            Signature

                        </div>

                    </td>

                </tr>

            </table>

        </div>

    </div>


</div>

</body>
</html>
