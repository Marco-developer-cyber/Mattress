<?php
session_start();

// Простая аутентификация
$password = 'admin123'; // Измените на свой пароль
$session_key = 'products_admin_logged_in';

// Проверка авторизации
if (!isset($_SESSION[$session_key]) && (!isset($_POST['action']) || $_POST['action'] !== 'login')) {
    showLoginForm();
    exit;
}

// Обработка входа
if (isset($_POST['action']) && $_POST['action'] === 'login') {
    if (isset($_POST['password']) && $_POST['password'] === $password) {
        $_SESSION[$session_key] = true;
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    } else {
        $error = 'Неверный пароль';
        showLoginForm($error);
        exit;
    }
}

// Обработка выхода
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    unset($_SESSION[$session_key]);
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Путь к JSON файлу
$json_file = '../products.json';

// Обработка действий
if (isset($_POST['action']) && $_POST['action']) {
    switch ($_POST['action']) {
        case 'add_product':
            addProduct();
            break;
        case 'edit_product':
            editProduct();
            break;
        case 'delete_product':
            deleteProduct();
            break;
    }
}

// Функции
function loadProducts() {
    global $json_file;
    if (file_exists($json_file)) {
        $content = file_get_contents($json_file);
        return json_decode($content, true) ?: [];
    }
    return [];
}

function saveProducts($products) {
    global $json_file;
    $json = json_encode($products, JSON_PRETTY_PRINT);
    return file_put_contents($json_file, $json);
}

function addProduct() {
    $products = loadProducts();
    
    // Обработка комментариев
    $comments = [];
    if (!empty($_POST['comment_names']) && !empty($_POST['comment_ratings']) && !empty($_POST['comment_texts'])) {
        $names = array_filter(explode("\n", $_POST['comment_names']));
        $ratings = array_filter(explode("\n", $_POST['comment_ratings']));
        $texts = array_filter(explode("\n", $_POST['comment_texts']));
        
        $max_comments = min(count($names), count($ratings), count($texts));
        for ($i = 0; $i < $max_comments; $i++) {
            if (!empty($names[$i]) && !empty($ratings[$i]) && !empty($texts[$i])) {
                $comments[] = [
                    'name' => trim($names[$i]),
                    'rating' => (int)trim($ratings[$i]),
                    'comment' => trim($texts[$i])
                ];
            }
        }
    }
    
    // Получаем максимальный ID
    $max_id = 0;
    foreach ($products as $product) {
        if (isset($product['id']) && $product['id'] > $max_id) {
            $max_id = $product['id'];
        }
    }
    
    $new_product = [
        'id' => $max_id + 1,
        'name' => $_POST['name'],
        'category' => $_POST['category'],
        'price' => (int)$_POST['price'],
        'originalPrice' => (int)$_POST['originalPrice'],
        'discountPercent' => (int)$_POST['discountPercent'],
        'images' => array_filter(explode("\n", $_POST['images'])),
        'description' => $_POST['description'],
        'features' => array_filter(explode("\n", $_POST['features'])),
        'sizes' => json_decode($_POST['sizes'], true),
        'rating' => (float)$_POST['rating'],
        'reviews' => (int)$_POST['reviews'],
        'badge' => isset($_POST['badge']) && $_POST['badge'] ? $_POST['badge'] : null,
        'comments' => $comments
    ];
    
    $products[] = $new_product;
    
    if (saveProducts($products)) {
        $success = 'Товар успешно добавлен!';
    } else {
        $error = 'Ошибка при сохранении товара';
    }
}

