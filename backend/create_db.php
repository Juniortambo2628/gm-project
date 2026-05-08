<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS jm_portfolio_db");
    echo "Database created successfully\n";
} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
