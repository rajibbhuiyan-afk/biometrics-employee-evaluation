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
            | Question Reviews
            |--------------------------------------------------------------------------
            */

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
            | Stage Action
            |--------------------------------------------------------------------------
            */

            'action' => [
                'required',
                'in:approved,rejected,returned',
            ],


            /*
            |--------------------------------------------------------------------------
            | Review Date
            |--------------------------------------------------------------------------
            */

            'reviewed_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}