<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],

            'evaluation_period_id' => [
                'required',
                'integer',
                'exists:evaluation_periods,id',
            ],

            'status' => [
                'nullable',
                'in:draft,submitted,under_review,reviewed,approved,rejected',
            ],

            'employee_comment' => [
                'nullable',
                'string',
            ],
        ];
    }
}