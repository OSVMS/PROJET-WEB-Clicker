<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$leaderboard = getTopLeaderboard();

echo json_encode([
    'ok' => true,
    'leaderboard' => $leaderboard,
]);
