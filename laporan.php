<?php
header('Content-Type: application/json');
include 'koneksi.php';

$email = $_GET['email'] ?? '';
$bulan = $_GET['bulan'] ?? ''; // Format: YYYY-MM

if (empty($email) || empty($bulan)) {
    echo json_encode(["error" => "Parameter tidak lengkap"]);
    exit;
}

$start_date = $bulan . '-01';
$end_date = date('Y-m-t', strtotime($start_date));

$query = mysqli_query($koneksi, "SELECT * FROM transaksi WHERE user_email = '$email' AND tanggal BETWEEN '$start_date' AND '$end_date' ORDER BY tanggal ASC");

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