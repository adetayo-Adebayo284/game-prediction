<?php
header('Content-Type: application/json');

$apiToken  = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
$startDate = $_GET['start'] ?? '2025-08-01';
$endDate   = $_GET['end'] ?? '2025-08-31';

// --- Prediction Type Mapping ---
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
    1679 => "Over/Under Total Goals",
    33 => "To Win From Behind",
    34 => "To Win From Ahead"
];

// --- Step 1: Get fixtures ---
$fixturesUrl = "https://api.sportmonks.com/v3/football/fixtures/between/$startDate/$endDate"
             . "?api_token=$apiToken&include=sport;league;statistics;participants;predictions;scores";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fixturesUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);

$data     = json_decode($response, true);
$fixtures = $data['data'] ?? [];

if (empty($fixtures)) {
    echo json_encode(["error" => "No fixtures found"]);
    exit;
}

// --- Step 2: Build structured history data ---
$historyData = [];

foreach ($fixtures as $fixture) {
    // --- Participants ---
    $participants = $fixture['participants'] ?? [];
    $home = $participants[0]['name'] ?? 'Home Team';
    $away = $participants[1]['name'] ?? 'Away Team';
    $homeLogo = $participants[0]['image_path'] ?? '';
    $awayLogo = $participants[1]['image_path'] ?? '';

    // --- League ---
    $league = $fixture['league'] ?? [];
    $leagueId    = $league['id'] ?? null;
    $leagueName  = $league['name'] ?? 'Unknown League';
    $leagueLogo  = $league['image_path'] ?? '';
    $leagueShort = $league['short_code'] ?? '';

    // --- Score (CURRENT goals) ---
    $homeGoals = $awayGoals = 0;
    if (!empty($fixture['scores'])) {
        foreach ($fixture['scores'] as $s) {
            if ($s['description'] === 'CURRENT') {
                if ($s['participant_id'] == ($participants[0]['id'] ?? null)) {
                    $homeGoals = $s['score']['goals'] ?? 0;
                }
                if ($s['participant_id'] == ($participants[1]['id'] ?? null)) {
                    $awayGoals = $s['score']['goals'] ?? 0;
                }
            }
        }
    }
    $score = "$homeGoals - $awayGoals";

    // --- Result simplified ---
    $resultText = strtolower($fixture['result_info'] ?? '');
    if (strpos($resultText, strtolower($home)) !== false) {
        $result = 'win';
    } elseif (strpos($resultText, strtolower($away)) !== false) {
        // $result = 'loss';
    } else {
        $result = 'draw';
    }

    // --- Predictions ---
    $predictions = [];
    if (!empty($fixture['predictions'])) {
        foreach ($fixture['predictions'] as $p) {
            $typeId = $p['type_id'] ?? null;
            $market = $predictionTypes[$typeId] ?? "Unknown Market ($typeId)";
            $predictions[] = [
                "market"      => $market,
                "fixture_id"  => $p['fixture_id'] ?? null,
                "type_id"     => $typeId,
                "raw"         => $p['predictions'] ?? [] // keep raw percentages/odds mapping
            ];
        }
    }

    // --- Build historyData object ---
    $historyData[] = [
        "id"          => $fixture['id'],
        "name"        => $fixture['name'] ?? '',
        "home"        => $home,
        "away"        => $away,
        "homeLogo"    => $homeLogo,
        "awayLogo"    => $awayLogo,
        "score"       => $score,
        "date"        => $fixture['starting_at'] ?? '',

        "league"      => [
            "id"         => $leagueId,
            "name"       => $leagueName,
            "short_code" => $leagueShort,
            "logo"       => $leagueLogo,
        ],

        "result_info" => $fixture['result_info'] ?? null,
        "sport"       => $fixture['sport'] ?? [],
        "statistics"  => $fixture['statistics'] ?? [],
        "participants"=> $participants,
        "predictions" => $predictions,
        "scores"      => $fixture['scores'] ?? [],

        "confidence"  => "High",
        "result"      => $result
    ];
}

echo json_encode($historyData, JSON_PRETTY_PRINT);




