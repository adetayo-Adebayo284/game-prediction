<?php

// USE THIS ITS THE ONE YOU USE BEFORE BUT ODDS ARE NOT PRESENT

error_reporting(0);
header('Content-Type: application/json');

require_once(__DIR__ . "/allLeague.php");

// --- Type ID → Market Mapping ---
$predictionTypes = [
    233 => "Fulltime Result (1X2)",
    1585 => "Both Teams To Score",
    1685 => "Over/Under 2.5 Goals",
    1684 => "Over/Under 1.5 Goals",
    1683 => "Over/Under 0.5 Goals",
    1686 => "Over/Under 3.5 Goals",
    1687 => "Over/Under 4.5 Goals",
    1688 => "Over/Under 5.5 Goals",
    1689 => "Over/Under 6.5 Goals",
    1690 => "Over/Under 7.5 Goals",
    231 => "Double Chance",
    232 => "Draw No Bet",
    234 => "Correct Score",
    235 => "Half-time/Full-time",
    236 => "Half-time Result",
    237 => "Exact Goals",
    238 => "Odd/Even Goals",
    239 => "First Team to Score",
    240 => "Clean Sheet",
    326 => "Asian Handicap",
    327 => "Goal Line",
    328 => "Corners",
    330 => "Both Halves Over 1.5",
    331 => "Win to Nil",
    332 => "Penalty Awarded?",
    333 => "Red Card?",
    334 => "Yellow Card?",
    1679 => "Over/Under Total Goals"
];

// Receive date in YYYY-MM-DD format
$inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// Fetch fixtures
$fixtures = getFootballFixtures([$inputDate]);

$matchesDB = [];

// Reformat date keys to DD-MM-YYYY
foreach ($fixtures as $date => $matches) {
    $formattedDate = date("d-m-Y", strtotime($date));
    $matchesDB[$formattedDate] = [];

    foreach ($matches as $fixture) {
        // --- Participants ---
        $homeTeam = ["name" => "Unknown", "logo" => "", "score" => "Home"];
        $awayTeam = ["name" => "Unknown", "logo" => "", "score" => "Away"];

        if (!empty($fixture["participants"])) {
            foreach ($fixture["participants"] as $p) {
                if ($p["location"] === "home") {
                    $homeTeam["name"] = $p["name"];
                    $homeTeam["logo"] = $p["logo"];
                }
                if ($p["location"] === "away") {
                    $awayTeam["name"] = $p["name"];
                    $awayTeam["logo"] = $p["logo"];
                }
            }
        }

        // --- Scores ---
        if (!empty($fixture["scores"]) && is_array($fixture["scores"])) {
            $foundCurrent = false;
            foreach ($fixture["scores"] as $scoreObj) {
                $participant = $scoreObj["score"]["participant"] ?? null;
                $goals = $scoreObj["score"]["goals"] ?? null;
                $desc = $scoreObj["description"] ?? "";

                // Prefer CURRENT
                if ($desc === "CURRENT") {
                    if ($participant === "home") $homeTeam["score"] = $goals;
                    if ($participant === "away") $awayTeam["score"] = $goals;
                    $foundCurrent = true;
                }
            }

            // If no CURRENT, fallback to last score in array
            if (!$foundCurrent) {
                foreach ($fixture["scores"] as $scoreObj) {
                    $participant = $scoreObj["score"]["participant"] ?? null;
                    $goals = $scoreObj["score"]["goals"] ?? null;
                    if ($participant === "home") $homeTeam["score"] = $goals;
                    if ($participant === "away") $awayTeam["score"] = $goals;
                }
            }
        }

        // --- Kickoff ---
        $kickoff = $fixture["kickoff"] ?? "";
        $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

        // --- Determine Status ---
        $status = "upcoming";
        if (!empty($kickoff)) {
            $now = new DateTime("now", new DateTimeZone("UTC"));
            $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
            if ($kickoffDT > $now) {
                $status = "upcoming";
            } else {
                $status = ($homeTeam["score"] > 0 || $awayTeam["score"] > 0) ? "past" : "past";
            }
        }

        // --- Predictions ---
        $predictionsClean = [];
        if (!empty($fixture["predictions"])) {
            foreach ($fixture["predictions"] as $pred) {
                $typeId = $pred["type_id"] ?? null;
                $marketName = $predictionTypes[$typeId] ?? "Unknown Market";

                $predictionsClean[] = [
                    "type_id" => $typeId,
                    "market"  => $marketName,
                    "values"  => $pred["predictions"] ?? $pred
                ];
            }
        }

        // --- Build Fixture ---
        $matchesDB[$formattedDate][] = [
            "kickoff"       => $kickoff,
            "time"          => $timeOnly,
            "status"        => $status,
            "league"        => $fixture["league"]["name"] ?? "Unknown League",
            "leagueLogo"    => $fixture["league"]["logo"] ?? "",
            "sport"         => $fixture["sport"]["name"] ?? "Football",
            "homeLogo"      => $homeTeam["logo"],
            "awayLogo"      => $awayTeam["logo"],
            "home"          => $homeTeam["name"],
            "away"          => $awayTeam["name"],
            "score"         => $homeTeam["score"] . " - " . $awayTeam["score"],
            "date"          => $fixture["date"] ?? "",
            "statistics"    => $fixture["statistics"] ?? [],
            "metadata"      => $fixture["metadata"] ?? [],
            "predictions"   => $predictionsClean,
            "rawPredictions"=> $fixture["predictions"] ?? []
        ];
    }
}

