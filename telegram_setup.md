# Настройка Telegram бота для формы обратной связи

## Что уже готово:
1. ✅ PHP скрипт для отправки сообщений (`send_telegram.php`)
2. ✅ Файл с переменными окружения (`.env`)
3. ✅ JavaScript код для обработки формы (`script.js`)
4. ✅ CSS стили для уведомлений (`styles.css`)

## Что нужно сделать:

### 1. Создать Telegram бота (если еще не создан)
1. Откройте Telegram и найдите бота @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен (он уже указан в .env файле)

### 2. Получить Chat ID для пользователей
Для каждого пользователя (@Olzhiki, @TerritoriaSna1, @boranbay07):

**Способ 1 - Через бота:**
1. Каждый пользователь должен написать боту любое сообщение
2. Перейдите по ссылке: `https://api.telegram.org/bot7618751385:AAGLKry1_Rnd7rwFY5QkqjDxIfFu1WqB654/getUpdates`
3. Найдите в ответе chat_id для каждого пользователя
4. Замените usernames в .env файле на chat_id

**Способ 2 - Использовать готовый скрипт:**
```php
<?php
// Создайте файл get_chat_ids.php
$botToken = '7618751385:AAGLKry1_Rnd7rwFY5QkqjDxIfFu1WqB654';
$url = "https://api.telegram.org/bot{$botToken}/getUpdates";

$response = file_get_contents($url);
$data = json_decode($response, true);

echo "<h2>Найденные пользователи:</h2>";
foreach ($data['result'] as $update) {
    if (isset($update['message']['from'])) {
        $user = $update['message']['from'];
        echo "<p>";
        echo "Username: @" . ($user['username'] ?? 'не указан') . "<br>";
        echo "Chat ID: " . $user['id'] . "<br>";
        echo "Имя: " . $user['first_name'] . "<br>";
        echo "</p><hr>";
    }
}
?>
```

### 3. Обновить .env файл
После получения chat_id обновите файл .env:
```
TELEGRAM_BOT_TOKEN=7618751385:AAGLKry1_Rnd7rwFY5QkqjDxIfFu1WqB654
TELEGRAM_USERNAMES=123456789,987654321,555666777
```
(Замените числа на реальные chat_id)

### 4. Проверить работу
1. Откройте сайт
2. Заполните форму в секции "Бесплатная консультация"
3. Нажмите "Заказать бесплатную консультацию"
4. Проверьте, что сообщения приходят в Telegram

## Структура сообщения в Telegram:
```
🔔 НОВАЯ ЗАЯВКА С САЙТА

👤 Имя: [Имя пользователя]
📱 Телефон: [Номер телефона]

⏰ Время: [Дата и время]
🌐 Источник: Форма обратной связи
```

## Возможные проблемы и решения:

### Ошибка "Токен бота не найден"
- Проверьте, что файл .env находится в корне сайта
- Убедитесь, что в .env нет лишних пробелов

### Ошибка "Не удалось отправить сообщение"
- Убедитесь, что пользователи написали боту хотя бы одно сообщение
- Проверьте правильность chat_id
- Убедитесь, что бот не заблокирован пользователями

### Форма не отправляется
- Откройте консоль браузера (F12) и проверьте ошибки
- Убедитесь, что файл send_telegram.php доступен по URL

## Безопасность:
1. Добавьте .env в .gitignore, чтобы не загружать токен в репозиторий
2. Ограничьте доступ к файлу send_telegram.php только для POST запросов
3. Регулярно проверяйте логи на предмет подозрительной активности

## Тестирование:
Для тестирования можете использовать этот простой HTML файл:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Тест формы</title>
</head>
<body>
    <form id="testForm">
        <input type="text" id="name" placeholder="Имя" required>
        <input type="tel" id="phone" placeholder="Телефон" required>
        <button type="submit">Отправить</button>
    </form>

    <script>
        document.getElementById('testForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            fetch('send_telegram.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.success ? 'Отправлено!' : 'Ошибка: ' + data.message);
            });
        });
    </script>
</body>
</html>
