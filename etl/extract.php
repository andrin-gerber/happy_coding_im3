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

// ♡ get the years from json2
$years = $data2['dataset']['dimension']['Jahr']['category']['label'];

// ♡ get amount of cinemas per year for each municipality
$values = $data2['dataset']['value'];

// ♡ get all the bfs codes of the municipalities. flip the array so the bfs codes are the values instead of the keys
$municipalityIndex = $data2['dataset']['dimension']['Kanton (-) / Gemeinde (......)']['category']['index'];
$municipalityIds = array_keys($municipalityIndex);

// ♡ create new array with bfs code -> the array contains the amount of cinemas in each municipality for every year
$cinemas_mun_totals = [];
$i = 0;
foreach ($municipalityIds as $gdenr) {

    foreach ($years as $year) {
        $cinemas_mun_totals[$gdenr][$year] = $values[$i]; //nimm jedi gmeind, gang jedes jahr dure und mach en neue array für die gmeint mit de bfs nummere und em jahr und füeg det d azahl kinos wos i dem jahr i dere gmeind ge het i, das isch de "values", und gang alli values dure drum i++. zB: nimm adliswil bzw de bfs code devo - was i dem fall 131 isch, denn gang is jahr 1966, erstell en array mit de azahl kinos wos denn in adliswil ge het, indem du de value 0 (i=0) nimmsch. denn gang is nöchste jahr und nimm de nöchst value (i=1)
        $i++;
    }
}

// ✧ ─────────── fix municipalities (fusions) ────────────── ✧

// ♡ merge Bévilard (682) into Valbirse (717): Bévilard (682) has the values until 2014, Valbirse (717) from 2015.
$old = 682;
$new = 717;

if (isset($cinemas_mun_totals[$old], $cinemas_mun_totals[$new])) {
    foreach ($cinemas_mun_totals[$old] as $year => $value) {
        $cinemas_mun_totals[$old][$year] = $value ?? $cinemas_mun_totals[$new][$year] ?? null;
    }
    unset($cinemas_mun_totals[$new]);
}

// ♡ merge Rapperswil (3336) into Rapperswil-Jona (3340): Rapperswil (3336) has the values until 2006, Rapperswil-Jona (3340) from 2007.
$rapperswil = 3336;
$rapperswil_jona = 3340;

if (isset($cinemas_mun_totals[$rapperswil], $cinemas_mun_totals[$rapperswil_jona])) {
    foreach ($cinemas_mun_totals[$rapperswil] as $year => $value) {
        $cinemas_mun_totals[$rapperswil][$year] = $value ?? $cinemas_mun_totals[$rapperswil_jona][$year] ?? null;
    }
    unset($cinemas_mun_totals[$rapperswil_jona]);
}

// ♡ merge Oron-la-Ville (5793) into Oron (5805): Oron-la-Ville (5793) has the values until 2011, Oron (5805) from 2012.
$oron_la_ville = 5793;
$oron = 5805;

if (isset($cinemas_mun_totals[$oron_la_ville], $cinemas_mun_totals[$oron])) {
    foreach ($cinemas_mun_totals[$oron_la_ville] as $year => $value) {
        $cinemas_mun_totals[$oron_la_ville][$year] = $value ?? $cinemas_mun_totals[$oron][$year] ?? null;
    }
    unset($cinemas_mun_totals[$oron]);
}

// ♡ merge Carrouge (5782) into Jorat-Mézières (5806): Carrouge (5782) has the values until 2015, Jorat-Mézières (5806) from 2016.
$carrouge = 5782;
$jorat_mezieres = 5806;

if (isset($cinemas_mun_totals[$carrouge], $cinemas_mun_totals[$jorat_mezieres])) {
    foreach ($cinemas_mun_totals[$carrouge] as $year => $value) {
        $cinemas_mun_totals[$carrouge][$year] = $value ?? $cinemas_mun_totals[$jorat_mezieres][$year] ?? null;
    }
    unset($cinemas_mun_totals[$jorat_mezieres]);
}

// ♡ merge Corzoneso (5034) into Acquarossa (5048): Corzoneso (5034) has the values until 2003, Acquarossa (5048) from 2004.
$corzoneso = 5034;
$acquarossa = 5048;

if (isset($cinemas_mun_totals[$corzoneso], $cinemas_mun_totals[$acquarossa])) {
    foreach ($cinemas_mun_totals[$corzoneso] as $year => $value) {
        $cinemas_mun_totals[$corzoneso][$year] = $value ?? $cinemas_mun_totals[$acquarossa][$year] ?? null;
    }
    unset($cinemas_mun_totals[$acquarossa]);
}

