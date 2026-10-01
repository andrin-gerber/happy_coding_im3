<?php
header("Content-type: text/plain");

// ✧ ─────────── get access stuff from config.php ────────────── ✧
require __DIR__ . '/../config.php';
$pdo = new PDO($dsn, $username, $password, $options);

$pdo->exec('DELETE FROM diagram1');

$insert_year_ch = $pdo->prepare(
    'INSERT INTO diagram1 (year, cinema_ch_total)
    VALUES (:year, :cinema_ch_total)'
);


// ✧ ─────────── get data from transform.php ────────────── ✧
$transformed = include __DIR__ . '/transform.php';



// ✧ ─────────── Add data diagram1 ────────────── ✧
foreach ($transformed['diagram1'] as $year => $cinema_ch_total) {
    $insert_year_ch->execute([
        'year' => $year,
        'cinema_ch_total' => $cinema_ch_total,
    ]);
}