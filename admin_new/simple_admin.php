<?php
// Максимально простая админ панель для тестирования
session_start();

// Простая аутентификация
$password = 'admin123';

// Проверка входа
if (isset($_POST['password']) && $_POST['password'] === $password) {
    $_SESSION['logged_in'] = true;
}

// Выход
if (isset($_GET['logout'])) {
    unset($_SESSION['logged_in']);
    header('Location: simple_admin.php');
    exit;
}

// Если не авторизован, показываем форму входа
if (!isset($_SESSION['logged_in'])) {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Вход в админку</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .login-form { max-width: 400px; margin: 100px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="login-form">
            <h2>Вход в админку товаров</h2>
            <form method="post">
                <div class="form-group">
                    <label>Пароль:</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit">Войти</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Если авторизован, показываем админку
?>
<!DOCTYPE html>
<html>
<head>
    <title>Простая админка товаров</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; color: #333; }
        .btn { background: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin-right: 10px; }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Простая админка товаров</h1>
            <a href="?logout=1" class="btn btn-danger">Выйти</a>
        </div>

        <?php
        // Показываем информацию о PHP
        echo '<div class="success">';
        echo '<strong>PHP работает!</strong><br>';
        echo 'Версия PHP: ' . phpversion() . '<br>';
        echo 'JSON поддержка: ' . (function_exists('json_encode') ? 'Да' : 'Нет') . '<br>';
        echo 'Session поддержка: ' . (function_exists('session_start') ? 'Да' : 'Нет') . '<br>';
        echo 'File functions: ' . (function_exists('file_get_contents') ? 'Да' : 'Нет') . '<br>';
        echo '</div>';

        // Проверяем доступ к products.json
        $json_file = '../products.json';
        if (file_exists($json_file)) {
            echo '<div class="success">';
            echo '<strong>products.json найден</strong><br>';
            if (is_readable($json_file)) {
                echo 'products.json читается<br>';
                $content = file_get_contents($json_file);
                $data = json_decode($content, true);
                if ($data) {
                    echo 'JSON парсится корректно. Товаров: ' . count($data) . '<br>';
                    
                    // Показываем первые 3 товара
                    echo '<h3>Первые товары:</h3>';
                    $count = 0;
                    foreach ($data as $product) {
                        if ($count >= 3) break;
                        echo '<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px;">';
                        echo '<strong>' . htmlspecialchars($product['name']) . '</strong><br>';
                        echo 'Цена: ' . number_format($product['price']) . ' ₸<br>';
                        echo 'Рейтинг: ' . $product['rating'] . '<br>';
                        if (isset($product['comments'])) {
                            echo 'Комментарии: ' . count($product['comments']) . ' шт.<br>';
                        }
                        echo '</div>';
                        $count++;
                    }
                } else {
                    echo '<div class="error">Ошибка парсинга JSON</div>';
                }
            } else {
                echo '<div class="error">products.json не читается</div>';
            }
            echo '</div>';
        } else {
            echo '<div class="error">products.json не найден</div>';
        }
        ?>
    </div>
</body>
</html> 