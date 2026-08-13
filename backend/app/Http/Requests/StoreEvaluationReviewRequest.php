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

            'reviewer_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],

            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100',
            ],

            'comment' => [
                'nullable',
                'string',
            ],

            'action' => [
                'required',
                'in:reviewed,approved,rejected,returned',
            ],

            'reviewed_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}