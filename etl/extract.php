<?php

header('Content-Type: text/plain; charset=utf-8');

// ✧ ─────────── diagram 1 ────────────── ✧

// ♡ get total amount of cinemas in switzerland per year

// ♡ get the data from the file
$json1 = file_get_contents('../data/diagram1.json');
$data1 = json_decode($json1, true);

// ♡ get the years and the values in an array ready to combine
$years = $data1['dataset']['dimension']['Jahr']['category']['label'];
$cinema_ch_totals = $data1['dataset']['value'];

$cinemas_per_year = array_combine($years, $cinema_ch_totals);


// ✧ ─────────── diagram 2 ────────────── ✧

// ♡ get total amount of cinemas per municipality per year

// ♡ get the data from the files
$json2 = file_get_contents('../data/diagram2.json');
$data2 = json_decode($json2, true);

// ♡ get the years and the keys of the years of the data
$years = $data2['dataset']['dimension']['Jahr']['category']['label'];

// ♡ get all the values of the data
$values = $data2['dataset']['value'];

// ♡ get all the gfs codes of the municipalities of the data as values
$municipalityIndex = $data2['dataset']['dimension']['Kanton (-) / Gemeinde (......)']['category']['index'];
$municipalityIds = array_keys($municipalityIndex);

$cinemas_mun_totals = [];
$i = 0;
// ♡ create new array with gfs code -> array of every year with amount of cinemas in municipality
foreach ($municipalityIds as $gdenr) {

    foreach ($years as $year) {
        $cinemas_mun_totals[$gdenr][$year] = $values[$i];
        $i++;
    }
}

// ♡ get coordinates of municipalities via bfs code

// ♡ get data from files
$handle = fopen('../data/diagram2_coordinates.csv' , 'r');
$header = array_map('trim', fgetcsv($handle , null , ',' , '"' , ''));

$bfs_codes_and_coordinates = [];

// ♡ combine the header and the values to an array
while (($row = fgetcsv($handle , null , ',' , '"' , '"')) !== false) {
    if ($row[0]==='') {
        continue;
    }
    $bfs_codes_and_coordinates[]=array_combine($header, $row);
}
fclose($handle);

// ♡ combine coordinates with municipalities

// ♡ get a list of all names of the municipalities
$municipality_names = $data2['dataset']['dimension']['Kanton (-) / Gemeinde (......)']['category']['label'];

$data_diagram2 = [];
// ♡ combine the two arrays -> for each cinema bfs code go thru every coordinate bfs code -> if there is a match -> combine the two arrays and add it to a new array
foreach ($cinemas_mun_totals as $bfs => $cinemas_of_municipality) {
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

// ♡ get the data from the files
$json3 = file_get_contents('../data/diagram3.json');
$data3 = json_decode($json3, true);


$years3 = $data3['dataset']['dimension']['Jahr']['category']['label'];
$halls = $data3['dataset']['value'];
//municipalityIds comes from diagram2

$data_diagram3_part1 = [];
$i1 = 0;

// ♡ create array with the gfs code as key and add the number of halls to every year to every municipality
foreach ($municipalityIds as $municipalityId){
    foreach ($years3 as $year3){
        $data_diagram3_part1[$municipalityId][$year3] = $halls[$i1];
        $i1++;
    }
}


$data_diagram3 = [];

// ♡ combine the amount of cinemas in the two years with the array above
foreach ($data_diagram3_part1 as $key => $data_diagram3_part1_mun) {
    // ♡ create the array with the values null to be able to use the gfs code as key
    if (!isset($data_diagram3[$key])) {
        $data_diagram3[$key] = [
            'cinemas1966' => null,
            'cinemas2025' => null,
        ];
    }
    // ♡ combine the two arrays if the gfs code matches
    foreach ($data_diagram2 as $municipality_cinema) {

        if ((int)$municipality_cinema['coordinates']['GDENR'] === $key) {
            $data_diagram3[$key]['halls1966'] = $data_diagram3_part1_mun['1966'];
            $data_diagram3[$key]['halls2025'] = $data_diagram3_part1_mun['2025'];
            $data_diagram3[$key]['cinemas1966'] = $municipality_cinema['cinemas']['1966'];
            $data_diagram3[$key]['cinemas2025'] = $municipality_cinema['cinemas']['2025'];

            break;
        }
    }
}

return [
    'cinemas_per_year' => $cinemas_per_year,
    'data_diagram2'    => $data_diagram2,
    'data_diagram3'    => $data_diagram3
];
