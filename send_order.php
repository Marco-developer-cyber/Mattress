<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

// Получаем данные из POST запроса
$input = json_decode(file_get_contents('php://input'), true);

// Если данные не в JSON формате, пробуем получить из $_POST
if (!$input) {
    $input = $_POST;
}

// Проверяем обязательные поля
if (empty($input['name']) || empty($input['phone']) || empty($input['product_name']) || empty($input['size']) || empty($input['price'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Заполните все обязательные поля']);
    exit;
}

// Очищаем и валидируем данные
$name = trim(htmlspecialchars($input['name']));
$phone = trim(htmlspecialchars($input['phone']));
$productName = trim(htmlspecialchars($input['product_name']));
$size = trim(htmlspecialchars($input['size']));
$price = trim(htmlspecialchars($input['price']));
$originalPrice = isset($input['original_price']) ? trim(htmlspecialchars($input['original_price'])) : '';
$comment = isset($input['comment']) ? trim(htmlspecialchars($input['comment'])) : '';

// Проверяем длину имени
if (strlen($name) < 2 || strlen($name) > 50) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Имя должно содержать от 2 до 50 символов']);
    exit;
}

// Проверяем формат телефона
$cleanPhone = preg_replace('/[^\d+]/', '', $phone);
if (strlen($cleanPhone) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Неверный формат телефона']);
    exit;
}

// Настройки Telegram
$botToken = '7618751385:AAGLKry1_Rnd7rwFY5QkqjDxIfFu1WqB654';
$chatIds = ['@Olzhiki', '@TerritoriaSna1', '@boranbay07'];

// Формируем сообщение
$message = "🛏️ *НОВЫЙ ЗАКАЗ*\n\n";
$message .= "👤 *Клиент:* " . $name . "\n";
$message .= "📱 *Телефон:* " . $phone . "\n\n";
$message .= "🛏️ *Товар:* " . $productName . "\n";
$message .= "📏 *Размер:* " . $size . "\n";
$message .= "💰 *Цена:* " . $price . " ₸\n";

if (!empty($originalPrice) && $originalPrice !== $price) {
    $discount = intval(str_replace([' ', '₸'], '', $originalPrice)) - intval(str_replace([' ', '₸'], '', $price));
    $message .= "🔥 *Скидка:* " . number_format($discount, 0, '.', ' ') . " ₸\n";
}

$message .= "🎁 *Подарок:* Наматрасник\n\n";

if (!empty($comment)) {
    $message .= "💬 *Комментарий:* " . $comment . "\n\n";
}

$message .= "⏰ *Время заказа:* " . date('d.m.Y H:i:s') . "\n\n";
$message .= "💬 *Источник:* Сайт territoria-sna.kz";

// Функция для отправки сообщения в Telegram
function sendTelegramMessage($botToken, $chatId, $message) {
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    $data = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'Markdown'
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
            'timeout' => 10
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        return false;
    }
    
    $response = json_decode($result, true);
    return isset($response['ok']) && $response['ok'] === true;
}

// Отправляем сообщения во все чаты
$successCount = 0;
$errors = [];

foreach ($chatIds as $chatId) {
    if (sendTelegramMessage($botToken, $chatId, $message)) {
        $successCount++;
    } else {
        $errors[] = "Ошибка отправки в чат: " . $chatId;
    }
}

// Проверяем результат
if ($successCount > 0) {
    // Логируем успешный заказ
    $logEntry = date('Y-m-d H:i:s') . " - Заказ от: {$name}, {$phone}, Товар: {$productName}, Размер: {$size}, Цена: {$price}\n";
    file_put_contents('orders_log.txt', $logEntry, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => true,
        'message' => 'Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.',
        'sent_to' => $successCount . ' из ' . count($chatIds) . ' получателей'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при отправке заказа. Попробуйте позже или свяжитесь с нами по телефону.',
        'errors' => $errors
    ]);
}
?>
