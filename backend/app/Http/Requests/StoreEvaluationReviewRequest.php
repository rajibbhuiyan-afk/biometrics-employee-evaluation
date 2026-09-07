<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            /*
            |--------------------------------------------------------------------------
            | Evaluation
            |--------------------------------------------------------------------------
            */

            'evaluation_id' => [
                'required',
                'integer',
                'exists:evaluations,id',
            ],


            /*
            |--------------------------------------------------------------------------
            | Reviews
            |--------------------------------------------------------------------------
            */

            'reviews' => [
                'required',
                'array',
                'min:1',
            ],


            /*
            |--------------------------------------------------------------------------
            | Question ID
            |--------------------------------------------------------------------------
            */

            'reviews.*.question_id' => [
                'required',
                'integer',
                'exists:evaluation_questions,id',
            ],


            /*
            |--------------------------------------------------------------------------
            | Review Result
            |--------------------------------------------------------------------------
            |
            | okay     = Accept
            | not_okay = Reject
            | ignore   = Ignore
            |
            */

            'reviews.*.review_result' => [
                'required',
                'in:okay,not_okay,ignore',
            ],


            /*
            |--------------------------------------------------------------------------
            | Rating
            |--------------------------------------------------------------------------
            |
            | Accept → Rating required
            | Reject → Rating not required
            | Ignore → Rating not required
            |
            */

            'reviews.*.rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10',
                'required_if:reviews.*.review_result,okay',
            ],


            /*
            |--------------------------------------------------------------------------
            | Comment
            |--------------------------------------------------------------------------
            |
            | Accept → Comment optional
            | Reject → Comment required
            | Ignore → Comment not required
            |
            */

            'reviews.*.comment' => [
                'nullable',
                'string',
                'required_if:reviews.*.review_result,not_okay',
            ],


            /*
            |--------------------------------------------------------------------------
            | Overall Rating
            |--------------------------------------------------------------------------
            */

            'overall_rating' => [
                'required',
                'numeric',
                'min:0',
                'max:10',
            ],


            /*
            |--------------------------------------------------------------------------
            | Overall Comment
            |--------------------------------------------------------------------------
            */

            'overall_comment' => [
                'nullable',
                'string',
            ],


            /*
            |--------------------------------------------------------------------------
            | Final Action
            |--------------------------------------------------------------------------
            */

            'action' => [
                'required',
                'in:approved,rejected',
            ],


            /*
            |--------------------------------------------------------------------------
            | Reviewed At
            |--------------------------------------------------------------------------
            */

            'reviewed_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}