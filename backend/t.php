<?php

$apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
error_reporting(0);
header('Content-Type: application/json');

$predictionTypes = [
    233=>"Fulltime Result (1X2)",1585=>"Both Teams To Score",1685=>"Over/Under 2.5 Goals",
    1684=>"Over/Under 1.5 Goals",1683=>"Over/Under 0.5 Goals",1686=>"Over/Under 3.5 Goals",
    1687=>"Over/Under 4.5 Goals",1688=>"Over/Under 5.5 Goals",1689=>"Over/Under 6.5 Goals",
    1690=>"Over/Under 7.5 Goals",231=>"Double Chance",232=>"Draw No Bet",234=>"Correct Score",
    235=>"Half-time/Full-time",236=>"Half-time Result",237=>"Exact Goals",238=>"Odd/Even Goals",
    239=>"First Team to Score",240=>"Clean Sheet",326=>"Asian Handicap",327=>"Goal Line",
    328=>"Corners",330=>"Both Halves Over 1.5",331=>"Win to Nil",332=>"Penalty Awarded?",
    333=>"Red Card?",334=>"Yellow Card?",1679=>"Over/Under Total Goals"
];

$inputDate = $_GET['date'] ?? date('Y-m-d');

function getFixtures($date){
    global $apiToken;
    $url = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}?".http_build_query([
        'api_token'=>$apiToken,'include'=>'league;participants;scores;statistics;predictions;sport;metadata'
    ]);
    $res = file_get_contents($url);
    $data = json_decode($res,true);
    return $data['data'] ?? [];
}

function getOdds(array $fixtures){
    global $apiToken;
    $allOdds=[];
    $batchSize=3; // smaller batch prevents freezing
    $chunks=array_chunk($fixtures,$batchSize);

    foreach($chunks as $chunk){
        $mh=curl_multi_init();
        $curlMap=[];
        foreach($chunk as $fix){
            $id=$fix['id']??null; if(!$id) continue;
            $kickoff=$fix['starting_at']??'';
            $now=new DateTime("now",new DateTimeZone("UTC"));
            $status=(!empty($kickoff) && new DateTime($kickoff,new DateTimeZone("UTC"))<=$now)?"started":"upcoming";
            $url="https://api.sportmonks.com/v3/football/odds/".($status==="upcoming"?"pre-match":"inplay")."/fixtures/{$id}?api_token={$apiToken}";
            $ch=curl_init($url);
            curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
            curl_multi_add_handle($mh,$ch);
            $curlMap[$id]=$ch;
        }

        $running=null;
        do{
            curl_multi_exec($mh,$running);
            curl_multi_select($mh,1); // timeout 1 sec prevents freeze
        }while($running>0);

        foreach($curlMap as $id=>$ch){
            $res=curl_multi_getcontent($ch);
            curl_multi_remove_handle($mh,$ch);
            curl_close($ch);

            $oddsData=json_decode($res,true);
            $fixtureOdds=[];
            foreach($oddsData['data']??[] as $entry){
                if(!empty($entry['odds'])){
                    foreach($entry['odds'] as $odd){
                        $market=$odd['market']['name']??($odd['market_description']??'Unknown Market');
                        $bookmaker=$odd['bookmaker']['name']??$odd['bookmaker_name']??'Unknown Bookmaker';
                        $values=array_map(fn($v)=>['label'=>$v['label']??'','odd'=>$v['odd']??''],$odd['values']??[]);
                        $fixtureOdds[]=compact('market','bookmaker','values')+['market_id'=>$odd['market_id']??null];
                    }
                }
            }
            $allOdds[$id]=$fixtureOdds;
        }
        curl_multi_close($mh);
    }
    return $allOdds;
}

// Merge fixtures + odds
$fixtures=getFixtures($inputDate);
$odds=getOdds($fixtures);
$matchesDB=[];
$formattedDate=date("d-m-Y",strtotime($inputDate));

