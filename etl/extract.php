<?php

// ✧ ─────────── coordinates transform ────────────── ✧

composer require antistatique/swisstopo

// ✧ ─────────── diagram 1 ────────────── ✧

// ♡ get total amount of cinemas in switzerland per year

$json1 = file_get_contents('../data/diagram1.json');

$data1 = json_decode($json1, true);

$years = $data1['dataset']['dimension']['Jahr']['category']['label'];
$cinema_ch_totals = $data1['dataset']['value'];

if (count($cinema_ch_totals) == count($years)) {
    print_r("Prüfung erfolgt. Jedes Jahr verfügt über Daten.");
}
else {
    print_r("ACHTUNG: FEHLENDE DATEN");
}

//print_r($year);
//print_r($cinema_ch_total);

$cinemas_per_year = array_combine($years, $cinema_ch_totals);

//print_r($cinemas_per_year);
//10 Stichproben erfolgreich

// ✧ ─────────── diagram 2 ────────────── ✧

// ♡ get total amount of cinemas per municipality per year

$json2 = file_get_contents('../data/diagram2.json');

$data2 = json_decode($json2, true);

$municipalities = $data2['dataset']['dimension']['Kanton (-) / Gemeinde (......)']['category']['label'];

$cinema_mun_totals = $data2['dataset']['value'];

$cinema_mun_totals_labelled = [];
$i = 0;

foreach ($municipalities as $municipality) {
    foreach ($years as $year) {
        $cinema_mun_totals_labelled[$municipality][$year]=$cinema_mun_totals[$i];
        $i++;
    }
}

//print_r($cinema_mun_totals_labelled);

// ♡ get coordinates (format lv95) of municipalities via bfs code

$handle = fopen('../data/diagram2_coordinates.csv' , 'r');
$header = array_map('trim', fgetcsv($handle , null , ',' , '"' , ''));

$bfs_codes_and_coordinates_lv95 = [];

while (($row = fgetcsv($handle , null , ',' , '"' , '"')) !== false) {
    if ($row[0]==='') {
        continue;
    }
    $bfs_codes_and_coordinates_lv95[]=array_combine($header, $row);
}
fclose($handle);

print_r($bfs_codes_and_coordinates_lv95);

// ♡ transform coordinates from lv95 format to WGS84



