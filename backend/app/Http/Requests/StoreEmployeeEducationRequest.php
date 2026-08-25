<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeEducationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [

            'degree' => [
                'required',
                'string',
                'max:255',
            ],

            'institution_name' => [
                'required',
                'string',
                'max:255',
            ],

            'subject' => [
                'nullable',
                'string',
                'max:255',
            ],

            'board_university' => [
                'nullable',
                'string',
                'max:255',
            ],

            'passing_year' => [
                'nullable',
                'integer',
                'min:1950',
                'max:' . date('Y'),
            ],

            'result' => [
                'nullable',
                'string',
                'max:100',
            ],

            'certificate_number' => [
                'nullable',
                'string',
                'max:100',
            ],

            'achievement' => [
                'nullable',
                'string',
            ],
        ];
    }
}