// ♡ merge Bagnes (6031) into Val-de-Bagnes (6037): Bagnes (6031) has the values until 2020, Val-de-Bagnes (6037) from 2021.
$bagnes = 6031;
$val_de_bagnes = 6037;

if (isset($cinemas_mun_totals[$bagnes], $cinemas_mun_totals[$val_de_bagnes])) {
    foreach ($cinemas_mun_totals[$bagnes] as $year => $value) {
        $cinemas_mun_totals[$bagnes][$year] = $value ?? $cinemas_mun_totals[$val_de_bagnes][$year] ?? null;
    }
    unset($cinemas_mun_totals[$val_de_bagnes]);
}

// ♡ merge Delémont (BE) (467) into Delémont (JU) (6711): Delémont (BE) (467) has the values until 1978, Delémont (JU) (6711) from 1979.
$delemont_be = 467;
$delemont_ju = 6711;

if (isset($cinemas_mun_totals[$delemont_be], $cinemas_mun_totals[$delemont_ju])) {
    foreach ($cinemas_mun_totals[$delemont_be] as $year => $value) {
        $cinemas_mun_totals[$delemont_be][$year] = $value ?? $cinemas_mun_totals[$delemont_ju][$year] ?? null;
    }
    unset($cinemas_mun_totals[$delemont_ju]);
}

// ♡ merge Le Noirmont (BE) (522) into Le Noirmont (JU) (6754): Le Noirmont (BE) (522) has the values until 1978, Le Noirmont (JU) (6754) from 1979.
$le_noirmont_be = 522;
$le_noirmont_ju = 6754;

if (isset($cinemas_mun_totals[$le_noirmont_be], $cinemas_mun_totals[$le_noirmont_ju])) {
    foreach ($cinemas_mun_totals[$le_noirmont_be] as $year => $value) {
        $cinemas_mun_totals[$le_noirmont_be][$year] = $value ?? $cinemas_mun_totals[$le_noirmont_ju][$year] ?? null;
    }
    unset($cinemas_mun_totals[$le_noirmont_ju]);
}

// ♡ merge Les Breuleux (BE) (513) into Les Breuleux (JU) (6743): Les Breuleux (BE) (513) has the values until 1978, Les Breuleux (JU) (6743) from 1979.
$les_breuleux_be = 513;
$les_breuleux_ju = 6743;

if (isset($cinemas_mun_totals[$les_breuleux_be], $cinemas_mun_totals[$les_breuleux_ju])) {
    foreach ($cinemas_mun_totals[$les_breuleux_be] as $year => $value) {
        $cinemas_mun_totals[$les_breuleux_be][$year] = $value ?? $cinemas_mun_totals[$les_breuleux_ju][$year] ?? null;
    }
    unset($cinemas_mun_totals[$les_breuleux_ju]);
}

// ♡ merge Porrentruy (BE) (830) into Porrentruy (JU) (6800): Porrentruy (BE) (830) has the values until 1978, Porrentruy (JU) (6800) from 1979.
$porrentruy_be = 830;
$porrentruy_ju = 6800;

if (isset($cinemas_mun_totals[$porrentruy_be], $cinemas_mun_totals[$porrentruy_ju])) {
    foreach ($cinemas_mun_totals[$porrentruy_be] as $year => $value) {
        $cinemas_mun_totals[$porrentruy_be][$year] = $value ?? $cinemas_mun_totals[$porrentruy_ju][$year] ?? null;
    }
    unset($cinemas_mun_totals[$porrentruy_ju]);
}

// ♡ combine Braunwald (1603) into Schwanden (1627) by summing the values for each year 1966 to 2025
$schwanden = 1627;
$braunwald = 1603;

if (isset($cinemas_mun_totals[$schwanden], $cinemas_mun_totals[$braunwald])) {
    for ($year = 1966; $year <= 2025; $year++) {
        $value_schwanden = $cinemas_mun_totals[$schwanden][$year] ?? null;
        $value_braunwald = ($year >= 2011) ? 0 : ($cinemas_mun_totals[$braunwald][$year] ?? null);

        $cinemas_mun_totals[$schwanden][$year] = ($value_schwanden === null && $value_braunwald === null)
            ? null
            : ($value_schwanden ?? 0) + ($value_braunwald ?? 0);
    }
    unset($cinemas_mun_totals[$braunwald]);
}

// ♡ combine Näfels (1619) into Niederurnen (1622) by summing the values for each year 1966-2010, then use ONLY the values of Glarus Nord (1630) for each year 2011-2025
$niederurnen = 1622;
$naefels = 1619;
$glarus_nord = 1630;

