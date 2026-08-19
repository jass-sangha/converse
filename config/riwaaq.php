<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Free-Tier Limits
    |--------------------------------------------------------------------------
    |
    | Defaults for this package on its own. `null` means unlimited. These are
    | always what's in effect unless the `riwaaq-pro` add-on is installed —
    | see RiwaaqLimitsInterface / RiwaaqLimits for the extension point
    | that lets it override these values, and the "Extension point" section
    | of the README for how to build against it.
    |
    */
    // Conversations may grow to at most 10 total participants; any attempt to add
    // beyond that is blocked.
    'max_group_participants' => 10,
    'show_branding' => true,

];
