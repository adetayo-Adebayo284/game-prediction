<?php


function getFootballFixtures($dates) {
    $apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
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
        if (isset($data['data']) && !empty($data['data'])) {
            foreach ($data['data'] as $fixture) {
                // --- Kickoff ---
                $kickoff = $fixture['starting_at'] ?? ""; // string "YYYY-MM-DD HH:MM:SS"
                $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

                // --- League ---
                $league = [
                    "id"   => $fixture['league']['id'] ?? null,
                    "name" => $fixture['league']['name'] ?? "Unknown League",
                    "logo" => $fixture['league']['image_path'] ?? ""
                ];

                // --- Sport ---
                $sport = [
                    "id"   => $fixture['sport']['id'] ?? null,
                    "name" => $fixture['sport']['name'] ?? ""
                ];

                // --- Participants ---
                $participants = [];
                if (isset($fixture['participants'])) {
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
