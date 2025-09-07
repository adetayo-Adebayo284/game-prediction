<?php
header('Content-Type: application/json');

$apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
$startDate = $_GET['start'] ?? '2025-08-01';
$endDate   = $_GET['end'] ?? '2025-08-31';

// --- Step 1: Get fixtures between dates ---
$fixturesUrl = "https://api.sportmonks.com/v3/football/fixtures/between/$startDate/$endDate?api_token=$apiToken";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fixturesUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$fixtures = $data['data'] ?? [];

if (empty($fixtures)) {
    echo json_encode(["error" => "No fixtures found"]);
    exit;
}

// --- Step 2: Fetch full details per fixture ---
$historyData = [];

foreach ($fixtures as $fixture) {
    $fixtureId = $fixture['id'];

    // Fetch fixture details with valid includes
    $detailUrl = "https://api.sportmonks.com/v3/football/fixtures/$fixtureId?api_token=$apiToken&include=participants,scores,league";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $detailUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $detailResp = curl_exec($ch);
    curl_close($ch);

    $fullData = json_decode($detailResp, true)['data'] ?? [];

    // --- Participants ---
    $participants = $fullData['participants']['data'] ?? [];
    $home = $participants[0]['name'] ?? 'Home Team';
    $away = $participants[1]['name'] ?? 'Away Team';
    $homeLogo = $participants[0]['image_path'] ?? '';
    $awayLogo = $participants[1]['image_path'] ?? '';

    // --- League ---
    $leagueName = $fullData['league']['data']['name'] ?? 'Unknown League';

    // --- Score ---
    $homeGoals = $awayGoals = 0;
    if (!empty($fullData['scores']['data'])) {
        foreach ($fullData['scores']['data'] as $s) {
            if ($s['description'] === 'CURRENT') {
                if ($s['participant_id'] == ($participants[0]['id'] ?? null)) $homeGoals = $s['score']['goals'] ?? 0;
                if ($s['participant_id'] == ($participants[1]['id'] ?? null)) $awayGoals = $s['score']['goals'] ?? 0;
            }
        }
    }
    $score = "$homeGoals - $awayGoals";

    // --- Result simplified ---
    $resultText = strtolower($fullData['result_info'] ?? '');
    if (strpos($resultText, $home) !== false) $result = 'win';
    elseif (strpos($resultText, $away) !== false) $result = 'loss';
    else $result = 'win';

    // --- Build historyData object ---
    $historyData[] = [
        "id"         => $fixtureId,
        "home"       => $home,
        "away"       => $away,
        "homeLogo"   => $homeLogo,
        "awayLogo"   => $awayLogo,
        "score"      => $score,
        "league"     => $leagueName,
        "date"       => $fixture['starting_at'] ?? '',
        "prediction" => "$home to Win",
        "confidence" => "High",
        "result"     => $result
    ];
}

echo json_encode($historyData, JSON_PRETTY_PRINT);
