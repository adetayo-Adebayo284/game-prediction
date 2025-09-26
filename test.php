<?php
$apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa'; //$_ENV['SPORTMONKS_TOKEN']; 

error_reporting(0);
header('Content-Type: application/json');

require_once(__DIR__ . "/allLeague.php");

// --- API Token ---

// --- Prediction types mapping ---
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

// --- Input date ---
$inputDate = $_GET['date'] ?? date('Y-m-d');

// --- Step 1: Fetch all fixtures for the date ---
$fixtures = getFootballFixtures([$inputDate], $apiToken);

// --- Step 2: Fetch odds per fixture and store ---
$allOdds = [];

foreach ($fixtures as $date => $matches) {
    foreach ($matches as $fixture) {
        $fixtureId = $fixture['id'] ?? null;
        if (!$fixtureId) continue;

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => "https://api.sportmonks.com/v3/odds/pre-match/fixtures/$fixtureId?api_token=$apiToken&include=bookmaker,market,values",
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $response = curl_exec($curl);
        curl_close($curl);

        $oddsData = json_decode($response, true);

        $fixtureOdds = [];
        if (isset($oddsData['data'])) {
            foreach ($oddsData['data'] as $odd) {
                $marketName = $odd['market']['data']['name'] ?? ($odd['market']['name'] ?? 'Unknown Market');
                $bookmakerName = $odd['bookmaker']['data']['name'] ?? ($odd['bookmaker']['name'] ?? 'Unknown Bookmaker');

                $values = [];
                if (isset($odd['values']['data'])) {
                    foreach ($odd['values']['data'] as $v) {
                        $values[] = [
                            'label' => $v['label'] ?? '',
                            'odd'   => $v['odd'] ?? ''
                        ];
                    }
                }

                $fixtureOdds[] = [
                    'market_id' => $odd['market_id'] ?? null,
                    'market'    => $marketName,
                    'bookmaker' => $bookmakerName,
                    'values'    => $values
                ];
            }
        }

        $allOdds[$fixtureId] = $fixtureOdds;
    }
}

// --- Step 3: Merge odds into fixtures and format output ---
$matchesDB = [];

foreach ($fixtures as $date => $matches) {
    $formattedDate = date("d-m-Y", strtotime($date));
    $matchesDB[$formattedDate] = [];

    foreach ($matches as $fixture) {
        $homeTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];
        $awayTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];

        foreach ($fixture["participants"] as $p) {
            if (($p["location"] ?? "") === "home") {
                $homeTeam["name"] = $p["name"] ?? "Unknown";
                $homeTeam["logo"] = $p["logo"] ?? "";
            }
            if (($p["location"] ?? "") === "away") {
                $awayTeam["name"] = $p["name"] ?? "Unknown";
                $awayTeam["logo"] = $p["logo"] ?? "";
            }
        }

        if (!empty($fixture["scores"])) {
            $homeTeam["score"] = $fixture["scores"]["localteam_score"] ?? "0";
            $awayTeam["score"] = $fixture["scores"]["visitorteam_score"] ?? "0";
        }

        $kickoff = $fixture["kickoff"] ?? "";
        $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

        $status = "upcoming";
        if (!empty($kickoff)) {
            $now = new DateTime("now", new DateTimeZone("UTC"));
            $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
            if ($kickoffDT > $now) {
                $status = "upcoming";
            } else {
                $status = ($homeTeam["score"] !== "0" || $awayTeam["score"] !== "0") ? "started" : "past";
            }
        }

        $predictionsClean = [];
        foreach ($fixture["predictions"] as $pred) {
            $typeId = $pred["type_id"] ?? null;
            $marketName = $predictionTypes[$typeId] ?? "Unknown Market";
            $predictionsClean[] = [
                "type_id" => $typeId,
                "market"  => $marketName,
                "values"  => $pred["predictions"] ?? $pred
            ];
        }

        // Merge odds
        $fixtureOdds = $allOdds[$fixture["id"]] ?? [];

        $matchesDB[$formattedDate][] = [
            "kickoff"        => $kickoff,
            "time"           => $timeOnly,
            "status"         => $status,
            "league"         => $fixture["league"]["name"] ?? "Unknown League",
            "leagueLogo"     => $fixture["league"]["logo"] ?? "",
            "sport"          => $fixture["sport"]["name"] ?? "Football",
            "homeLogo"       => $homeTeam["logo"],
            "awayLogo"       => $awayTeam["logo"],
            "home"           => $homeTeam["name"],
            "away"           => $awayTeam["name"],
            "score"          => $homeTeam["score"] . " - " . $awayTeam["score"],
            "date"           => $fixture["date"] ?? "",
            "statistics"     => $fixture["statistics"] ?? [],
            "metadata"       => $fixture["metadata"] ?? [],
            "predictions"    => $predictionsClean,
            "odds"           => $fixtureOdds,
            "rawPredictions" => $fixture["predictions"] ?? []
        ];
    }
}

