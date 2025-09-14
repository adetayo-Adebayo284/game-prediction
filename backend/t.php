<?php
// Set the API endpoint
$url = "https://sports-betting-predictions.p.rapidapi.com/v3/soccer/prediction";

// Initialize a CURL session
$ch = curl_init();

// Set CURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Set headers
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "x-rapidapi-host: sports-betting-predictions.p.rapidapi.com",
    "x-rapidapi-key: 542ee901cdmsh68638446902776dp111bfcjsn1d09c655bddd"
]);

// Execute the request
$response = curl_exec($ch);

// Error handling
if ($response === false) {
    echo "CURL Error: " . curl_error($ch);
} else {
    $data = json_decode($response, true);
    echo "<pre>";
    print_r($data);
    echo "</pre>";
}

// Close CURL session
curl_close($ch);
?>
