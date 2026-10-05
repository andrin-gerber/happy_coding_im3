<?php
header("Content-type: text/plain");

// ✧ ─────────── get access stuff from config.php ────────────── ✧
require __DIR__ . '/../config.php';
$pdo = new PDO($dsn, $username, $password, $options);

$pdo->exec('DELETE FROM diagram1');
$pdo->exec('DELETE FROM diagram2');
$pdo->exec('DELETE FROM diagram3');



$insert_year_ch = $pdo->prepare(
    'INSERT INTO diagram1 (year, cinema_ch_total)
    VALUES (:year, :cinema_ch_total)'
);


// ✧ ─────────── get data from transform.php ────────────── ✧
$transformed = include __DIR__ . '/transform.php';



// ✧ ─────────── add data diagram1 ────────────── ✧
foreach ($transformed['diagram1'] as $year => $cinema_ch_total) {
    $insert_year_ch->execute([
        'year' => $year,
        'cinema_ch_total' => $cinema_ch_total,
    ]);
}

// ✧ ─────────── add data diagram2 ────────────── ✧
$insert_municipality = $pdo->prepare(
    'INSERT INTO diagram2 (municipality, latitude, longitude, `1966`, `1967`, `1968`, `1969`, `1970`, `1971`, `1972`, `1973`, `1974`, `1975`, `1976`, `1977`, `1978`, `1979`, `1980`, `1981`, `1982`, `1983`, `1984`, `1985`, `1986`, `1987`, `1988`, `1989`, `1990`, `1991`, `1992`, `1993`, `1994`, `1995`, `1996`, `1997`, `1998`, `1999`, `2000`, `2001`, `2002`, `2003`, `2004`, `2005`, `2006`, `2007`, `2008`, `2009`, `2010`, `2011`, `2012`, `2013`, `2014`, `2015`, `2016`, `2017`, `2018`, `2019`, `2020`, `2021`, `2022`, `2023`, `2024`, `2025`)
    VALUES (:municipality, :latitude, :longitude, :1966, :1967, :1968, :1969, :1970, :1971, :1972, :1973, :1974, :1975, :1976, :1977, :1978, :1979, :1980, :1981, :1982, :1983, :1984, :1985, :1986, :1987, :1988, :1989, :1990, :1991, :1992, :1993, :1994, :1995, :1996, :1997, :1998, :1999, :2000, :2001, :2002, :2003, :2004, :2005, :2006, :2007, :2008, :2009, :2010, :2011, :2012, :2013, :2014, :2015, :2016, :2017, :2018, :2019, :2020, :2021, :2022, :2023, :2024, :2025)'
);

foreach ($transformed['diagram2'] as $municipality) {
    $insert_municipality->execute([
        ':municipality' => $municipality['name'],
        ':latitude'     => $municipality['coordinates']['latitude'],
        ':longitude'    => $municipality['coordinates']['longitude'],
        ':1966' => $municipality['cinemas']['1966'],
        ':1967' => $municipality['cinemas']['1967'],
        ':1968' => $municipality['cinemas']['1968'],
        ':1969' => $municipality['cinemas']['1969'],
        ':1970' => $municipality['cinemas']['1970'],
        ':1971' => $municipality['cinemas']['1971'],
        ':1972' => $municipality['cinemas']['1972'],
        ':1973' => $municipality['cinemas']['1973'],
        ':1974' => $municipality['cinemas']['1974'],
        ':1975' => $municipality['cinemas']['1975'],
        ':1976' => $municipality['cinemas']['1976'],
        ':1977' => $municipality['cinemas']['1977'],
        ':1978' => $municipality['cinemas']['1978'],
        ':1979' => $municipality['cinemas']['1979'],
        ':1980' => $municipality['cinemas']['1980'],
        ':1981' => $municipality['cinemas']['1981'],
        ':1982' => $municipality['cinemas']['1982'],
        ':1983' => $municipality['cinemas']['1983'],
        ':1984' => $municipality['cinemas']['1984'],
        ':1985' => $municipality['cinemas']['1985'],
        ':1986' => $municipality['cinemas']['1986'],
        ':1987' => $municipality['cinemas']['1987'],
        ':1988' => $municipality['cinemas']['1988'],
        ':1989' => $municipality['cinemas']['1989'],
        ':1990' => $municipality['cinemas']['1990'],
        ':1991' => $municipality['cinemas']['1991'],
        ':1992' => $municipality['cinemas']['1992'],
        ':1993' => $municipality['cinemas']['1993'],
        ':1994' => $municipality['cinemas']['1994'],
        ':1995' => $municipality['cinemas']['1995'],
        ':1996' => $municipality['cinemas']['1996'],
        ':1997' => $municipality['cinemas']['1997'],
        ':1998' => $municipality['cinemas']['1998'],
        ':1999' => $municipality['cinemas']['1999'],
        ':2000' => $municipality['cinemas']['2000'],
        ':2001' => $municipality['cinemas']['2001'],
        ':2002' => $municipality['cinemas']['2002'],
        ':2003' => $municipality['cinemas']['2003'],
        ':2004' => $municipality['cinemas']['2004'],
        ':2005' => $municipality['cinemas']['2005'],
        ':2006' => $municipality['cinemas']['2006'],
        ':2007' => $municipality['cinemas']['2007'],
        ':2008' => $municipality['cinemas']['2008'],
        ':2009' => $municipality['cinemas']['2009'],
        ':2010' => $municipality['cinemas']['2010'],
        ':2011' => $municipality['cinemas']['2011'],
        ':2012' => $municipality['cinemas']['2012'],
        ':2013' => $municipality['cinemas']['2013'],
        ':2014' => $municipality['cinemas']['2014'],
        ':2015' => $municipality['cinemas']['2015'],
        ':2016' => $municipality['cinemas']['2016'],
        ':2017' => $municipality['cinemas']['2017'],
        ':2018' => $municipality['cinemas']['2018'],
        ':2019' => $municipality['cinemas']['2019'],
        ':2020' => $municipality['cinemas']['2020'],
        ':2021' => $municipality['cinemas']['2021'],
        ':2022' => $municipality['cinemas']['2022'],
        ':2023' => $municipality['cinemas']['2023'],
        ':2024' => $municipality['cinemas']['2024'],
        ':2025' => $municipality['cinemas']['2025'],
    ]);
}

// ✧ ─────────── add data diagram3 ────────────── ✧

$insert_halls_mun = $pdo->prepare(
    'INSERT INTO diagram3 (gfs, cinema_mun_total_1966, cinema_mun_total_2025, hall_mun_total_1966, hall_mun_total_2025)
    VALUES (:gfs, :cinema_mun_total_1966, :cinema_mun_total_2025, :hall_mun_total_1966, :hall_mun_total_2025)'
);

// ✧ ─────────── add data diagram1 ────────────── ✧
foreach ($transformed['diagram3'] as $data_diagram3) {
    $insert_halls_mun->execute([
        'gfs' => $data_diagram3['id'],
        'cinema_mun_total_1966' => $data_diagram3['cinemas_1966'],
        'cinema_mun_total_2025' => $data_diagram3['cinemas_2025'],
        'hall_mun_total_1966' => $data_diagram3['halls_1966'],
        'hall_mun_total_2025' => $data_diagram3['halls_2025'],
    ]);
}