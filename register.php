<?php
include 'koneksi.php';
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    // Memperbaiki typo: dari mysqli_real_escape_escape_string menjadi mysqli_real_escape_string
    $name     = mysqli_real_escape_string($koneksi, $data['name']);
    $email    = mysqli_real_escape_string($koneksi, $data['email']);
    $password = mysqli_real_escape_string($koneksi, $data['password']); 

    // Cek apakah email sudah terdaftar
    $checkEmail = mysqli_query($koneksi, "SELECT * FROM users WHERE email = '$email'");
    if (mysqli_num_rows($checkEmail) > 0) {
        echo "Email sudah terdaftar di database!";
    } else {
        $query = "INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$password')";
        if (mysqli_query($koneksi, $query)) {
            echo "Sukses";
        } else {
            echo "Gagal menyimpan user: " . mysqli_error($koneksi);
        }
    }
} else {
    echo "Tidak ada data.";
}
?>