<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Plan Limits
    |--------------------------------------------------------------------------
    |
    | Feature limits per license plan. `null` means unlimited. This file only
    | defines what each plan is allowed — the install's *current* plan lives
    | in the license table (see the License model / LicenseServiceInterface),
    | not here, so upgrading never means editing this file.
    |
    */
    'plans' => [
        'free' => [
            // 2 total participants is effectively direct-message only — any attempt to
            // grow a conversation past that (i.e. an actual group) is blocked.
            'max_group_participants' => 2,
            'history_days' => 30,
            'show_branding' => true,
        ],
        'paid' => [
            'max_group_participants' => null,
            'history_days' => null,
            'show_branding' => false,
        ],
    ],

];
