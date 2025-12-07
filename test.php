
// HAS ODDS 

// error_reporting(0);
// header('Content-Type: application/json');

// require_once(__DIR__ . "/allLeague.php");

// // --- Type ID → Market Mapping ---
// $predictionTypes = [
//     233 => "Fulltime Result (1X2)",
//     1585 => "Both Teams To Score",
//     1685 => "Over/Under 2.5 Goals",
//     1684 => "Over/Under 1.5 Goals",
//     1683 => "Over/Under 0.5 Goals",
//     1686 => "Over/Under 3.5 Goals",
//     1687 => "Over/Under 4.5 Goals",
//     1688 => "Over/Under 5.5 Goals",
//     1689 => "Over/Under 6.5 Goals",
//     1690 => "Over/Under 7.5 Goals",
//     231 => "Double Chance",
//     232 => "Draw No Bet",
//     234 => "Correct Score",
//     235 => "Half-time/Full-time",
//     236 => "Half-time Result",
//     237 => "Exact Goals",
//     238 => "Odd/Even Goals",
//     239 => "First Team to Score",
//     240 => "Clean Sheet",
//     326 => "Asian Handicap",
//     327 => "Goal Line",
//     328 => "Corners",
//     330 => "Both Halves Over 1.5",
//     331 => "Win to Nil",
//     332 => "Penalty Awarded?",
//     333 => "Red Card?",
//     334 => "Yellow Card?",
//     1679 => "Over/Under Total Goals"
// ];

// // Receive date in YYYY-MM-DD format
// $inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// // Fetch fixtures
// $fixtures = getFootballFixtures([$inputDate]);

// $matchesDB = [];

// // Reformat date keys to DD-MM-YYYY
// foreach ($fixtures as $date => $matches) {
//     $formattedDate = date("d-m-Y", strtotime($date));
//     $matchesDB[$formattedDate] = [];

//     foreach ($matches as $fixture) {
//         // --- Participants ---
//         $homeTeam = ["name" => "Unknown", "logo" => "", "score" => "V"];
//         $awayTeam = ["name" => "Unknown", "logo" => "", "score" => "S"];

//         if (!empty($fixture["participants"])) {
//             foreach ($fixture["participants"] as $p) {
//                 if ($p["location"] === "home") {
//                     $homeTeam["name"] = $p["name"];
//                     $homeTeam["logo"] = $p["logo"];
//                 }
//                 if ($p["location"] === "away") {
//                     $awayTeam["name"] = $p["name"];
//                     $awayTeam["logo"] = $p["logo"];
//                 }
//             }
//         }

//         // --- Scores ---
//         if (!empty($fixture["scores"])) {
//             $homeTeam["score"] = $fixture["scores"]["localteam_score"] ?? "0";
//             $awayTeam["score"] = $fixture["scores"]["visitorteam_score"] ?? "0";
//         }

//         // --- Kickoff ---
//         $kickoff = $fixture["kickoff"] ?? "";
//         $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

//         // --- Determine Status ---
//         $status = "upcoming";
//         if (!empty($kickoff)) {
//             $now = new DateTime("now", new DateTimeZone("UTC"));
//             $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
//             if ($kickoffDT > $now) {
//                 $status = "upcoming";
//             } else {
//                 $localScore = $homeTeam["score"] . $awayTeam["score"];
//                 $status = ($homeTeam["score"] !== "0" || $awayTeam["score"] !== "0") ? "started" : "past";
//             }
//         }

//         // --- Predictions ---
//         $predictionsClean = [];
//         if (!empty($fixture["predictions"])) {
//             foreach ($fixture["predictions"] as $pred) {
//                 $typeId = $pred["type_id"] ?? null;
//                 $marketName = $predictionTypes[$typeId] ?? "Unknown Market";

//                 $predictionsClean[] = [
//                     "type_id" => $typeId,
//                     "market"  => $marketName,
//                     "values"  => $pred["predictions"] ?? $pred
//                 ];
//             }
//         }

//         // --- Build Fixture ---
//         $matchesDB[$formattedDate][] = [
//             "kickoff"       => $kickoff,
//             "time"          => $timeOnly,
//             "status"        => $status,
//             "league"        => $fixture["league"]["name"] ?? "Unknown League",
//             "leagueLogo"    => $fixture["league"]["logo"] ?? "",
//             "sport"         => $fixture["sport"]["name"] ?? "Football",
//             "homeLogo"      => $homeTeam["logo"],
//             "awayLogo"      => $awayTeam["logo"],
//             "home"          => $homeTeam["name"],
//             "away"          => $awayTeam["name"],
//             "score"         => $homeTeam["score"] . " - " . $awayTeam["score"],
//             "date"          => $fixture["date"] ?? "",
//             "statistics"    => $fixture["statistics"] ?? [],
//             "metadata"      => $fixture["metadata"] ?? [],
//             "predictions"   => $predictionsClean,
//             "rawPredictions"=> $fixture["predictions"] ?? []
//         ];
//     }
// }

// exit(json_encode($matchesDB, JSON_PRETTY_PRINT));





// // NO 3 ODDS INCLUDED

// error_reporting(0);
// header('Content-Type: application/json');

// require_once(__DIR__ . "/allLeague.php");

// // --- API Token ---
// $apiToken = 'YOUR_API_TOKEN_HERE';

