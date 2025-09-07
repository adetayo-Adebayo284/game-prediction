<?php
// // backend/getHistory.php

// // Allow CORS (if frontend is served from another port, like React dev server)
// header("Access-Control-Allow-Origin: *");
// header("Content-Type: application/json");

// // Read raw POST body
// $input = file_get_contents("php://input");
// $data = json_decode($input, true);

// // ---- LOGGING ----
// $logFile = __DIR__ . "/history_log.txt";
// $logEntry = "[" . date("Y-m-d H:i:s") . "] " . ($input ?: "NO INPUT") . PHP_EOL;
// file_put_contents($logFile, $logEntry, FILE_APPEND);

// // ---- Load fixtures (static demo data for now) ----
// $fixtures = require __DIR__ . "/fixtures.php"; // your file with return [ ... ];

// // ---- Filter by type ----
// $response = [];

// if ($data) {
//     $type = $data['type'] ?? "";

//     if ($type === "fixtures_date_range") {
//         $start = $data['startDate'] ?? "";
//         $end   = $data['endDate'] ?? "";

//         // filter fixtures by date range
//         $response = array_filter($fixtures, function ($f) use ($start, $end) {
//             return (!$start || $f['date'] >= $start) &&
//                    (!$end   || $f['date'] <= $end);
//         });

//         $response = array_values($response); // reindex
//     } elseif ($type === "wins") {
//         $response = array_values(array_filter($fixtures, fn($f) => $f['result'] === "win"));
//     } elseif ($type === "losses") {
//         $response = array_values(array_filter($fixtures, fn($f) => $f['result'] === "lose"));
//     } else {
//         // fallback: return all
//         $response = $fixtures;
//     }
// } else {
//     // no input: return all
//     $response = $fixtures;
// }

// // ---- Return JSON ----
// echo json_encode($response);
// exit;



header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Read frontend POST
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Fallback
if (!$data) {
    echo json_encode(["error" => "No input received"]);
    exit;
}

// Load static fixtures
$fixtures = require __DIR__ . "/fixtures.php";

$type     = strtolower($data['type'] ?? '');
$start    = $data['startDate'] ?? '';
$end      = $data['endDate'] ?? '';
$includes = $data['includes'] ?? [];

$response = [];

switch ($type) {
    case "fixtures_date_range":
        $filtered = array_filter($fixtures, function ($f) use ($start, $end) {
            return (!$start || $f['date'] >= $start) &&
                   (!$end   || $f['date'] <= $end);
        });

        // Attach requested includes
        $response = array_map(function ($match) use ($includes) {
            foreach ($includes as $inc) {
                $match[$inc] = "Sample data for $inc"; // stub, replace with real API later
            }
            return $match;
        }, array_values($filtered));
        break;

    case "wins":
        $response = array_values(array_filter($fixtures, fn($f) => $f['result'] === "win"));
        break;

    case "losses":
        $response = array_values(array_filter($fixtures, fn($f) => $f['result'] === "lose"));
        break;

    case "odds":
        $response = [
            ["match" => "Barcelona vs Real Madrid", "odds" => ["1" => 2.1, "X" => 3.4, "2" => 2.9]],
            ["match" => "Man City vs Liverpool", "odds" => ["1" => 2.5, "X" => 3.2, "2" => 2.7]],
        ];
        break;

    case "predictions":
        $response = [
            ["match" => "Chelsea vs Arsenal", "prediction" => "Both Teams To Score", "confidence" => "High"],
            ["match" => "PSG vs Marseille", "prediction" => "PSG to Win", "confidence" => "High"],
        ];
        break;

    case "livescores":
        $response = [
            ["match" => "Juventus vs AC Milan", "minute" => "75", "score" => "0-1"],
            ["match" => "Bayern vs Dortmund", "minute" => "60", "score" => "1-1"],
        ];
        break;

    case "leagues_teams":
        $response = [
            ["league" => "La Liga", "teams" => ["Barcelona", "Real Madrid", "Atletico Madrid"]],
            ["league" => "Premier League", "teams" => ["Man City", "Liverpool", "Chelsea", "Arsenal"]],
        ];
        break;

    default:
        $response = $fixtures; // fallback: return all
        break;
}

echo json_encode($response, JSON_PRETTY_PRINT);
