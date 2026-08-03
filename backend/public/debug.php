<?php

use Illuminate\Http\Request;

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo '<h1>Debug Info</h1>';

// Check PHP version
echo '<h2>PHP Version</h2>';
echo '<pre>'.phpversion().'</pre>';

// Check extensions
echo '<h2>Extensions</h2>';
$needed = ['pdo', 'pdo_sqlite', 'mbstring', 'xml', 'ctype', 'json', 'bcmath', 'gd', 'fileinfo', 'curl', 'openssl', 'tokenizer'];
foreach ($needed as $ext) {
    $loaded = extension_loaded($ext);
    echo "<pre>$ext: ".($loaded ? 'YES' : 'NO').'</pre>';
}

// Check paths
echo '<h2>Paths</h2>';
$corePath = __DIR__.'/../../gm-coaching-core';
echo "<pre>Core path: $corePath</pre>";
echo '<pre>vendor/autoload.php exists: '.(file_exists("$corePath/vendor/autoload.php") ? 'YES' : 'NO').'</pre>';
echo '<pre>.env exists: '.(file_exists("$corePath/.env") ? 'YES' : 'NO').'</pre>';

if (file_exists("$corePath/.env")) {
    $env = file_get_contents("$corePath/.env");
    echo '<h2>.env Contents</h2>';
    echo '<pre>'.htmlspecialchars($env).'</pre>';
}

// Try to boot Laravel
echo '<h2>Laravel Boot</h2>';
try {
    require $corePath.'/vendor/autoload.php';
    echo '<pre>Autoload loaded OK</pre>';

    $app = require_once $corePath.'/bootstrap/app.php';
    echo '<pre>App created OK</pre>';

    $response = $app->handle(Request::capture());
    echo '<pre>Response status: '.$response->getStatusCode().'</pre>';
} catch (Throwable $e) {
    echo '<pre>ERROR: '.$e->getMessage()."\n";
    echo $e->getTraceAsString().'</pre>';
}
