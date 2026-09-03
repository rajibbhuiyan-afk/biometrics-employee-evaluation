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
            'evaluation_id' => [
                'required',
                'integer',
                'exists:evaluations,id',
            ],

            'reviews' => [
                'required',
                'array',
                'min:1',
            ],

            'reviews.*.question_id' => [
                'required',
                'integer',
                'exists:evaluation_questions,id',
            ],

            'reviews.*.review_result' => [
                'required',
                'in:okay,not_okay',
            ],

            'reviews.*.rating' => [
                'required',
                'numeric',
                'min:0',
                'max:10',
            ],

            'reviews.*.comment' => [
                'nullable',
                'string',
                'required_if:reviews.*.review_result,not_okay',
            ],

            'overall_rating' => [
                'required',
                'numeric',
                'min:0',
                'max:10',
            ],

            'overall_comment' => [
                'nullable',
                'string',
            ],

            'action' => [
                'required',
                'in:approved,rejected,returned',
            ],

            'reviewed_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}