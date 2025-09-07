<?php
header('Content-Type: application/json');

$raw = file_get_contents("php://input");
if (!$raw) { echo json_encode(["error"=>"No payload"]); exit; }
$req = json_decode($raw, true);

$resource = $req["resource"] ?? null;
$endpointType = $req["endpointType"] ?? "list";
$identifier = $req["identifier"] ?? null;
$dateFrom = $req["dateFrom"] ?? null;
$dateTo = $req["dateTo"] ?? null;
$includes = $req["includes"] ?? [];
$params = $req["params"] ?? [];

$apiToken = "4jDTLmQ5n2VWB1tEobA1jYZRvUql6aA03CUkNLBDtHgz0q1VsM1a2ufM7CGa"; // TODO: replace with real key
$base = "https://api.sportmonks.com/v3";
$url = "";

switch ($resource) {
  case "fixtures":
    $base .= "/football/fixtures";
    if ($endpointType === "byDate" && $identifier) {
      $url = "$base/date/$identifier";
    } elseif ($endpointType === "between" && $dateFrom && $dateTo) {
      $url = "$base/between/$dateFrom/$dateTo";
    } elseif ($endpointType === "byID" && $identifier) {
      $url = "$base/$identifier";
    } else {
      $url = $base;
    }
    break;

  case "continents":
    $url = "$base/core/continents";
    if ($endpointType === "byID" && $identifier) {
      $url .= "/$identifier";
    }
    break;

  case "standings":
    $url = "$base/football/standings";
    if ($endpointType === "byID" && $identifier) {
      $url .= "/$identifier";
    }
    break;

  default:
    // fallback (core or football depending)
    if (in_array($resource, ["countries","regions","cities","types","states"])) {
      $url = "$base/core/$resource";
    } else {
      $url = "$base/football/$resource";
    }
    if ($endpointType === "byID" && $identifier) {
      $url .= "/$identifier";
    }
    break;
}

// add token + includes
$query = ["api_token" => $apiToken];
if (!empty($includes)) {
  $query["include"] = implode(";", $includes);
}
if (!empty($params) && is_array($params)) {
  foreach ($params as $k=>$v) { $query[$k] = $v; }
}
$url .= "?" . http_build_query($query);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
$err = curl_error($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($err) {
  echo json_encode(["error"=>"cURL error: $err"]);
} else {
  echo $response;
}