foreach($fixtures as $fix){
    $home=['name'=>'Unknown','logo'=>'','score'=>'0'];
    $away=['name'=>'Unknown','logo'=>'','score'=>'0'];
    foreach($fix['participants']??[] as $p){
        $loc=$p['meta']['location']??'';
        if($loc==='home'){$home['name']=$p['name']??'Unknown'; $home['logo']=$p['image_path']??'';}
        if($loc==='away'){$away['name']=$p['name']??'Unknown'; $away['logo']=$p['image_path']??'';}
    }
    $home['score']=$fix['scores']['localteam_score']??'0';
    $away['score']=$fix['scores']['visitorteam_score']??'0';

    $kickoff=$fix['starting_at']??'';
    $timeOnly=$kickoff?date("H:i",strtotime($kickoff)):'';
    $now=new DateTime("now",new DateTimeZone("UTC"));
    $status=(!empty($kickoff)&&new DateTime($kickoff,new DateTimeZone("UTC"))<=$now)?"started":"upcoming";

    $predictions=array_map(fn($pred)=>[
        'type_id'=>$pred['type_id']??null,
        'market'=>$predictionTypes[$pred['type_id']??0]??'Unknown Market',
        'values'=>$pred['predictions']??$pred
    ],$fix['predictions']??[]);

    $matchesDB[$formattedDate][]=[
        'kickoff'=>$kickoff,'time'=>$timeOnly,'status'=>$status,
        'league'=>$fix['league']['name']??'Unknown League',
        'leagueLogo'=>$fix['league']['image_path']??'',
        'sport'=>$fix['sport']['name']??'Football',
        'homeLogo'=>$home['logo'],'awayLogo'=>$away['logo'],
        'home'=>$home['name'],'away'=>$away['name'],
        'score'=>$home['score'].' - '.$away['score'],
        'predictions'=>$predictions,'odds'=>$odds[$fix['id']]??[]
    ];
}

echo json_encode($matchesDB,JSON_PRETTY_PRINT);


// $apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
// error_reporting(0);
// header('Content-Type: application/json');

// // --- Prediction types mapping ---
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

// // --- Input date ---
// $inputDate = $_GET['date'] ?? date('Y-m-d');

// // --- Step 1: Fetch fixtures ---
// function getFootballFixtures($dates) {
//     global $apiToken;
//     $fixturesArray = [];

//     foreach ($dates as $date) {
//         $endpoint = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}";
//         $params = [
//             "api_token" => $apiToken,
//             "include"   => "league;participants;scores;statistics;predictions;sport;metadata"
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

//         $dateFixtures = [];
//         if (!empty($data['data'])) {
//             foreach ($data['data'] as $fixture) {
//                 $kickoff = $fixture['starting_at'] ?? "";
//                 $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

//                 $league = [
//                     "id"   => $fixture['league']['id'] ?? null,
//                     "name" => $fixture['league']['name'] ?? "Unknown League",
//                     "logo" => $fixture['league']['image_path'] ?? ""
//                 ];

//                 $sport = [
//                     "id"   => $fixture['sport']['id'] ?? null,
//                     "name" => $fixture['sport']['name'] ?? ""
//                 ];

//                 $participants = [];
//                 if (!empty($fixture['participants'])) {
//                     foreach ($fixture['participants'] as $p) {
//                         $participants[] = [
//                             "id"       => $p['id'] ?? null,
//                             "name"     => $p['name'] ?? "Unknown",
//                             "logo"     => $p['image_path'] ?? "",
//                             "location" => $p['meta']['location'] ?? null
//                         ];
//                     }
//                 }

//                 $dateFixtures[] = [
//                     "id"           => $fixture['id'] ?? null,
//                     "date"         => $date,
//                     "kickoff"      => $kickoff,
//                     "time"         => $timeOnly,
//                     "league"       => $league,
//                     "sport"        => $sport,
//                     "participants" => $participants,
//                     "scores"       => $fixture['scores'] ?? [],
//                     "statistics"   => $fixture['statistics'] ?? [],
//                     "predictions"  => $fixture['predictions'] ?? [],
//                     "metadata"     => $fixture['meta'] ?? []
//                 ];
//             }
//         }

//         $fixturesArray[$date] = $dateFixtures;
//     }

