<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

// Загружаем переменные окружения из .env файла
function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
    return true;
}

// Загружаем .env файл
if (!loadEnv('.env')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка загрузки конфигурации']);
    exit;
}

// Получаем данные из POST запроса
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Неверные данные']);
    exit;
}

// Валидация обязательных полей
$name = isset($input['name']) ? trim($input['name']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';

if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Имя и телефон обязательны']);
    exit;
}

// Очистка и валидация данных
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');

// Валидация телефона (базовая)
if (!preg_match('/^\+?[0-9\s\(\)\-]{10,18}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Неверный формат телефона']);
    exit;
}

// Получаем токен бота
$botToken = getenv('TELEGRAM_BOT_TOKEN');
if (!$botToken) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Токен бота не найден']);
    exit;
}

// Получаем список пользователей
$usernames = getenv('TELEGRAM_USERNAMES');
if (!$usernames) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Список получателей не найден']);
    exit;
}

$usernamesList = array_map('trim', explode(',', $usernames));

// Дополнительные поля заказа (если есть)
$productName = isset($input['productName']) ? trim($input['productName']) : null;
$sizeName = isset($input['sizeName']) ? trim($input['sizeName']) : null;
$price = isset($input['price']) ? (int)$input['price'] : null;
$originalPrice = isset($input['originalPrice']) ? (int)$input['originalPrice'] : null;
$gift = isset($input['gift']) ? trim($input['gift']) : null;
$commentText = isset($input['comment']) ? trim($input['comment']) : null;

// Формируем сообщение
$message = "🛍️ *НОВЫЙ ЗАКАЗ С САЙТА*\n\n";
$message .= "👤 *Имя:* " . $name . "\n";
$message .= "📱 *Телефон:* " . $phone . "\n\n";

if ($productName) {
    $message .= "🛏️ *Товар:* " . $productName . "\n";
}
if ($sizeName) {
    $message .= "📏 *Размер:* " . $sizeName . "\n";
}
if ($price) {
    $message .= "💰 *Цена:* " . number_format($price, 0, '.', ' ') . " ₸\n";
}
if ($originalPrice && $price) {
    $discount = $originalPrice - $price;
    if ($discount > 0) {
        $message .= "🔥 *Скидка:* " . number_format($discount, 0, '.', ' ') . " ₸\n";
    }
}
if ($gift) {
    $message .= "🎁 *Подарок:* " . $gift . "\n";
}
if ($commentText) {
    $message .= "💬 *Комментарий:* " . $commentText . "\n";
}

$message .= "\n⏰ *Время:* " . date('d.m.Y H:i:s') . "\n";
$message .= "🌐 *Источник:* Форма заказа на сайте";

// Функция для получения chat_id по username
function getChatIdByUsername($botToken, $username) {
    // Убираем @ если есть
    $username = ltrim($username, '@');
    
    // Пытаемся найти chat_id через getUpdates (это работает только если пользователь писал боту)
    $url = "https://api.telegram.org/bot{$botToken}/getUpdates";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['ok'] && !empty($data['result'])) {
            foreach ($data['result'] as $update) {
                if (isset($update['message']['from']['username']) && 
                    $update['message']['from']['username'] === $username) {
                    return $update['message']['from']['id'];
                }
            }
        }
    }
    
    return null;
}

// Функция отправки сообщения
function sendTelegramMessage($botToken, $chatId, $message) {
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    $data = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'Markdown'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 200;
}

// Отправляем сообщения
$successCount = 0;
$errors = [];

foreach ($usernamesList as $username) {
    $username = trim($username);
    if (empty($username)) continue;
    
    // Если это числовой ID, используем его напрямую
    if (is_numeric(ltrim($username, '-'))) {
        $chatId = $username;
    } else {
        // Пытаемся получить chat_id по username
        $chatId = getChatIdByUsername($botToken, $username);
        
        if (!$chatId) {
            // Если не удалось получить chat_id, пробуем отправить по username
            // Это работает только если бот может отправлять сообщения по username
            $chatId = $username;
        }
    }
    
    if (sendTelegramMessage($botToken, $chatId, $message)) {
        $successCount++;
    } else {
        $errors[] = "Не удалось отправить сообщение для {$username}";
    }
}

// Возвращаем результат
if ($successCount > 0) {
    $response = [
        'success' => true,
        'message' => "Сообщение отправлено ({$successCount} получателей)",
        'sent_count' => $successCount
    ];
    
    if (!empty($errors)) {
        $response['warnings'] = $errors;
    }
    
    echo json_encode($response);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Не удалось отправить сообщение ни одному получателю',
        'errors' => $errors
    ]);
}
?>
