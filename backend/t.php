<?php
header("Content-Type: application/json");
error_reporting(0);

// --- CONFIG ---
$apiToken  = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
$inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// --- Helpers ---
function factorial($n) { return ($n <= 1) ? 1 : $n * factorial($n - 1); }
function poisson($lambda, $k) { return (pow($lambda, $k) * exp(-$lambda)) / factorial($k); }
function calculateProbabilities($homeGF, $homeGA, $awayGF, $awayGA, $maxGoals = 7) {
    $lambdaHome = ($homeGF + $awayGA) / 2;
    $lambdaAway = ($awayGF + $homeGA) / 2;
    $probs = [
        "home"=>0,"draw"=>0,"away"=>0,
        "over"=>array_fill(0,8,0),
        "under"=>array_fill(0,8,0),
        "btts_yes"=>0,"btts_no"=>0,
        "exact"=>[]
    ];
    
    for ($i=0;$i<=$maxGoals;$i++) {
        for ($j=0;$j<=$maxGoals;$j++) {
            $p = poisson($lambdaHome,$i)*poisson($lambdaAway,$j);
            if($i>$j) $probs["home"]+=$p;
            elseif($i==$j) $probs["draw"]+=$p;
            else $probs["away"]+=$p;
            for($g=0;$g<=7;$g++){
                if(($i+$j)>$g) $probs["over"][$g]+=$p; else $probs["under"][$g]+=$p;
            }
            if($i>0 && $j>0) $probs["btts_yes"]+=$p; else $probs["btts_no"]+=$p;
            $probs["exact"]["$i-$j"] = $p;
        }
    }
    return $probs;
}
function toOdds($prob,$margin=0.93){ return round(1/max($prob,0.01)*$margin,2); }

// --- Market Type Mapping ---
$marketTypes = [
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

// --- Map predictions type_id to market text ---
function mapPredictions($predictions, $marketTypes){
    if(!is_array($predictions)) return $predictions;
    foreach($predictions as &$pred){
        if(isset($pred['type_id'])){
            $pred['market'] = $marketTypes[$pred['type_id']] ?? "Unknown Market";
            unset($pred['type_id']);
        }
    }
    return $predictions;
}

// --- Fetch Fixtures ---
$url = "https://api.sportmonks.com/v3/football/fixtures/between/$inputDate/$inputDate?api_token=$apiToken&include=sport;league;participants;predictions";
$ch = curl_init();
curl_setopt($ch,CURLOPT_URL,$url);
curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response,true);

// --- Build Output ---
$output = [];
$id = 1;

