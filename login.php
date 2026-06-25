<?php
header('Content-Type: application/json');
include 'koneksi.php';
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $email    = mysqli_real_escape_string($koneksi, $data['email']);
    $password = mysqli_real_escape_string($koneksi, $data['password']);

    $query = mysqli_query($koneksi, "SELECT * FROM users WHERE email = '$email' AND password = '$password'");

    if (mysqli_num_rows($query) > 0) {
        $user = mysqli_fetch_assoc($query);
        echo json_encode([
            "success" => true,
            "user" => [
                "name" => $user['name'],
                "email" => $user['email'],
                "password" => $user['password']
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Email atau Password salah!"
        ]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Kosong"]);
}
?>