// --- Output final JSON ---
exit(json_encode($matchesDB, JSON_PRETTY_PRINT));




// // Pick old dates (past season to work with free plan)
// $dates = ["2024-05-15"]; // Example date

// // List of league IDs you want to fetch
// // (Use Sportmonks league IDs: La Liga, Premier League, Champions League, etc.)
// $leagueIds = [
//     564,  // La Liga
//     524,  // Premier League
//     195,  // Champions League
//     // Add more league IDs if needed
// ];

// foreach ($dates as $date) {
//     echo "<h2>Matches on {$date}</h2>";

//     foreach ($leagueIds as $leagueId) {

//         // Build endpoint
//         $endpoint = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}";
//         $params = [
//             "api_token" => $apiToken,
//             "include"   => "league;participants;scores",
//             "leagues"   => $leagueId
//         ];
//         $endpoint .= "?" . http_build_query($params);

//         // Init cURL
//         $ch = curl_init();
//         curl_setopt($ch, CURLOPT_URL, $endpoint);
//         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//         $response = curl_exec($ch);
//         if (curl_error($ch)) {
//             die("cURL Error: " . curl_error($ch));
//         }
//         $data = json_decode($response, true);
//         curl_close($ch);

//         // If no data
//         if (!isset($data['data']) || empty($data['data'])) {
//             echo "<p>No matches found for league {$leagueId} on {$date}</p>";
//             continue;
//         }

//         // Loop fixtures
//         foreach ($data['data'] as $fixture) {
//             $leagueName = $fixture['league']['name'] ?? "Unknown League";
//             $time = date("H:i", strtotime($fixture['starting_at']));

//             // Default placeholders
//             $homeName = $awayName = "Unknown";
//             $homeLogo = $awayLogo = "";
//             $homeScore = $awayScore = "-";

//             // Find participants
//             if (isset($fixture['participants'])) {
//                 foreach ($fixture['participants'] as $team) {
//                     if ($team['meta']['location'] === 'home') {
//                         $homeName = $team['name'];
//                         $homeLogo = $team['image_path'];
//                     }
//                     if ($team['meta']['location'] === 'away') {
//                         $awayName = $team['name'];
//                         $awayLogo = $team['image_path'];
//                     }
//                 }
//             }

//             // Scores
//             if (isset($fixture['scores'])) {
//                 $homeScore = $fixture['scores']['localteam_score'] ?? "-";
//                 $awayScore = $fixture['scores']['visitorteam_score'] ?? "-";
//             }

//             // Dummy prediction
//             $prediction = "Draw"; // You can update logic for predictions
//             $confidence = "70%";  // Example confidence

//             // Display
//             echo "<div style='margin:20px;padding:10px;border:1px solid #ccc;'>";
//             echo "<h3>{$homeName} vs {$awayName}</h3>";
//             echo "<img src='{$homeLogo}' width='40'> {$homeName} {$homeScore} - {$awayScore} ";
//             echo "<img src='{$awayLogo}' width='40'> {$awayName}<br>";
//             echo "<small>{$leagueName} • {$time}</small><br>";
//             echo "<b>Prediction:</b> {$prediction}<br>";
//             echo "<b>Confidence:</b> {$confidence}<br>";
//             echo "</div>";
//         }
//     }
// }




