<?php

if( $_POST['action'] != 'getdash' )
    ajax_die("Sorry, not implemented yet.");

$tumblr_email       = $_POST['user'];
$tumblr_password    = $_POST['password'];
$tumblr_start       = $_POST['start'];

// Prepare POST request
$request_data = http_build_query(
    array
    (
        'email'     => $tumblr_email,
        'password'  => $tumblr_password,
        'start'     => $tumblr_start,
        'likes'     => 1,
        'num'       => 25
    )
);

// Send the POST request (with cURL)
$c = curl_init('http://www.tumblr.com/api/dashboard/json');
curl_setopt($c, CURLOPT_POST, true);
curl_setopt($c, CURLOPT_POSTFIELDS, $request_data);
curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($c);
$status = curl_getinfo($c, CURLINFO_HTTP_CODE);
curl_close($c);

// Check for success
if( $status == 200 )
    ajax_return(200, $result);
else if( $status == 403 )
    ajax_die('Bad email or password');
else
    ajax_die($result);

//------------------------------------------------------------------------------
function ajax_die($msg)
{
    ajax_return(0, $msg);
}

//------------------------------------------------------------------------------
function ajax_return($status, $response)
{
    print json_encode
        (
            array
            (
                'status'    => $status,
                'data'      => $response
            )
        );
    exit();
}

?>
