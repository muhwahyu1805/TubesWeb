<?php
include 'koneksi.php';
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $email    = $data['userEmail'] ?? $data['user_id']; 
    $type     = $data['type'] ?? $data['jenis'];
    $category = $data['category'] ?? $data['kategori'];
    $desc     = $data['Keterangan'] ?? $data['desc']; 
    $amount   = $data['amount'] ?? $data['jumlah'];
    $date     = $data['Tanggal'] ?? $data['date'];    

    $query = "INSERT INTO transaksi (user_email, type, category, keterangan, amount, Tanggal) 
              VALUES ('$email', '$type', '$category', '$desc', '$amount', '$date')";
              
    if (mysqli_query($koneksi, $query)) {
        echo "Sukses";
    } else {
        echo "Gagal: " . mysqli_error($koneksi);
    }
} else {
    echo "Tidak ada data yang dikirim.";
}
?>