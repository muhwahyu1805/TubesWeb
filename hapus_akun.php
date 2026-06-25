<?php
include 'koneksi.php';
$data = json_decode(file_get_contents("php://input"), true);
if($data) {
    $email = $data['email'];
    $password = $data['password'];

    // Hapus transaksi milik user dahulu
    mysqli_query($koneksi, "DELETE FROM transaksi WHERE user_email='$email'");
    
    // PERBAIKAN: Ubah dari tabel 'user' menjadi 'users' agar sesuai dengan database Anda
    mysqli_query($koneksi, "DELETE FROM users WHERE email='$email' AND password='$password'");

    if(mysqli_affected_rows($koneksi) > 0) {
        echo "Sukses";
    } else {
        echo "Gagal: Password salah.";
    }
}
?>