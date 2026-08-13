<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => [
                'required',
                'integer',
                'exists:evaluation_categories,id',
            ],

            'question' => [
                'required',
                'string',
            ],

            'question_type' => [
                'required',
                'in:rating,text,yes_no',
            ],

            'max_rating' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],

            'weight' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999.99',
            ],

            'is_required' => [
                'nullable',
                'boolean',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'status' => [
                'nullable',
                'boolean',
            ],
        ];
    }
}