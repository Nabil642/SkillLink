<?php
// skills_api.php
require_once __DIR__ . '/config.php';

// --- Basic CORS + JSON headers (adjust origin if you want to restrict) ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204); exit;
}

// Helpers
function json_input() {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
function respond($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr); exit;
}

// Read action
$action = isset($_GET['action']) ? trim($_GET['action']) : 'list';

// ROUTES
switch ($action) {
  case 'create':
    create_skill($pdo);
    break;

  case 'update':
    update_skill($pdo);
    break;

  case 'delete':
    delete_skill($pdo);
    break;

  case 'list':
    list_skills($pdo);
    break;

  case 'categories':
    list_categories($pdo);
    break;

  default:
    respond(['success' => false, 'error' => 'Unknown action'], 400);
}


// ========== ACTION HANDLERS ==========

function create_skill(PDO $pdo) {
  $in = json_input();

  $title = trim($in['title'] ?? '');
  $description = trim($in['description'] ?? '');
  $category = trim($in['category'] ?? '');
  $price = floatval($in['price'] ?? 0);
  $photo = trim($in['photo'] ?? '');
  $rating = isset($in['rating']) ? round(floatval($in['rating']), 1) : round(mt_rand(30, 50) / 10, 1); // 3.0–5.0

  if ($title === '' || $description === '' || $category === '' || $photo === '') {
    respond(['success' => false, 'error' => 'Missing required fields'], 422);
  }

  $sql = "INSERT INTO skills (title, description, category, price, photo, rating)
          VALUES (:title, :description, :category, :price, :photo, :rating)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':title' => $title,
    ':description' => $description,
    ':category' => $category,
    ':price' => $price,
    ':photo' => $photo,
    ':rating' => $rating
  ]);

  $id = (int)$pdo->lastInsertId();
  respond(['success' => true, 'data' => ['id' => $id]]);
}

function update_skill(PDO $pdo) {
  $in = json_input();
  $id = intval($in['id'] ?? 0);

  if ($id <= 0) respond(['success' => false, 'error' => 'Invalid id'], 422);

  // Only include provided fields
  $fields = [];
  $params = [':id' => $id];

  foreach (['title','description','category','photo'] as $f) {
    if (isset($in[$f])) { $fields[] = "$f = :$f"; $params[":$f"] = trim($in[$f]); }
  }
  if (isset($in['price']))  { $fields[] = "price = :price";   $params[':price']  = floatval($in['price']); }
  if (isset($in['rating'])) { $fields[] = "rating = :rating"; $params[':rating'] = round(floatval($in['rating']), 1); }

  if (empty($fields)) respond(['success' => false, 'error' => 'No fields to update'], 422);

  $sql = "UPDATE skills SET ".implode(', ', $fields)." WHERE id = :id";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  respond(['success' => true]);
}

function delete_skill(PDO $pdo) {
  $in = json_input();
  $id = intval($in['id'] ?? 0);
  if ($id <= 0) respond(['success' => false, 'error' => 'Invalid id'], 422);

  $stmt = $pdo->prepare("DELETE FROM skills WHERE id = :id");
  $stmt->execute([':id' => $id]);

  respond(['success' => true]);
}

function list_skills(PDO $pdo) {
  // Query params via GET
  $q        = isset($_GET['q']) ? trim($_GET['q']) : '';
  $category = isset($_GET['category']) ? trim($_GET['category']) : '';
  $sort     = isset($_GET['sort']) ? trim($_GET['sort']) : ''; // priceLow, priceHigh, ratingHigh
  $limit    = max(1, min(100, intval($_GET['limit'] ?? 50)));
  $offset   = max(0, intval($_GET['offset'] ?? 0));

  $where = [];
  $params = [];

  if ($q !== '') {
    // Prefer FULLTEXT if available, else LIKE
    // Using LIKE for simplicity (works without FT index)
    $where[] = "(title LIKE :kw OR description LIKE :kw)";
    $params[':kw'] = '%'.$q.'%';
  }

  if ($category !== '') {
    $where[] = "category = :category";
    $params[':category'] = $category;
  }

  $whereSql = $where ? ('WHERE '.implode(' AND ', $where)) : '';

  // Sorting
  $order = "ORDER BY created_at DESC";
  if ($sort === 'priceLow')   $order = "ORDER BY price ASC";
  if ($sort === 'priceHigh')  $order = "ORDER BY price DESC";
  if ($sort === 'ratingHigh') $order = "ORDER BY rating DESC";

  // Count
  $countSql = "SELECT COUNT(*) AS cnt FROM skills $whereSql";
  $countStmt = $pdo->prepare($countSql);
  $countStmt->execute($params);
  $total = (int)($countStmt->fetch()['cnt'] ?? 0);

  // Page
  $sql = "SELECT id, title, description, category, price, photo, rating, created_at, updated_at
          FROM skills
          $whereSql
          $order
          LIMIT :limit OFFSET :offset";

  $stmt = $pdo->prepare($sql);
  foreach ($params as $k => $v) $stmt->bindValue($k, $v);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $rows = $stmt->fetchAll();
  respond(['success' => true, 'data' => $rows, 'page' => ['total' => $total, 'limit' => $limit, 'offset' => $offset]]);
}

function list_categories(PDO $pdo) {
  $sql = "SELECT DISTINCT category FROM skills ORDER BY category ASC";
  $rows = $pdo->query($sql)->fetchAll(PDO::FETCH_COLUMN);
  respond(['success' => true, 'data' => $rows]);
}
