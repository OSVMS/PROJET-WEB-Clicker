<?php
session_start();
require_once __DIR__ . '/db.php';

if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$pdo = getPdo();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '' || $password === '') {
        $error = 'Veuillez remplir tous les champs.';
    } elseif ($action === 'register') {
        if (strlen($password) < 12) {
            $error = 'Le mot de passe doit contenir au moins 12 caracteres.';
        } else {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = :username');
            $stmt->execute(['username' => $username]);

            if ((int) $stmt->fetchColumn() > 0) {
                $error = "Ce nom d'utilisateur existe deja.";
            } else {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare('INSERT INTO users (username, password) VALUES (:username, :password)');
                if ($stmt->execute(['username' => $username, 'password' => $hashedPassword])) {
                $_SESSION['user_id'] = (int) $pdo->lastInsertId();
                $_SESSION['username'] = $username;
                header('Location: index.php');
                exit;
                } else {
                    $error = "Erreur lors de l'inscription.";
                }
            }
        }
    } elseif ($action === 'login') {
        $stmt = $pdo->prepare('SELECT id, username, password FROM users WHERE username = :username');
        $stmt->execute(['username' => $username]);
        $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userRow && password_verify($password, $userRow['password'])) {
            $_SESSION['user_id'] = (int) $userRow['id'];
            $_SESSION['username'] = $userRow['username'];
            header('Location: index.php');
            exit;
        }

        $error = 'Identifiants incorrects.';
    } else {
        $error = 'Action invalide.';
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connexion / Inscription - Racing Clicker</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="app auth-page">
    <div class="auth-container">
      <h1>Racing Clicker</h1>

      <?php if ($error !== ''): ?>
        <div class="message error"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
      <?php endif; ?>

      <div class="auth-grid">
        <section class="auth-block">
          <h2>Connexion</h2>
          <form class="auth-form" method="post" action="auth.php">
            <input type="hidden" name="action" value="login">
            <input type="text" name="username" placeholder="Nom d'utilisateur" required>
            <input type="password" name="password" placeholder="Mot de passe" required>
            <button type="submit">Se connecter</button>
          </form>
        </section>

        <section class="auth-block">
          <h2>Inscription</h2>
          <form class="auth-form" method="post" action="auth.php">
            <input type="hidden" name="action" value="register">
            <input type="text" name="username" placeholder="Nom d'utilisateur" required>
            <input type="password" name="password" placeholder="Mot de passe" minlength="12" required>
            <button type="submit">S'inscrire</button>
          </form>
        </section>
      </div>
    </div>
  </main>
</body>
</html>