if(!empty($data["data"])){
    foreach($data["data"] as $fixture){
        if(count($fixture["participants"])<2) continue;

        $home = $fixture["participants"][0]["name"];
        $away = $fixture["participants"][1]["name"];
        $league = $fixture["league"]["name"];
        $kick = $fixture["starting_at"];
        $homeLogo = $fixture["participants"][0]["image_path"] ?? "./assets/images.jpg";
        $awayLogo = $fixture["participants"][1]["image_path"] ?? "./assets/images.jpg";

        // Map type_id to market text in predictions
        $predictions = mapPredictions($fixture['predictions'] ?? [], $marketTypes);

        // Placeholder stats
        $homeGF = rand(1,3); $homeGA = rand(0,2);
        $awayGF = rand(1,3); $awayGA = rand(0,2);

        $probs = calculateProbabilities($homeGF,$homeGA,$awayGF,$awayGA);

        // --- Fulltime Result ---
        foreach(["Home"=>$probs["home"],"Draw"=>$probs["draw"],"Away"=>$probs["away"]] as $sel=>$p){
            $output[] = [
                "id" => (string)$id++,
                "sport"=>"Soccer",
                "home"=>$home,
                "away"=>$away,
                "odds"=>toOdds($p),
                "market"=>"Win - $sel",
                "type_id"=>233,
                "league"=>$league,
                "kick"=>$kick,
                "homeLogo"=>$homeLogo,
                "awayLogo"=>$awayLogo,
                "prediction"=>$predictions
            ];
        }

        // --- Double Chance ---
        foreach(["1X"=>$probs["home"]+$probs["draw"],"12"=>$probs["home"]+$probs["away"],"X2"=>$probs["draw"]+$probs["away"]] as $sel=>$p){
            $output[] = [
                "id" => (string)$id++,
                "sport"=>"Soccer",
                "home"=>$home,
                "away"=>$away,
                "odds"=>toOdds($p),
                "market"=>"Double Chance - $sel",
                "type_id"=>231,
                "league"=>$league,
                "kick"=>$kick,
                "homeLogo"=>$homeLogo,
                "awayLogo"=>$awayLogo,
                "prediction"=>$predictions
            ];
        }

        // --- Draw No Bet ---
        foreach(["Home"=>$probs["home"]/($probs["home"]+$probs["away"]),"Away"=>$probs["away"]/($probs["home"]+$probs["away"])] as $sel=>$p){
            $output[] = [
                "id" => (string)$id++,
                "sport"=>"Soccer",
                "home"=>$home,
                "away"=>$away,
                "odds"=>toOdds($p),
                "market"=>"Draw No Bet - $sel",
                "type_id"=>232,
                "league"=>$league,
                "kick"=>$kick,
                "homeLogo"=>$homeLogo,
                "awayLogo"=>$awayLogo,
                "prediction"=>$predictions
            ];
        }

        // --- BTTS ---
        foreach(["Yes"=>$probs["btts_yes"],"No"=>$probs["btts_no"]] as $sel=>$p){
            $output[] = [
                "id" => (string)$id++,
                "sport"=>"Soccer",
                "home"=>$home,
                "away"=>$away,
                "odds"=>toOdds($p),
                "market"=>"Both Teams To Score - $sel",
                "type_id"=>1585,
                "league"=>$league,
                "kick"=>$kick,
                "homeLogo"=>$homeLogo,
                "awayLogo"=>$awayLogo,
                "prediction"=>$predictions
            ];
        }

        // --- Over/Under 0.5 → 7.5 ---
        for($g=0;$g<=7;$g++){
            $output[]=[
                "id"=>(string)$id++,
                "sport"=>"Soccer",
                "home"=>$home,
                "away"=>$away,
                "odds"=>toOdds($probs["over"][$g]),
                "market"=>"Over ".($g+0.5),
                "type_id"=>1683+$g,
                "league"=>$league,
                "kick"=>$kick,
                "homeLogo"=>$homeLogo,
                "awayLogo"=>$awayLogo,
                "prediction"=>$predictions
            ];
            $output[]=[
                "id"=>(string)$id++,
                "sport"=>"Soccer",
                "home"=>$home,
                "away"=>$away,
                "odds"=>toOdds($probs["under"][$g]),
                "market"=>"Under ".($g+0.5),
                "type_id"=>1683+$g,
                "league"=>$league,
                "kick"=>$kick,
                "homeLogo"=>$homeLogo,
                "awayLogo"=>$awayLogo,
                "prediction"=>$predictions
            ];
        }

        // --- Correct Score 0-3 ---
        foreach($probs["exact"] as $score=>$p){
            list($h,$a)=explode("-",$score);
            if($h<=3 && $a<=3){
                $output[]=[
                    "id"=>(string)$id++,
                    "sport"=>"Soccer",
                    "home"=>$home,
                    "away"=>$away,
                    "odds"=>toOdds($p),
                    "market"=>"Correct Score $score",
                    "type_id"=>234,
                    "league"=>$league,
                    "kick"=>$kick,
                    "homeLogo"=>$homeLogo,
                    "awayLogo"=>$awayLogo,
                    "prediction"=>$predictions
                ];
            }
        }

        // --- Odd/Even Goals ---
        $oddProb = array_sum(array_filter($probs["exact"], fn($p,$score)=>(array_sum(explode("-",$score))%2)==1, ARRAY_FILTER_USE_BOTH));
        $evenProb = array_sum(array_filter($probs["exact"], fn($p,$score)=>(array_sum(explode("-",$score))%2)==0, ARRAY_FILTER_USE_BOTH));
        $output[]=[
            "id"=>(string)$id++,
            "sport"=>"Soccer",
            "home"=>$home,
            "away"=>$away,
            "odds"=>toOdds($oddProb),
            "market"=>"Total Goals - Odd",
            "type_id"=>238,
            "league"=>$league,
            "kick"=>$kick,
            "homeLogo"=>$homeLogo,
            "awayLogo"=>$awayLogo,
            "prediction"=>$predictions
        ];
        $output[]=[
            "id"=>(string)$id++,
            "sport"=>"Soccer",
            "home"=>$home,
            "away"=>$away,
            "odds"=>toOdds($evenProb),
            "market"=>"Total Goals - Even",
            "type_id"=>238,
            "league"=>$league,
            "kick"=>$kick,
            "homeLogo"=>$homeLogo,
            "awayLogo"=>$awayLogo,
            "prediction"=>$predictions
        ];

        // --- First Team to Score ---
        foreach(["Home"=>0.55,"Away"=>0.40,"No Goal"=>0.05] as $sel=>$p){
            $output[]=[
                "id"=>(string)$id++,
                "sport"=>"Soccer",
                "home"=>$home,
                "away"=>$away,
                "odds"=>toOdds($p),
                "market"=>"First Team to Score - $sel",
                "type_id"=>239,
                "league"=>$league,
                "kick"=>$kick,
                "homeLogo"=>$homeLogo,
                "awayLogo"=>$awayLogo,
                "prediction"=>$predictions
            ];
        }
    }
}

