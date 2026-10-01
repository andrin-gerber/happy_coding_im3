<?php

header('Content-Type: text/plain; charset=utf-8');

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

//print_r($years);
//print_r($cinema_ch_total);

$cinemas_per_year = array_combine($years, $cinema_ch_totals);

//print_r($cinemas_per_year);
//10 Stichproben erfolgreich

// ✧ ─────────── diagram 2 ────────────── ✧

// ♡ get total amount of cinemas per municipality per year

$json2 = file_get_contents('../data/diagram2.json');

$data2 = json_decode($json2, true);


$municipalities = $data2['dataset']['dimension']['Kanton (-) / Gemeinde (......)']['category']['index'];
ksort($municipalities);
//Weil der BFS Code in den Keys und nicht im value gespeichert ist müssen wir nur die keys holen
$municipalities_bfs = array_flip($municipalities);


$cinema_mun_totals = $data2['dataset']['value'];

$cinema_mun_totals_labelled = [];
$i = 0;

foreach ($municipalities_bfs as $municipality) {
    foreach ($years as $year) {
        $cinema_mun_totals_labelled[$municipality][$year]=$cinema_mun_totals[$i];
        $i++;
    }
}


// ♡ get coordinates (format lv95) of municipalities via bfs code

$handle = fopen('../data/diagram2_coordinates.csv' , 'r');
$header = array_map('trim', fgetcsv($handle , null , ',' , '"' , ''));

$bfs_codes_and_coordinates = [];

while (($row = fgetcsv($handle , null , ',' , '"' , '"')) !== false) {
    if ($row[0]==='') {
        continue;
    }
    $bfs_codes_and_coordinates[]=array_combine($header, $row);
}
fclose($handle);


// ♡ combine coordinates with municipalities

$municipality_names = $data2['dataset']['dimension']['Kanton (-) / Gemeinde (......)']['category']['label'];

$data_diagram2 = [];

foreach ($cinema_mun_totals_labelled as $bfs => $cinemas_of_municipality) {
    foreach ($bfs_codes_and_coordinates as $bfs_and_coordinate) {
        if ((int)$bfs === (int)$bfs_and_coordinate['GDENR']) {
            $data_diagram2[$bfs] = [
                'name'        => $municipality_names[$bfs],
                'coordinates' => $bfs_and_coordinate,
                'cinemas'     => $cinemas_of_municipality,
            ];
            break; // Treffer gefunden, innere Schleife beenden
        }
    }
}



// ✧ ─────────── diagram 3 ────────────── ✧

// ♡ get total amount of halls per municipality in 1966 and 2025

$json3 = file_get_contents('../data/diagram3.json');

$data3 = json_decode($json3, true);


$year3 = $data3['dataset']['dimension']['Jahr']['category']['label'];

$halls = $data3['dataset']['value'];


$data_diagram3 = [];

$j1 = 0;

foreach ($municipalities as $municipality) {
    foreach ($year3 as $year) {
        $data_diagram3[$municipality][$year] = $halls[$j1];
        $j1++;
    }
}


return [
    'cinemas_per_year' => $cinemas_per_year,
    'data_diagram2'    => $data_diagram2,
    'data_diagram3'    => $data_diagram3
];
