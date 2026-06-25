<?php
include 'koneksi.php';
$data = json_decode(file_get_contents("php://input"), true);
if($data) {
    $email = $data['email'];
    $oldPass = $data['oldPassword'];
    $newPass = $data['newPassword'];

    $query = mysqli_query($koneksi, "UPDATE user SET password='$newPass' WHERE email='$email' AND password='$oldPass'");
    if(mysqli_affected_rows($koneksi) > 0) {
        echo "Sukses";
    } else {
        echo "Gagal: Password lama salah.";
    }
}
?>