echo json_encode($output, JSON_PRETTY_PRINT);








// // GOOD ONE AND REAL TO USE 

// header("Content-Type: application/json");
// error_reporting(0);

// // --- CONFIG ---
// $apiToken  = '4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa';
// // Receive date in YYYY-MM-DD format
// $inputDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// $startDate = $inputDate;
// $endDate   = $inputDate;

// // --- Helpers ---
// function factorial($n) { return ($n <= 1) ? 1 : $n * factorial($n - 1); }
// function poisson($lambda, $k) { return (pow($lambda, $k) * exp(-$lambda)) / factorial($k); }
// function calculateProbabilities($homeGF, $homeGA, $awayGF, $awayGA, $maxGoals = 7) {
//     $lambdaHome = ($homeGF + $awayGA) / 2;
//     $lambdaAway = ($awayGF + $homeGA) / 2;
//     $probs = [
//         "home"=>0,"draw"=>0,"away"=>0,
//         "over"=>array_fill(0,8,0),
//         "under"=>array_fill(0,8,0),
//         "btts_yes"=>0,"btts_no"=>0,
//         "exact"=>[]
//     ];
//     for ($i=0;$i<=$maxGoals;$i++) {
//         for ($j=0;$j<=$maxGoals;$j++) {
//             $p = poisson($lambdaHome,$i)*poisson($lambdaAway,$j);
//             if($i>$j) $probs["home"]+=$p;
//             elseif($i==$j) $probs["draw"]+=$p;
//             else $probs["away"]+=$p;
//             for($g=0;$g<=7;$g++){
//                 if(($i+$j)>$g) $probs["over"][$g]+=$p; else $probs["under"][$g]+=$p;
//             }
//             if($i>0&&$j>0) $probs["btts_yes"]+=$p; else $probs["btts_no"]+=$p;
//             $probs["exact"]["$i-$j"] = $p;
//         }
//     }
//     return $probs;
// }
// function toOdds($prob,$margin=0.93){ return round(1/max($prob,0.01)*$margin,2); }

// // --- Fetch Fixtures ---
// $url = "https://api.sportmonks.com/v3/football/fixtures/between/$startDate/$endDate?api_token=$apiToken&include=sport;league;participants;";
// $ch = curl_init();
// curl_setopt($ch,CURLOPT_URL,$url);
// curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
// $response = curl_exec($ch);
// curl_close($ch);
// $data = json_decode($response,true);

// // --- Build Odds Feed ---
// $output = [];
// $id = 1;

// if(!empty($data["data"])){
//     foreach($data["data"] as $fixture){
//         if(count($fixture["participants"])<2) continue;
//         $home = $fixture["participants"][0]["name"];
//         $away = $fixture["participants"][1]["name"];
//         $league = $fixture["league"]["name"];
//         $kick = $fixture["starting_at"];
//         $homeLogo = $fixture["participants"][0]["image_path"] ?? "./assets/images.jpg";
//         $awayLogo = $fixture["participants"][1]["image_path"] ?? "./assets/images.jpg";

//         // Placeholder stats
//         $homeGF = rand(1,3); $homeGA = rand(0,2);
//         $awayGF = rand(1,3); $awayGA = rand(0,2);

//         $probs = calculateProbabilities($homeGF,$homeGA,$awayGF,$awayGA);

//         // --- Fulltime Result (1X2) ---
//         foreach(["Home"=>$probs["home"],"Draw"=>$probs["draw"],"Away"=>$probs["away"]] as $sel=>$p){
//             $output[] = [
//                 "id" => (string)$id++,
//                 "sport"=>"Soccer",
//                 "home"=>$home,
//                 "away"=>$away,
//                 "odds"=>toOdds($p),
//                 "market"=>"Win - $sel",
//                 "league"=>$league,
//                 "kick"=>$kick,
//                 "homeLogo"=>$homeLogo,
//                 "awayLogo"=>$awayLogo
//             ];
//         }

//         // --- Double Chance ---
//         $doubleChance = [
//             "1X"=>$probs["home"]+$probs["draw"],
//             "12"=>$probs["home"]+$probs["away"],
//             "X2"=>$probs["draw"]+$probs["away"]
//         ];
//         foreach($doubleChance as $sel=>$p){
//             $output[] = [
//                 "id" => (string)$id++,
//                 "sport"=>"Soccer",
//                 "home"=>$home,
//                 "away"=>$away,
//                 "odds"=>toOdds($p),
//                 "market"=>"Double Chance - $sel",
//                 "league"=>$league,
//                 "kick"=>$kick,
//                 "homeLogo"=>$homeLogo,
//                 "awayLogo"=>$awayLogo
//             ];
//         }

