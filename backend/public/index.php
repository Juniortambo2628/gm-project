<?php

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