for ($year = 1966; $year <= 2010; $year++) {
    $value_niederurnen = $cinemas_mun_totals[$niederurnen][$year] ?? null;
    $value_naefels = $cinemas_mun_totals[$naefels][$year] ?? null;

    $cinemas_mun_totals[$niederurnen][$year] = ($value_niederurnen === null && $value_naefels === null)
        ? null
        : ($value_niederurnen ?? 0) + ($value_naefels ?? 0);
}

for ($year = 2011; $year <= 2025; $year++) {
    $cinemas_mun_totals[$niederurnen][$year] = $cinemas_mun_totals[$glarus_nord][$year] ?? null;
}

unset($cinemas_mun_totals[$naefels], $cinemas_mun_totals[$glarus_nord]);

// ♡ combine Montana (6243) into Chermignon (6234) by summing the values for each year 1966-2016, then use ONLY the values of Crans-Montana (6253) for each year 2017-2025
$chermignon = 6234;
$montana = 6243;
$crans_montana = 6253;

for ($year = 1966; $year <= 2016; $year++) {
    $value_chermignon = $cinemas_mun_totals[$chermignon][$year] ?? null;
    $value_montana = $cinemas_mun_totals[$montana][$year] ?? null;

    $cinemas_mun_totals[$chermignon][$year] = ($value_chermignon === null && $value_montana === null)
        ? null
        : ($value_chermignon ?? 0) + ($value_montana ?? 0);
}

for ($year = 2017; $year <= 2025; $year++) {
    $cinemas_mun_totals[$chermignon][$year] = $cinemas_mun_totals[$crans_montana][$year] ?? null;
}

unset($cinemas_mun_totals[$montana], $cinemas_mun_totals[$crans_montana]);

// ♡ combine Fleurier (6506) and Travers (6510) into Couvet (6505) by summing the values for each year 1966-2008, then use ONLY the values of Val-de-Travers (6512) for each year 2009-2025
$couvet = 6505;
$fleurier = 6506;
$travers = 6510;
$val_de_travers = 6512;

for ($year = 1966; $year <= 2008; $year++) {
    $value_couvet = $cinemas_mun_totals[$couvet][$year] ?? null;
    $value_fleurier = $cinemas_mun_totals[$fleurier][$year] ?? null;
    $value_travers = $cinemas_mun_totals[$travers][$year] ?? null;

    $cinemas_mun_totals[$couvet][$year] = ($value_couvet === null && $value_fleurier === null && $value_travers === null)
        ? null
        : ($value_couvet ?? 0) + ($value_fleurier ?? 0) + ($value_travers ?? 0);
}

for ($year = 2009; $year <= 2025; $year++) {
    $cinemas_mun_totals[$couvet][$year] = $cinemas_mun_totals[$val_de_travers][$year] ?? null;
}

unset($cinemas_mun_totals[$fleurier], $cinemas_mun_totals[$travers], $cinemas_mun_totals[$val_de_travers]);

// ♡ get coordinates of municipalities via bfs code

// ♡ get data from files
$handle = fopen('../data/diagram2_coordinates.csv' , 'r');
$header = array_map('trim', fgetcsv($handle , null , ',' , '"' , ''));

$bfs_codes_and_coordinates = [];

// ♡ combine the header and the values to the above array
while (($row = fgetcsv($handle , null , ',' , '"' , '"')) !== false) {
    if ($row[0]==='') {
        continue;
    }
    $bfs_codes_and_coordinates[]=array_combine($header, $row);
}
fclose($handle);

// ♡ combine coordinates with municipalities

// ♡ get a list of all names of the municipalities (not necessary but helpful to check)
$municipality_names = $data2['dataset']['dimension']['Kanton (-) / Gemeinde (......)']['category']['label'];

// ♡ combine the two arrays: for each bfs code (from the array with amount of cinemas per municipality) go through every bfs code (from the array with the coordinates). when the bfs codes match, combine the two arrays and add it to a new array.
$data_diagram2 = [];
$missing_bfs_codes = []; // <— hier sammeln wir alle fehlenden BFS-Codes