exit(json_encode($matchesDB, JSON_PRETTY_PRINT));




// // NEW ONE WITH GEMINI AI INTEGRATION
// error_reporting(0);
// header('Content-Type: application/json');

// require_once(__DIR__ . "/allLeague.php");

// // --- GEMINI API CONFIG ---
// $GEMINI_API_KEY = "AIzaSyCQBMODCVLWCRZuh0C8utuMVvnSavGwVY0"; // <-- Replace this with your real Gemini API key
// $GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY";

// // --- Type ID → Market Mapping ---
// $predictionTypes = [
//     233 => "Fulltime Result (1X2)",
//     1585 => "Both Teams To Score",
//     1685 => "Over/Under 2.5 Goals",
//     1684 => "Over/Under 1.5 Goals",
//     1683 => "Over/Under 0.5 Goals",
//     1686 => "Over/Under 3.5 Goals",
//     231 => "Double Chance",
//     232 => "Draw No Bet",
//     234 => "Correct Score",
//     235 => "Half-time/Full-time",
//     236 => "Half-time Result",
//     238 => "Odd/Even Goals",
//     239 => "First Team to Score",
//     240 => "Clean Sheet",
//     326 => "Asian Handicap",
//     331 => "Win to Nil",
//     333 => "Red Card?",
//     334 => "Yellow Card?"
// ];

// // --- Input Date ---
// $inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// // --- Fetch fixtures ---
// $fixtures = getFootballFixtures([$inputDate]);
// $matchesDB = [];

// // --- Reformat fixtures ---
// foreach ($fixtures as $date => $matches) {
//     $formattedDate = date("d-m-Y", strtotime($date));
//     $matchesDB[$formattedDate] = [];

//     foreach ($matches as $fixture) {
//         $homeTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];
//         $awayTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];

//         if (!empty($fixture["participants"])) {
//             foreach ($fixture["participants"] as $p) {
//                 if ($p["location"] === "home") {
//                     $homeTeam["name"] = $p["name"];
//                     $homeTeam["logo"] = $p["logo"];
//                 } elseif ($p["location"] === "away") {
//                     $awayTeam["name"] = $p["name"];
//                     $awayTeam["logo"] = $p["logo"];
//                 }
//             }
//         }

//         // --- Scores ---
//         if (!empty($fixture["scores"]) && is_array($fixture["scores"])) {
//             foreach ($fixture["scores"] as $scoreObj) {
//                 $participant = $scoreObj["score"]["participant"] ?? null;
//                 $goals = $scoreObj["score"]["goals"] ?? null;
//                 $desc = $scoreObj["description"] ?? "";

//                 if ($desc === "CURRENT" || $desc === "FT" || $desc === "HT") {
//                     if ($participant === "home") $homeTeam["score"] = $goals;
//                     if ($participant === "away") $awayTeam["score"] = $goals;
//                 }
//             }
//         }

//         // --- Match time & status ---
//         $kickoff = $fixture["kickoff"] ?? "";
//         $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";
//         $status = (!empty($kickoff) && new DateTime($kickoff, new DateTimeZone("UTC")) < new DateTime("now", new DateTimeZone("UTC")))
//             ? "past" : "upcoming";

//         // --- Predictions ---
//         $predictionsClean = [];
//         if (!empty($fixture["predictions"])) {
//             foreach ($fixture["predictions"] as $pred) {
//                 $typeId = $pred["type_id"] ?? null;
//                 $marketName = $predictionTypes[$typeId] ?? "Unknown Market";

//                 $predictionsClean[] = [
//                     "market" => $marketName,
//                     "values" => $pred["predictions"] ?? $pred
//                 ];
//             }
//         }

//         // --- Build fixture ---
//         $matchesDB[$formattedDate][] = [
//             "time" => $timeOnly,
//             "status" => $status,
//             "league" => $fixture["league"]["name"] ?? "Unknown League",
//             "home" => $homeTeam["name"],
//             "away" => $awayTeam["name"],
//             "score" => $homeTeam["score"] . " - " . $awayTeam["score"],
//             "predictions" => $predictionsClean
//         ];
//     }
// }

// // --- Build Gemini prompt ---
// $geminiPrompt = "Analyze the football matches below and predict likely outcomes (Over 1.5, BTTS, Win/Draw, etc.):\n\n"
//     . substr(json_encode($matchesDB, JSON_PRETTY_PRINT), 0, 6000);

// // --- Send to Gemini AI ---
// $payload = json_encode([
//     "contents" => [
//         [
//             "role" => "user",
//             "parts" => [
//                 ["text" => $geminiPrompt]
//             ]
//         ]
//     ]
// ]);

// $ch = curl_init();
// curl_setopt($ch, CURLOPT_URL, $GEMINI_API_URL);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch, CURLOPT_POST, true);
// curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
// curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

// $response = curl_exec($ch);
// file_put_contents("gemini_log.txt", $response); // ✅ Optional debug log
// curl_close($ch);

// $geminiResult = json_decode($response, true);
// $geminiSummary = $geminiResult["candidates"][0]["content"]["parts"][0]["text"] ?? "No summary from Gemini.";

// // --- Output ---
// $output = [
//     "matches" => $matchesDB,
//     "gemini_summary" => $geminiSummary
// ];

// exit(json_encode($output, JSON_PRETTY_PRINT));
