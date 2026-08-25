<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'father_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'mother_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'date_of_birth' => [
                'nullable',
                'date',
            ],

            'gender' => [
                'nullable',
                'string',
                'max:50',
            ],

            'blood_group' => [
                'nullable',
                'string',
                'max:10',
            ],

            'nationality' => [
                'nullable',
                'string',
                'max:100',
            ],

            'religion' => [
                'nullable',
                'string',
                'max:100',
            ],

            'marital_status' => [
                'nullable',
                'string',
                'max:50',
            ],

            'nid' => [
                'nullable',
                'string',
                'max:50',
            ],

            'passport_number' => [
                'nullable',
                'string',
                'max:50',
            ],

            'driving_license_number' => [
                'nullable',
                'string',
                'max:50',
            ],

            'personal_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'mobile_number' => [
                'nullable',
                'string',
                'max:30',
            ],

            'emergency_contact_number' => [
                'nullable',
                'string',
                'max:30',
            ],

            'emergency_contact_person' => [
                'nullable',
                'string',
                'max:255',
            ],

            'emergency_contact_relationship' => [
                'nullable',
                'string',
                'max:100',
            ],

            'present_address' => [
                'nullable',
                'string',
            ],

            'permanent_address' => [
                'nullable',
                'string',
            ],
        ];
    }
}