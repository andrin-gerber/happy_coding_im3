<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php';

$pdo = new PDO($dsn, $username, $password, $options);

$sql = "SELECT
year,
cinema_ch_total
FROM diagram1";

$statement = $pdo->prepare($sql);
$statement->execute();
$rows = $statement->fetchAll();

echo json_encode($rows, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);

