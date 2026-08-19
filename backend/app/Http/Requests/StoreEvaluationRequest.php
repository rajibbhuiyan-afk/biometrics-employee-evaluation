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
            'evaluation_period_id' => [
                'required',
                'integer',
                'exists:evaluation_periods,id',
            ],

            'employee_comment' => [
                'nullable',
                'string',
            ],
        ];
    }
}