//         // --- Draw No Bet ---
//         $dnb = [
//             "Home"=>$probs["home"]/($probs["home"]+$probs["away"]),
//             "Away"=>$probs["away"]/($probs["home"]+$probs["away"])
//         ];
//         foreach($dnb as $sel=>$p){
//             $output[] = [
//                 "id" => (string)$id++,
//                 "sport"=>"Soccer",
//                 "home"=>$home,
//                 "away"=>$away,
//                 "odds"=>toOdds($p),
//                 "market"=>"Draw No Bet - $sel",
//                 "league"=>$league,
//                 "kick"=>$kick,
//                 "homeLogo"=>$homeLogo,
//                 "awayLogo"=>$awayLogo
//             ];
//         }

//         // --- BTTS ---
//         foreach(["Yes"=>$probs["btts_yes"],"No"=>$probs["btts_no"]] as $sel=>$p){
//             $output[] = [
//                 "id" => (string)$id++,
//                 "sport"=>"Soccer",
//                 "home"=>$home,
//                 "away"=>$away,
//                 "odds"=>toOdds($p),
//                 "market"=>"Both Teams To Score - $sel",
//                 "league"=>$league,
//                 "kick"=>$kick,
//                 "homeLogo"=>$homeLogo,
//                 "awayLogo"=>$awayLogo
//             ];
//         }

//         // --- Over/Under ---
//         for($g=0;$g<=7;$g++){
//             $output[] = [
//                 "id"=>(string)$id++,
//                 "sport"=>"Soccer",
//                 "home"=>$home,
//                 "away"=>$away,
//                 "odds"=>toOdds($probs["over"][$g]),
//                 "market"=>"Over ".($g+0.5),
//                 "league"=>$league,
//                 "kick"=>$kick,
//                 "homeLogo"=>$homeLogo,
//                 "awayLogo"=>$awayLogo
//             ];
//             $output[] = [
//                 "id"=>(string)$id++,
//                 "sport"=>"Soccer",
//                 "home"=>$home,
//                 "away"=>$away,
//                 "odds"=>toOdds($probs["under"][$g]),
//                 "market"=>"Under ".($g+0.5),
//                 "league"=>$league,
//                 "kick"=>$kick,
//                 "homeLogo"=>$homeLogo,
//                 "awayLogo"=>$awayLogo
//             ];
//         }

//         // --- Correct Score 0-3 ---
//         foreach($probs["exact"] as $score=>$p){
//             list($h,$a)=explode("-",$score);
//             if($h<=3 && $a<=3){
//                 $output[]=[
//                     "id"=>(string)$id++,
//                     "sport"=>"Soccer",
//                     "home"=>$home,
//                     "away"=>$away,
//                     "odds"=>toOdds($p),
//                     "market"=>"Correct Score $score",
//                     "league"=>$league,
//                     "kick"=>$kick,
//                     "homeLogo"=>$homeLogo,
//                     "awayLogo"=>$awayLogo
//                 ];
//             }
//         }

//         // --- Odd/Even Goals ---
//         $oddProb = array_sum(array_filter($probs["exact"], fn($p,$score)=>(array_sum(explode("-",$score))%2)==1, ARRAY_FILTER_USE_BOTH));
//         $evenProb = array_sum(array_filter($probs["exact"], fn($p,$score)=>(array_sum(explode("-",$score))%2)==0, ARRAY_FILTER_USE_BOTH));
//         $output[] = [
//             "id"=>(string)$id++,
//             "sport"=>"Soccer",
//             "home"=>$home,
//             "away"=>$away,
//             "odds"=>toOdds($oddProb),
//             "market"=>"Total Goals - Odd",
//             "league"=>$league,
//             "kick"=>$kick,
//             "homeLogo"=>$homeLogo,
//             "awayLogo"=>$awayLogo
//         ];
//         $output[] = [
//             "id"=>(string)$id++,
//             "sport"=>"Soccer",
//             "home"=>$home,
//             "away"=>$away,
//             "odds"=>toOdds($evenProb),
//             "market"=>"Total Goals - Even",
//             "league"=>$league,
//             "kick"=>$kick,
//             "homeLogo"=>$homeLogo,
//             "awayLogo"=>$awayLogo
//         ];

//         // --- First Team to Score ---
//         foreach(["Home"=>0.55,"Away"=>0.40,"No Goal"=>0.05] as $sel=>$p){
//             $output[]=[
//                 "id"=>(string)$id++,
//                 "sport"=>"Soccer",
//                 "home"=>$home,
//                 "away"=>$away,
//                 "odds"=>toOdds($p),
//                 "market"=>"First Team to Score - $sel",
//                 "league"=>$league,
//                 "kick"=>$kick,
//                 "homeLogo"=>$homeLogo,
//                 "awayLogo"=>$awayLogo
//             ];
//         }
//     }
// }

// echo json_encode($output,JSON_PRETTY_PRINT);


