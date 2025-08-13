<?php
// Enable error reporting for debugging (remove or comment out in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Enable CORS Headers
header("Access-Control-Allow-Origin: http://127.0.0.1:5500"); // Change to your front-end domain
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE"); // Allowed methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allowed headers
header("Access-Control-Allow-Credentials: true"); // Allow credentials if needed (like cookies)

// Handle pre-flight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php'; // Include your database connection file

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case "POST":
        if ($_GET['action'] == 'register') {
            registerUser();
        } elseif ($_GET['action'] == 'login') {
            loginUser();
        } elseif ($_GET['action'] == 'update_profile') {
            updateUserProfile();
        }
        break;

    case "GET":
        if ($_GET['action'] == 'retrieve_profile') {
            retrieveUserProfile();
        }elseif ($_GET['action'] == 'filter') {
            filterUsers(); // Add this line for filtering users
        }
        break;

    default:
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

// Registration Function
function registerUser() {
    global $conn;

    // Get raw POST data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Check if required fields are provided
    if (!isset($data['first_name']) || !isset($data['last_name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['location'])) {
        echo json_encode(["message" => "All fields are required"]);
        return;
    }

    // Sanitize input data
    $first_name = mysqli_real_escape_string($conn, $data['first_name']);
    $last_name = mysqli_real_escape_string($conn, $data['last_name']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = mysqli_real_escape_string($conn, $data['password']);
    $location = mysqli_real_escape_string($conn, $data['location']);

    // Check if email already exists
    $email_check_query = "SELECT * FROM users WHERE email = '$email' LIMIT 1";
    $result = mysqli_query($conn, $email_check_query);
    if (mysqli_num_rows($result) > 0) {
        echo json_encode(["message" => "Email already exists"]);
        return;
    }

    // Hash the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user into the database
    $query = "INSERT INTO users (first_name, last_name, email, password, location) VALUES ('$first_name', '$last_name', '$email', '$password_hash', '$location')";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["message" => "Registration successful"]);
    } else {
        echo json_encode(["message" => "Error: " . mysqli_error($conn)]);
    }
}


// Login Function
// Login Function
function loginUser() {
    global $conn;

    // Get raw POST data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Check if email and password are provided
    if (!isset($data['email']) || !isset($data['password'])) {
        echo json_encode(["message" => "Email and password are required"]);
        return;
    }

    // Sanitize input data
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = mysqli_real_escape_string($conn, $data['password']);

    // Check if email exists
    $query = "SELECT * FROM users WHERE email = '$email' LIMIT 1";
    $result = mysqli_query($conn, $query);
    $user = mysqli_fetch_assoc($result);

    if ($user && password_verify($password, $user['password'])) {
        // Successful login
        echo json_encode(["success" => true,"message" => "Login successful", "user_id" => $user['id']]);
    } else {
        // Incorrect credentials
        echo json_encode(["message" => "Invalid email or password"]);
    }
}


// Update Profile Function
function updateUserProfile() {
    global $conn;

    // Read raw JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Check if required fields are present
    if (!isset($data['user_id'], $data['first_name'], $data['last_name'], $data['email'], $data['location'])) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        return;
    }

    // Sanitize input data
    $user_id = mysqli_real_escape_string($conn, $data['user_id']);
    $first_name = mysqli_real_escape_string($conn, $data['first_name']);
    $last_name = mysqli_real_escape_string($conn, $data['last_name']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $location = mysqli_real_escape_string($conn, $data['location']);

    // Optionally, check if the email is already taken by another user (except for the current user)
    $email_check_query = "SELECT * FROM users WHERE email = '$email' AND id != '$user_id' LIMIT 1";
    $result = mysqli_query($conn, $email_check_query);
    if (mysqli_num_rows($result) > 0) {
        echo json_encode(["success" => false, "message" => "Email already exists"]);
        return;
    }

    // Update the user details
    $query = "UPDATE users SET first_name = '$first_name', last_name = '$last_name', email = '$email', location = '$location' WHERE id = '$user_id'";

    if (mysqli_query($conn, $query)) {
        echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . mysqli_error($conn)]);
    }
}

// Retrieve User Profile Function (GET)
function retrieveUserProfile() {
    global $conn;

    // Check if user_id is provided
    if (!isset($_GET['user_id'])) {
        echo json_encode(["message" => "User ID is required"]);
        return;
    }

    // Sanitize input data
    $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);

    // Query to retrieve user profile information
    $query = "SELECT id, first_name, last_name, email, location FROM users WHERE id = '$user_id' LIMIT 1";
    $result = mysqli_query($conn, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        // Fetch the user data
        $user = mysqli_fetch_assoc($result);
        echo json_encode(["success" => true,"message" => "User profile retrieved successfully", "user" => $user]);
    } else {
        echo json_encode(["message" => "User not found"]);
    }
}

// Filter Users Function
function filterUsers() {
    global $conn;

    // Fetch the location and skill parameters from GET request
    $location = isset($_GET['location']) ? mysqli_real_escape_string($conn, $_GET['location']) : '';
    $skill = isset($_GET['skill']) ? mysqli_real_escape_string($conn, $_GET['skill']) : '';

    // Construct the query
    $query = "
        SELECT u.id, u.first_name, u.last_name, u.email, u.location, GROUP_CONCAT(s.name) as skills
        FROM users u
        LEFT JOIN users_skills us ON u.id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.id
        WHERE (u.location LIKE '%$location%' OR '$location' = '')
        AND (s.name LIKE '%$skill%' OR '$skill' = '')
        GROUP BY u.id
    ";

    // Execute the query
    $result = mysqli_query($conn, $query);

    // Prepare the response
    $users = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $row['skills'] = $row['skills'] ? explode(',', $row['skills']) : []; // Convert skills to array
            $users[] = $row;
        }
    }

    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "success",
        "users" => $users,
    ]);
}

?>
