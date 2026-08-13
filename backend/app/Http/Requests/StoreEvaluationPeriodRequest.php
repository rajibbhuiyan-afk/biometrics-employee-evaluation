<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],

            'start_date' => ['required', 'date'],

            'end_date' => [
                'required',
                'date',
                'after_or_equal:start_date',
            ],

            'submission_start_date' => [
                'required',
                'date',
                'after_or_equal:start_date',
            ],

            'submission_end_date' => [
                'required',
                'date',
                'after_or_equal:submission_start_date',
                'before_or_equal:end_date',
            ],

            'status' => [
                'nullable',
                'in:draft,active,closed',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ];
    }
}