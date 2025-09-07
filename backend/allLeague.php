<?php
function getFootballFixtures($dates) {
    $apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
    $fixturesArray = [];

    // Step 1: Get available leagues from your plan
    $leaguesEndpoint = "https://api.sportmonks.com/v3/football/leagues?api_token={$apiToken}";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $leaguesEndpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    if (curl_error($ch)) {
        die("cURL Error: " . curl_error($ch));
    }
    $leaguesData = json_decode($response, true);
    curl_close($ch);

    // Extract league IDs and names
    $availableLeagues = [];
    if (isset($leaguesData['data'])) {
        foreach ($leaguesData['data'] as $league) {
            $id = $league['id'] ?? null;
            $name = $league['name'] ?? 'Unknown League';
            if ($id) {
                $availableLeagues[$id] = $name;
            }
        }
    } else {
        return ["error" => "No leagues available on your plan."];
    }

    // Step 2: Loop through dates and leagues to fetch fixtures
    foreach ($dates as $date) {
        $dateFixtures = [];
        $fixturesFound = false;

        foreach ($availableLeagues as $leagueId => $leagueName) {
            $endpoint = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}";
            $params = [
                "api_token" => $apiToken,
                "include"   => "league;participants;scores",
                "leagues"   => $leagueId
            ];
            $endpoint .= "?" . http_build_query($params);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $endpoint);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            if (curl_error($ch)) {
                die("cURL Error: " . curl_error($ch));
            }
            $data = json_decode($response, true);
            curl_close($ch);

            if (!isset($data['data']) || empty($data['data'])) continue;

            $fixturesFound = true;

            foreach ($data['data'] as $fixture) {
                $time = date("H:i", strtotime($fixture['starting_at']));
                $fixtureId = $fixture['id'] ?? null;

                $homeName = $awayName = "Unknown";
                $homeLogo = $awayLogo = "";
                $homeScore = $awayScore = "0";

                if (isset($fixture['participants'])) {
                    foreach ($fixture['participants'] as $team) {
                        if ($team['meta']['location'] === 'home') {
                            $homeName = $team['name'];
                            $homeLogo = $team['image_path'];
                        }
                        if ($team['meta']['location'] === 'away') {
                            $awayName = $team['name'];
                            $awayLogo = $team['image_path'];
                        }
                    }
                }

                if (isset($fixture['scores'])) {
                    $homeScore = $fixture['scores']['localteam_score'] ?? "0";
                    $awayScore = $fixture['scores']['visitorteam_score'] ?? "0";
                }

                // Dummy prediction
                $prediction = "";
                $confidence = "70%";

                $dateFixtures[] = [
                    "id" => $fixtureId,
                    "date" => $date,
                    "league" => $leagueName,
                    "time" => $time,
                    "home" => [
                        "name" => $homeName,
                        "logo" => $homeLogo,
                        "score" => $homeScore
                    ],
                    "away" => [
                        "name" => $awayName,
                        "logo" => $awayLogo,
                        "score" => $awayScore
                    ],
                    "prediction" => $prediction,
                    "confidence" => $confidence
                ];
            }
        }

        $fixturesArray[$date] = $fixturesFound ? $dateFixtures : [];
    }

    return $fixturesArray;
}


// REAL PRODUCTION FUNCTION




// function getFootballFixtures($dates) {
//     $apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
//     $fixturesArray = [];

//     // Step 1: Get available leagues
//     $leaguesEndpoint = "https://api.sportmonks.com/v3/football/leagues?api_token={$apiToken}";
//     $ch = curl_init();
//     curl_setopt($ch, CURLOPT_URL, $leaguesEndpoint);
//     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//     $response = curl_exec($ch);
//     if (curl_error($ch)) die("cURL Error: " . curl_error($ch));
//     $leaguesData = json_decode($response, true);
//     curl_close($ch);

//     $availableLeagues = [];
//     if (isset($leaguesData['data'])) {
//         foreach ($leaguesData['data'] as $league) {
//             $id = $league['id'] ?? null;
//             $name = $league['name'] ?? 'Unknown League';
//             if ($id) $availableLeagues[$id] = $name;
//         }
//     } else {
//         return ["error" => "No leagues available on your plan."];
//     }

//     // Step 2: Loop through dates
//     foreach ($dates as $date) {
//         $dateFixtures = [];
//         $fixturesFound = false;

