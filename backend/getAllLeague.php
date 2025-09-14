<?php
error_reporting(0);
header('Content-Type: application/json');

require_once(__DIR__ . "/allLeague.php");

// Receive date in YYYY-MM-DD format
$inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// Call your function with YYYY-MM-DD
$fixtures = getFootballFixtures([$inputDate]);

$matchesDB = [];

// Reformat date keys to DD-MM-YYYY
foreach ($fixtures as $date => $matches) {
    $formattedDate = date("d-m-Y", strtotime($date)); // dd-mm-yyyy
    $matchesDB[$formattedDate] = [];

    foreach ($matches as $fixture) {
        $matchesDB[$formattedDate][] = [
            "time"          => $fixture["time"] ?? "",
            "status"        => $fixture["status"] ?? "upcoming",
            "league"        => $fixture["league"] ?? "",
            "homeLogo"      => $fixture["home"]["logo"] ?? "",
            "awayLogo"      => $fixture["away"]["logo"] ?? "",
            "home"          => $fixture["home"]["name"] ?? "",
            "away"          => $fixture["away"]["name"] ?? "",
            "score"         => ($fixture["home"]["score"] ?? "0") . " - " . ($fixture["away"]["score"] ?? "0"),
            "prediction"    => $fixture["prediction"] ?? "",
            "confidence"    => intval(str_replace("%", "", $fixture["confidence"] ?? "0")),
            "xgHome"        => $fixture["xg"]["home"] ?? "0.00",
            "xgAway"        => $fixture["xg"]["away"] ?? "0.00",
            "pressureIndex" => $fixture["pressureIndex"] ?? "N/A",
            "valueBet"      => isset($fixture["valueBet"]) ? (bool)$fixture["valueBet"] : false,
            "odds" => [
                "home" => $fixture["odds"]["home"] ?? "N/A",
                "draw" => $fixture["odds"]["draw"] ?? "N/A",
                "away" => $fixture["odds"]["away"] ?? "N/A"
            ],
            "liveOdds" => $fixture["liveOdds"] ?? null
        ];
    }
}

// Encode to JSON and exit to prevent extra output
exit(json_encode($matchesDB, JSON_PRETTY_PRINT));


// good for testing
// Suppress warnings/notices to avoid breaking JSON

// error_reporting(0);
// header('Content-Type: application/json');

// require_once(__DIR__ . "/allLeague.php");

// // Receive date in YYYY-MM-DD format
// $inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// // Call your function with YYYY-MM-DD
// $fixtures = getFootballFixtures([$inputDate]);

// $matchesDB = [];

// // Reformat date keys to DD-MM-YYYY
// foreach ($fixtures as $date => $matches) {
//     $formattedDate = date("d-m-Y", strtotime($date)); // dd-mm-yyyy
//     $matchesDB[$formattedDate] = [];

//     foreach ($matches as $fixture) {
//         $matchesDB[$formattedDate][] = [
//             "time"       => $fixture["time"] ?? "",
//             "league"     => $fixture["league"] ?? "",
//             "homeLogo"   => $fixture["home"]["logo"] ?? "",
//             "awayLogo"   => $fixture["away"]["logo"] ?? "",
//             "home"       => $fixture["home"]["name"] ?? "",
//             "away"       => $fixture["away"]["name"] ?? "",
//             "score"      => ($fixture["home"]["score"] ?? "0") . " - " . ($fixture["away"]["score"] ?? "0"),
//             "prediction" => $fixture["prediction"] ?? "",
//             "confidence" => intval(str_replace("%", "", $fixture["confidence"] ?? "0"))
//         ];
//     }
// }

// // Encode to JSON and exit to prevent extra output
// exit(json_encode($matchesDB, JSON_PRETTY_PRINT));



// REAL PRODUCTION CODE BELOW

// // Suppress warnings/notices to avoid breaking JSON
// error_reporting(0);
// header('Content-Type: application/json');

// require_once(__DIR__ . "/allLeague.php");

// // Receive date in YYYY-MM-DD format (default: today)
// $inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// // Fetch fixtures for the given date(s)
// $fixtures = getFootballFixtures(["2025-09-31"]);

// $matchesDB = [];

// // Reformat date keys to DD-MM-YYYY
// foreach ($fixtures as $date => $matches) {
//     $formattedDate = date("d-m-Y", strtotime($date)); // dd-mm-yyyy
//     $matchesDB[$formattedDate] = [];

//     foreach ($matches as $fixture) {
//         $matchesDB[$formattedDate][] = [
//             "time"       => $fixture["time"] ?? "",
//             "league"     => $fixture["league"] ?? "",
//             "homeLogo"   => $fixture["home"]["logo"] ?? "",
//             "awayLogo"   => $fixture["away"]["logo"] ?? "",
//             "home"       => $fixture["home"]["name"] ?? "",
//             "away"       => $fixture["away"]["name"] ?? "",
//             "score"      => ($fixture["home"]["score"] ?? "**") . " - " . ($fixture["away"]["score"] ?? "**"),
//             "prediction" => $fixture["prediction"] ?? "",
//             "confidence" => intval(str_replace("%", "", $fixture["confidence"] ?? "0")),

//             // ✅ Include odds + stats in the same normalized record
//             "odds"       => $fixture["odds"] ?? [],
//             "stats"      => $fixture["stats"] ?? []
//         ];
//     }
// }

// // Encode to JSON and exit to prevent extra output
// exit(json_encode($matchesDB, JSON_PRETTY_PRINT));
