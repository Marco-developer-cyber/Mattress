<?php
// Простой тестовый файл для проверки работы PHP
echo "PHP работает! Версия: " . phpversion();
echo "<br>JSON поддержка: " . (function_exists('json_encode') ? 'Да' : 'Нет');
echo "<br>Session поддержка: " . (function_exists('session_start') ? 'Да' : 'Нет');
echo "<br>File functions: " . (function_exists('file_get_contents') ? 'Да' : 'Нет');

// Проверяем доступ к products.json
$json_file = '../products.json';
if (file_exists($json_file)) {
    echo "<br>products.json найден";
    if (is_readable($json_file)) {
        echo "<br>products.json читается";
        $content = file_get_contents($json_file);
        $data = json_decode($content, true);
        if ($data) {
            echo "<br>JSON парсится корректно. Товаров: " . count($data);
        } else {
            echo "<br>Ошибка парсинга JSON";
        }
    } else {
        echo "<br>products.json не читается";
    }
} else {
    echo "<br>products.json не найден";
}
?> 