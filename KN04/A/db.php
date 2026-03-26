<?php
$host = getenv('DB_HOST') ?: 'db';
$user = getenv('DB_USER') ?: 'kn04user';
$pass = getenv('DB_PASS') ?: 'kn04pass';
$dbname = getenv('DB_NAME') ?: 'kn04db';

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

echo "Verbindung zur Datenbank erfolgreich!<br>";
echo "Host: " . htmlspecialchars($host) . "<br>";
echo "Datenbank: " . htmlspecialchars($dbname) . "<br>";

$conn->close();
?>