//     return $fixturesArray;
// }

// $fixtures = getFootballFixtures([$inputDate]);

// // --- Step 2: Fetch odds per fixture (optimized with batch) ---
// $allOdds = [];
// $batchSize = 5; // adjust for performance
// $fixtureChunks = array_chunk($fixtures[$inputDate], $batchSize);

// foreach ($fixtureChunks as $chunk) {
//     $multiCurl = [];
//     $mh = curl_multi_init();

//     foreach ($chunk as $fixture) {
//         $fixtureId = $fixture['id'] ?? null;
//         if (!$fixtureId) continue;

//         $kickoff = $fixture['kickoff'] ?? "";
//         $status = "upcoming";
//         if (!empty($kickoff)) {
//             $now = new DateTime("now", new DateTimeZone("UTC"));
//             $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
//             $status = ($kickoffDT > $now) ? "upcoming" : "started";
//         }

//         $oddsUrl = ($status === "upcoming")
//             ? "https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/$fixtureId?api_token=$apiToken"
//             : "https://api.sportmonks.com/v3/football/odds/inplay/fixtures/$fixtureId?api_token=$apiToken";

//         $ch = curl_init();
//         curl_setopt($ch, CURLOPT_URL, $oddsUrl);
//         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//         curl_multi_add_handle($mh, $ch);
//         $multiCurl[$fixtureId] = $ch;
//     }

//     // execute all
//     $running = null;
//     do {
//         curl_multi_exec($mh, $running);
//         curl_multi_select($mh);
//     } while ($running > 0);

//     // fetch results
//     foreach ($multiCurl as $fixtureId => $ch) {
//         $response = curl_multi_getcontent($ch);
//         curl_multi_remove_handle($mh, $ch);
//         curl_close($ch);

//         $oddsData = json_decode($response, true);
//         $fixtureOdds = [];

//         if (!empty($oddsData['data'])) {
//             foreach ($oddsData['data'] as $oddsEntry) {
//                 if (!empty($oddsEntry['odds'])) {
//                     foreach ($oddsEntry['odds'] as $odd) {
//                         // --- Fix market and bookmaker names ---
//                         $marketName = $odd['market']['name'] ?? ($odd['market_description'] ?? 'Unknown Market');

//                         $bookmakerName = 'Unknown Bookmaker';
//                         if (!empty($odd['bookmaker']['name'])) {
//                             $bookmakerName = $odd['bookmaker']['name'];
//                         } elseif (!empty($odd['bookmaker_name'])) {
//                             $bookmakerName = $odd['bookmaker_name'];
//                         } elseif (!empty($oddsEntry['bookmaker_name'])) {
//                             $bookmakerName = $oddsEntry['bookmaker_name'];
//                         }

//                         $values = [];
//                         if (!empty($odd['values'])) {
//                             foreach ($odd['values'] as $v) {
//                                 $values[] = [
//                                     'label' => $v['label'] ?? '',
//                                     'odd'   => $v['odd'] ?? ''
//                                 ];
//                             }
//                         }

//                         $fixtureOdds[] = [
//                             'market_id' => $odd['market_id'] ?? null,
//                             'market'    => $marketName,
//                             'bookmaker' => $bookmakerName,
//                             'values'    => $values
//                         ];
//                     }
//                 } else {
//                     // fallback for single odds entry
//                     $marketName = $oddsEntry['market_description'] ?? 'Unknown Market';
//                     $bookmakerName = $oddsEntry['bookmaker_name'] ?? 'Unknown Bookmaker';

//                     $fixtureOdds[] = [
//                         'market_id' => $oddsEntry['market_id'] ?? null,
//                         'market'    => $marketName,
//                         'bookmaker' => $bookmakerName,
//                         'values'    => [
//                             [
//                                 'label' => $oddsEntry['label'] ?? '',
//                                 'odd'   => $oddsEntry['value'] ?? ''
//                             ]
//                         ]
//                     ];
//                 }
//             }
//         }

//         $allOdds[$fixtureId] = $fixtureOdds;
//     }

//     curl_multi_close($mh);
// }

