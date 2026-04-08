<?php

function load_project_env(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $values = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $trimmed, 2);
        $key = trim($key);
        $value = trim($value);
        if ($key === '') {
            continue;
        }

        $values[$key] = trim($value, " \t\n\r\0\x0B\"'");
    }

    return $values;
}

function env_value(array $fileEnv, string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }

    if (array_key_exists($key, $fileEnv) && $fileEnv[$key] !== '') {
        return $fileEnv[$key];
    }

    return $default;
}

function csv_values(?string $value): array
{
    if ($value === null) {
        return [];
    }

    return array_values(array_filter(array_map(
        static fn (string $item): string => trim($item),
        explode(',', $value)
    )));
}

function normalize_origin(?string $value): ?string
{
    $trimmed = trim((string) $value);
    if ($trimmed === '') {
        return null;
    }

    $parts = parse_url($trimmed);
    if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
        return null;
    }

    $origin = strtolower($parts['scheme']) . '://' . strtolower($parts['host']);
    if (!empty($parts['port'])) {
        $origin .= ':' . (int) $parts['port'];
    }

    return $origin;
}

function normalize_host(?string $value): ?string
{
    $trimmed = strtolower(trim((string) $value));
    if ($trimmed === '') {
        return null;
    }

    if (str_contains($trimmed, '://')) {
        $host = parse_url($trimmed, PHP_URL_HOST);
        return is_string($host) && $host !== '' ? strtolower($host) : null;
    }

    return ltrim($trimmed, '.');
}

$projectEnv = load_project_env(dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env');
$siteUrl = env_value($projectEnv, 'APP_URL', env_value($projectEnv, 'SITE_URL'));
$siteOrigin = normalize_origin($siteUrl);
$siteHost = normalize_host($siteOrigin);

$allowedOrigins = csv_values(env_value(
    $projectEnv,
    'ALLOWED_ORIGINS',
    $siteOrigin ?? 'http://localhost:8080,http://127.0.0.1:8080,http://localhost,http://127.0.0.1'
));

$defaultRedirectHosts = array_values(array_filter([
    $siteHost,
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'x.com',
    'youtube.com',
    'youtu.be',
    'linkedin.com',
    'wa.me',
    'whatsapp.com',
]));

$defaultEmbedHosts = array_values(array_filter([
    $siteHost,
    'google.com',
    'maps.google.com',
    'youtube.com',
    'youtu.be',
]));

return [
    'db' => [
        'host' => env_value($projectEnv, 'DB_HOST', '127.0.0.1'),
        'port' => env_value($projectEnv, 'DB_PORT', '3306'),
        'name' => env_value($projectEnv, 'DB_NAME', 'school_website'),
        'user' => env_value($projectEnv, 'DB_USER', 'root'),
        'password' => env_value($projectEnv, 'DB_PASSWORD', ''),
    ],
    'cors' => [
        'allowed_origins' => $allowedOrigins,
    ],
    'security' => [
        'site_origin' => $siteOrigin,
        'allowed_redirect_hosts' => array_values(array_filter(array_map(
            'normalize_host',
            csv_values(env_value(
                $projectEnv,
                'ALLOWED_REDIRECT_HOSTS',
                implode(',', $defaultRedirectHosts)
            ))
        ))),
        'allowed_embed_hosts' => array_values(array_filter(array_map(
            'normalize_host',
            csv_values(env_value(
                $projectEnv,
                'ALLOWED_EMBED_HOSTS',
                implode(',', $defaultEmbedHosts)
            ))
        ))),
    ],
];
