<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php';

$pdo = new PDO($dsn, $username, $password, $options);

// ✧ ─────────── diagram 1 ────────────── ✧

$sql1 = "SELECT
year,
cinema_ch_total
FROM diagram1";

$statement1 = $pdo->prepare($sql1);
$statement1->execute();
$rows1 = $statement1->fetchAll();

// ✧ ─────────── diagram 2 ────────────── ✧
$sql2 = "SELECT
    longitude,
    latitude,
    municipality,
    `1966`,
    `1967`,
    `1968`,
    `1969`,
    `1970`,
    `1971`,
    `1972`,
    `1973`,
    `1974`,
    `1975`,
    `1976`,
    `1977`,
    `1978`,
    `1979`,
    `1980`,
    `1981`,
    `1982`,
    `1983`,
    `1984`,
    `1985`,
    `1986`,
    `1987`,
    `1988`,
    `1989`,
    `1990`,
    `1991`,
    `1992`,
    `1993`,
    `1994`,
    `1995`,
    `1996`,
    `1997`,
    `1998`,
    `1999`,
    `2000`,
    `2001`,
    `2002`,
    `2003`,
    `2004`,
    `2005`,
    `2006`,
    `2007`,
    `2008`,
    `2009`,
    `2010`,
    `2011`,
    `2012`,
    `2013`,
    `2014`,
    `2015`,
    `2016`,
    `2017`,
    `2018`,
    `2019`,
    `2020`,
    `2021`,
    `2022`,
    `2023`,
    `2024`,
    `2025`
FROM diagram2";

$statement2 = $pdo->prepare($sql2);
$statement2->execute();
$rows2 = $statement2->fetchAll(PDO::FETCH_ASSOC);

// ✧ ─────────── diagram 3 ────────────── ✧

$sql3 = "SELECT
cinema_mun_total_1966,
cinema_mun_total_2025,
hall_mun_total_1966,
hall_mun_total_2025
FROM diagram3";

$statement3 = $pdo->prepare($sql3);
$statement3->execute();
$rows3 = $statement3->fetchAll();

echo json_encode($rows3, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);