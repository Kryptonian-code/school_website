<?php

declare(strict_types=1);

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$basePath = $scriptDir === '/' ? '' : rtrim($scriptDir, '/');
$relativePath = $basePath !== '' && str_starts_with($requestPath, $basePath)
    ? substr($requestPath, strlen($basePath)) ?: '/'
    : $requestPath;

function site_origin(): string
{
    $https = ($_SERVER['HTTPS'] ?? '') !== '' && strtolower((string) $_SERVER['HTTPS']) !== 'off';
    $scheme = $https ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

    return $scheme . '://' . $host;
}

function site_base_url(): string
{
    global $basePath;

    return rtrim(site_origin() . $basePath, '/');
}

function send_plain_text(string $body): void
{
    header('Content-Type: text/plain; charset=utf-8');
    echo $body;
    exit;
}

function open_site_pdo(): ?PDO
{
    $config = require __DIR__ . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'config.php';
    $dbConfig = $config['db'];

    try {
        return new PDO(
            sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                $dbConfig['host'],
                $dbConfig['port'],
                $dbConfig['name']
            ),
            $dbConfig['user'],
            $dbConfig['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    } catch (Throwable) {
        return null;
    }
}

if ($relativePath === '/robots.txt') {
    send_plain_text("User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /backend/\nSitemap: " . site_base_url() . "/sitemap.xml\n");
}

if ($relativePath === '/sitemap.xml') {
    $pdo = open_site_pdo();
    $baseUrl = site_base_url();
    $urls = [
        ['loc' => $baseUrl . '/', 'lastmod' => date('Y-m-d')],
        ['loc' => $baseUrl . '/programmes', 'lastmod' => date('Y-m-d')],
        ['loc' => $baseUrl . '/news', 'lastmod' => date('Y-m-d')],
        ['loc' => $baseUrl . '/staff', 'lastmod' => date('Y-m-d')],
        ['loc' => $baseUrl . '/gallery', 'lastmod' => date('Y-m-d')],
        ['loc' => $baseUrl . '/careers', 'lastmod' => date('Y-m-d')],
        ['loc' => $baseUrl . '/admissions/apply', 'lastmod' => date('Y-m-d')],
    ];

    if ($pdo instanceof PDO) {
        $programmeStatement = $pdo->query("SELECT slug, updated_at FROM programmes ORDER BY updated_at DESC");
        foreach ($programmeStatement?->fetchAll() ?? [] as $row) {
            if (!empty($row['slug'])) {
                $urls[] = [
                    'loc' => $baseUrl . '/programmes/' . rawurlencode((string) $row['slug']),
                    'lastmod' => !empty($row['updated_at']) ? substr((string) $row['updated_at'], 0, 10) : date('Y-m-d'),
                ];
            }
        }

        $postStatement = $pdo->query("SELECT slug, COALESCE(published_at, updated_at, created_at) AS lastmod FROM blog_posts WHERE status = 'published' ORDER BY COALESCE(published_at, updated_at, created_at) DESC");
        foreach ($postStatement?->fetchAll() ?? [] as $row) {
            if (!empty($row['slug'])) {
                $urls[] = [
                    'loc' => $baseUrl . '/news/' . rawurlencode((string) $row['slug']),
                    'lastmod' => !empty($row['lastmod']) ? substr((string) $row['lastmod'], 0, 10) : date('Y-m-d'),
                ];
            }
        }

        $careerStatement = $pdo->query("SELECT slug, COALESCE(updated_at, created_at) AS lastmod FROM careers_vacancies WHERE status = 'published' ORDER BY COALESCE(updated_at, created_at) DESC");
        foreach ($careerStatement?->fetchAll() ?? [] as $row) {
            if (!empty($row['slug'])) {
                $urls[] = [
                    'loc' => $baseUrl . '/careers/' . rawurlencode((string) $row['slug']),
                    'lastmod' => !empty($row['lastmod']) ? substr((string) $row['lastmod'], 0, 10) : date('Y-m-d'),
                ];
            }
        }
    }

    header('Content-Type: application/xml; charset=utf-8');
    echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
    foreach ($urls as $url) {
        echo "  <url>\n";
        echo '    <loc>' . htmlspecialchars($url['loc'], ENT_XML1) . "</loc>\n";
        echo '    <lastmod>' . htmlspecialchars($url['lastmod'], ENT_XML1) . "</lastmod>\n";
        echo "  </url>\n";
    }
    echo "</urlset>";
    exit;
}

$distIndex = __DIR__ . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'index.html';

if (!is_file($distIndex)) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo "The frontend build was not found. Run `npm run build` from the project root, then reload this page.";
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($distIndex);