// // Pick old dates (past season to work with free plan)
// $dates = ["2025-05-09"]; // Example date

// // Step 1: Get available leagues from your plan
// $leaguesEndpoint = "https://api.sportmonks.com/v3/football/leagues?api_token={$apiToken}";

// $ch = curl_init();
// curl_setopt($ch, CURLOPT_URL, $leaguesEndpoint);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// $response = curl_exec($ch);
// if (curl_error($ch)) {
//     die("cURL Error: " . curl_error($ch));
// }
// $leaguesData = json_decode($response, true);
// curl_close($ch);

// // Extract league IDs and names
// $availableLeagues = [];
// if (isset($leaguesData['data'])) {
//     foreach ($leaguesData['data'] as $league) {
//         $id = $league['id'] ?? null;
//         $name = $league['name'] ?? 'Unknown League';
//         if ($id) {
//             $availableLeagues[$id] = $name;
//         }
//     }
// } else {
//     die("No leagues available on your plan.");
// }

// // Step 2: Loop through dates and leagues to fetch fixtures
// foreach ($dates as $date) {
//     echo "<h2>Matches on {$date}</h2>";

//     $fixturesFound = false; // Track if any fixture exists for this date

//     foreach ($availableLeagues as $leagueId => $leagueName) {
//         $endpoint = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}";
//         $params = [
//             "api_token" => $apiToken,
//             "include"   => "league;participants;scores",
//             "leagues"   => $leagueId
//         ];
//         $endpoint .= "?" . http_build_query($params);

//         $ch = curl_init();
//         curl_setopt($ch, CURLOPT_URL, $endpoint);
//         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//         $response = curl_exec($ch);
//         if (curl_error($ch)) {
//             die("cURL Error: " . curl_error($ch));
//         }
//         $data = json_decode($response, true);
//         curl_close($ch);

//         if (!isset($data['data']) || empty($data['data'])) {
//             continue; // Skip if no fixtures for this league
//         }

//         $fixturesFound = true; // At least one fixture exists

//         foreach ($data['data'] as $fixture) {
//             $time = date("H:i", strtotime($fixture['starting_at']));

//             $homeName = $awayName = "Unknown";
//             $homeLogo = $awayLogo = "";
//             $homeScore = $awayScore = "0";

//             if (isset($fixture['participants'])) {
//                 foreach ($fixture['participants'] as $team) {
//                     if ($team['meta']['location'] === 'home') {
//                         $homeName = $team['name'];
//                         $homeLogo = $team['image_path'];
//                     }
//                     if ($team['meta']['location'] === 'away') {
//                         $awayName = $team['name'];
//                         $awayLogo = $team['image_path'];
//                     }
//                 }
//             }

//             if (isset($fixture['scores'])) {
//                 $homeScore = $fixture['scores']['localteam_score'] ?? "0";
//                 $awayScore = $fixture['scores']['visitorteam_score'] ?? "0";
//             }

//             // Dummy prediction
//             $prediction = "Draw";
//             $confidence = "70%";

//             // Display fixture
//             echo "<div style='margin:20px;padding:10px;border:1px solid #ccc;'>";
//             echo "<h3>{$homeName} vs {$awayName}</h3>";
//             echo "<img src='{$homeLogo}' width='40'> {$homeName} {$homeScore} - {$awayScore} ";
//             echo "<img src='{$awayLogo}' width='40'> {$awayName}<br>";
//             echo "<small>{$leagueName} • {$time}</small><br>";
//             echo "<b>Prediction:</b> {$prediction}<br>";
//             echo "<b>Confidence:</b> {$confidence}<br>";
//             echo "</div>";
//         }
//     }

//     if (!$fixturesFound) {
//         echo "<p>No matches found for {$date}</p>";
//     }
// }