function editProduct() {
    $products = loadProducts();
    $id = (int)$_POST['id'];
    
    // Обработка комментариев
    $comments = [];
    if (!empty($_POST['comment_names']) && !empty($_POST['comment_ratings']) && !empty($_POST['comment_texts'])) {
        $names = array_filter(explode("\n", $_POST['comment_names']));
        $ratings = array_filter(explode("\n", $_POST['comment_ratings']));
        $texts = array_filter(explode("\n", $_POST['comment_texts']));
        
        $max_comments = min(count($names), count($ratings), count($texts));
        for ($i = 0; $i < $max_comments; $i++) {
            if (!empty($names[$i]) && !empty($ratings[$i]) && !empty($texts[$i])) {
                $comments[] = [
                    'name' => trim($names[$i]),
                    'rating' => (int)trim($ratings[$i]),
                    'comment' => trim($texts[$i])
                ];
            }
        }
    }
    
    foreach ($products as &$product) {
        if ($product['id'] === $id) {
            $product['name'] = $_POST['name'];
            $product['category'] = $_POST['category'];
            $product['price'] = (int)$_POST['price'];
            $product['originalPrice'] = (int)$_POST['originalPrice'];
            $product['discountPercent'] = (int)$_POST['discountPercent'];
            $product['images'] = array_filter(explode("\n", $_POST['images']));
            $product['description'] = $_POST['description'];
            $product['features'] = array_filter(explode("\n", $_POST['features']));
            $product['sizes'] = json_decode($_POST['sizes'], true);
            $product['rating'] = (float)$_POST['rating'];
            $product['reviews'] = (int)$_POST['reviews'];
            $product['badge'] = isset($_POST['badge']) && $_POST['badge'] ? $_POST['badge'] : null;
            $product['comments'] = $comments;
            break;
        }
    }
    
    if (saveProducts($products)) {
        $success = 'Товар успешно обновлен!';
    } else {
        $error = 'Ошибка при сохранении товара';
    }
}

function deleteProduct() {
    $products = loadProducts();
    $id = (int)$_POST['id'];
    
    $products = array_filter($products, function($product) use ($id) {
        return $product['id'] !== $id;
    });
    
    if (saveProducts(array_values($products))) {
        $success = 'Товар успешно удален!';
    } else {
        $error = 'Ошибка при удалении товара';
    }
}

