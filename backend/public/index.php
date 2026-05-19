<?php

// Dynamic CORS handling to bypass Laravel config caching issues
$allowed_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://gm-consulting.okjtech.co.ke',
    'https://www.gm-consulting.okjtech.co.ke'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With, X-XSRF-Token");
    
    // Handle OPTIONS Preflight request immediately
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Dynamic Paths for Local Development vs Production cPanel Environment
$isLocal = file_exists(__DIR__.'/../vendor/autoload.php');
$corePath = $isLocal ? __DIR__.'/..' : __DIR__.'/../../gmconsulting-core';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $corePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $corePath.'/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $corePath.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
