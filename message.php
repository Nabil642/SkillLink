<?php
$conn = new mysqli('localhost', 'root', '', 'skill_share');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Session management
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php"); // Redirect to login page if not logged in
    exit;
}
$user_id = $_SESSION['user_id'];

// Handle message sending
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['send_message'])) {
    $receiver_id = $_POST['receiver_id'];
    $content = htmlspecialchars($_POST['content']);
    
    // Check if booking is confirmed between users
    $stmt = $conn->prepare("SELECT id FROM bookings WHERE skill_id IN (SELECT id FROM skills WHERE user_id = ?) AND booked_by = ? AND status = 'confirmed'");
    $stmt->bind_param("ii", $receiver_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0 || ($conn->query("SELECT id FROM bookings WHERE skill_id IN (SELECT id FROM skills WHERE user_id = $user_id) AND booked_by = $receiver_id AND status = 'confirmed'")->num_rows > 0)) {
        // Insert message
        $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $user_id, $receiver_id, $content);
        $stmt->execute();
        
        // Create notification for receiver
        $stmt = $conn->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
        $message = "New message from user ID $user_id";
        $stmt->bind_param("is", $receiver_id, $message);
        $stmt->execute();
    }
    $stmt->close();
}

// Check for new skills by known users (those with confirmed bookings)
$known_users = [];
$stmt = $conn->prepare("SELECT DISTINCT user_id FROM skills WHERE id IN (SELECT skill_id FROM bookings WHERE booked_by = ? AND status = 'confirmed')");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $known_users[] = $row['user_id'];
}
$stmt->close();

// Notify about new skills
if (!empty($known_users)) {
    $known_users_str = implode(',', $known_users);
    $recent_skills = $conn->query("SELECT s.title, u.username FROM skills s JOIN users u ON s.user_id = u.id WHERE s.user_id IN ($known_users_str) AND s.created_at > NOW() - INTERVAL 1 DAY");
    while ($skill = $recent_skills->fetch_assoc()) {
        $stmt = $conn->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
        $message = "New skill posted: {$skill['title']} by {$skill['username']}";
        $stmt->bind_param("is", $user_id, $message);
        $stmt->execute();
        $stmt->close();
    }
}

// Fetch notifications
$notifications = $conn->query("SELECT id, message, is_read, created_at FROM notifications WHERE user_id = $user_id ORDER BY created_at DESC");

// Fetch users with confirmed bookings for chat
$chat_users = $conn->query("SELECT DISTINCT u.id, u.username FROM users u JOIN bookings b ON (b.booked_by = u.id AND b.skill_id IN (SELECT id FROM skills WHERE user_id = $user_id) OR b.booked_by = $user_id AND b.skill_id IN (SELECT id FROM skills WHERE user_id = u.id)) WHERE b.status = 'confirmed' AND u.id != $user_id");

// Fetch messages if a chat is selected
$messages = [];
$selected_user = isset($_GET['chat_with']) ? (int)$_GET['chat_with'] : 0;
if ($selected_user) {
    $stmt = $conn->prepare("SELECT m.content, m.created_at, m.sender_id, u.username FROM messages m JOIN users u ON m.sender_id = u.id WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) ORDER BY m.created_at");
    $stmt->bind_param("iiii", $user_id, $selected_user, $selected_user, $user_id);
    $stmt->execute();
    $messages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    
    // Mark notifications as read
    $conn->query("UPDATE notifications SET is_read = 1 WHERE user_id = $user_id AND message LIKE 'New message from user ID $selected_user'");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat & Notifications - SkillShare</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            display: flex;
            max-width: 1200px;
            margin: 0 auto;
            gap: 20px;
        }
        .sidebar {
            width: 300px;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .chat-area {
            flex-grow: 1;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .notification {
            padding: 10px;
            margin-bottom: 10px;
            background: #e0f7fa;
            border-radius: 5px;
        }
        .notification.unread {
            background: #b3e5fc;
            font-weight: bold;
        }
        .chat-users {
            list-style: none;
            padding: 0;
        }
        .chat-users li {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        .chat-users li:hover {
            background: #f0f0f0;
        }
        .messages {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 10px;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 5px;
        }
        .message.sent {
            background: #d1e7dd;
            margin-left: 20%;
        }
        .message.received {
            background: #f8d7da;
            margin-right: 20%;
        }
        .message-form {
            display: flex;
            gap: 10px;
        }
        .message-form input[type="text"] {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .message-form button {
            padding: 8px 16px;
            background: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .message-form button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <h2>Notifications</h2>
            <?php while ($notification = $notifications->fetch_assoc()): ?>
                <div class="notification <?php echo $notification['is_read'] ? '' : 'unread'; ?>">
                    <?php echo htmlspecialchars($notification['message']); ?>
                    <br><small><?php echo $notification['created_at']; ?></small>
                </div>
            <?php endwhile; ?>
            
            <h2>Chat with Users</h2>
            <ul class="chat-users">
                <?php while ($user = $chat_users->fetch_assoc()): ?>
                    <li onclick="window.location.href='?chat_with=<?php echo $user['id']; ?>'">
                        <?php echo htmlspecialchars($user['username']); ?>
                    </li>
                <?php endwhile; ?>
            </ul>
        </div>
        
        <div class="chat-area">
            <?php if ($selected_user): ?>
                <h2>Chat with User ID <?php echo $selected_user; ?></h2>
                <div class="messages">
                    <?php foreach ($messages as $msg): ?>
                        <div class="message <?php echo $msg['sender_id'] == $user_id ? 'sent' : 'received'; ?>">
                            <strong><?php echo htmlspecialchars($msg['username']); ?>:</strong>
                            <?php echo htmlspecialchars($msg['content']); ?>
                            <br><small><?php echo $msg['created_at']; ?></small>
                        </div>
                    <?php endforeach; ?>
                </div>
                <form class="message-form" method="POST">
                    <input type="hidden" name="receiver_id" value="<?php echo $selected_user; ?>">
                    <input type="text" name="content" placeholder="Type your message..." required>
                    <button type="submit" name="send_message">Send</button>
                </form>
            <?php else: ?>
                <p>Select a user to start chatting.</p>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>