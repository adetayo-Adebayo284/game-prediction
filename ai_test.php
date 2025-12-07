<?php
header("Content-Type: application/json");
error_reporting(0);

$apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';

// ✅ CONFIG
$apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
$baseUrl  = "https://api.sportmonks.com/v3/football";

// ✅ REMOVE "probabilities" (invalid include)
$include  = "league;participants;venue;odds;stats;coach;referee;weather_report;details;scores";
$limit    = 10;

// ✅ Fetch today's fixtures
$url = "$baseUrl/fixtures/date/" . date('Y-m-d') . "?api_token=$apiToken&include=$include&per_page=$limit";

// ✅ Call API
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
]);
$response = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
    exit;
}
curl_close($ch);

// ✅ Decode response
$data = json_decode($response, true);

// ✅ Check for valid data
if (!isset($data['data']) || empty($data['data'])) {
    echo json_encode([
        "error" => "No fixtures returned",
        "api_response" => $data
    ]);
    exit;
}

// ✅ Extract fixtures
$fixtures = [];
foreach ($data['data'] as $match) {
    $home = $match['participants'][0]['name'] ?? 'Unknown';
    $away = $match['participants'][1]['name'] ?? 'Unknown';
    $fixtures[] = [
        "fixture_id" => $match['id'],
        "league" => $match['league']['name'] ?? 'Unknown League',
        "home_team" => $home,
        "away_team" => $away,
        "start_time" => $match['starting_at'] ?? null,
        "venue" => $match['venue']['name'] ?? 'N/A',
    ];
}

// ✅ Return response
echo json_encode([
    "status" => "success",
    "count" => count($fixtures),
    "fixtures" => $fixtures
], JSON_PRETTY_PRINT);
?>