// // --- Step 3: Merge odds into fixtures ---
// $matchesDB = [];
// foreach ($fixtures as $date => $matches) {
//     $formattedDate = date("d-m-Y", strtotime($date));
//     $matchesDB[$formattedDate] = [];

//     foreach ($matches as $fixture) {
//         $homeTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];
//         $awayTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];

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

//         if (!empty($fixture["scores"])) {
//             $homeTeam["score"] = $fixture["scores"]["localteam_score"] ?? "0";
//             $awayTeam["score"] = $fixture["scores"]["visitorteam_score"] ?? "0";
//         }

//         $kickoff = $fixture["kickoff"] ?? "";
//         $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

//         $status = "upcoming";
//         if (!empty($kickoff)) {
//             $now = new DateTime("now", new DateTimeZone("UTC"));
//             $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
//             $status = ($kickoffDT > $now) ? "upcoming" : "started";
//         }

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

//         $fixtureOdds = $allOdds[$fixture["id"]] ?? [];

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
//             "odds"           => $fixtureOdds,
//             "rawPredictions" => $fixture["predictions"] ?? []
//         ];
//     }
// }

// // --- Output final JSON ---
// exit(json_encode($matchesDB, JSON_PRETTY_PRINT));





// --- Configuration ---
// $apiToken = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
// error_reporting(0);
// header('Content-Type: application/json');

// // --- Prediction types mapping ---
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

// // --- Input date ---
// $inputDate = $_GET['date'] ?? date('Y-m-d');

// // --- Step 1: Fetch fixtures ---
// function getFootballFixtures($dates) {
//     global $apiToken;
//     $fixturesArray = [];

//     foreach ($dates as $date) {
//         $endpoint = "https://api.sportmonks.com/v3/football/fixtures/date/{$date}";
//         $params = [
//             "api_token" => $apiToken,
//             "include"   => "league;participants;scores;statistics;predictions;sport;metadata"
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

//         $dateFixtures = [];
//         if (!empty($data['data'])) {
//             foreach ($data['data'] as $fixture) {
//                 $kickoff = $fixture['starting_at'] ?? "";
//                 $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

//                 $league = [
//                     "id"   => $fixture['league']['id'] ?? null,
//                     "name" => $fixture['league']['name'] ?? "Unknown League",
//                     "logo" => $fixture['league']['image_path'] ?? ""
//                 ];

//                 $sport = [
//                     "id"   => $fixture['sport']['id'] ?? null,
//                     "name" => $fixture['sport']['name'] ?? ""
//                 ];

//                 $participants = [];
//                 if (!empty($fixture['participants'])) {
//                     foreach ($fixture['participants'] as $p) {
//                         $participants[] = [
//                             "id"       => $p['id'] ?? null,
//                             "name"     => $p['name'] ?? "Unknown",
//                             "logo"     => $p['image_path'] ?? "",
//                             "location" => $p['meta']['location'] ?? null
//                         ];
//                     }
//                 }

//                 $dateFixtures[] = [
//                     "id"           => $fixture['id'] ?? null,
//                     "date"         => $date,
//                     "kickoff"      => $kickoff,
//                     "time"         => $timeOnly,
//                     "league"       => $league,
//                     "sport"        => $sport,
//                     "participants" => $participants,
//                     "scores"       => $fixture['scores'] ?? [],
//                     "statistics"   => $fixture['statistics'] ?? [],
//                     "predictions"  => $fixture['predictions'] ?? [],
//                     "metadata"     => $fixture['meta'] ?? []
//                 ];
//             }
//         }

//         $fixturesArray[$date] = $dateFixtures;
//     }

//     return $fixturesArray;
// }

// $fixtures = getFootballFixtures([$inputDate]);

// // --- Step 2: Fetch odds per fixture ---
// $allOdds = [];
// foreach ($fixtures as $date => $matches) {
//     foreach ($matches as $fixture) {
//         $fixtureId = $fixture['id'] ?? null;
//         if (!$fixtureId) continue;

