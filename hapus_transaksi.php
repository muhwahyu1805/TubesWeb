<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    $id = $data['id'];

    $query = "DELETE FROM transaksi WHERE id = '$id'";

    if (mysqli_query($koneksi, $query)) {
        echo "Sukses";
    } else {
        echo "Gagal: " . mysqli_error($koneksi);
    }
} else {
    echo "ID tidak ditemukan.";
}
?>