// Product page functionality
let products = [];
let currentProduct = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadProductsAndDisplay();
    initAOS();
});

// Load products and display current product
async function loadProductsAndDisplay() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        
        // Get product from URL
        const productId = getProductIdFromUrl();
        if (productId) {
            currentProduct = products.find(p => p.id === productId);
            if (currentProduct) {
                displayProduct(currentProduct);
                loadRelatedProducts(currentProduct);
                updatePageMeta(currentProduct);
            } else {
                showProductNotFound();
            }
        } else {
            showProductNotFound();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showProductNotFound();
    }
}

// Get product ID from URL
function getProductIdFromUrl() {
    const path = window.location.pathname;
    // Match pattern: /product/slug-id where slug can contain letters, numbers, and hyphens
    const match = path.match(/^\/product\/[a-zA-Z0-9-]+-(\d+)$/);
    return match ? parseInt(match[1]) : null;
}

// Display product details
function displayProduct(product) {
    const container = document.getElementById('productContent');
    
    // Calculate discount percentage
    const discountPercent = product.originalPrice ? Math.round((1 - product.price/product.originalPrice) * 100) : 0;
    
    // Get first image or placeholder
    const productImage = product.images && product.images.length > 0 ? product.images[0] : `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center`;
    
    container.innerHTML = `
        <div class="col-lg-6" data-aos="fade-right">
            <div class="product-image-container">
                <img src="${productImage}" alt="${product.name}" class="img-fluid rounded product-main-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'">
                ${discountPercent > 0 ? `<div class="product-badge">-${discountPercent}%</div>` : ''}
                ${product.badge ? `<div class="product-badge product-badge-secondary">${product.badge}</div>` : ''}
            </div>
        </div>
        <div class="col-lg-6" data-aos="fade-left">
            <div class="product-details">
                <h1 class="product-title">${product.name}</h1>
                
                <div class="product-rating mb-3">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="reviews-count">${product.rating} (${product.reviews} отзывов)</span>
                </div>
                
                <div class="product-price mb-4">
                    ${product.originalPrice ? `<span class="product-old-price">${product.originalPrice.toLocaleString()} ₸</span>` : ''}
                    <span class="product-new-price">${product.price.toLocaleString()} ₸</span>
                </div>
                
                <div class="product-description mb-4">
                    <p>${product.description}</p>
                </div>
                
                <div class="product-features mb-4">
                    <h5>Характеристики:</h5>
                    <ul class="feature-list">
                        ${product.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                
                ${product.sizes && product.sizes.length > 0 ? `
                <div class="product-sizes mb-4">
                    <h5>Размеры и цены:</h5>
                    <div class="size-options">
                        ${product.sizes.map((size, index) => `
                            <div class="size-option ${index === 0 ? 'active' : ''}" data-size-index="${index}">
                                <span class="size-name">${size.name}</span>
                                <span class="size-price">${size.price.toLocaleString()} ₸</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="product-actions">
                    <button class="btn btn-primary btn-lg me-3" onclick="openOrderModal(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Заказать
                    </button>
                    <button class="btn btn-outline-primary btn-lg" onclick="showProductTest(${product.id})">
                        <i class="fas fa-play"></i> Смотреть тест
                    </button>
                </div>
                
                <div class="product-gift mt-3">
                    <i class="fas fa-gift"></i> Водозащитный наматрасник в подарок
                </div>
            </div>
        </div>
    `;
    
    // Add size selection functionality
    if (product.sizes && product.sizes.length > 0) {
        initSizeSelection();
    }
}

// Load related products
function loadRelatedProducts(currentProduct) {
    const container = document.getElementById('relatedProducts');
    
    // Get products from same category, excluding current product
    const relatedProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 3);
    
    if (relatedProducts.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>Нет похожих товаров</p></div>';
        return;
    }
    
    container.innerHTML = relatedProducts.map(product => {
        const productUrl = getProductUrl(product);
        const productImage = product.images && product.images.length > 0 ? product.images[0] : `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center`;
        const discountPercent = product.originalPrice ? Math.round((1 - product.price/product.originalPrice) * 100) : 0;
        
        return `
            <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up">
                <div class="product-card">
                    <div class="product-image">
                        <a href="${productUrl}" class="product-image-link">
                            <img src="${productImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'">
                        </a>
                        ${discountPercent > 0 ? `<div class="product-badge">-${discountPercent}%</div>` : ''}
                        ${product.badge ? `<div class="product-badge product-badge-secondary">${product.badge}</div>` : ''}
                    </div>
                    <div class="product-content">
                        <h4 class="product-title">
                            <a href="${productUrl}" class="product-title-link">${product.name}</a>
                        </h4>
                        <div class="product-rating">
                            <div class="stars">
                                ${generateStars(product.rating)}
                            </div>
                            <span class="reviews-count">(${product.reviews} отзывов)</span>
                        </div>
                        <div class="product-price">
                            ${product.originalPrice ? `<span class="product-old-price">${product.originalPrice.toLocaleString()} ₸</span>` : ''}
                            <span class="product-new-price">${product.price.toLocaleString()} ₸</span>
                        </div>
                        <div class="product-actions">
                            <a href="${productUrl}" class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-search"></i> Подробнее
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate slug from product name
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[а-яё]/g, function(char) {
            const map = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
                'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
                'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
                'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
                'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
            };
            return map[char] || char;
        })
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Get product URL
function getProductUrl(product) {
    const slug = product.slug || generateSlug(product.name);
    return `product/${slug}-${product.id}`;
}

// Generate stars for rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Initialize size selection
function initSizeSelection() {
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update price display
            const sizeIndex = parseInt(this.dataset.sizeIndex);
            updatePriceDisplay(sizeIndex);
        });
    });
}

// Update price display based on selected size
function updatePriceDisplay(sizeIndex) {
    if (!currentProduct || !currentProduct.sizes) return;
    
    const size = currentProduct.sizes[sizeIndex];
    const priceElement = document.querySelector('.product-new-price');
    const oldPriceElement = document.querySelector('.product-old-price');
    
    if (priceElement) {
        priceElement.textContent = `${size.price.toLocaleString()} ₸`;
    }
    
    if (oldPriceElement && size.originalPrice) {
        oldPriceElement.textContent = `${size.originalPrice.toLocaleString()} ₸`;
    }
}

// Show product test
function showProductTest(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Create modal for product test
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'testModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${product.name} - Тест качества</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <h4>Тест с яйцом</h4>
                        <p>Наш матрас не ломает яйцо - доказываем качество!</p>
                        <img src="https://sleepvip.uz/thumb/2/xCzJkt2T30oSdcrFItVv-A/r/d/matras_memory_rakurs_2.jpg" 
                             alt="Тест с яйцом" class="img-fluid rounded mb-3">
                        <h4>Тест с водой</h4>
                        <p>Стакан воды не шевелится - идеальная стабильность!</p>
                        <img src="https://weqew.ru/wp-content/uploads/2019/02/2-16.jpg" 
                             alt="Тест с водой" class="img-fluid rounded">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const testModal = new bootstrap.Modal(modal);
    testModal.show();
    
    // Remove modal from DOM after it's hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Open order modal
function openOrderModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentOrderProduct = product;
    currentOrderSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    
    updateOrderSummary();
    
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

// Update order summary
function updateOrderSummary() {
    if (!currentOrderProduct) return;
    
    const orderDetails = document.getElementById('orderDetails');
    const size = currentOrderSize || currentOrderProduct;
    
    orderDetails.innerHTML = `
        <div class="order-item">
            <div class="order-item-info">
                <h6>${currentOrderProduct.name}</h6>
                ${currentOrderProduct.sizes && currentOrderProduct.sizes.length > 0 ? 
                    `<p class="order-item-size">Размер: ${size.name}</p>` : ''}
            </div>
            <div class="order-item-price">
                ${size.originalPrice ? `<span class="order-old-price">${size.originalPrice.toLocaleString()} ₸</span>` : ''}
                <span class="order-new-price">${size.price.toLocaleString()} ₸</span>
            </div>
        </div>
    `;
}

// Submit order
function submitOrder() {
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerComment = document.getElementById('customerComment').value;
    
    if (!customerName || !customerPhone) {
        alert('Пожалуйста, заполните обязательные поля');
        return;
    }
    
    const size = currentOrderSize || currentOrderProduct;
    const message = `🛏️ *Новый заказ матраса*

*Товар:* ${currentOrderProduct.name}
${currentOrderProduct.sizes && currentOrderProduct.sizes.length > 0 ? `*Размер:* ${size.name}` : ''}
*Цена:* ${size.price.toLocaleString()} ₸
${size.originalPrice ? `*Старая цена:* ${size.originalPrice.toLocaleString()} ₸` : ''}

*Клиент:* ${customerName}
*Телефон:* ${customerPhone}
${customerAddress ? `*Адрес:* ${customerAddress}` : ''}
${customerComment ? `*Комментарий:* ${customerComment}` : ''}

*Источник:* ${window.location.href}`;
    
    const whatsappUrl = `https://wa.me/77758747861?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    modal.hide();
    
    // Show success message
    showSuccessNotification();
}

// Show success notification
function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <strong>Заказ отправлен!</strong> Мы свяжемся с вами в ближайшее время.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Update page meta tags
function updatePageMeta(product) {
    const slug = product.slug || generateSlug(product.name);
    const productUrl = `https://territoria-sna.kz/product/${slug}-${product.id}`;
    
    // Update title
    document.getElementById('pageTitle').textContent = `${product.name} - Территория Сна`;
    document.title = `${product.name} - Территория Сна`;
    
    // Update description
    const description = product.description || `Купить ${product.name} в Таразе. Ортопедические матрасы от производителя с доставкой.`;
    document.getElementById('pageDescription').content = description;
    
    // Update canonical URL
    document.getElementById('pageCanonical').href = productUrl;
    
    // Update Open Graph tags
    document.getElementById('ogUrl').content = productUrl;
    document.getElementById('ogTitle').content = `${product.name} - Территория Сна`;
    document.getElementById('ogDescription').content = description;
    
    // Update Open Graph image if product has images
    if (product.images && product.images.length > 0) {
        document.getElementById('ogImage').content = `https://territoria-sna.kz/${product.images[0]}`;
    }
}

// Show product not found
function showProductNotFound() {
    const container = document.getElementById('productContent');
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="product-not-found">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h2>Товар не найден</h2>
                <p>К сожалению, запрашиваемый товар не найден.</p>
                <a href="index.html#catalog" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> Вернуться в каталог
                </a>
            </div>
        </div>
    `;
}

// Initialize AOS animations
function initAOS() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
}

// Form submission
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOrder();
        });
    }
}); 