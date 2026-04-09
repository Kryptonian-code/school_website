<?php

declare(strict_types=1);

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow', true);
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
if (!empty($config['security']['content_security_policy'])) {
    header('Content-Security-Policy: ' . $config['security']['content_security_policy']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && (in_array($origin, $config['cors']['allowed_origins'], true) || is_same_site_origin($origin))) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_name('prestige_admin_session');
session_start([
    'cookie_secure' => is_https_request(),
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'use_strict_mode' => true,
]);
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

try {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $config['db']['host'],
        $config['db']['port'],
        $config['db']['name']
    );

    $pdo = new PDO($dsn, $config['db']['user'], $config['db']['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    ensure_local_auth_schema($pdo);
    ensure_admin_management_schema($pdo);
    ensure_password_recovery_schema($pdo);
    ensure_admissions_review_schema($pdo);
    ensure_activity_log_schema($pdo);
    ensure_careers_schema($pdo);
    ensure_careers_settings($pdo);
} catch (Throwable $exception) {
    $pdo = null;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '', '/');
$backendIndex = strpos($path, 'backend');
$route = $backendIndex === false ? '' : trim(substr($path, $backendIndex + 7), '/');
$segments = $route === '' ? [] : explode('/', $route);
$body = read_json_body();

try {
    if ($method === 'GET' && $route === 'site/bootstrap') {
        $scope = query_param('scope', 'full');
        if (!($pdo instanceof PDO)) {
            if ($scope === 'settings') {
                respond([
                    'settings' => [],
                ]);
            }

            respond([
                'settings' => [],
                'programmes' => [],
                'staff' => [],
                'faqs' => [],
                'posts' => [],
                'facilities' => [],
                'testimonials' => [],
                'galleryItems' => [],
            ]);
        }

        if ($scope === 'settings') {
            respond([
                'settings' => get_settings($pdo),
            ]);
        }
        respond([
            'settings' => get_settings($pdo),
            'programmes' => get_programmes($pdo),
            'staff' => get_staff($pdo, false),
            'faqs' => get_faqs($pdo, false),
            'posts' => get_posts($pdo, false),
            'facilities' => get_facilities($pdo, false),
            'testimonials' => get_testimonials($pdo, false),
            'galleryItems' => get_gallery_items($pdo, false),
        ]);
    }

    if ($method === 'GET' && $route === 'public/blog-posts') {
        if (!($pdo instanceof PDO)) {
            respond([
                'items' => [],
                'pagination' => pagination_payload(1, 6, 0),
            ]);
        }
        respond(get_public_posts_response($pdo));
    }

    if ($method === 'GET' && $route === 'public/programmes') {
        if (!($pdo instanceof PDO)) {
            respond([
                'items' => [],
                'pagination' => pagination_payload(1, 12, 0),
            ]);
        }
        respond(get_public_programmes_response($pdo));
    }

    if ($method === 'GET' && $route === 'public/staff') {
        if (!($pdo instanceof PDO)) {
            respond(['items' => []]);
        }
        respond(['items' => get_staff($pdo, true)]);
    }

    if ($method === 'GET' && $route === 'public/gallery-items') {
        if (!($pdo instanceof PDO)) {
            respond(['items' => []]);
        }
        respond(['items' => get_gallery_items($pdo, false)]);
    }

    if ($method === 'GET' && $route === 'public/careers') {
        if (!($pdo instanceof PDO)) {
            respond([
                'items' => [],
                'pagination' => pagination_payload(1, 9, 0),
                'filters' => [
                    'departments' => [],
                    'employment_types' => [],
                ],
            ]);
        }
        respond(get_public_careers_response($pdo));
    }

    if ($method === 'GET' && count($segments) === 3 && ($segments[0] ?? '') === 'public' && ($segments[1] ?? '') === 'blog-posts') {
        $statement = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1");
        $statement->execute([(string) $segments[2]]);
        respond(['item' => $statement->fetch() ?: null]);
    }

    if ($method === 'GET' && count($segments) === 3 && ($segments[0] ?? '') === 'public' && ($segments[1] ?? '') === 'programmes') {
        $statement = $pdo->prepare('SELECT * FROM programmes WHERE slug = ? LIMIT 1');
        $statement->execute([(string) $segments[2]]);
        $item = $statement->fetch() ?: null;
        if (!$item) {
            respond(['item' => null], 404);
        }
        respond(['item' => normalize_programme_row($item)]);
    }

    if ($method === 'GET' && count($segments) === 3 && ($segments[0] ?? '') === 'public' && ($segments[1] ?? '') === 'careers') {
        $statement = $pdo->prepare("SELECT * FROM careers_vacancies WHERE slug = ? AND status = 'published' LIMIT 1");
        $statement->execute([(string) $segments[2]]);
        $item = $statement->fetch() ?: null;
        if (!$item) {
            respond(['item' => null], 404);
        }
        respond(['item' => normalize_career_vacancy_row($item)]);
    }

    if ($method === 'GET' && $route === 'auth/session') {
        respond(['user' => current_admin(), 'csrf_token' => $_SESSION['csrf_token']]);
    }

    if ($method === 'GET' && $route === 'auth/setup-status') {
        respond(['has_admin' => has_available_admin($pdo)]);
    }

    if ($method === 'POST' && $route === 'auth/login') {
        assert_rate_limit('auth-login', 6, 300);
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($username === '' || $password === '') {
            respond(['message' => 'Username and password are required.'], 422);
        }

        validate_username($username);
        $admin = find_admin_by_username($pdo, $username);

        if (!$admin || !verify_password($password, (string) $admin['password_salt'], (string) $admin['password_hash'])) {
            respond(['message' => 'Invalid username or password.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['admin_name'] = $admin['display_name'];
        $_SESSION['admin_email'] = $admin['email'] ?? null;
        $_SESSION['admin_role'] = $admin['role'];

        respond([
            'user' => [
                'id' => (int) $admin['id'],
                'username' => $admin['username'],
                'display_name' => $admin['display_name'],
                'email' => $admin['email'] ?? null,
                'role' => $admin['role'],
            ],
            'csrf_token' => $_SESSION['csrf_token'],
        ]);
    }

    if ($method === 'POST' && $route === 'auth/bootstrap-admin') {
        assert_rate_limit('auth-bootstrap', 3, 900);
        if (!$pdo instanceof PDO) {
            respond(['message' => 'Database connection failed. Start MySQL before creating a local admin account.'], 500);
        }
        if (count_rows($pdo, 'admins') > 0) {
            respond(['message' => 'An admin account already exists.'], 409);
        }

        $username = trim((string) ($body['username'] ?? ''));
        $displayName = trim((string) ($body['display_name'] ?? ''));
        $email = nullable_string($body['email'] ?? null);
        $password = (string) ($body['password'] ?? '');

        validate_required([
            'username' => $username,
            'display_name' => $displayName,
            'password' => $password,
        ], ['username', 'display_name', 'password']);
        validate_username($username);
        validate_text_length($displayName, 2, 80, 'Display name');
        if ($email !== null) {
            validate_email($email);
        }
        validate_password_strength($password);

        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha512', $password, $salt, 120000, 64);

        $statement = $pdo->prepare('INSERT INTO admins (username, display_name, email, role, password_salt, password_hash) VALUES (?, ?, ?, ?, ?, ?)');
        $statement->execute([$username, $displayName, $email, 'admin', $salt, $hash]);
        respond(['success' => true], 201);
    }

    if ($method === 'POST' && $route === 'auth/recover-password') {
        $username = trim((string) ($body['username'] ?? ''));
        $recoveryKey = strtoupper(trim((string) ($body['recovery_key'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        validate_required([
            'username' => $username,
            'recovery_key' => $recoveryKey,
            'password' => $password,
        ], ['username', 'recovery_key', 'password']);
        validate_username($username);
        validate_password_strength($password);
        assert_subject_rate_limit('auth-recovery', strtolower($username), 3, 3600);

        $admin = find_admin_by_username($pdo, $username);
        if (
            !$admin
            || empty($admin['recovery_key_hash'])
            || empty($admin['recovery_key_salt'])
            || !verify_password($recoveryKey, (string) $admin['recovery_key_salt'], (string) $admin['recovery_key_hash'])
        ) {
            respond(['message' => 'The recovery details were invalid.'], 401);
        }

        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha512', $password, $salt, 120000, 64);
        $statement = $pdo->prepare('UPDATE admins SET password_salt = ?, password_hash = ?, recovery_key_salt = NULL, recovery_key_hash = NULL, recovery_key_created_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $statement->execute([$salt, $hash, (int) $admin['id']]);
        log_activity($pdo, 'recover', 'admin_user_password', (int) $admin['id'], 'Recovered password for ' . $admin['username']);

        respond([
            'success' => true,
            'message' => 'Your password has been reset. Sign in with the new password.',
        ]);
    }

    if ($method === 'POST' && $route === 'auth/logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        respond(['success' => true]);
    }

    if ($method === 'POST' && $route === 'telemetry/client-error') {
        assert_rate_limit('client-error-log', 20, 300);
        $message = trim((string) ($body['message'] ?? 'Client-side application error'));
        $context = $body['context'] ?? [];
        $stack = trim((string) ($body['stack'] ?? ''));
        $payload = [
            'message' => $message !== '' ? mb_substr($message, 0, 500) : 'Client-side application error',
            'url' => trim((string) ($body['url'] ?? '')),
            'user_agent' => trim((string) ($body['userAgent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? ''))),
            'timestamp' => trim((string) ($body['timestamp'] ?? date(DATE_ATOM))),
            'context' => is_array($context) ? $context : [],
        ];

        if ($stack !== '') {
            $payload['stack'] = mb_substr($stack, 0, 4000);
        }

        error_log('[client-error] ' . json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        respond(['success' => true], 202);
    }

    if ($method === 'POST' && $route === 'enquiries') {
        assert_rate_limit('public-enquiries', 8, 600);
        $payload = [
            'name' => trim((string) ($body['name'] ?? '')),
            'email' => trim((string) ($body['email'] ?? '')),
            'phone' => nullable_string($body['phone'] ?? null),
            'subject' => nullable_string($body['subject'] ?? null),
            'message' => trim((string) ($body['message'] ?? '')),
            'type' => trim((string) ($body['type'] ?? 'contact')),
        ];
        validate_required($payload, ['name', 'email', 'message', 'type']);
        validate_email($payload['email']);
        validate_text_length($payload['name'], 2, 100, 'Name');
        if ($payload['phone']) {
            validate_phone((string) $payload['phone'], 'Phone number');
        }
        if ($payload['subject']) {
            validate_text_length((string) $payload['subject'], 2, 150, 'Subject');
        }
        validate_text_length($payload['message'], 10, 2500, 'Message');
        validate_enum($payload['type'], ['contact', 'admission', 'general'], 'Enquiry type');

        $statement = $pdo->prepare('INSERT INTO enquiries (name, email, phone, subject, message, type) VALUES (:name, :email, :phone, :subject, :message, :type)');
        $statement->execute($payload);
        respond(['success' => true], 201);
    }

    if ($method === 'POST' && $route === 'admissions') {
        assert_rate_limit('public-admissions', 4, 900);
        $payload = [
            'application_number' => sprintf('ADM-%s-%04d', date('Y'), random_int(1000, 9999)),
            'student_first_name' => trim((string) ($body['student_first_name'] ?? '')),
            'student_last_name' => trim((string) ($body['student_last_name'] ?? '')),
            'date_of_birth' => trim((string) ($body['date_of_birth'] ?? '')),
            'gender' => trim((string) ($body['gender'] ?? '')),
            'class_applying' => trim((string) ($body['class_applying'] ?? '')),
            'term_applying' => trim((string) ($body['term_applying'] ?? '')),
            'previous_school' => nullable_string($body['previous_school'] ?? null),
            'parent_name' => trim((string) ($body['parent_name'] ?? '')),
            'parent_relationship' => trim((string) ($body['parent_relationship'] ?? '')),
            'parent_phone' => trim((string) ($body['parent_phone'] ?? '')),
            'alternate_phone' => nullable_string($body['alternate_phone'] ?? null),
            'email' => trim((string) ($body['email'] ?? '')),
            'address' => trim((string) ($body['address'] ?? '')),
            'city' => trim((string) ($body['city'] ?? '')),
            'medical_information' => nullable_string($body['medical_information'] ?? null),
            'notes' => nullable_string($body['notes'] ?? null),
        ];
        validate_required($payload, [
            'student_first_name',
            'student_last_name',
            'date_of_birth',
            'gender',
            'class_applying',
            'term_applying',
            'parent_name',
            'parent_relationship',
            'parent_phone',
            'email',
            'address',
            'city',
        ]);
        validate_email($payload['email']);
        validate_text_length($payload['student_first_name'], 2, 80, 'Student first name');
        validate_text_length($payload['student_last_name'], 2, 80, 'Student last name');
        validate_date_string($payload['date_of_birth'], 'Date of birth');
        validate_enum($payload['gender'], ['Male', 'Female'], 'Gender');
        validate_text_length($payload['class_applying'], 2, 50, 'Class applying for');
        validate_text_length($payload['term_applying'], 4, 100, 'Term / academic year');
        validate_text_length($payload['parent_name'], 2, 100, 'Parent / guardian name');
        validate_text_length($payload['parent_relationship'], 2, 60, 'Relationship to student');
        validate_phone($payload['parent_phone'], 'Primary phone number');
        if ($payload['alternate_phone']) {
            validate_phone((string) $payload['alternate_phone'], 'Alternate phone number');
        }
        validate_text_length($payload['address'], 6, 255, 'Address');
        validate_text_length($payload['city'], 2, 100, 'City / town');
        if ($payload['previous_school']) {
            validate_text_length((string) $payload['previous_school'], 2, 120, 'Previous school');
        }
        if ($payload['medical_information']) {
            validate_text_length((string) $payload['medical_information'], 0, 1500, 'Medical information');
        }
        if ($payload['notes']) {
            validate_text_length((string) $payload['notes'], 0, 2000, 'Additional notes');
        }

        $statement = $pdo->prepare(
            'INSERT INTO admissions (
                application_number, student_first_name, student_last_name, date_of_birth, gender, class_applying,
                term_applying, previous_school, parent_name, parent_relationship, parent_phone, alternate_phone,
                email, address, city, medical_information, notes
            ) VALUES (
                :application_number, :student_first_name, :student_last_name, :date_of_birth, :gender, :class_applying,
                :term_applying, :previous_school, :parent_name, :parent_relationship, :parent_phone, :alternate_phone,
                :email, :address, :city, :medical_information, :notes
            )'
        );
        $statement->execute($payload);
        respond(['success' => true, 'application_number' => $payload['application_number']], 201);
    }

    if (!$pdo instanceof PDO) {
        respond([
            'message' => 'Database connection failed. Start MySQL and confirm your DB settings before using the dashboard.',
        ], 500);
    }

    require_authenticated_admin();
    if ($method !== 'GET') {
        validate_csrf_token();
    }

    if ($method === 'POST' && $route === 'uploads') {
        require_roles(['admin', 'editor']);
        handle_uploads();
    }

    if ($method === 'GET' && $route === 'dashboard/stats') {
        require_roles(['admin', 'editor', 'admissions_manager', 'enquiries_manager']);
        respond([
            'enquiries' => count_rows($pdo, 'enquiries'),
            'admissions' => count_rows($pdo, 'admissions'),
            'programmes' => count_rows($pdo, 'programmes'),
            'blog_posts' => count_rows($pdo, 'blog_posts'),
            'staff' => count_rows($pdo, 'staff'),
            'faqs' => count_rows($pdo, 'faqs'),
        ]);
    }

    if ($method === 'GET' && $route === 'dashboard/health') {
        require_roles(['admin', 'editor', 'admissions_manager', 'enquiries_manager']);
        respond(get_system_health($pdo));
    }

    if (($segments[0] ?? '') === 'users') {
        require_roles(['admin']);
        handle_users($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'activity') {
        require_roles(['admin']);
        handle_activity_logs($pdo, $method);
    }

    if (($segments[0] ?? '') === 'exports' && $method === 'GET') {
        handle_exports($pdo, $segments);
    }

    if (($segments[0] ?? '') === 'programmes') {
        require_roles(['admin', 'editor']);
        handle_programmes($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'blog-posts') {
        require_roles(['admin', 'editor']);
        handle_posts($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'staff') {
        require_roles(['admin', 'editor']);
        handle_staff($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'faqs') {
        require_roles(['admin', 'editor']);
        handle_faqs($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'facilities') {
        require_roles(['admin', 'editor']);
        handle_facilities($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'testimonials') {
        require_roles(['admin', 'editor']);
        handle_testimonials($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'gallery-items') {
        require_roles(['admin', 'editor']);
        handle_gallery_items($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'careers') {
        require_roles(['admin', 'editor']);
        handle_careers($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'enquiries') {
        require_roles(['admin', 'enquiries_manager']);
        handle_enquiries($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'admissions') {
        require_roles(['admin', 'admissions_manager']);
        handle_admissions($pdo, $method, $segments, $body);
    }

    if (($segments[0] ?? '') === 'settings') {
        require_roles(['admin']);
        handle_settings($pdo, $method, $body);
    }

    respond(['message' => 'Route not found.'], 404);
} catch (InvalidArgumentException $exception) {
    log_server_exception($exception, ['route' => $route, 'method' => $method]);
    respond(['message' => 'The submitted data was invalid. Please review your input and try again.'], 422);
} catch (Throwable $exception) {
    log_server_exception($exception, ['route' => $route, 'method' => $method]);
    respond(['message' => 'Something went wrong on the server.'], 500);
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function is_https_request(): bool
{
    $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
    if ($https !== '' && $https !== 'off') {
        return true;
    }

    $forwardedProto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
    if ($forwardedProto === 'https') {
        return true;
    }

    return (int) ($_SERVER['SERVER_PORT'] ?? 80) === 443;
}

function normalize_host_name(string $value): string
{
    return ltrim(strtolower(trim($value)), '.');
}

function host_matches_allowlist(string $host, array $allowlist): bool
{
    $normalizedHost = normalize_host_name($host);
    foreach ($allowlist as $allowedHost) {
        $normalizedAllowedHost = normalize_host_name((string) $allowedHost);
        if ($normalizedAllowedHost === '') {
            continue;
        }

        if ($normalizedHost === $normalizedAllowedHost || str_ends_with($normalizedHost, '.' . $normalizedAllowedHost)) {
            return true;
        }
    }

    return false;
}

function is_same_site_origin(string $origin): bool
{
    $originHost = parse_url($origin, PHP_URL_HOST);
    $requestHost = $_SERVER['HTTP_HOST'] ?? '';
    if (!is_string($originHost) || $originHost === '' || $requestHost === '') {
        return false;
    }

    $requestHost = preg_replace('/:\d+$/', '', $requestHost) ?? $requestHost;
    return normalize_host_name($originHost) === normalize_host_name($requestHost);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function nullable_string(mixed $value): ?string
{
    $trimmed = trim((string) $value);
    return $trimmed === '' ? null : $trimmed;
}

function table_has_column(PDO $pdo, string $table, string $column): bool
{
    $statement = $pdo->prepare('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?');
    $statement->execute([$table, $column]);
    return (int) $statement->fetchColumn() > 0;
}

function sanitize_username_candidate(string $value, int $fallbackId = 0): string
{
    $clean = preg_replace('/[^A-Za-z0-9_.-]/', '', $value);
    $clean = trim((string) $clean, '.-_');
    if ($clean === '') {
        $clean = $fallbackId > 0 ? 'admin' . $fallbackId : 'admin';
    }
    if (strlen($clean) < 3) {
        $clean .= $fallbackId > 0 ? $fallbackId : '001';
    }
    return substr($clean, 0, 40);
}

function generate_unique_username(PDO $pdo, string $base, ?int $excludeId = null): string
{
    $candidate = $base;
    $suffix = 1;

    while (true) {
        $sql = 'SELECT COUNT(*) FROM admins WHERE username = ?';
        $params = [$candidate];
        if ($excludeId !== null) {
            $sql .= ' AND id <> ?';
            $params[] = $excludeId;
        }
        $statement = $pdo->prepare($sql);
        $statement->execute($params);
        if ((int) $statement->fetchColumn() === 0) {
            return $candidate;
        }

        $candidate = substr($base, 0, max(1, 40 - strlen((string) $suffix) - 1)) . '-' . $suffix;
        $suffix++;
    }
}

function ensure_local_auth_schema(PDO $pdo): void
{
    if (!table_has_column($pdo, 'admins', 'username')) {
        $pdo->exec('ALTER TABLE admins ADD COLUMN username VARCHAR(80) NULL UNIQUE AFTER id');
    }
    if (!table_has_column($pdo, 'admins', 'email')) {
        $pdo->exec('ALTER TABLE admins ADD COLUMN email VARCHAR(255) NULL AFTER display_name');
    }

    $selectColumns = ['id', 'display_name', 'username', 'email'];
    if (table_has_column($pdo, 'admins', 'role')) {
        $selectColumns[] = 'role';
    } else {
        $pdo->exec("ALTER TABLE admins ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'admin' AFTER display_name");
    }

    $rows = $pdo->query('SELECT ' . implode(', ', $selectColumns) . ' FROM admins ORDER BY id ASC')->fetchAll();
    $updateUsername = $pdo->prepare('UPDATE admins SET username = ? WHERE id = ?');

    foreach ($rows as $row) {
        if (!empty($row['username'])) {
            continue;
        }

        $source = '';
        if (!empty($row['email'])) {
            $source = strtok((string) $row['email'], '@') ?: '';
        }
        if ($source === '' && !empty($row['display_name'])) {
            $source = (string) $row['display_name'];
        }

        $base = sanitize_username_candidate($source, (int) $row['id']);
        $username = generate_unique_username($pdo, $base, (int) $row['id']);
        $updateUsername->execute([$username, (int) $row['id']]);
    }

}

function ensure_admin_management_schema(PDO $pdo): void
{
    if (!table_has_column($pdo, 'admins', 'is_active')) {
        $pdo->exec("ALTER TABLE admins ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role");
    }
}

function ensure_password_recovery_schema(PDO $pdo): void
{
    if (!table_has_column($pdo, 'admins', 'recovery_key_salt')) {
        $pdo->exec('ALTER TABLE admins ADD COLUMN recovery_key_salt VARCHAR(64) NULL AFTER password_hash');
    }
    if (!table_has_column($pdo, 'admins', 'recovery_key_hash')) {
        $pdo->exec('ALTER TABLE admins ADD COLUMN recovery_key_hash VARCHAR(255) NULL AFTER recovery_key_salt');
    }
    if (!table_has_column($pdo, 'admins', 'recovery_key_created_at')) {
        $pdo->exec('ALTER TABLE admins ADD COLUMN recovery_key_created_at DATETIME NULL AFTER recovery_key_hash');
    }
}

function ensure_admissions_review_schema(PDO $pdo): void
{
    if (!table_has_column($pdo, 'admissions', 'admin_feedback')) {
        $pdo->exec('ALTER TABLE admissions ADD COLUMN admin_feedback TEXT NULL AFTER notes');
    }
}

function ensure_activity_log_schema(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NULL,
            admin_username VARCHAR(80) NULL,
            action VARCHAR(80) NOT NULL,
            entity_type VARCHAR(80) NOT NULL,
            entity_id INT NULL,
            summary TEXT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_activity_created_at (created_at),
            INDEX idx_activity_entity (entity_type, entity_id),
            INDEX idx_activity_admin (admin_id)
        )'
      );
}

function ensure_careers_schema(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS careers_vacancies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            department VARCHAR(150) NULL,
            location VARCHAR(150) NULL,
            employment_type VARCHAR(80) NULL,
            experience_level VARCHAR(120) NULL,
            application_deadline DATE NULL,
            short_summary TEXT NULL,
            full_description LONGTEXT NULL,
            requirements_json LONGTEXT NULL,
            application_email VARCHAR(255) NULL,
            external_application_url VARCHAR(255) NULL,
            status VARCHAR(40) NOT NULL DEFAULT "draft",
            hiring_status VARCHAR(40) NOT NULL DEFAULT "open",
            featured TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_careers_status (status),
            INDEX idx_careers_hiring_status (hiring_status),
            INDEX idx_careers_featured (featured)
        )'
    );
}

function ensure_careers_settings(PDO $pdo): void
{
    $defaults = [
        'careers_page_title' => 'Careers at Prestige Academy',
        'careers_intro_text' => 'Join a school community that values excellent teaching, strong character, warm collaboration, and long-term student impact.',
        'careers_why_work_title' => 'Why Work With Us',
        'careers_why_work_body' => 'We are building a professional school culture where teachers and support staff are respected, developed, and empowered to do meaningful work every day.',
        'careers_culture_title' => 'Workplace Culture',
        'careers_culture_body' => 'Our teams thrive in a structured, caring environment that values planning, accountability, teamwork, and a genuine commitment to children and families.',
        'careers_benefits_title' => 'Benefits and Compensation',
        'careers_benefits_body' => 'We aim to offer a fair, supportive employment experience with professional growth opportunities, clear communication, and a healthy working rhythm.',
        'careers_hr_title' => 'HR Contact',
        'careers_hr_body' => 'For recruitment questions or partnership enquiries, our HR team is available to guide applicants on the next steps.',
        'careers_hr_email' => 'hr@prestigeacademy.edu.gh',
        'careers_hr_phone' => '+233 30 255 1234',
        'careers_cta_text' => 'Explore current opportunities and help shape the future of learning at Prestige Academy.',
    ];

    $statement = $pdo->prepare('INSERT INTO site_settings (`key`, `value`) VALUES (:key, :value) ON DUPLICATE KEY UPDATE `value` = `value`');
    foreach ($defaults as $key => $value) {
        $statement->execute(['key' => $key, 'value' => $value]);
    }
}

function validate_required(array $payload, array $keys): void
{
    foreach ($keys as $key) {
        if (!isset($payload[$key]) || trim((string) $payload[$key]) === '') {
            throw new InvalidArgumentException('Please complete all required fields.');
        }
    }
}

function validate_email(string $email): void
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Please provide a valid email address.');
    }
}

function validate_password_strength(string $password): void
{
    if (strlen($password) < 10) {
        throw new InvalidArgumentException('Password must be at least 10 characters long.');
    }

    if (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/\d/', $password)) {
        throw new InvalidArgumentException('Password must include uppercase, lowercase, and a number.');
    }
}

function validate_username(string $username): void
{
    if (!preg_match('/^[A-Za-z0-9_.-]{3,40}$/', $username)) {
        throw new InvalidArgumentException('Username must be 3-40 characters and can only include letters, numbers, dots, underscores, and hyphens.');
    }
}

function validate_text_length(string $value, int $min, int $max, string $label): void
{
    $length = mb_strlen(trim($value));
    if ($length < $min || $length > $max) {
        if ($min === 0) {
            throw new InvalidArgumentException(sprintf('%s must be %d characters or fewer.', $label, $max));
        }
        throw new InvalidArgumentException(sprintf('%s must be between %d and %d characters.', $label, $min, $max));
    }
}

function validate_phone(string $value, string $label): void
{
    $normalized = preg_replace('/\s+/', '', $value);
    if (!preg_match('/^\+?[0-9()-]{7,20}$/', $normalized)) {
        throw new InvalidArgumentException(sprintf('Please provide a valid %s.', strtolower($label)));
    }
}

function validate_enum(string $value, array $allowed, string $label): void
{
    if (!in_array($value, $allowed, true)) {
        throw new InvalidArgumentException(sprintf('Invalid %s selected.', strtolower($label)));
    }
}

function validate_date_string(string $value, string $label): void
{
    $date = DateTime::createFromFormat('Y-m-d', $value);
    $errors = DateTime::getLastErrors();
    if (!$date || ($errors['warning_count'] ?? 0) > 0 || ($errors['error_count'] ?? 0) > 0) {
        throw new InvalidArgumentException(sprintf('Please provide a valid %s.', strtolower($label)));
    }
    if ($date > new DateTime()) {
        throw new InvalidArgumentException(sprintf('%s cannot be in the future.', $label));
    }
}

function validate_iso_date(string $value, string $label): void
{
    $date = DateTime::createFromFormat('Y-m-d', $value);
    $errors = DateTime::getLastErrors();
    if (!$date || ($errors['warning_count'] ?? 0) > 0 || ($errors['error_count'] ?? 0) > 0) {
        throw new InvalidArgumentException(sprintf('Please provide a valid %s.', strtolower($label)));
    }
}

function validate_optional_url(?string $value, string $label): void
{
    if ($value === null || $value === '') {
        return;
    }

    $trimmed = trim($value);
    if ($trimmed === '') {
        return;
    }

    if (is_safe_relative_url($trimmed) || str_starts_with($trimmed, 'mailto:') || str_starts_with($trimmed, 'tel:')) {
        return;
    }

    if (!filter_var($trimmed, FILTER_VALIDATE_URL)) {
        throw new InvalidArgumentException(sprintf('Please provide a valid %s.', strtolower($label)));
    }

    $parts = parse_url($trimmed);
    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = strtolower((string) ($parts['host'] ?? ''));
    if (!in_array($scheme, ['http', 'https'], true) || $host === '') {
        throw new InvalidArgumentException(sprintf('Please provide a valid %s.', strtolower($label)));
    }

    global $config;
    $allowedHosts = $config['security']['allowed_redirect_hosts'] ?? [];
    if (!host_matches_allowlist($host, is_array($allowedHosts) ? $allowedHosts : [])) {
        throw new InvalidArgumentException(sprintf('Please provide a %s that matches an approved domain.', strtolower($label)));
    }
}

function validate_optional_embed_url(?string $value, string $label): void
{
    if ($value === null || $value === '') {
        return;
    }

    if (!filter_var($value, FILTER_VALIDATE_URL)) {
        throw new InvalidArgumentException(sprintf('Please provide a valid %s.', strtolower($label)));
    }

    $parts = parse_url($value);
    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = strtolower((string) ($parts['host'] ?? ''));
    if (!in_array($scheme, ['http', 'https'], true) || $host === '') {
        throw new InvalidArgumentException(sprintf('Please provide a valid %s.', strtolower($label)));
    }

    global $config;
    $allowedHosts = $config['security']['allowed_embed_hosts'] ?? [];
    if (!host_matches_allowlist($host, is_array($allowedHosts) ? $allowedHosts : [])) {
        throw new InvalidArgumentException(sprintf('Please provide a %s from an approved embed provider.', strtolower($label)));
    }
}

function is_safe_relative_url(string $value): bool
{
    return (
        str_starts_with($value, '/')
        || str_starts_with($value, '#')
        || str_starts_with($value, '?')
        || str_starts_with($value, './')
        || str_starts_with($value, '../')
    ) && !str_starts_with($value, '//');
}

function log_server_exception(Throwable $exception, array $context = []): void
{
    $payload = [
        'message' => $exception->getMessage(),
        'type' => $exception::class,
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'context' => $context,
    ];

    error_log('[backend-error] ' . json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function validate_slug(string $value, string $label = 'Slug'): void
{
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $value)) {
        throw new InvalidArgumentException(sprintf('%s must use lowercase letters, numbers, and hyphens only.', $label));
    }
}

function is_unique_constraint_violation(Throwable $exception): bool
{
    return $exception instanceof PDOException && (string) $exception->getCode() === '23000';
}

function execute_or_respond_conflict(PDOStatement $statement, array $payload, string $message): void
{
    try {
        $statement->execute($payload);
    } catch (Throwable $exception) {
        if (is_unique_constraint_violation($exception)) {
            respond(['message' => $message], 409);
        }

        throw $exception;
    }
}

function get_rate_limit_file(string $bucket): string
{
    $identifier = sha1($bucket . '|' . client_rate_limit_identifier());
    return rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'prestige_rate_' . $identifier . '.json';
}

function client_rate_limit_identifier(): string
{
    $remoteAddr = trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    return $remoteAddr !== '' ? $remoteAddr : 'unknown';
}

function get_subject_rate_limit_file(string $bucket, string $subject): string
{
    $identifier = sha1($bucket . '|' . strtolower(trim($subject)));
    return rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'prestige_rate_' . $identifier . '.json';
}

function assert_rate_limit(string $bucket, int $limit, int $windowSeconds): void
{
    $file = get_rate_limit_file($bucket);
    $now = time();
    $state = ['count' => 0, 'expires_at' => $now + $windowSeconds];

    if (is_file($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded) && ($decoded['expires_at'] ?? 0) > $now) {
            $state = $decoded;
        }
    }

    if (($state['expires_at'] ?? 0) <= $now) {
        $state = ['count' => 0, 'expires_at' => $now + $windowSeconds];
    }

    $state['count'] = (int) ($state['count'] ?? 0) + 1;
    file_put_contents($file, json_encode($state, JSON_UNESCAPED_SLASHES));

    if ($state['count'] > $limit) {
        respond(['message' => 'Too many attempts. Please wait a few minutes and try again.'], 429);
    }
}

function assert_subject_rate_limit(string $bucket, string $subject, int $limit, int $windowSeconds): void
{
    $file = get_subject_rate_limit_file($bucket, $subject);
    $now = time();
    $state = ['count' => 0, 'expires_at' => $now + $windowSeconds];

    if (is_file($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded) && ($decoded['expires_at'] ?? 0) > $now) {
            $state = $decoded;
        }
    }

    if (($state['expires_at'] ?? 0) <= $now) {
        $state = ['count' => 0, 'expires_at' => $now + $windowSeconds];
    }

    $state['count'] = (int) ($state['count'] ?? 0) + 1;
    file_put_contents($file, json_encode($state, JSON_UNESCAPED_SLASHES));

    if ($state['count'] > $limit) {
        respond(['message' => 'Too many recovery attempts. Please wait before trying again.'], 429);
    }
}

function validate_csrf_token(): void
{
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $sessionToken = $_SESSION['csrf_token'] ?? '';
    if ($headerToken === '' || $sessionToken === '' || !hash_equals($sessionToken, $headerToken)) {
        respond(['message' => 'Security token mismatch. Please refresh and try again.'], 419);
    }
}

function sanitize_upload_folder(string $folder): string
{
    $normalized = str_replace('\\', '/', trim($folder));
    $segments = preg_split('#/+#', $normalized) ?: [];
    $cleanSegments = [];

    foreach ($segments as $segment) {
        $clean = preg_replace('/[^a-zA-Z0-9_-]/', '', $segment);
        if ($clean !== '' && $clean !== '.' && $clean !== '..') {
            $cleanSegments[] = $clean;
        }
    }

    return $cleanSegments ? implode(DIRECTORY_SEPARATOR, $cleanSegments) : 'general';
}

function handle_uploads(): void
{
    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
        throw new InvalidArgumentException('Please choose a file to upload.');
    }

    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new InvalidArgumentException('Upload failed. Please try again.');
    }

    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > 8 * 1024 * 1024) {
        throw new InvalidArgumentException('Files must be smaller than 8MB.');
    }

    $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx'];
    $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!in_array($extension, $allowed, true)) {
        throw new InvalidArgumentException('Unsupported file type.');
    }
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = $finfo ? finfo_file($finfo, (string) $file['tmp_name']) : false;
    if ($finfo) {
        finfo_close($finfo);
    }
    if (!$mimeType || !in_array($mimeType, $allowedMimeTypes, true)) {
        throw new InvalidArgumentException('The uploaded file type is not allowed.');
    }

    $folder = sanitize_upload_folder((string) ($_POST['folder'] ?? 'general'));
    $projectRoot = realpath(__DIR__ . '/..');
    if ($projectRoot === false) {
        respond(['message' => 'Upload directory is unavailable.'], 500);
    }

    $targetDir = $projectRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $folder;
    if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
        respond(['message' => 'Could not prepare upload directory.'], 500);
    }

    $filename = sprintf('%s-%s.%s', date('YmdHis'), bin2hex(random_bytes(4)), $extension);
    $targetPath = $targetDir . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
        respond(['message' => 'Could not save uploaded file.'], 500);
    }

    $urlFolder = str_replace(DIRECTORY_SEPARATOR, '/', $folder);

    respond([
        'success' => true,
        'filename' => $filename,
        'url' => app_public_path('/uploads/' . $urlFolder . '/' . $filename),
    ], 201);
}

function current_admin(): ?array
{
    if (!isset($_SESSION['admin_id'])) {
        return null;
    }

    return [
        'id' => (int) $_SESSION['admin_id'],
        'username' => $_SESSION['admin_username'] ?? '',
        'display_name' => $_SESSION['admin_name'] ?? '',
        'email' => $_SESSION['admin_email'] ?? null,
        'role' => $_SESSION['admin_role'] ?? 'admin',
    ];
}

function current_admin_id(): ?int
{
    return isset($_SESSION['admin_id']) ? (int) $_SESSION['admin_id'] : null;
}

function has_available_admin(?PDO $pdo): bool
{
    return $pdo instanceof PDO && count_rows($pdo, 'admins') > 0;
}

function find_admin_by_username(?PDO $pdo, string $username): ?array
{
    if (!($pdo instanceof PDO)) {
        return null;
    }

    $statement = $pdo->prepare('SELECT id, username, display_name, email, password_hash, password_salt, recovery_key_salt, recovery_key_hash, recovery_key_created_at, role, is_active FROM admins WHERE username = ? AND is_active = 1 LIMIT 1');
    $statement->execute([$username]);
    return $statement->fetch() ?: null;
}

function find_admin_by_id(PDO $pdo, int $id): ?array
{
    $statement = $pdo->prepare('SELECT id, username, display_name, email, role, is_active, recovery_key_created_at, created_at, updated_at FROM admins WHERE id = ? LIMIT 1');
    $statement->execute([$id]);
    return $statement->fetch() ?: null;
}

function create_recovery_key(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $key = [];

    for ($groupIndex = 0; $groupIndex < 4; $groupIndex++) {
        $segment = '';
        for ($charIndex = 0; $charIndex < 5; $charIndex++) {
            $segment .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        $key[] = $segment;
    }

    return implode('-', $key);
}

function get_system_health(PDO $pdo): array
{
    $uploadDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
    $siteOrigin = $GLOBALS['config']['security']['site_origin'] ?? null;
    $allowedOrigins = $GLOBALS['config']['cors']['allowed_origins'] ?? [];
    $adminsWithRecoveryKeys = table_has_column($pdo, 'admins', 'recovery_key_hash')
        ? (int) $pdo->query('SELECT COUNT(*) FROM admins WHERE recovery_key_hash IS NOT NULL AND recovery_key_hash <> ""')->fetchColumn()
        : 0;

    return [
        'database' => [
            'connected' => true,
            'server_version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
        ],
        'uploads' => [
            'path' => $uploadDirectory,
            'writable' => is_dir($uploadDirectory) && is_writable($uploadDirectory),
        ],
        'session' => [
            'cookie_secure' => is_https_request(),
            'cookie_name' => session_name(),
        ],
        'security' => [
            'site_origin_configured' => !empty($siteOrigin),
            'allowed_origins_count' => is_array($allowedOrigins) ? count($allowedOrigins) : 0,
            'recovery_keys_ready' => $adminsWithRecoveryKeys,
        ],
        'generated_at' => date(DATE_ATOM),
    ];
}

function count_active_admin_accounts(PDO $pdo, ?int $excludeId = null): int
{
    $sql = "SELECT COUNT(*) FROM admins WHERE role = 'admin' AND is_active = 1";
    $params = [];
    if ($excludeId !== null) {
        $sql .= ' AND id <> ?';
        $params[] = $excludeId;
    }

    $statement = $pdo->prepare($sql);
    $statement->execute($params);

    return (int) $statement->fetchColumn();
}

function app_public_path(string $path): string
{
    $uriPath = trim((string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    $backendIndex = strpos($uriPath, 'backend');
    if ($backendIndex === false) {
        return $path;
    }

    $prefix = trim(substr($uriPath, 0, $backendIndex), '/');
    if ($prefix === '') {
        return $path;
    }

    return '/' . $prefix . $path;
}

function require_authenticated_admin(): void
{
    if (!isset($_SESSION['admin_id'])) {
        respond(['message' => 'You must be signed in to continue.'], 401);
    }
    if (!in_array($_SESSION['admin_role'] ?? '', ['admin', 'editor', 'admissions_manager', 'enquiries_manager'], true)) {
        respond(['message' => 'Dashboard access is required.'], 403);
    }
}

function require_roles(array $roles): void
{
    require_authenticated_admin();
    if (!in_array($_SESSION['admin_role'] ?? '', $roles, true)) {
        respond(['message' => 'You do not have permission to perform this action.'], 403);
    }
}

function verify_password(string $password, string $salt, string $expectedHash): bool
{
    $computed = hash_pbkdf2('sha512', $password, $salt, 120000, 64);
    return hash_equals($expectedHash, $computed);
}

function count_rows(PDO $pdo, string $table): int
{
    return (int) $pdo->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
}

function query_param(string $key, ?string $default = null): ?string
{
    $value = $_GET[$key] ?? $default;
    if ($value === null) {
        return null;
    }

    return trim((string) $value);
}

function pagination_params(int $defaultLimit = 10, int $maxLimit = 50): array
{
    $page = max(1, (int) (query_param('page', '1') ?? '1'));
    $limit = max(1, min($maxLimit, (int) (query_param('limit', (string) $defaultLimit) ?? (string) $defaultLimit)));
    $search = query_param('search', query_param('q', '')) ?? '';

    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => ($page - 1) * $limit,
        'search' => $search,
    ];
}

function pagination_payload(int $page, int $limit, int $total): array
{
    return [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'page_count' => max(1, (int) ceil($total / max(1, $limit))),
    ];
}

function get_settings(PDO $pdo): array
{
    $settings = [];
    $rows = $pdo->query('SELECT `key`, `value` FROM site_settings ORDER BY `key`')->fetchAll();
    foreach ($rows as $row) {
        $settings[$row['key']] = $row['value'];
    }

    return $settings;
}

function allowed_setting_keys(): array
{
    return [
        'admin_brand_name',
        'admin_brand_subtitle',
        'admin_sidebar_badge',
        'admin_header_label',
        'school_name',
        'tagline',
        'phone',
        'alternate_phone',
        'email',
        'address',
        'office_hours',
        'primary_color',
        'secondary_color',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'youtube_url',
        'whatsapp_number',
        'hero_badge',
        'hero_title',
        'hero_subtitle',
        'hero_primary_cta_label',
        'hero_primary_cta_url',
        'hero_secondary_cta_label',
        'hero_secondary_cta_url',
        'hero_image_url',
        'about_badge',
        'about_title',
        'about_subtitle',
        'mission_title',
        'mission_body',
        'vision_title',
        'vision_body',
        'headteacher_label',
        'headteacher_name',
        'headteacher_title',
        'headteacher_message',
        'headteacher_image_url',
        'admissions_badge',
        'admissions_title',
        'admissions_subtitle',
        'admissions_step_1_title',
        'admissions_step_1_desc',
        'admissions_step_2_title',
        'admissions_step_2_desc',
        'admissions_step_3_title',
        'admissions_step_3_desc',
        'admissions_step_4_title',
        'admissions_step_4_desc',
        'cta_title',
        'cta_body',
        'cta_primary_label',
        'cta_primary_url',
        'cta_secondary_label',
        'cta_secondary_url',
            'contact_badge',
            'contact_title',
            'contact_subtitle',
            'contact_map_embed_url',
            'careers_page_title',
            'careers_intro_text',
            'careers_why_work_title',
            'careers_why_work_body',
            'careers_culture_title',
            'careers_culture_body',
            'careers_benefits_title',
            'careers_benefits_body',
            'careers_hr_title',
            'careers_hr_body',
            'careers_hr_email',
            'careers_hr_phone',
            'careers_cta_text',
        ];
}

function validate_settings_payload(array $body): array
{
    $allowedKeys = allowed_setting_keys();
    $unknownKeys = [];
    $sanitized = [];

    foreach ($body as $key => $value) {
        $normalizedKey = trim((string) $key);
        if ($normalizedKey === '') {
            continue;
        }

        if (!in_array($normalizedKey, $allowedKeys, true)) {
            $unknownKeys[] = $normalizedKey;
            continue;
        }

        $sanitized[$normalizedKey] = nullable_string($value) ?? '';
    }

    if ($unknownKeys !== []) {
        respond(['message' => 'Unsupported settings were submitted: ' . implode(', ', $unknownKeys) . '.'], 422);
    }

    foreach ([
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'youtube_url',
        'hero_primary_cta_url',
        'hero_secondary_cta_url',
        'cta_primary_url',
        'cta_secondary_url',
    ] as $urlKey) {
        validate_optional_url($sanitized[$urlKey] ?? null, str_replace('_', ' ', $urlKey));
    }

    validate_optional_embed_url($sanitized['contact_map_embed_url'] ?? null, 'map embed URL');

    return $sanitized;
}

function normalize_upload_reference(?string $value): ?string
{
    if (!$value) {
        return null;
    }

    $path = parse_url($value, PHP_URL_PATH);
    $path = is_string($path) ? $path : $value;
    $uploadIndex = strpos($path, '/uploads/');
    if ($uploadIndex === false) {
        return null;
    }

    return ltrim(substr($path, $uploadIndex + 1), '/');
}

function media_references_in_use(PDO $pdo): array
{
    $references = [];
    $queries = [
        ['SELECT brochure_url AS path FROM programmes WHERE brochure_url IS NOT NULL AND brochure_url <> ""'],
        ['SELECT image_url AS path FROM programmes WHERE image_url IS NOT NULL AND image_url <> ""'],
        ['SELECT featured_image_url AS path FROM blog_posts WHERE featured_image_url IS NOT NULL AND featured_image_url <> ""'],
        ['SELECT photo_url AS path FROM staff WHERE photo_url IS NOT NULL AND photo_url <> ""'],
        ['SELECT image_url AS path FROM facilities WHERE image_url IS NOT NULL AND image_url <> ""'],
        ['SELECT photo_url AS path FROM testimonials WHERE photo_url IS NOT NULL AND photo_url <> ""'],
        ['SELECT image_url AS path FROM gallery_items WHERE image_url IS NOT NULL AND image_url <> ""'],
        ['SELECT `value` AS path FROM site_settings WHERE `key` IN ("hero_image_url", "headteacher_image_url") AND `value` IS NOT NULL AND `value` <> ""'],
    ];

    foreach ($queries as [$sql]) {
        foreach ($pdo->query($sql)->fetchAll() as $row) {
            $normalized = normalize_upload_reference((string) ($row['path'] ?? ''));
            if ($normalized) {
                $references[$normalized] = true;
            }
        }
    }

    return $references;
}

function delete_upload_file_if_unused(PDO $pdo, ?string $value): void
{
    $normalized = normalize_upload_reference($value);
    if (!$normalized) {
        return;
    }

    $references = media_references_in_use($pdo);
    if (isset($references[$normalized])) {
        return;
    }

    $projectRoot = realpath(__DIR__ . '/..');
    if ($projectRoot === false) {
        return;
    }

    $fullPath = $projectRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
    if ($fullPath && is_file($fullPath)) {
        @unlink($fullPath);
    }
}

function log_activity(PDO $pdo, string $action, string $entityType, ?int $entityId, ?string $summary = null): void
{
    $admin = current_admin();
    $statement = $pdo->prepare('INSERT INTO activity_logs (admin_id, admin_username, action, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?)');
    $statement->execute([
        $admin['id'] ?? null,
        $admin['username'] ?? null,
        $action,
        $entityType,
        $entityId,
        $summary,
    ]);
}

function get_programmes(PDO $pdo): array
{
    $rows = $pdo->query('SELECT * FROM programmes ORDER BY sort_order ASC, title ASC')->fetchAll();
    return array_map('normalize_programme_row', $rows);
}

function normalize_programme_row(array $row): array
{
    $row['highlights'] = json_decode($row['highlights_json'] ?: '[]', true) ?: [];
    $row['subjects'] = json_decode($row['subjects_json'] ?: '[]', true) ?: [];
    unset($row['highlights_json'], $row['subjects_json']);
    return $row;
}

function get_staff(PDO $pdo, bool $all): array
{
    $sql = 'SELECT * FROM staff';
    if (!$all) {
        $sql .= ' WHERE featured = 1';
    }
    $sql .= ' ORDER BY sort_order ASC, name ASC';
    return $pdo->query($sql)->fetchAll();
}

function get_post_by_id(PDO $pdo, int $id): ?array
{
    $statement = $pdo->prepare('SELECT * FROM blog_posts WHERE id = ? LIMIT 1');
    $statement->execute([$id]);
    return $statement->fetch() ?: null;
}

function get_faqs(PDO $pdo, bool $all): array
{
    $sql = 'SELECT * FROM faqs';
    if (!$all) {
        $sql .= ' WHERE is_published = 1';
    }
    $sql .= ' ORDER BY sort_order ASC, id ASC';
    return $pdo->query($sql)->fetchAll();
}

function get_posts(PDO $pdo, bool $all): array
{
    $sql = 'SELECT * FROM blog_posts';
    if (!$all) {
        $sql .= " WHERE status = 'published'";
    }
    $sql .= ' ORDER BY COALESCE(published_at, created_at) DESC';
    return $pdo->query($sql)->fetchAll();
}

function normalize_career_vacancy_row(array $row): array
{
    $row['requirements'] = json_decode($row['requirements_json'] ?: '[]', true) ?: [];
    unset($row['requirements_json']);
    return $row;
}

function get_careers_vacancy_by_id(PDO $pdo, int $id): ?array
{
    $statement = $pdo->prepare('SELECT * FROM careers_vacancies WHERE id = ? LIMIT 1');
    $statement->execute([$id]);
    $item = $statement->fetch() ?: null;
    return $item ? normalize_career_vacancy_row($item) : null;
}

function get_facilities(PDO $pdo, bool $all): array
{
    $sql = 'SELECT * FROM facilities';
    if (!$all) {
        $sql .= ' ORDER BY display_order ASC, title ASC LIMIT 4';
    } else {
        $sql .= ' ORDER BY display_order ASC, title ASC';
    }

    return $pdo->query($sql)->fetchAll();
}

function get_testimonials(PDO $pdo, bool $all): array
{
    $sql = 'SELECT * FROM testimonials';
    if (!$all) {
        $sql .= ' WHERE is_published = 1';
    }
    $sql .= ' ORDER BY display_order ASC, id ASC';
    return $pdo->query($sql)->fetchAll();
}

function get_gallery_items(PDO $pdo, bool $all): array
{
    $sql = 'SELECT * FROM gallery_items';
    if (!$all) {
        $sql .= ' WHERE is_published = 1';
    }
    $sql .= ' ORDER BY display_order ASC, id ASC';
    return $pdo->query($sql)->fetchAll();
}

function get_public_programmes_response(PDO $pdo): array
{
    $params = pagination_params(12, 50);
    $search = $params['search'];
    $whereSql = '';
    $whereParams = [];

    if ($search !== '') {
        $whereSql = ' WHERE title LIKE :search OR short_description LIKE :search OR full_description LIKE :search';
        $whereParams['search'] = '%' . $search . '%';
    }

    $countStatement = $pdo->prepare('SELECT COUNT(*) FROM programmes' . $whereSql);
    $countStatement->execute($whereParams);
    $total = (int) $countStatement->fetchColumn();

    $statement = $pdo->prepare('SELECT * FROM programmes' . $whereSql . ' ORDER BY sort_order ASC, title ASC LIMIT :limit OFFSET :offset');
    foreach ($whereParams as $key => $value) {
        $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
    }
    $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
    $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
    $statement->execute();

    return [
        'items' => array_map('normalize_programme_row', $statement->fetchAll()),
        'pagination' => pagination_payload($params['page'], $params['limit'], $total),
    ];
}

function get_public_posts_response(PDO $pdo): array
{
    $params = pagination_params(6, 50);
    $search = $params['search'];
    $whereSql = " WHERE status = 'published'";
    $whereParams = [];

    if ($search !== '') {
        $whereSql .= ' AND (title LIKE :search OR excerpt LIKE :search OR content LIKE :search OR category LIKE :search)';
        $whereParams['search'] = '%' . $search . '%';
    }

    $countStatement = $pdo->prepare('SELECT COUNT(*) FROM blog_posts' . $whereSql);
    $countStatement->execute($whereParams);
    $total = (int) $countStatement->fetchColumn();

    $statement = $pdo->prepare('SELECT * FROM blog_posts' . $whereSql . ' ORDER BY COALESCE(published_at, created_at) DESC LIMIT :limit OFFSET :offset');
    foreach ($whereParams as $key => $value) {
        $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
    }
    $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
    $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
    $statement->execute();

    return [
        'items' => $statement->fetchAll(),
        'pagination' => pagination_payload($params['page'], $params['limit'], $total),
    ];
}

function get_public_careers_response(PDO $pdo): array
{
    $params = pagination_params(9, 50);
    $search = $params['search'];
    $department = trim((string) (query_param('department', '') ?? ''));
    $employmentType = trim((string) (query_param('employment_type', '') ?? ''));
    $hiringStatus = trim((string) (query_param('hiring_status', 'open') ?? 'open'));
    $whereSql = " WHERE status = 'published'";
    $whereParams = [];

    if ($hiringStatus !== '') {
        $whereSql .= ' AND hiring_status = :hiring_status';
        $whereParams['hiring_status'] = $hiringStatus;
    }
    if ($department !== '') {
        $whereSql .= ' AND department = :department';
        $whereParams['department'] = $department;
    }
    if ($employmentType !== '') {
        $whereSql .= ' AND employment_type = :employment_type';
        $whereParams['employment_type'] = $employmentType;
    }
    if ($search !== '') {
        $whereSql .= ' AND (title LIKE :search OR short_summary LIKE :search OR full_description LIKE :search OR department LIKE :search)';
        $whereParams['search'] = '%' . $search . '%';
    }

    $countStatement = $pdo->prepare('SELECT COUNT(*) FROM careers_vacancies' . $whereSql);
    $countStatement->execute($whereParams);
    $total = (int) $countStatement->fetchColumn();

    $statement = $pdo->prepare('SELECT * FROM careers_vacancies' . $whereSql . ' ORDER BY featured DESC, application_deadline IS NULL ASC, application_deadline ASC, created_at DESC LIMIT :limit OFFSET :offset');
    foreach ($whereParams as $key => $value) {
        $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
    }
    $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
    $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
    $statement->execute();

    $departments = $pdo->query("SELECT DISTINCT department FROM careers_vacancies WHERE status = 'published' AND department IS NOT NULL AND department <> '' ORDER BY department ASC")->fetchAll(PDO::FETCH_COLUMN) ?: [];
    $employmentTypes = $pdo->query("SELECT DISTINCT employment_type FROM careers_vacancies WHERE status = 'published' AND employment_type IS NOT NULL AND employment_type <> '' ORDER BY employment_type ASC")->fetchAll(PDO::FETCH_COLUMN) ?: [];

    return [
        'items' => array_map('normalize_career_vacancy_row', $statement->fetchAll()),
        'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        'filters' => [
            'departments' => array_values(array_filter($departments)),
            'employment_types' => array_values(array_filter($employmentTypes)),
        ],
    ];
}

function decode_list_field(mixed $value): string
{
    $text = trim((string) $value);
    if ($text === '') {
        return '[]';
    }

    $items = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n|,/', $text) ?: [])));
    return json_encode($items, JSON_UNESCAPED_UNICODE);
}

function handle_programmes(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE title LIKE :search OR slug LIKE :search OR short_description LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM programmes' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM programmes' . $whereSql . ' ORDER BY sort_order ASC, title ASC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => array_map('normalize_programme_row', $statement->fetchAll()),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = [
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'age_group' => nullable_string($body['age_group'] ?? null),
            'duration' => nullable_string($body['duration'] ?? null),
            'short_description' => nullable_string($body['short_description'] ?? null),
            'full_description' => nullable_string($body['full_description'] ?? null),
            'highlights_json' => decode_list_field($body['highlights'] ?? ''),
            'subjects_json' => decode_list_field($body['subjects'] ?? ''),
            'theme_color' => nullable_string($body['theme_color'] ?? null) ?: 'bg-blue-50 border-blue-200',
            'brochure_url' => nullable_string($body['brochure_url'] ?? null),
            'image_url' => nullable_string($body['image_url'] ?? null),
            'sort_order' => (int) ($body['sort_order'] ?? 0),
        ];
        validate_required($payload, ['title', 'slug']);
        validate_text_length($payload['title'], 2, 120, 'Programme title');
        validate_slug($payload['slug']);

        $statement = $pdo->prepare('INSERT INTO programmes (title, slug, age_group, duration, short_description, full_description, highlights_json, subjects_json, theme_color, brochure_url, image_url, sort_order) VALUES (:title, :slug, :age_group, :duration, :short_description, :full_description, :highlights_json, :subjects_json, :theme_color, :brochure_url, :image_url, :sort_order)');
        execute_or_respond_conflict($statement, $payload, 'A programme with this slug already exists. Please choose a different slug.');
        log_activity($pdo, 'create', 'programme', (int) $pdo->lastInsertId(), 'Created programme ' . $payload['title']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT brochure_url, image_url, title FROM programmes WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        if (!$existingRow) {
            respond(['message' => 'Programme not found.'], 404);
        }
        $payload = [
            'id' => (int) $segments[1],
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'age_group' => nullable_string($body['age_group'] ?? null),
            'duration' => nullable_string($body['duration'] ?? null),
            'short_description' => nullable_string($body['short_description'] ?? null),
            'full_description' => nullable_string($body['full_description'] ?? null),
            'highlights_json' => decode_list_field($body['highlights'] ?? ''),
            'subjects_json' => decode_list_field($body['subjects'] ?? ''),
            'theme_color' => nullable_string($body['theme_color'] ?? null) ?: 'bg-blue-50 border-blue-200',
            'brochure_url' => nullable_string($body['brochure_url'] ?? null),
            'image_url' => nullable_string($body['image_url'] ?? null),
            'sort_order' => (int) ($body['sort_order'] ?? 0),
        ];
        validate_required($payload, ['title', 'slug']);
        validate_text_length($payload['title'], 2, 120, 'Programme title');
        validate_slug($payload['slug']);

        $statement = $pdo->prepare('UPDATE programmes SET title = :title, slug = :slug, age_group = :age_group, duration = :duration, short_description = :short_description, full_description = :full_description, highlights_json = :highlights_json, subjects_json = :subjects_json, theme_color = :theme_color, brochure_url = :brochure_url, image_url = :image_url, sort_order = :sort_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        execute_or_respond_conflict($statement, $payload, 'A programme with this slug already exists. Please choose a different slug.');
        if (($existingRow['brochure_url'] ?? null) !== $payload['brochure_url']) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['brochure_url'] ?? ''));
        }
        if (($existingRow['image_url'] ?? null) !== $payload['image_url']) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['image_url'] ?? ''));
        }
        log_activity($pdo, 'update', 'programme', $payload['id'], 'Updated programme ' . $payload['title']);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT brochure_url, image_url, title FROM programmes WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        $statement = $pdo->prepare('DELETE FROM programmes WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        if ($existingRow) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['brochure_url'] ?? ''));
            delete_upload_file_if_unused($pdo, (string) ($existingRow['image_url'] ?? ''));
            log_activity($pdo, 'delete', 'programme', (int) $segments[1], 'Deleted programme ' . $existingRow['title']);
        }
        respond(['success' => true]);
    }
}

function handle_posts(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE title LIKE :search OR slug LIKE :search OR excerpt LIKE :search OR category LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM blog_posts' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM blog_posts' . $whereSql . ' ORDER BY COALESCE(published_at, created_at) DESC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $status = trim((string) ($body['status'] ?? 'draft'));
        $payload = [
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'excerpt' => nullable_string($body['excerpt'] ?? null),
            'content' => nullable_string($body['content'] ?? null),
            'category' => nullable_string($body['category'] ?? null),
            'status' => $status,
            'featured_image_url' => nullable_string($body['featured_image_url'] ?? null),
            'meta_title' => nullable_string($body['meta_title'] ?? null),
            'meta_description' => nullable_string($body['meta_description'] ?? null),
            'published_at' => $status === 'published' ? date('Y-m-d H:i:s') : null,
        ];
        validate_required($payload, ['title', 'slug', 'status']);
        validate_text_length($payload['title'], 2, 160, 'Post title');
        validate_slug($payload['slug']);
        validate_enum($payload['status'], ['draft', 'published'], 'Post status');

        $statement = $pdo->prepare('INSERT INTO blog_posts (title, slug, excerpt, content, category, status, featured_image_url, meta_title, meta_description, published_at) VALUES (:title, :slug, :excerpt, :content, :category, :status, :featured_image_url, :meta_title, :meta_description, :published_at)');
        execute_or_respond_conflict($statement, $payload, 'A blog post with this slug already exists. Please choose a different slug.');
        log_activity($pdo, 'create', 'blog_post', (int) $pdo->lastInsertId(), 'Created post ' . $payload['title']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $existingPost = get_post_by_id($pdo, (int) $segments[1]);
        if (!$existingPost) {
            respond(['message' => 'Post not found.'], 404);
        }

        $status = trim((string) ($body['status'] ?? 'draft'));
        $payload = [
            'id' => (int) $segments[1],
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'excerpt' => nullable_string($body['excerpt'] ?? null),
            'content' => nullable_string($body['content'] ?? null),
            'category' => nullable_string($body['category'] ?? null),
            'status' => $status,
            'featured_image_url' => nullable_string($body['featured_image_url'] ?? null),
            'meta_title' => nullable_string($body['meta_title'] ?? null),
            'meta_description' => nullable_string($body['meta_description'] ?? null),
            'published_at' => $status === 'published'
                ? ((string) ($existingPost['published_at'] ?? '') !== '' ? $existingPost['published_at'] : date('Y-m-d H:i:s'))
                : null,
        ];
        validate_required($payload, ['title', 'slug', 'status']);
        validate_text_length($payload['title'], 2, 160, 'Post title');
        validate_slug($payload['slug']);
        validate_enum($payload['status'], ['draft', 'published'], 'Post status');

        $statement = $pdo->prepare('UPDATE blog_posts SET title = :title, slug = :slug, excerpt = :excerpt, content = :content, category = :category, status = :status, featured_image_url = :featured_image_url, meta_title = :meta_title, meta_description = :meta_description, published_at = :published_at, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        execute_or_respond_conflict($statement, $payload, 'A blog post with this slug already exists. Please choose a different slug.');
        if (($existingPost['featured_image_url'] ?? null) !== $payload['featured_image_url']) {
            delete_upload_file_if_unused($pdo, (string) ($existingPost['featured_image_url'] ?? ''));
        }
        log_activity($pdo, 'update', 'blog_post', $payload['id'], 'Updated post ' . $payload['title']);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $existing = get_post_by_id($pdo, (int) $segments[1]);
        $statement = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        if ($existing) {
            delete_upload_file_if_unused($pdo, (string) ($existing['featured_image_url'] ?? ''));
            log_activity($pdo, 'delete', 'blog_post', (int) $segments[1], 'Deleted post ' . $existing['title']);
        }
        respond(['success' => true]);
    }
}

function handle_staff(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE name LIKE :search OR slug LIKE :search OR position LIKE :search OR department LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM staff' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM staff' . $whereSql . ' ORDER BY sort_order ASC, name ASC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = [
            'name' => trim((string) ($body['name'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'position' => nullable_string($body['position'] ?? null),
            'department' => nullable_string($body['department'] ?? null),
            'qualification' => nullable_string($body['qualification'] ?? null),
            'email' => nullable_string($body['email'] ?? null),
            'phone' => nullable_string($body['phone'] ?? null),
            'photo_url' => nullable_string($body['photo_url'] ?? null),
            'bio' => nullable_string($body['bio'] ?? null),
            'featured' => !empty($body['featured']) ? 1 : 0,
            'sort_order' => (int) ($body['sort_order'] ?? 0),
        ];
        validate_required($payload, ['name', 'slug']);
        validate_text_length($payload['name'], 2, 120, 'Staff name');
        validate_slug($payload['slug']);
        if ($payload['email']) {
            validate_email((string) $payload['email']);
        }

        $statement = $pdo->prepare('INSERT INTO staff (name, slug, position, department, qualification, email, phone, photo_url, bio, featured, sort_order) VALUES (:name, :slug, :position, :department, :qualification, :email, :phone, :photo_url, :bio, :featured, :sort_order)');
        execute_or_respond_conflict($statement, $payload, 'A staff profile with this slug already exists. Please choose a different slug.');
        log_activity($pdo, 'create', 'staff', (int) $pdo->lastInsertId(), 'Created staff profile ' . $payload['name']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT photo_url, name FROM staff WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        if (!$existingRow) {
            respond(['message' => 'Staff profile not found.'], 404);
        }
        $payload = [
            'id' => (int) $segments[1],
            'name' => trim((string) ($body['name'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'position' => nullable_string($body['position'] ?? null),
            'department' => nullable_string($body['department'] ?? null),
            'qualification' => nullable_string($body['qualification'] ?? null),
            'email' => nullable_string($body['email'] ?? null),
            'phone' => nullable_string($body['phone'] ?? null),
            'photo_url' => nullable_string($body['photo_url'] ?? null),
            'bio' => nullable_string($body['bio'] ?? null),
            'featured' => !empty($body['featured']) ? 1 : 0,
            'sort_order' => (int) ($body['sort_order'] ?? 0),
        ];
        validate_required($payload, ['name', 'slug']);
        validate_text_length($payload['name'], 2, 120, 'Staff name');
        validate_slug($payload['slug']);
        if ($payload['email']) {
            validate_email((string) $payload['email']);
        }

        $statement = $pdo->prepare('UPDATE staff SET name = :name, slug = :slug, position = :position, department = :department, qualification = :qualification, email = :email, phone = :phone, photo_url = :photo_url, bio = :bio, featured = :featured, sort_order = :sort_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        execute_or_respond_conflict($statement, $payload, 'A staff profile with this slug already exists. Please choose a different slug.');
        if (($existingRow['photo_url'] ?? null) !== $payload['photo_url']) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['photo_url'] ?? ''));
        }
        log_activity($pdo, 'update', 'staff', $payload['id'], 'Updated staff profile ' . $payload['name']);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT photo_url, name FROM staff WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        $statement = $pdo->prepare('DELETE FROM staff WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        if ($existingRow) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['photo_url'] ?? ''));
            log_activity($pdo, 'delete', 'staff', (int) $segments[1], 'Deleted staff profile ' . $existingRow['name']);
        }
        respond(['success' => true]);
    }
}

function handle_faqs(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        respond(['items' => get_faqs($pdo, true)]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = [
            'question' => trim((string) ($body['question'] ?? '')),
            'answer' => trim((string) ($body['answer'] ?? '')),
            'sort_order' => (int) ($body['sort_order'] ?? 0),
            'is_published' => !empty($body['is_published']) ? 1 : 0,
        ];
        validate_required($payload, ['question', 'answer']);
        validate_text_length($payload['question'], 6, 180, 'Question');
        validate_text_length($payload['answer'], 10, 2000, 'Answer');

        $statement = $pdo->prepare('INSERT INTO faqs (question, answer, sort_order, is_published) VALUES (:question, :answer, :sort_order, :is_published)');
        $statement->execute($payload);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $payload = [
            'id' => (int) $segments[1],
            'question' => trim((string) ($body['question'] ?? '')),
            'answer' => trim((string) ($body['answer'] ?? '')),
            'sort_order' => (int) ($body['sort_order'] ?? 0),
            'is_published' => !empty($body['is_published']) ? 1 : 0,
        ];
        validate_required($payload, ['question', 'answer']);
        validate_text_length($payload['question'], 6, 180, 'Question');
        validate_text_length($payload['answer'], 10, 2000, 'Answer');

        $statement = $pdo->prepare('UPDATE faqs SET question = :question, answer = :answer, sort_order = :sort_order, is_published = :is_published, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        $statement->execute($payload);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $statement = $pdo->prepare('DELETE FROM faqs WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        respond(['success' => true]);
    }
}

function handle_facilities(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE title LIKE :search OR slug LIKE :search OR short_description LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM facilities' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM facilities' . $whereSql . ' ORDER BY display_order ASC, title ASC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = [
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'short_description' => nullable_string($body['short_description'] ?? null),
            'image_url' => nullable_string($body['image_url'] ?? null),
            'display_order' => (int) ($body['display_order'] ?? 0),
        ];
        validate_required($payload, ['title', 'slug']);
        validate_text_length($payload['title'], 2, 120, 'Facility title');
        validate_slug($payload['slug']);

        $statement = $pdo->prepare('INSERT INTO facilities (title, slug, short_description, image_url, display_order) VALUES (:title, :slug, :short_description, :image_url, :display_order)');
        execute_or_respond_conflict($statement, $payload, 'A facility with this slug already exists. Please choose a different slug.');
        log_activity($pdo, 'create', 'facility', (int) $pdo->lastInsertId(), 'Created facility ' . $payload['title']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT image_url, title FROM facilities WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        if (!$existingRow) {
            respond(['message' => 'Facility not found.'], 404);
        }
        $payload = [
            'id' => (int) $segments[1],
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'short_description' => nullable_string($body['short_description'] ?? null),
            'image_url' => nullable_string($body['image_url'] ?? null),
            'display_order' => (int) ($body['display_order'] ?? 0),
        ];
        validate_required($payload, ['title', 'slug']);
        validate_text_length($payload['title'], 2, 120, 'Facility title');
        validate_slug($payload['slug']);

        $statement = $pdo->prepare('UPDATE facilities SET title = :title, slug = :slug, short_description = :short_description, image_url = :image_url, display_order = :display_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        execute_or_respond_conflict($statement, $payload, 'A facility with this slug already exists. Please choose a different slug.');
        if (($existingRow['image_url'] ?? null) !== $payload['image_url']) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['image_url'] ?? ''));
        }
        log_activity($pdo, 'update', 'facility', $payload['id'], 'Updated facility ' . $payload['title']);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT image_url, title FROM facilities WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        $statement = $pdo->prepare('DELETE FROM facilities WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        if ($existingRow) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['image_url'] ?? ''));
            log_activity($pdo, 'delete', 'facility', (int) $segments[1], 'Deleted facility ' . $existingRow['title']);
        }
        respond(['success' => true]);
    }
}

function handle_testimonials(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE name LIKE :search OR role LIKE :search OR message LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM testimonials' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM testimonials' . $whereSql . ' ORDER BY display_order ASC, id ASC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = [
            'name' => trim((string) ($body['name'] ?? '')),
            'role' => nullable_string($body['role'] ?? null),
            'message' => trim((string) ($body['message'] ?? '')),
            'rating' => max(1, min(5, (int) ($body['rating'] ?? 5))),
            'photo_url' => nullable_string($body['photo_url'] ?? null),
            'is_published' => !empty($body['is_published']) ? 1 : 0,
            'display_order' => (int) ($body['display_order'] ?? 0),
        ];
        validate_required($payload, ['name', 'message']);
        validate_text_length($payload['name'], 2, 120, 'Name');
        validate_text_length($payload['message'], 10, 1500, 'Testimonial');

        $statement = $pdo->prepare('INSERT INTO testimonials (name, role, message, rating, photo_url, is_published, display_order) VALUES (:name, :role, :message, :rating, :photo_url, :is_published, :display_order)');
        $statement->execute($payload);
        log_activity($pdo, 'create', 'testimonial', (int) $pdo->lastInsertId(), 'Created testimonial for ' . $payload['name']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT photo_url, name FROM testimonials WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        if (!$existingRow) {
            respond(['message' => 'Testimonial not found.'], 404);
        }
        $payload = [
            'id' => (int) $segments[1],
            'name' => trim((string) ($body['name'] ?? '')),
            'role' => nullable_string($body['role'] ?? null),
            'message' => trim((string) ($body['message'] ?? '')),
            'rating' => max(1, min(5, (int) ($body['rating'] ?? 5))),
            'photo_url' => nullable_string($body['photo_url'] ?? null),
            'is_published' => !empty($body['is_published']) ? 1 : 0,
            'display_order' => (int) ($body['display_order'] ?? 0),
        ];
        validate_required($payload, ['name', 'message']);
        validate_text_length($payload['name'], 2, 120, 'Name');
        validate_text_length($payload['message'], 10, 1500, 'Testimonial');

        $statement = $pdo->prepare('UPDATE testimonials SET name = :name, role = :role, message = :message, rating = :rating, photo_url = :photo_url, is_published = :is_published, display_order = :display_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        $statement->execute($payload);
        if (($existingRow['photo_url'] ?? null) !== $payload['photo_url']) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['photo_url'] ?? ''));
        }
        log_activity($pdo, 'update', 'testimonial', $payload['id'], 'Updated testimonial for ' . $payload['name']);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT photo_url, name FROM testimonials WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        $statement = $pdo->prepare('DELETE FROM testimonials WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        if ($existingRow) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['photo_url'] ?? ''));
            log_activity($pdo, 'delete', 'testimonial', (int) $segments[1], 'Deleted testimonial for ' . $existingRow['name']);
        }
        respond(['success' => true]);
    }
}

function handle_gallery_items(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE title LIKE :search OR category LIKE :search OR description LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM gallery_items' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM gallery_items' . $whereSql . ' ORDER BY display_order ASC, id ASC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = [
            'title' => trim((string) ($body['title'] ?? '')),
            'category' => nullable_string($body['category'] ?? null),
            'image_url' => trim((string) ($body['image_url'] ?? '')),
            'description' => nullable_string($body['description'] ?? null),
            'is_published' => !empty($body['is_published']) ? 1 : 0,
            'display_order' => (int) ($body['display_order'] ?? 0),
        ];
        validate_required($payload, ['title', 'image_url']);
        validate_text_length($payload['title'], 2, 140, 'Gallery title');

        $statement = $pdo->prepare('INSERT INTO gallery_items (title, category, image_url, description, is_published, display_order) VALUES (:title, :category, :image_url, :description, :is_published, :display_order)');
        $statement->execute($payload);
        log_activity($pdo, 'create', 'gallery_item', (int) $pdo->lastInsertId(), 'Created gallery item ' . $payload['title']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT image_url, title FROM gallery_items WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        if (!$existingRow) {
            respond(['message' => 'Gallery item not found.'], 404);
        }
        $payload = [
            'id' => (int) $segments[1],
            'title' => trim((string) ($body['title'] ?? '')),
            'category' => nullable_string($body['category'] ?? null),
            'image_url' => trim((string) ($body['image_url'] ?? '')),
            'description' => nullable_string($body['description'] ?? null),
            'is_published' => !empty($body['is_published']) ? 1 : 0,
            'display_order' => (int) ($body['display_order'] ?? 0),
        ];
        validate_required($payload, ['title', 'image_url']);
        validate_text_length($payload['title'], 2, 140, 'Gallery title');

        $statement = $pdo->prepare('UPDATE gallery_items SET title = :title, category = :category, image_url = :image_url, description = :description, is_published = :is_published, display_order = :display_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        $statement->execute($payload);
        if (($existingRow['image_url'] ?? null) !== $payload['image_url']) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['image_url'] ?? ''));
        }
        log_activity($pdo, 'update', 'gallery_item', $payload['id'], 'Updated gallery item ' . $payload['title']);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $existing = $pdo->prepare('SELECT image_url, title FROM gallery_items WHERE id = ? LIMIT 1');
        $existing->execute([(int) $segments[1]]);
        $existingRow = $existing->fetch();
        $statement = $pdo->prepare('DELETE FROM gallery_items WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        if ($existingRow) {
            delete_upload_file_if_unused($pdo, (string) ($existingRow['image_url'] ?? ''));
            log_activity($pdo, 'delete', 'gallery_item', (int) $segments[1], 'Deleted gallery item ' . $existingRow['title']);
        }
        respond(['success' => true]);
    }
}

function handle_careers(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $status = trim((string) (query_param('status', '') ?? ''));
        $hiringStatus = trim((string) (query_param('hiring_status', '') ?? ''));
        $whereClauses = [];
        $whereParams = [];

        if ($search !== '') {
            $whereClauses[] = '(title LIKE :search OR slug LIKE :search OR department LIKE :search OR location LIKE :search OR employment_type LIKE :search)';
            $whereParams['search'] = '%' . $search . '%';
        }
        if ($status !== '') {
            validate_enum($status, ['draft', 'published'], 'Vacancy status');
            $whereClauses[] = 'status = :status';
            $whereParams['status'] = $status;
        }
        if ($hiringStatus !== '') {
            validate_enum($hiringStatus, ['open', 'closed'], 'Hiring status');
            $whereClauses[] = 'hiring_status = :hiring_status';
            $whereParams['hiring_status'] = $hiringStatus;
        }

        $whereSql = $whereClauses ? ' WHERE ' . implode(' AND ', $whereClauses) : '';
        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM careers_vacancies' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM careers_vacancies' . $whereSql . ' ORDER BY featured DESC, updated_at DESC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => array_map('normalize_career_vacancy_row', $statement->fetchAll()),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $status = trim((string) ($body['status'] ?? 'draft'));
        $hiringStatus = trim((string) ($body['hiring_status'] ?? 'open'));
        $payload = [
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'department' => nullable_string($body['department'] ?? null),
            'location' => nullable_string($body['location'] ?? null),
            'employment_type' => nullable_string($body['employment_type'] ?? null),
            'experience_level' => nullable_string($body['experience_level'] ?? null),
            'application_deadline' => nullable_string($body['application_deadline'] ?? null),
            'short_summary' => nullable_string($body['short_summary'] ?? null),
            'full_description' => nullable_string($body['full_description'] ?? null),
            'requirements_json' => decode_list_field($body['requirements'] ?? ''),
            'application_email' => nullable_string($body['application_email'] ?? null),
            'external_application_url' => nullable_string($body['external_application_url'] ?? null),
            'status' => $status,
            'hiring_status' => $hiringStatus,
            'featured' => !empty($body['featured']) ? 1 : 0,
        ];
        validate_required($payload, ['title', 'slug', 'status', 'hiring_status']);
        validate_text_length($payload['title'], 2, 255, 'Vacancy title');
        validate_slug($payload['slug']);
        validate_enum($payload['status'], ['draft', 'published'], 'Vacancy status');
        validate_enum($payload['hiring_status'], ['open', 'closed'], 'Hiring status');
        if ($payload['department']) {
            validate_text_length((string) $payload['department'], 2, 150, 'Department');
        }
        if ($payload['location']) {
            validate_text_length((string) $payload['location'], 2, 150, 'Location');
        }
        if ($payload['employment_type']) {
            validate_text_length((string) $payload['employment_type'], 2, 80, 'Employment type');
        }
        if ($payload['experience_level']) {
            validate_text_length((string) $payload['experience_level'], 2, 120, 'Experience level');
        }
        if ($payload['application_deadline']) {
            validate_iso_date((string) $payload['application_deadline'], 'Application deadline');
        }
        if ($payload['short_summary']) {
            validate_text_length((string) $payload['short_summary'], 10, 1000, 'Short summary');
        }
        if ($payload['full_description']) {
            validate_text_length((string) $payload['full_description'], 10, 20000, 'Full description');
        }
        if ($payload['application_email']) {
            validate_email((string) $payload['application_email']);
        }
        validate_optional_url($payload['external_application_url'], 'application link');

        $statement = $pdo->prepare('INSERT INTO careers_vacancies (title, slug, department, location, employment_type, experience_level, application_deadline, short_summary, full_description, requirements_json, application_email, external_application_url, status, hiring_status, featured) VALUES (:title, :slug, :department, :location, :employment_type, :experience_level, :application_deadline, :short_summary, :full_description, :requirements_json, :application_email, :external_application_url, :status, :hiring_status, :featured)');
        execute_or_respond_conflict($statement, $payload, 'A vacancy with this slug already exists. Please choose a different slug.');
        log_activity($pdo, 'create', 'career_vacancy', (int) $pdo->lastInsertId(), 'Created vacancy ' . $payload['title']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $existing = get_careers_vacancy_by_id($pdo, (int) $segments[1]);
        if (!$existing) {
            respond(['message' => 'Vacancy not found.'], 404);
        }

        $status = trim((string) ($body['status'] ?? 'draft'));
        $hiringStatus = trim((string) ($body['hiring_status'] ?? 'open'));
        $payload = [
            'id' => (int) $segments[1],
            'title' => trim((string) ($body['title'] ?? '')),
            'slug' => trim((string) ($body['slug'] ?? '')),
            'department' => nullable_string($body['department'] ?? null),
            'location' => nullable_string($body['location'] ?? null),
            'employment_type' => nullable_string($body['employment_type'] ?? null),
            'experience_level' => nullable_string($body['experience_level'] ?? null),
            'application_deadline' => nullable_string($body['application_deadline'] ?? null),
            'short_summary' => nullable_string($body['short_summary'] ?? null),
            'full_description' => nullable_string($body['full_description'] ?? null),
            'requirements_json' => decode_list_field($body['requirements'] ?? ''),
            'application_email' => nullable_string($body['application_email'] ?? null),
            'external_application_url' => nullable_string($body['external_application_url'] ?? null),
            'status' => $status,
            'hiring_status' => $hiringStatus,
            'featured' => !empty($body['featured']) ? 1 : 0,
        ];
        validate_required($payload, ['title', 'slug', 'status', 'hiring_status']);
        validate_text_length($payload['title'], 2, 255, 'Vacancy title');
        validate_slug($payload['slug']);
        validate_enum($payload['status'], ['draft', 'published'], 'Vacancy status');
        validate_enum($payload['hiring_status'], ['open', 'closed'], 'Hiring status');
        if ($payload['department']) {
            validate_text_length((string) $payload['department'], 2, 150, 'Department');
        }
        if ($payload['location']) {
            validate_text_length((string) $payload['location'], 2, 150, 'Location');
        }
        if ($payload['employment_type']) {
            validate_text_length((string) $payload['employment_type'], 2, 80, 'Employment type');
        }
        if ($payload['experience_level']) {
            validate_text_length((string) $payload['experience_level'], 2, 120, 'Experience level');
        }
        if ($payload['application_deadline']) {
            validate_iso_date((string) $payload['application_deadline'], 'Application deadline');
        }
        if ($payload['short_summary']) {
            validate_text_length((string) $payload['short_summary'], 10, 1000, 'Short summary');
        }
        if ($payload['full_description']) {
            validate_text_length((string) $payload['full_description'], 10, 20000, 'Full description');
        }
        if ($payload['application_email']) {
            validate_email((string) $payload['application_email']);
        }
        validate_optional_url($payload['external_application_url'], 'application link');

        $statement = $pdo->prepare('UPDATE careers_vacancies SET title = :title, slug = :slug, department = :department, location = :location, employment_type = :employment_type, experience_level = :experience_level, application_deadline = :application_deadline, short_summary = :short_summary, full_description = :full_description, requirements_json = :requirements_json, application_email = :application_email, external_application_url = :external_application_url, status = :status, hiring_status = :hiring_status, featured = :featured, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        execute_or_respond_conflict($statement, $payload, 'A vacancy with this slug already exists. Please choose a different slug.');
        log_activity($pdo, 'update', 'career_vacancy', $payload['id'], 'Updated vacancy ' . $payload['title']);
        respond(['success' => true]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $existing = get_careers_vacancy_by_id($pdo, (int) $segments[1]);
        $statement = $pdo->prepare('DELETE FROM careers_vacancies WHERE id = ?');
        $statement->execute([(int) $segments[1]]);
        if ($existing) {
            log_activity($pdo, 'delete', 'career_vacancy', (int) $segments[1], 'Deleted vacancy ' . $existing['title']);
        }
        respond(['success' => true]);
    }
}

function handle_enquiries(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE name LIKE :search OR email LIKE :search OR subject LIKE :search OR message LIKE :search OR type LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM enquiries' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM enquiries' . $whereSql . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $statement = $pdo->prepare('UPDATE enquiries SET is_read = ? WHERE id = ?');
        $statement->execute([!empty($body['is_read']) ? 1 : 0, (int) $segments[1]]);
        respond(['success' => true]);
    }
}

function handle_admissions(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE student_first_name LIKE :search OR student_last_name LIKE :search OR parent_name LIKE :search OR application_number LIKE :search OR class_applying LIKE :search OR email LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM admissions' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT * FROM admissions' . $whereSql . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $status = trim((string) ($body['status'] ?? 'pending'));
        $adminFeedbackProvided = array_key_exists('admin_feedback', $body);
        $adminFeedback = nullable_string($body['admin_feedback'] ?? null);
        validate_enum($status, ['pending', 'reviewing', 'approved', 'waitlisted', 'declined'], 'Application status');
        if ($adminFeedback !== null) {
            validate_text_length($adminFeedback, 0, 4000, 'Admin feedback');
        }
        if ($adminFeedbackProvided) {
            $statement = $pdo->prepare('UPDATE admissions SET status = ?, admin_feedback = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            $statement->execute([$status, $adminFeedback, (int) $segments[1]]);
        } else {
            $statement = $pdo->prepare('UPDATE admissions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            $statement->execute([$status, (int) $segments[1]]);
        }
        respond(['success' => true]);
    }
}

function handle_settings(PDO $pdo, string $method, array $body): void
{
    if ($method === 'GET') {
        respond(['items' => get_settings($pdo)]);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $payload = validate_settings_payload($body);
        $existingSettings = get_settings($pdo);
        $statement = $pdo->prepare('INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = CURRENT_TIMESTAMP');
        foreach ($payload as $key => $value) {
            $statement->execute([$key, $value]);
            if (($existingSettings[$key] ?? null) !== $value) {
                delete_upload_file_if_unused($pdo, (string) ($existingSettings[$key] ?? ''));
            }
        }
        log_activity($pdo, 'update', 'settings', null, 'Updated global site settings');
        respond(['success' => true]);
    }
}

function validate_admin_role(string $role): void
{
    validate_enum($role, ['admin', 'editor', 'admissions_manager', 'enquiries_manager'], 'User role');
}

function handle_users(PDO $pdo, string $method, array $segments, array $body): void
{
    if ($method === 'GET' && count($segments) === 1) {
        $params = pagination_params(10, 50);
        $search = $params['search'];
        $whereSql = '';
        $whereParams = [];

        if ($search !== '') {
            $whereSql = ' WHERE username LIKE :search OR display_name LIKE :search OR email LIKE :search OR role LIKE :search';
            $whereParams['search'] = '%' . $search . '%';
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) FROM admins' . $whereSql);
        $countStatement->execute($whereParams);
        $total = (int) $countStatement->fetchColumn();

        $statement = $pdo->prepare('SELECT id, username, display_name, email, role, is_active, recovery_key_created_at, created_at, updated_at FROM admins' . $whereSql . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        foreach ($whereParams as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
        }
        $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
        $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
        $statement->execute();

        respond([
            'items' => $statement->fetchAll(),
            'pagination' => pagination_payload($params['page'], $params['limit'], $total),
        ]);
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = [
            'username' => trim((string) ($body['username'] ?? '')),
            'display_name' => trim((string) ($body['display_name'] ?? '')),
            'email' => nullable_string($body['email'] ?? null),
            'role' => trim((string) ($body['role'] ?? 'editor')),
            'password' => (string) ($body['password'] ?? ''),
            'is_active' => array_key_exists('is_active', $body) ? (!empty($body['is_active']) ? 1 : 0) : 1,
        ];
        validate_required($payload, ['username', 'display_name', 'role', 'password']);
        validate_username($payload['username']);
        validate_text_length($payload['display_name'], 2, 80, 'Display name');
        if ($payload['email']) {
            validate_email((string) $payload['email']);
        }
        validate_admin_role($payload['role']);
        validate_password_strength($payload['password']);

        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha512', $payload['password'], $salt, 120000, 64);

        $statement = $pdo->prepare('INSERT INTO admins (username, display_name, email, role, is_active, password_salt, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)');
        execute_or_respond_conflict($statement, [
            $payload['username'],
            $payload['display_name'],
            $payload['email'],
            $payload['role'],
            $payload['is_active'],
            $salt,
            $hash,
        ], 'A user with this username already exists. Please choose a different username.');

        $userId = (int) $pdo->lastInsertId();
        log_activity($pdo, 'create', 'admin_user', $userId, 'Created admin user ' . $payload['username']);
        respond(['success' => true], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 2) {
        $userId = (int) $segments[1];
        $existing = find_admin_by_id($pdo, $userId);
        if (!$existing) {
            respond(['message' => 'User not found.'], 404);
        }

        $payload = [
            'id' => $userId,
            'username' => trim((string) ($body['username'] ?? $existing['username'])),
            'display_name' => trim((string) ($body['display_name'] ?? $existing['display_name'])),
            'email' => nullable_string($body['email'] ?? ($existing['email'] ?? null)),
            'role' => trim((string) ($body['role'] ?? $existing['role'])),
            'is_active' => array_key_exists('is_active', $body) ? (!empty($body['is_active']) ? 1 : 0) : (int) $existing['is_active'],
        ];

        validate_required($payload, ['username', 'display_name', 'role']);
        validate_username($payload['username']);
        validate_text_length($payload['display_name'], 2, 80, 'Display name');
        if ($payload['email']) {
            validate_email((string) $payload['email']);
        }
        validate_admin_role($payload['role']);

        if ($userId === current_admin_id() && ((int) $existing['is_active'] !== $payload['is_active'] || $existing['role'] !== $payload['role'])) {
            respond(['message' => 'You cannot deactivate yourself or change your own role from this screen.'], 422);
        }

        if (($existing['role'] ?? '') === 'admin' && ($payload['role'] !== 'admin' || $payload['is_active'] !== 1) && count_active_admin_accounts($pdo, $userId) < 1) {
            respond(['message' => 'At least one active admin account must remain.'], 422);
        }

        $statement = $pdo->prepare('UPDATE admins SET username = ?, display_name = ?, email = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        execute_or_respond_conflict($statement, [
            $payload['username'],
            $payload['display_name'],
            $payload['email'],
            $payload['role'],
            $payload['is_active'],
            $payload['id'],
        ], 'A user with this username already exists. Please choose a different username.');

        log_activity($pdo, 'update', 'admin_user', $payload['id'], 'Updated admin user ' . $payload['username']);
        respond(['success' => true]);
    }

    if (($method === 'PUT' || $method === 'PATCH') && count($segments) === 3 && $segments[2] === 'password') {
        $userId = (int) $segments[1];
        $existing = find_admin_by_id($pdo, $userId);
        if (!$existing) {
            respond(['message' => 'User not found.'], 404);
        }

        $password = (string) ($body['password'] ?? '');
        validate_password_strength($password);

        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha512', $password, $salt, 120000, 64);
        $statement = $pdo->prepare('UPDATE admins SET password_salt = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $statement->execute([$salt, $hash, $userId]);

        log_activity($pdo, 'update', 'admin_user_password', $userId, 'Changed password for ' . $existing['username']);
        respond(['success' => true]);
    }

    if ($method === 'POST' && count($segments) === 3 && $segments[2] === 'recovery-key') {
        $userId = (int) $segments[1];
        $existing = find_admin_by_id($pdo, $userId);
        if (!$existing) {
            respond(['message' => 'User not found.'], 404);
        }

        $recoveryKey = create_recovery_key();
        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha512', $recoveryKey, $salt, 120000, 64);
        $statement = $pdo->prepare('UPDATE admins SET recovery_key_salt = ?, recovery_key_hash = ?, recovery_key_created_at = NOW(), updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $statement->execute([$salt, $hash, $userId]);

        log_activity($pdo, 'create', 'admin_recovery_key', $userId, 'Generated recovery key for ' . $existing['username']);
        respond([
            'success' => true,
            'recovery_key' => $recoveryKey,
            'message' => 'Save this recovery key in a secure place. It will only be shown once.',
        ]);
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $userId = (int) $segments[1];
        $existing = find_admin_by_id($pdo, $userId);
        if (!$existing) {
            respond(['message' => 'User not found.'], 404);
        }
        if ($userId === current_admin_id()) {
            respond(['message' => 'You cannot delete your own account while signed in.'], 422);
        }
        if (($existing['role'] ?? '') === 'admin' && count_active_admin_accounts($pdo, $userId) < 1) {
            respond(['message' => 'At least one active admin account must remain.'], 422);
        }

        $statement = $pdo->prepare('DELETE FROM admins WHERE id = ?');
        $statement->execute([$userId]);
        log_activity($pdo, 'delete', 'admin_user', $userId, 'Deleted admin user ' . $existing['username']);
        respond(['success' => true]);
    }
}

function handle_activity_logs(PDO $pdo, string $method): void
{
    if ($method !== 'GET') {
        respond(['message' => 'Method not allowed.'], 405);
    }

    $params = pagination_params(20, 100);
    $search = $params['search'];
    $whereSql = '';
    $whereParams = [];

    if ($search !== '') {
        $whereSql = ' WHERE admin_username LIKE :search OR action LIKE :search OR entity_type LIKE :search OR summary LIKE :search';
        $whereParams['search'] = '%' . $search . '%';
    }

    $countStatement = $pdo->prepare('SELECT COUNT(*) FROM activity_logs' . $whereSql);
    $countStatement->execute($whereParams);
    $total = (int) $countStatement->fetchColumn();

    $statement = $pdo->prepare('SELECT * FROM activity_logs' . $whereSql . ' ORDER BY created_at DESC, id DESC LIMIT :limit OFFSET :offset');
    foreach ($whereParams as $key => $value) {
        $statement->bindValue(':' . $key, $value, PDO::PARAM_STR);
    }
    $statement->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
    $statement->bindValue(':offset', $params['offset'], PDO::PARAM_INT);
    $statement->execute();

    respond([
        'items' => $statement->fetchAll(),
        'pagination' => pagination_payload($params['page'], $params['limit'], $total),
    ]);
}

function handle_exports(PDO $pdo, array $segments): void
{
    $entity = $segments[1] ?? '';
    $allowed = [
        'enquiries' => ['admin', 'enquiries_manager'],
        'admissions' => ['admin', 'admissions_manager'],
        'staff' => ['admin', 'editor'],
        'programmes' => ['admin', 'editor'],
        'blog-posts' => ['admin', 'editor'],
    ];

    if (!isset($allowed[$entity])) {
        respond(['message' => 'Export not found.'], 404);
    }

    require_roles($allowed[$entity]);

    $config = match ($entity) {
        'enquiries' => ['query' => 'SELECT id, name, email, phone, subject, type, is_read, created_at FROM enquiries ORDER BY created_at DESC', 'filename' => 'enquiries-export.csv'],
        'admissions' => ['query' => 'SELECT application_number, student_first_name, student_last_name, class_applying, parent_name, parent_phone, email, status, created_at FROM admissions ORDER BY created_at DESC', 'filename' => 'admissions-export.csv'],
        'staff' => ['query' => 'SELECT name, slug, position, department, qualification, email, phone, featured, sort_order FROM staff ORDER BY sort_order ASC, name ASC', 'filename' => 'staff-export.csv'],
        'programmes' => ['query' => 'SELECT title, slug, age_group, duration, sort_order, created_at FROM programmes ORDER BY sort_order ASC, title ASC', 'filename' => 'programmes-export.csv'],
        'blog-posts' => ['query' => 'SELECT title, slug, category, status, published_at, created_at FROM blog_posts ORDER BY COALESCE(published_at, created_at) DESC', 'filename' => 'blog-posts-export.csv'],
    };

    $rows = $pdo->query($config['query'])->fetchAll();

    header_remove('Content-Type');
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $config['filename'] . '"');

    $output = fopen('php://output', 'wb');
    if ($output === false) {
        respond(['message' => 'Could not generate export.'], 500);
    }

    if ($rows !== []) {
        fputcsv($output, array_keys($rows[0]));
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }
    }

    fclose($output);
    exit;
}
