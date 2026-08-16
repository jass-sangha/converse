<?php

use Converse\Chat\Support\ChatConfig;

it('renders chat.theme.overrides as an inline style block scoped to the mount element', function () {
    config(['chat.theme.overrides' => ['accent' => '1 2 3', 'accentContrast' => '4 5 6']]);

    expect(ChatConfig::themeOverrideStyles())
        ->toBe('<style>#converse-chat-app{--cv-accent: 1 2 3;--cv-accent-contrast: 4 5 6;}</style>');
});

it('returns an empty string when no overrides are configured', function () {
    config(['chat.theme.overrides' => []]);

    expect(ChatConfig::themeOverrideStyles())->toBe('');
});