// // --- Prediction types mapping ---
// $predictionTypes = [
//     233 => "Fulltime Result (1X2)",
//     1585 => "Both Teams To Score",
//     1685 => "Over/Under 2.5 Goals",
//     231 => "Double Chance",
//     232 => "Draw No Bet",
//     234 => "Correct Score",
//     236 => "Half-time Result",
//     239 => "First Team to Score",
//     240 => "Clean Sheet",
//     326 => "Asian Handicap",
//     328 => "Corners"
// ];

// // --- Query params ---
// $inputDate = $_GET['date'] ?? date('Y-m-d');

// // --- Fetch fixtures ---
// $fixtures = getFootballFixtures([$inputDate], $apiToken);
// $matchesDB = [];

// foreach ($fixtures as $date => $matches) {
//     $formattedDate = date("d-m-Y", strtotime($date));
//     $matchesDB[$formattedDate] = [];

//     foreach ($matches as $fixture) {
//         // --- Participants ---
//         $homeTeam = ["name" => "Unknown", "logo" => "", "score" => "V"];
//         $awayTeam = ["name" => "Unknown", "logo" => "", "score" => "S"];

//         foreach ($fixture["participants"] as $p) {
//             if (($p["location"] ?? "") === "home") {
//                 $homeTeam["name"] = $p["name"] ?? "Unknown";
//                 $homeTeam["logo"] = $p["logo"] ?? "";
//             }
//             if (($p["location"] ?? "") === "away") {
//                 $awayTeam["name"] = $p["name"] ?? "Unknown";
//                 $awayTeam["logo"] = $p["logo"] ?? "";
//             }
//         }

//         // --- Scores ---
//         if (!empty($fixture["scores"])) {
//             $homeTeam["score"] = $fixture["scores"]["localteam_score"] ?? "0";
//             $awayTeam["score"] = $fixture["scores"]["visitorteam_score"] ?? "0";
//         }

//         // --- Kickoff & time ---
//         $kickoff = $fixture["kickoff"] ?? "";
//         $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

//         // --- Status ---
//         $status = "upcoming";
//         if (!empty($kickoff)) {
//             $now = new DateTime("now", new DateTimeZone("UTC"));
//             $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
//             if ($kickoffDT > $now) {
//                 $status = "upcoming";
//             } else {
//                 $status = ($homeTeam["score"] !== "0" || $awayTeam["score"] !== "0") ? "started" : "past";
//             }
//         }

//         // --- Predictions ---
//         $predictionsClean = [];
//         foreach ($fixture["predictions"] as $pred) {
//             $typeId = $pred["type_id"] ?? null;
//             $marketName = $predictionTypes[$typeId] ?? "Unknown Market";
//             $predictionsClean[] = [
//                 "type_id" => $typeId,
//                 "market"  => $marketName,
//                 "values"  => $pred["predictions"] ?? $pred
//             ];
//         }

//         // --- FIXED: Fetch pre-match odds ---
//         $oddsEndpoint = "https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/{$fixture['id']}?api_token={$apiToken}&include=bookmaker,market,values";
//         $ch = curl_init();
//         curl_setopt($ch, CURLOPT_URL, $oddsEndpoint);
//         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//         $oddsResponse = curl_exec($ch);
//         if (curl_error($ch)) {
//             $odds = [];
//         } else {
//             $oddsData = json_decode($oddsResponse, true);
//             $odds = [];
//             if (isset($oddsData['data']) && !empty($oddsData['data'])) {
//                 foreach ($oddsData['data'] as $odd) {
//                     $marketName = $odd['market']['data']['name'] ?? ($odd['market']['name'] ?? 'Unknown Market');
//                     $bookmakerName = $odd['bookmaker']['data']['name'] ?? ($odd['bookmaker']['name'] ?? 'Unknown');

//                     $values = [];
//                     if (isset($odd['values']['data'])) {
//                         foreach ($odd['values']['data'] as $v) {
//                             $values[] = [
//                                 "label" => $v['label'] ?? "",
//                                 "odd"   => $v['odd'] ?? ""
//                             ];
//                         }
//                     }

//                     $odds[] = [
//                         "market_id" => $odd['market_id'] ?? null,
//                         "market"    => $marketName,
//                         "bookmaker" => $bookmakerName,
//                         "values"    => $values
//                     ];
//                 }
//             }
//         }
//         curl_close($ch);

//         // --- Build final fixture object ---
//         $matchesDB[$formattedDate][] = [
//             "kickoff"        => $kickoff,
//             "time"           => $timeOnly,
//             "status"         => $status,
//             "league"         => $fixture["league"]["name"] ?? "Unknown League",
//             "leagueLogo"     => $fixture["league"]["logo"] ?? "",
//             "sport"          => $fixture["sport"]["name"] ?? "Football",
//             "homeLogo"       => $homeTeam["logo"],
//             "awayLogo"       => $awayTeam["logo"],
//             "home"           => $homeTeam["name"],
//             "away"           => $awayTeam["name"],
//             "score"          => $homeTeam["score"] . " - " . $awayTeam["score"],
//             "date"           => $fixture["date"] ?? "",
//             "statistics"     => $fixture["statistics"] ?? [],
//             "metadata"       => $fixture["metadata"] ?? [],
//             "predictions"    => $predictionsClean,
//             "odds"           => $odds,
//             "rawPredictions" => $fixture["predictions"] ?? []
//         ];
//     }
// }

// exit(json_encode($matchesDB, JSON_PRETTY_PRINT));

