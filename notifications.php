<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
$user_id = $_SESSION['user_id'];
$conn = new mysqli('localhost', 'root', '', 'skill_share');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Fetch notifications for the user
$notifications = $conn->query("SELECT message, is_read, created_at FROM notifications WHERE user_id = $user_id ORDER BY created_at DESC");

// Optionally, mark all as read
$conn->query("UPDATE notifications SET is_read = 1 WHERE user_id = $user_id AND is_read = 0");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Your Notifications</title>
    <style>
        .notification-list {
            max-width: 600px;
            margin: 30px auto;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .notification {
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 5px;
            background: #fff;
            border-left: 5px solid #007bff;
        }
        .notification.unread {
            background: #e9f7fe;
            font-weight: bold;
            border-left-color: #ffc107;
        }
        .notification small {
            color: #888;
            float: right;
        }
        h2 {
            text-align: center;
        }
        a {
            display: block;
            margin: 20px auto;
            width: fit-content;
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <h2>Your Notifications</h2>
    <div class="notification-list">
        <?php if ($notifications->num_rows > 0): ?>
            <?php while ($n = $notifications->fetch_assoc()): ?>
                <div class="notification<?php echo $n['is_read'] ? '' : ' unread'; ?>">
                    <?php echo htmlspecialchars($n['message']); ?>
                    <small><?php echo $n['created_at']; ?></small>
                </div>
            <?php endwhile; ?>
        <?php else: ?>
            <p>No notifications yet.</p>
        <?php endif; ?>
    </div>
    <a href="home.php">&larr; Back to Home</a>
</body>
</html>