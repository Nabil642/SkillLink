<?php
$conn = new mysqli('localhost', 'root', '', 'skill_share');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);
?>