function showLoginForm($error = '') {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Вход в админку товаров</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .login-form { max-width: 400px; margin: 100px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .error { color: red; margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <div class="login-form">
            <h2>Вход в админку товаров</h2>
            <?php if ($error): ?>
                <div class="error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            <form method="post">
                <input type="hidden" name="action" value="login">
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
}

// Загружаем товары
$products = loadProducts();

// Получаем товар для редактирования
$edit_product = null;
if (isset($_GET['edit'])) {
    $edit_id = (int)$_GET['edit'];
    foreach ($products as $product) {
        if ($product['id'] === $edit_id) {
            $edit_product = $product;
            break;
        }
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Управление товарами</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; color: #333; }
        .header .actions { margin-top: 15px; }
        .btn { background: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin-right: 10px; }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #218838; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .product-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .product-card h3 { margin: 0 0 10px 0; color: #333; }
        .product-info { margin-bottom: 15px; }
        .product-info p { margin: 5px 0; color: #666; }
        .product-actions { display: flex; gap: 10px; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
        .modal.show { display: block; }
        .modal-content { background: white; max-width: 800px; margin: 50px auto; padding: 30px; border-radius: 10px; max-height: 80vh; overflow-y: auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        .form-group textarea { height: 100px; resize: vertical; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .close { float: right; font-size: 24px; cursor: pointer; }
        .badge { background: #ffc107; color: #333; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Управление товарами</h1>
            <div class="actions">
                <button class="btn btn-success" onclick="showAddModal()">Добавить товар</button>
                <a href="?action=logout" class="btn btn-danger">Выйти</a>
            </div>
        </div>

        <?php if (isset($success)): ?>
            <div class="success"><?= htmlspecialchars($success) ?></div>
        <?php endif; ?>

        <?php if (isset($error)): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <div class="products-grid">
            <?php foreach ($products as $product): ?>
                <div class="product-card">
                    <h3><?= htmlspecialchars($product['name']) ?></h3>
                    <div class="product-info">
                        <p><strong>Категория:</strong> <?= htmlspecialchars($product['category']) ?></p>
                        <p><strong>Цена:</strong> <?= number_format($product['price']) ?> ₸</p>
                        <p><strong>Рейтинг:</strong> <?= $product['rating'] ?> (<?= $product['reviews'] ?> отзывов)</p>
                        <?php if ($product['badge']): ?>
                            <p><span class="badge"><?= htmlspecialchars($product['badge']) ?></span></p>
                        <?php endif; ?>
                        <?php if (isset($product['comments']) && !empty($product['comments'])): ?>
                            <p><strong>Комментарии:</strong> <?= count($product['comments']) ?> шт.</p>
                        <?php endif; ?>
                    </div>
                    <div class="product-actions">
                        <button class="btn" onclick="showEditModal(<?= $product['id'] ?>)">Редактировать</button>
                        <button class="btn btn-danger" onclick="deleteProduct(<?= $product['id'] ?>)">Удалить</button>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div id="productModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="hideModal()">&times;</span>
            <h2 id="modalTitle">Добавить товар</h2>
            
            <form method="post" id="productForm">
                <input type="hidden" name="action" id="formAction" value="add_product">
                <input type="hidden" name="id" id="productId">
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Название товара *</label>
                        <input type="text" name="name" id="productName" required>
                    </div>
                    <div class="form-group">
                        <label>Категория *</label>
                        <select name="category" id="productCategory" required>
                            <option value="children">Детские матрасы</option>
                            <option value="dependent">Зависимые пружины</option>
                            <option value="independent">Независимые пружины</option>
                            <option value="springless">Беспружинные</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Цена (₸) *</label>
                        <input type="number" name="price" id="productPrice" required>
                    </div>
                    <div class="form-group">
                        <label>Старая цена (₸)</label>
                        <input type="number" name="originalPrice" id="productOriginalPrice">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Скидка (%)</label>
                        <input type="number" name="discountPercent" id="productDiscount" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>Бейдж (например: "Хит продаж")</label>
                        <input type="text" name="badge" id="productBadge">
                    </div>
                </div>

                <div class="form-group">
                    <label>Описание *</label>
                    <textarea name="description" id="productDescription" required></textarea>
                </div>

                <div class="form-group">
                    <label>Характеристики (каждая с новой строки) *</label>
                    <textarea name="features" id="productFeatures" required placeholder="Монолит из пенополиуретана 10 см&#10;Чехол: х/б жаккард стеганный с синтепоном&#10;Нагрузка на спальное место: до 50 кг&#10;Гарантия: 36 месяцев"></textarea>
                </div>

                <div class="form-group">
                    <label>Изображения (каждое с новой строки) *</label>
                    <textarea name="images" id="productImages" required placeholder="img/матрасы/детские матрасы/Baby happy/51664_big.jpg"></textarea>
                </div>

                <div class="form-group">
                    <label>Размеры (JSON формат) *</label>
                    <textarea name="sizes" id="productSizes" required placeholder='[{"name":"80x190","price":15000,"originalPrice":18000,"discountPercent":17}]'></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Рейтинг (0-5) *</label>
                        <input type="number" name="rating" id="productRating" min="0" max="5" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label>Количество отзывов *</label>
                        <input type="number" name="reviews" id="productReviews" min="0" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Комментарии (необязательно)</label>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                            <strong>Формат:</strong> Каждый комментарий с новой строки. Максимум 3 комментария.
                        </p>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Имена клиентов (каждое с новой строки)</label>
                                <textarea name="comment_names" id="commentNames" placeholder="Айжан Нурлановна&#10;Бакытжан Алиев&#10;Гульнара Садыкова"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Рейтинги (каждый с новой строки, 1-5)</label>
                                <textarea name="comment_ratings" id="commentRatings" placeholder="5&#10;5&#10;4"></textarea>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Тексты комментариев (каждый с новой строки)</label>
                            <textarea name="comment_texts" id="commentTexts" placeholder="Отличный матрас для ребенка! Дочь спит спокойно, не просыпается по ночам. Качество на высоте!&#10;Покупали для сына 3 лет. Очень довольны! Матрас упругий, но мягкий. Рекомендую всем родителям.&#10;Хороший матрас за свои деньги. Ребенок спит хорошо, но хотелось бы немного мягче."></textarea>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-success">Сохранить</button>
                    <button type="button" class="btn" onclick="hideModal()">Отмена</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function showAddModal() {
            document.getElementById('modalTitle').textContent = 'Добавить товар';
            document.getElementById('formAction').value = 'add_product';
            document.getElementById('productForm').reset();
            document.getElementById('productModal').classList.add('show');
        }

        function showEditModal(productId) {
            // Здесь можно загрузить данные товара через AJAX или передать их в PHP
            window.location.href = '?edit=' + productId;
        }

        function hideModal() {
            document.getElementById('productModal').classList.remove('show');
        }

        function deleteProduct(productId) {
            if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                const form = document.createElement('form');
                form.method = 'post';
                form.innerHTML = `
                    <input type="hidden" name="action" value="delete_product">
                    <input type="hidden" name="id" value="${productId}">
                `;
                document.body.appendChild(form);
                form.submit();
            }
        }

        // Закрытие модального окна при клике вне его
        window.onclick = function(event) {
            const modal = document.getElementById('productModal');
            if (event.target === modal) {
                hideModal();
            }
        }

        <?php if ($edit_product): ?>
        // Заполняем форму данными для редактирования
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('modalTitle').textContent = 'Редактировать товар';
            document.getElementById('formAction').value = 'edit_product';
            document.getElementById('productId').value = '<?= $edit_product['id'] ?>';
            document.getElementById('productName').value = '<?= htmlspecialchars($edit_product['name']) ?>';
            document.getElementById('productCategory').value = '<?= $edit_product['category'] ?>';
            document.getElementById('productPrice').value = '<?= $edit_product['price'] ?>';
            document.getElementById('productOriginalPrice').value = '<?= $edit_product['originalPrice'] ?>';
            document.getElementById('productDiscount').value = '<?= $edit_product['discountPercent'] ?>';
            document.getElementById('productBadge').value = '<?= htmlspecialchars($edit_product['badge'] ?? '') ?>';
            document.getElementById('productDescription').value = '<?= htmlspecialchars($edit_product['description']) ?>';
            document.getElementById('productFeatures').value = '<?= htmlspecialchars(implode("\n", $edit_product['features'])) ?>';
            document.getElementById('productImages').value = '<?= htmlspecialchars(implode("\n", $edit_product['images'])) ?>';
            document.getElementById('productSizes').value = '<?= htmlspecialchars(json_encode($edit_product['sizes'])) ?>';
            document.getElementById('productRating').value = '<?= $edit_product['rating'] ?>';
            document.getElementById('productReviews').value = '<?= $edit_product['reviews'] ?>';
            
            // Заполняем комментарии
            <?php if (isset($edit_product['comments']) && !empty($edit_product['comments'])): ?>
            var comments = <?= json_encode($edit_product['comments']) ?>;
            var names = [];
            var ratings = [];
            var texts = [];
            
            for (var i = 0; i < comments.length; i++) {
                names.push(comments[i].name);
                ratings.push(comments[i].rating);
                texts.push(comments[i].comment);
            }
            
            document.getElementById('commentNames').value = names.join('\n');
            document.getElementById('commentRatings').value = ratings.join('\n');
            document.getElementById('commentTexts').value = texts.join('\n');
            <?php endif; ?>
            
            document.getElementById('productModal').classList.add('show');
        });
        <?php endif; ?>
    </script>
</body>
</html> 