//         foreach ($availableLeagues as $leagueId => $leagueName) {
//             $endpoint = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}";
//             $params = [
//                 "api_token" => $apiToken,
//                 // "include"   => "league;participants;scores;odds;stats;predictions",
//                 "include"   => "league;participants;scores",
//                 "leagues"   => $leagueId
//             ];
//             $endpoint .= "?" . http_build_query($params);

//             $ch = curl_init();
//             curl_setopt($ch, CURLOPT_URL, $endpoint);
//             curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//             $response = curl_exec($ch);
//             if (curl_error($ch)) die("cURL Error: " . curl_error($ch));
//             $data = json_decode($response, true);
//             curl_close($ch);

//             if (!isset($data['data']) || empty($data['data'])) continue;

//             $fixturesFound = true;

//             foreach ($data['data'] as $fixture) {
//                 $time = date("H:i", strtotime($fixture['starting_at'] ?? ''));
//                 $fixtureId = $fixture['id'] ?? null;

//                 $homeName = $awayName = "Unknown";
//                 $homeLogo = $awayLogo = "";
//                 $homeScore = $awayScore = "0";

//                 if (isset($fixture['participants'])) {
//                     foreach ($fixture['participants'] as $team) {
//                         if (($team['meta']['location'] ?? '') === 'home') {
//                             $homeName = $team['name'] ?? "Unknown";
//                             $homeLogo = $team['image_path'] ?? "";
//                         }
//                         if (($team['meta']['location'] ?? '') === 'away') {
//                             $awayName = $team['name'] ?? "Unknown";
//                             $awayLogo = $team['image_path'] ?? "";
//                         }
//                     }
//                 }

//                 if (isset($fixture['scores'])) {
//                     $homeScore = $fixture['scores']['localteam_score'] ?? "0";
//                     $awayScore = $fixture['scores']['visitorteam_score'] ?? "0";
//                 }

//                 // --- Predictions (first only) ---
//                 $prediction = "";
//                 $confidence = "";
//                 if (!empty($fixture['predictions'])) {
//                     $firstPrediction = $fixture['predictions'][0];
//                     $prediction = $firstPrediction['prediction'] ?? "";
//                     $confidence = $firstPrediction['probability'] ?? "";
//                 }

//                 // --- Odds (only 1X2 and Over/Under 2.5) ---
//                 $filteredOdds = [];
//                 if (!empty($fixture['odds'])) {
//                     foreach ($fixture['odds'] as $market) {
//                         $marketName = strtolower($market['name'] ?? "");
//                         if (in_array($marketName, ['1x2', 'over/under'])) {
//                             $values = [];
//                             if (!empty($market['values'])) {
//                                 foreach ($market['values'] as $val) {
//                                     if (stripos($val['label'], '2.5') !== false || in_array($val['label'], ['1', 'X', '2'])) {
//                                         $values[] = [
//                                             "label" => $val['label'] ?? "",
//                                             "odd"   => $val['odd'] ?? ""
//                                         ];
//                                     }
//                                 }
//                             }
//                             $filteredOdds[] = [
//                                 "market" => $market['name'],
//                                 "bookmaker" => $market['bookmaker']['name'] ?? "",
//                                 "values" => $values
//                             ];
//                         }
//                     }
//                 }

//                 // --- Stats (only possession, shots on target, corners, fouls) ---
//                 $filteredStats = [];
//                 if (!empty($fixture['stats'])) {
//                     foreach ($fixture['stats'] as $stat) {
//                         $type = strtolower($stat['type'] ?? "");
//                         if (in_array($type, ['possession', 'shots_on_target', 'corners', 'fouls'])) {
//                             $filteredStats[] = [
//                                 "type" => $stat['type'],
//                                 "value" => $stat['value'] ?? ""
//                             ];
//                         }
//                     }
//                 }

//                 // Build fixture record
//                 $dateFixtures[] = [
//                     "id" => $fixtureId,
//                     "date" => $date,
//                     "league" => $leagueName,
//                     "time" => $time,
//                     "home" => [
//                         "name" => $homeName,
//                         "logo" => $homeLogo,
//                         "score" => $homeScore
//                     ],
//                     "away" => [
//                         "name" => $awayName,
//                         "logo" => $awayLogo,
//                         "score" => $awayScore
//                     ],
//                     "prediction" => $prediction,
//                     "confidence" => $confidence,
//                     "odds" => $filteredOdds,
//                     "stats" => $filteredStats
//                 ];
//             }
//         }

//         $fixturesArray[$date] = $fixturesFound ? $dateFixtures : [];
//     }

//     return $fixturesArray;
// }
