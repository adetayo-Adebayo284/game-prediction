<?php

error_reporting(0);
header('Content-Type: application/json');

$apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';

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

// --- Step 1: Fetch fixtures ---
function getFootballFixtures($dates) {
    global $apiToken;
    $fixturesArray = [];

    foreach ($dates as $date) {
        $endpoint = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}";
        $params = [
            "api_token" => $apiToken,
            "include"   => "league;participants;scores;statistics;predictions;sport;metadata"
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

        $dateFixtures = [];
        if (!empty($data['data'])) {
            foreach ($data['data'] as $fixture) {
                $kickoff = $fixture['starting_at'] ?? "";
                $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

                $league = [
                    "id"   => $fixture['league']['id'] ?? null,
                    "name" => $fixture['league']['name'] ?? "Unknown League",
                    "logo" => $fixture['league']['image_path'] ?? ""
                ];

                $sport = [
                    "id"   => $fixture['sport']['id'] ?? null,
                    "name" => $fixture['sport']['name'] ?? ""
                ];

                $participants = [];
                if (!empty($fixture['participants'])) {
                    foreach ($fixture['participants'] as $p) {
                        $participants[] = [
                            "id"       => $p['id'] ?? null,
                            "name"     => $p['name'] ?? "Unknown",
                            "logo"     => $p['image_path'] ?? "",
                            "location" => $p['meta']['location'] ?? null
                        ];
                    }
                }

                $dateFixtures[] = [
                    "id"           => $fixture['id'] ?? null,
                    "date"         => $date,
                    "kickoff"      => $kickoff,
                    "time"         => $timeOnly,
                    "league"       => $league,
                    "sport"        => $sport,
                    "participants" => $participants,
                    "scores"       => $fixture['scores'] ?? [],
                    "statistics"   => $fixture['statistics'] ?? [],
                    "predictions"  => $fixture['predictions'] ?? [],
                    "metadata"     => $fixture['meta'] ?? []
                ];
            }
        }

        $fixturesArray[$date] = $dateFixtures;
    }

    return $fixturesArray;
}

$fixtures = getFootballFixtures([$inputDate]);

// --- Step 2: Fetch odds per fixture in batch ---
$allOdds = [];
$batchSize = 5;
$fixtureChunks = array_chunk($fixtures[$inputDate], $batchSize);

foreach ($fixtureChunks as $chunk) {
    $multiCurl = [];
    $mh = curl_multi_init();

    foreach ($chunk as $fixture) {
        $fixtureId = $fixture['id'] ?? null;
        if (!$fixtureId) continue;

        $kickoff = $fixture['kickoff'] ?? "";
        $status = "upcoming";
        if (!empty($kickoff)) {
            $now = new DateTime("now", new DateTimeZone("UTC"));
            $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
            $status = ($kickoffDT > $now) ? "upcoming" : "started";
        }

        $oddsUrl = ($status === "upcoming")
            ? "https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/$fixtureId?api_token=$apiToken"
            : "https://api.sportmonks.com/v3/football/odds/inplay/fixtures/$fixtureId?api_token=$apiToken";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $oddsUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        curl_multi_add_handle($mh, $ch);
        $multiCurl[$fixtureId] = $ch;
    }

    $running = null;
    do {
        curl_multi_exec($mh, $running);
        curl_multi_select($mh);
    } while ($running > 0);

    foreach ($multiCurl as $fixtureId => $ch) {
        $response = curl_multi_getcontent($ch);
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);

        $oddsData = json_decode($response, true);
        $fixtureOdds = [];

        if (!empty($oddsData['data'])) {
            foreach ($oddsData['data'] as $oddsEntry) {
                if (!empty($oddsEntry['odds'])) {
                    foreach ($oddsEntry['odds'] as $odd) {
                        $marketName = $odd['market']['name'] ?? ($odd['market_description'] ?? 'Unknown Market');
                        $bookmakerName = $odd['bookmaker']['name'] ?? ($odd['bookmaker_name'] ?? 'Unknown Bookmaker');

                        $values = [];
                        if (!empty($odd['values'])) {
                            foreach ($odd['values'] as $v) {
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
            }
        }

        $allOdds[$fixtureId] = $fixtureOdds;
    }

    curl_multi_close($mh);
}

// --- Step 3: Merge odds into fixtures ---
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
            $status = ($kickoffDT > $now) ? "upcoming" : "started";
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

echo json_encode($matchesDB, JSON_PRETTY_PRINT);
exit();
