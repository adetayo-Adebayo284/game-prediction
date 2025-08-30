<?php
$apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa'; //$_ENV['SPORTMONKS_TOKEN']; 




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




// Pick old dates (past season to work with free plan)
$dates = ["2025-05-09"]; // Example date

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
    die("No leagues available on your plan.");
}

// Step 2: Loop through dates and leagues to fetch fixtures
foreach ($dates as $date) {
    echo "<h2>Matches on {$date}</h2>";

    $fixturesFound = false; // Track if any fixture exists for this date

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

        if (!isset($data['data']) || empty($data['data'])) {
            continue; // Skip if no fixtures for this league
        }

        $fixturesFound = true; // At least one fixture exists

        foreach ($data['data'] as $fixture) {
            $time = date("H:i", strtotime($fixture['starting_at']));

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
            $prediction = "Draw";
            $confidence = "70%";

            // Display fixture
            echo "<div style='margin:20px;padding:10px;border:1px solid #ccc;'>";
            echo "<h3>{$homeName} vs {$awayName}</h3>";
            echo "<img src='{$homeLogo}' width='40'> {$homeName} {$homeScore} - {$awayScore} ";
            echo "<img src='{$awayLogo}' width='40'> {$awayName}<br>";
            echo "<small>{$leagueName} • {$time}</small><br>";
            echo "<b>Prediction:</b> {$prediction}<br>";
            echo "<b>Confidence:</b> {$confidence}<br>";
            echo "</div>";
        }
    }

    if (!$fixturesFound) {
        echo "<p>No matches found for {$date}</p>";
    }
}
