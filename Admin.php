<?php
/**
 * Created by PhpStorm.
 * User: opw
 * Date: 12/5/2016
 * Time: 1:52
 */

$file = 'data/setting.json';
//$jsonString = file_get_contents($file);
//echo $jsonString;

// read post json
$inputJsonString= file_get_contents('php://input');
if (isJson($inputJsonString)) {
    // put the json to setting.json
    file_put_contents($file, $newJsonString);
    header("HTTP/ 200 OK");
}
else {
    echo "ERROR: Not a valid json file";
    header("HTTP/ 400 ERROR");
}

// check if the string is in valid json format
function isJson($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}
