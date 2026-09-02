<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationAnswerRequest extends FormRequest
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

            'question_id' => [
                'required',
                'integer',
                'exists:evaluation_questions,id',
            ],

            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10',
            ],

            'answer' => [
                'nullable',
                'string',
            ],

            'comment' => [
                'nullable',
                'string',
            ],
        ];
    }
}