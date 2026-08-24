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

            'rating' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],

            'comment' => [
                'required',
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