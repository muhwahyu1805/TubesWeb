<?php
error_reporting(0); 
header('Content-Type: application/json');
include 'koneksi.php';

$email = $_GET['email'] ?? '';

$query = mysqli_query($koneksi, "SELECT * FROM transaksi WHERE user_email = '$email' ORDER BY tanggal DESC");

if ($query) {
    $transaksi = [];
    while ($row = mysqli_fetch_assoc($query)) {
        $transaksi[] = $row;
    }
    echo json_encode($transaksi);
} else {
    echo json_encode(["error_sql" => mysqli_error($koneksi)]);
}
?>