foreach ($cinemas_mun_totals as $bfs => $cinemas_of_municipality) {

    $found = false;

    foreach ($bfs_codes_and_coordinates as $bfs_and_coordinate) {
        if ((int)$bfs === (int)$bfs_and_coordinate['GDENR']) {

            $data_diagram2[$bfs] = [
                'name'        => $municipality_names[$bfs],
                'coordinates' => $bfs_and_coordinate,
                'cinemas'     => $cinemas_of_municipality,
            ];

            $found = true;
            break;
        }
    }

    if (!$found) {
        echo $bfs . " Gemeinde nicht gefunden\n";
        $missing_bfs_codes[] = $bfs; // <— hier speichern
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


// ♡ PART 1: create array with the bfs code as key and the amount of halls for each year. do this for each municipality.
$data_diagram3_part1 = [];
$i1 = 0;
foreach ($municipalityIds as $municipalityId){
    foreach ($years3 as $year3){
        $data_diagram3_part1[$municipalityId][$year3] = $halls[$i1];
        $i1++;
    }
}

// ♡ fix municipalities (fusions) for halls – only 1966 and 2025 are relevant
$years_d3 = [1966, 2025];

// ♡ helper: sum values, but return null if all values are null
function sum_or_null(array $values) {
    $values = array_filter($values, fn($v) => $v !== null);
    return count($values) ? array_sum($values) : null;
}

// ♡ type 1: old municipality has the values until the fusion, the new one from the fusion on
// [old, new]
$fusions_fill = [
    [682,  717],   // Bévilard -> Valbirse
    [3336, 3340],  // Rapperswil -> Rapperswil-Jona
    [5793, 5805],  // Oron-la-Ville -> Oron
    [5782, 5806],  // Carrouge -> Jorat-Mézières
    [5034, 5048],  // Corzoneso -> Acquarossa
    [6031, 6037],  // Bagnes -> Val-de-Bagnes
    [467,  6711],  // Delémont (BE) -> Delémont (JU)
    [522,  6754],  // Le Noirmont (BE) -> Le Noirmont (JU)
    [513,  6743],  // Les Breuleux (BE) -> Les Breuleux (JU)
    [830,  6800],  // Porrentruy (BE) -> Porrentruy (JU)
];

foreach ($fusions_fill as [$old, $new]) {
    if (isset($data_diagram3_part1[$old], $data_diagram3_part1[$new])) {
        foreach ($years_d3 as $year) {
            $data_diagram3_part1[$old][$year] =
                $data_diagram3_part1[$old][$year] ?? $data_diagram3_part1[$new][$year] ?? null;
        }
        unset($data_diagram3_part1[$new]);
    }
}

// ♡ type 2: sum several municipalities until a certain year, afterwards use the new (merged) municipality
// main = municipality that stays, add = municipalities summed into it,
// sum_until = last year that is summed, successor = merged municipality used afterwards (null = main keeps its own values)
$fusions_sum = [
    ['main' => 1627, 'add' => [1603],        'sum_until' => 2010, 'successor' => null], // Braunwald -> Schwanden
    ['main' => 1622, 'add' => [1619],        'sum_until' => 2010, 'successor' => 1630], // Näfels -> Niederurnen, then Glarus Nord
    ['main' => 6234, 'add' => [6243],        'sum_until' => 2016, 'successor' => 6253], // Montana -> Chermignon, then Crans-Montana
    ['main' => 6505, 'add' => [6506, 6510],  'sum_until' => 2008, 'successor' => 6512], // Fleurier + Travers -> Couvet, then Val-de-Travers
];

foreach ($fusions_sum as $f) {
    $main = $f['main'];

    foreach ($years_d3 as $year) {
        if ($year <= $f['sum_until']) {
            $values = [$data_diagram3_part1[$main][$year] ?? null];
            foreach ($f['add'] as $add) {
                $values[] = $data_diagram3_part1[$add][$year] ?? null;
            }
            $data_diagram3_part1[$main][$year] = sum_or_null($values);
        } elseif ($f['successor'] !== null) {
            $data_diagram3_part1[$main][$year] = $data_diagram3_part1[$f['successor']][$year] ?? null;
        }
        // successor === null: main keeps its own value
    }

    foreach ($f['add'] as $add) {
        unset($data_diagram3_part1[$add]);
    }
    if ($f['successor'] !== null) {
        unset($data_diagram3_part1[$f['successor']]);
    }
}




// ♡ PART 2: combine the amount of cinemas per municipality in the two years with the array above
$data_diagram3 = [];
foreach ($data_diagram3_part1 as $key => $data_diagram3_part1_mun) {
    // ♡ create the array with the values null to be able to use the bfs code as key
    if (!isset($data_diagram3[$key])) {
        $data_diagram3[$key] = [
            'cinemas1966' => null,
            'cinemas2025' => null,
        ];
    }
    // ♡ combine the two arrays if the bfs code matches
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

print_r(count($data_diagram2));
echo "\n";
print_r(count($data_diagram3));
echo "\n";
print_r($data_diagram3);

return [
    'cinemas_per_year' => $cinemas_per_year,
    'data_diagram2'    => $data_diagram2,
    'data_diagram3'    => $data_diagram3,
    'missing_bfs_codes' => $missing_bfs_codes
];
