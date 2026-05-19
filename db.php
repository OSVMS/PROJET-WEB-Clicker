<?php

function ensureUsersSaveColumn(PDO $pdo): void
{
    try {
        $pdo->exec('ALTER TABLE users ADD COLUMN save_data LONGTEXT NULL');
    } catch (PDOException $error) {
        // Column already exists or not supported type in current driver.
    }

    try {
        $pdo->exec('ALTER TABLE users ADD COLUMN save_data TEXT NULL');
    } catch (PDOException $error) {
        // Column already exists.
    }

    try {
        $pdo->exec('ALTER TABLE users ADD COLUMN total_laps INT DEFAULT 0');
    } catch (PDOException $error) {
        // Column already exists.
    }

    try {
        $pdo->exec('ALTER TABLE users ADD COLUMN total_coins INT DEFAULT 0');
    } catch (PDOException $error) {
        // Column already exists.
    }
}

function getPdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $user = getenv('DB_USER') ?: 'racing_user';
    $pass = getenv('DB_PASS') ?: 'adminadmin';
    $dbname = getenv('DB_NAME') ?: 'racing_clicker';

    try {
        $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
        $pdo->exec("USE `$dbname`");

        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            save_data LONGTEXT NULL,
            total_laps INT DEFAULT 0,
            total_coins INT DEFAULT 0
        )");

        ensureUsersSaveColumn($pdo);

        return $pdo;
    } catch (PDOException $mysqlError) {
        $dataDir = __DIR__ . '/data';
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
        }

        $sqlitePath = $dataDir . '/racing_clicker.sqlite';
        $pdo = new PDO('sqlite:' . $sqlitePath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            save_data TEXT NULL,
            total_laps INTEGER DEFAULT 0,
            total_coins INTEGER DEFAULT 0
        )");

        ensureUsersSaveColumn($pdo);

        return $pdo;
    }
}

function loadUserSaveData(int $userId): ?array
{
    $pdo = getPdo();
    $stmt = $pdo->prepare('SELECT save_data FROM users WHERE id = :id');
    $stmt->execute(['id' => $userId]);
    $raw = $stmt->fetchColumn();

    if (!is_string($raw) || trim($raw) === '') {
        return null;
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

function saveUserSaveData(int $userId, array $saveData): bool
{
    $pdo = getPdo();
    $payload = json_encode($saveData, JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        return false;
    }

    $laps = isset($saveData['laps']) ? (int) $saveData['laps'] : 0;
    $coins = isset($saveData['coins']) ? (int) $saveData['coins'] : 0;
    $stmt = $pdo->prepare('UPDATE users SET save_data = :save_data, total_laps = :total_laps, total_coins = :total_coins WHERE id = :id');
    return $stmt->execute([
        'save_data' => $payload,
        'total_laps' => $laps,
        'total_coins' => $coins,
        'id' => $userId,
    ]);
}

function getTopLeaderboard(?int $limit = null): array
{
    $pdo = getPdo();
    if ($limit !== null) {
        $stmt = $pdo->prepare('SELECT id, username, total_laps, total_coins FROM users ORDER BY total_laps DESC LIMIT :limit');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $stmt = $pdo->query('SELECT id, username, total_laps, total_coins FROM users ORDER BY total_laps DESC');
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
