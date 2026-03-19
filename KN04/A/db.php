<?php
$host = "db";
$user = "kn04user";
$pass = "kn04pass";
$dbname = "kn04db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

echo "Verbindung zur Datenbank erfolgreich!";
?>