<?php
// config.php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'skilllink';
$DB_USER = 'root';
$DB_PASS = ''; // <-- set your password

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";

$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (Throwable $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['success' => false, 'error' => 'Database connection failed', 'detail' => $e->getMessage()]);
  exit;
}
