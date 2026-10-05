<?php
header('Content-Type: text/plain; charset=utf-8');


$extracted = include __DIR__ . '/extract.php';

$cinemas_per_year = $extracted['cinemas_per_year'];
$data_diagram2    = $extracted['data_diagram2'];
$data_diagram3    = $extracted['data_diagram3'];

$first_year = 1966;
$last_year  = 2025;
$years_expected = $last_year - $first_year + 1;

$audit = [
    'diagram1_years_expected'  => $years_expected,
    'diagram1_years_missing'   => 0,
    'diagram2_municipalities'  => count($data_diagram2),
    'diagram2_values_expected' => count($data_diagram2) * $years_expected,
    'diagram2_values_missing'  => 0,
];

// ✧ ─────────── diagram 1 ────────────── ✧

// ♡ get total amount of cinemas in switzerland per year

$diagram1 = [];

for ($year = $first_year; $year <= $last_year; $year++) {

    // fehlt das Jahr, wird es null (nicht 0: wir wissen es nicht)
    $value = $cinemas_per_year[$year] ?? null;

    if ($value === null) {
        $audit['diagram1_years_missing']++;
    }

    $diagram1[$year] = $value;
}

// ✧ ─────────── diagram 2 ────────────── ✧

// ♡ get total amount of cinemas per municipality per year

$diagram2 = [];

foreach ($data_diagram2 as $bfs => $municipality) {

    $cinemas = [];

    for ($year = $first_year; $year <= $last_year; $year++) {
        $value = $municipality['cinemas'][$year] ?? null;

        if ($value === null) {
            $audit['diagram2_values_missing']++;
        }

        $cinemas[$year] = $value;
    }

    // ♡ keep only name, coordinates and cinemas

    $diagram2[$bfs] = [
        'name'        => ltrim($municipality['name'], '.'),
        'coordinates' => [
            'latitude'  => (float) $municipality['coordinates']['LATITUDE'],
            'longitude' => (float) $municipality['coordinates']['LONGITUDE'],
        ],
        'cinemas'     => $cinemas,
    ];
}

// ✧ ─────────── diagram 3 ────────────── ✧

// ♡ combine cinemas + halls per municipality (1966 + 2025) with their bfs code

$raw = $extracted['data_diagram3'];
$diagram3 = [];

// ♡ add bfs code to the array as id
foreach ($raw as $gdenr => $values) {
    $diagram3[$gdenr] = [
        'id'             => $gdenr,
        'cinemas_1966'   => $values['cinemas1966'] ?? null,
        'cinemas_2025'   => $values['cinemas2025'] ?? null,
        'halls_1966'     => $values['halls1966'] ?? null,
        'halls_2025'     => $values['halls2025'] ?? null,
    ];
}

return [
    'diagram1' => $diagram1,
    'diagram2' => $diagram2,
    'diagram3' => $diagram3,
    'audit'    => $audit,
];