//         $kickoff = $fixture['kickoff'] ?? "";
//         $status = "upcoming";
//         if (!empty($kickoff)) {
//             $now = new DateTime("now", new DateTimeZone("UTC"));
//             $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
//             $status = ($kickoffDT > $now) ? "upcoming" : "started";
//         }

//         $oddsUrl = ($status === "upcoming")
//             ? "https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/$fixtureId?api_token=$apiToken"
//             : "https://api.sportmonks.com/v3/football/odds/inplay/fixtures/$fixtureId?api_token=$apiToken";

//         $curl = curl_init();
//         curl_setopt_array($curl, [
//             CURLOPT_URL => $oddsUrl,
//             CURLOPT_RETURNTRANSFER => true,
//         ]);
//         $response = curl_exec($curl);
//         curl_close($curl);

//         $oddsData = json_decode($response, true);

//         $fixtureOdds = [];
//         if (!empty($oddsData['data'])) {
//             foreach ($oddsData['data'] as $oddsEntry) {
//                 // If 'odds' exists, loop through them
//                 if (!empty($oddsEntry['odds'])) {
//                     foreach ($oddsEntry['odds'] as $odd) {
//                         $marketName = $odd['market']['name'] ?? 'Unknown Market';
//                         $bookmakerName = $odd['bookmaker']['name'] ?? 'Unknown Bookmaker';

//                         $values = [];
//                         if (!empty($odd['values'])) {
//                             foreach ($odd['values'] as $v) {
//                                 $values[] = [
//                                     'label' => $v['label'] ?? '',
//                                     'odd'   => $v['odd'] ?? ''
//                                 ];
//                             }
//                         }

//                         $fixtureOdds[] = [
//                             'market_id' => $odd['market_id'] ?? null,
//                             'market'    => $marketName,
//                             'bookmaker' => $bookmakerName,
//                             'values'    => $values
//                         ];
//                     }
//                 } else {
//                     // fallback for single odds entry
//                     $fixtureOdds[] = [
//                         'market_id' => $oddsEntry['market_id'] ?? null,
//                         'market'    => $oddsEntry['market_description'] ?? 'Unknown Market',
//                         'bookmaker' => 'Unknown Bookmaker',
//                         'values'    => [
//                             [
//                                 'label' => $oddsEntry['label'] ?? '',
//                                 'odd'   => $oddsEntry['value'] ?? ''
//                             ]
//                         ]
//                     ];
//                 }
//             }
//         }

//         $allOdds[$fixtureId] = $fixtureOdds;

//         if (empty($fixtureOdds)) {
//             file_put_contents("odds_debug.json", json_encode($oddsData, JSON_PRETTY_PRINT));
//         }
//     }
// }

// // --- Step 3: Merge odds into fixtures ---
// $matchesDB = [];
// foreach ($fixtures as $date => $matches) {
//     $formattedDate = date("d-m-Y", strtotime($date));
//     $matchesDB[$formattedDate] = [];

//     foreach ($matches as $fixture) {
//         $homeTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];
//         $awayTeam = ["name" => "Unknown", "logo" => "", "score" => "0"];

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

//         if (!empty($fixture["scores"])) {
//             $homeTeam["score"] = $fixture["scores"]["localteam_score"] ?? "0";
//             $awayTeam["score"] = $fixture["scores"]["visitorteam_score"] ?? "0";
//         }

//         $kickoff = $fixture["kickoff"] ?? "";
//         $timeOnly = !empty($kickoff) ? date("H:i", strtotime($kickoff)) : "";

//         $status = "upcoming";
//         if (!empty($kickoff)) {
//             $now = new DateTime("now", new DateTimeZone("UTC"));
//             $kickoffDT = new DateTime($kickoff, new DateTimeZone("UTC"));
//             $status = ($kickoffDT > $now) ? "upcoming" : "started";
//         }

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

//         $fixtureOdds = $allOdds[$fixture["id"]] ?? [];

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
//             "odds"           => $fixtureOdds,
//             "rawPredictions" => $fixture["predictions"] ?? []
//         ];
//     }
// }

// // --- Output final JSON ---
// exit(json_encode($matchesDB, JSON_PRETTY_PRINT));
?>
