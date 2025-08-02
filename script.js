// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS after page load for better performance
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
});

// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 1000);
    }
});

// Lazy loading for images
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => img.classList.add('loaded'));
    }
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(0, 119, 204, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(0, 119, 204, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Products data - will be loaded from JSON file
let products = [];
let currentOrderProduct = null;
let currentOrderSize = null;

// Load products from JSON file
async function loadProductsFromJSON() {
    try {
        console.log('Loading products from JSON...');
        const response = await fetch('products.json');
        products = await response.json();
        console.log('Products loaded successfully:', products.length, 'products');
        console.log('First product:', products[0]);
        loadProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to default products if JSON fails to load
        products = [
            {
                id: 1,
                name: "Орто Стандарт",
                category: "independent",
                price: 35000,
                originalPrice: 45000,
                images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center"],
                features: [
                    "Средняя жесткость",
                    "Высота 18 см",
                    "Пружины + кокос",
                    "Для среднего веса"
                ],
                description: "Идеальный матрас для ежедневного использования. Обеспечивает оптимальную поддержку позвоночника.",
                sizes: [
                    { name: "80x190", price: 35000, originalPrice: 45000 },
                    { name: "140x200", price: 46000, originalPrice: 58000 }
                ],
                rating: 4.8,
                reviews: 153
            }
        ];
        console.log('Using fallback products');
        loadProducts();
    }
}

// Size options with prices
const sizeOptions = [
    { name: "80 x 190", price: 0.8 },
    { name: "90 x 190", price: 0.9 },
    { name: "160 x 120", price: 1.0 },
    { name: "140 x 200", price: 1.1 },
    { name: "180 x 200", price: 1.2 },
    { name: "180 x 200", price: 1.2 }
];

// Load products with categories
function loadProducts() {
    console.log('Loading products into categories...');
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Clear container
    
    // Group products by category
    const categories = {
        'children': { name: 'Детские матрасы', products: [] },
        'dependent': { name: 'Матрасы с зависимыми пружинами', products: [] },
        'independent': { name: 'Матрасы с независимыми пружинами', products: [] },
        'springless': { name: 'Беспружинные матрасы', products: [] }
    };
    
    // Sort products into categories
    products.forEach(product => {
        if (categories[product.category]) {
            categories[product.category].products.push(product);
        } else {
            console.warn('Product has unknown category:', product.category, product.name);
        }
    });
    
    console.log('Categories:', categories);
    
    // Create category sections
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        if (category.products.length > 0) {
            console.log(`Creating category: ${category.name} with ${category.products.length} products`);
            
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'col-12 mb-4';
            categoryHeader.setAttribute('data-aos', 'fade-up');
            categoryHeader.innerHTML = `
                <h3 class="category-title">${category.name}</h3>
                <hr class="category-divider">
            `;
            container.appendChild(categoryHeader);
            
            // Create product cards container
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'row';
            cardsContainer.id = `category-${categoryKey}`;
            container.appendChild(cardsContainer);
            
            // Show only first 3 products initially
            const productsToShow = category.products.slice(0, 3);
            productsToShow.forEach((product, index) => {
                console.log(`Creating card for product: ${product.name} (ID: ${product.id})`);
                const productCard = createProductCard(product, index);
                cardsContainer.appendChild(productCard);
            });
            
            // Add "Show All" button if there are more than 3 products
            if (category.products.length > 3) {
                const showAllButton = document.createElement('div');
                showAllButton.className = 'col-12 text-center mt-4';
                showAllButton.innerHTML = `
                    <button class="btn btn-outline-primary show-all-btn" onclick="showAllProducts('${categoryKey}')">
                        Показать все (${category.products.length})
                    </button>
                `;
                container.appendChild(showAllButton);
                
                // Store remaining products for later display
                const remainingProducts = category.products.slice(3);
                showAllButton.setAttribute('data-products', JSON.stringify(remainingProducts));
            }
        }
    });
}

// Show all products in category
function showAllProducts(categoryKey) {
    const button = event.target;
    const remainingProducts = JSON.parse(button.getAttribute('data-products'));
    const cardsContainer = document.getElementById(`category-${categoryKey}`);
    
    // Add remaining products
    remainingProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index + 3);
        cardsContainer.appendChild(productCard);
    });
    
    // Hide the button
    button.style.display = 'none';
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

// Create product card
function createProductCard(product, index) {
    // Debug: Check if product has required fields
    if (!product || !product.name) {
        console.error('Invalid product data:', product);
        return document.createElement('div'); // Return empty div for invalid products
    }
    
    // Validate product data
    if (!product.id || !product.price) {
        console.error('Product missing required fields:', product);
        return document.createElement('div');
    }
    
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    col.setAttribute('data-aos', 'fade-up');
    col.setAttribute('data-aos-delay', (index + 1) * 100);
    
    // Calculate discount percentage
    const discountPercent = product.originalPrice ? Math.round((1 - product.price/product.originalPrice) * 100) : 0;
    
    // Get first image or placeholder with better error handling
    let productImage = `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center`;
    if (product.images && product.images.length > 0 && product.images[0]) {
        productImage = product.images[0];
    }
    
    // Get product URL
    const productUrl = getProductUrl(product);
    
    // Ensure product has required fields with fallbacks
    const productName = product.name || 'Название не указано';
    const productRating = product.rating || 0;
    const productReviews = product.reviews || 0;
    const productPrice = product.price || 0;
    const productOriginalPrice = product.originalPrice || null;
    const productFeatures = product.features || [];
    
    // Debug: Log product data
    console.log('Creating card for:', {
        id: product.id,
        name: productName,
        price: productPrice,
        features: productFeatures.length,
        rating: productRating,
        reviews: productReviews,
        image: productImage
    });
    
    col.innerHTML = `
        <div class="product-card">
            <div class="product-image">
                <a href="${productUrl}" class="product-image-link">
                    <img src="${productImage}" alt="${productName}" 
                         onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'"
                         onload="console.log('Image loaded successfully:', '${productName}')"
                         onerror="console.log('Image failed to load:', '${productName}')">
                </a>
                ${discountPercent > 0 ? `<div class="product-badge">-${discountPercent}%</div>` : ''}
                ${product.badge ? `<div class="product-badge product-badge-secondary">${product.badge}</div>` : ''}
            </div>
            <div class="product-content">
                <h4 class="product-title">
                    <a href="${productUrl}" class="product-title-link">${productName}</a>
                </h4>
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(productRating)}
                    </div>
                    <span class="reviews-count">(${productReviews} отзывов)</span>
                </div>
                <div class="product-price">
                    ${productOriginalPrice ? `<span class="product-old-price">${productOriginalPrice.toLocaleString()} ₸</span>` : ''}
                    <span class="product-new-price" data-product-id="${product.id}">${productPrice.toLocaleString()} ₸</span>
                </div>
                <div class="product-features">
                    ${productFeatures.slice(0, 3).map(feature => `
                        <div class="product-feature">
                            <i class="fas fa-check"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="showProductModal(${product.id})">
                        <i class="fas fa-play"></i> Смотреть тест
                    </button>
                    <a href="${productUrl}" class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-search"></i> Подробнее
                    </a>
                </div>
                <div class="product-gift">
                    <i class="fas fa-gift"></i> Водозащитный наматрасник в подарок
                </div>
            </div>
        </div>
    `;
    
    return col;
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

// Show product modal
function showProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Get first image or placeholder
    const productImage = product.images && product.images.length > 0 ? product.images[0] : `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center`;
    
    modalTitle.textContent = `${product.name} - Тест`;
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${productImage}" alt="${product.name}" class="img-fluid rounded mb-3" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'">
                <h5>${product.name}</h5>
                <p>${product.description}</p>
                <div class="product-rating mb-3">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="reviews-count">${product.rating} (${product.reviews} отзывов)</span>
                </div>
                <div class="product-features">
                    ${product.features.map(feature => `
                        <div class="product-feature">
                            <i class="fas fa-check"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="ratio ratio-16x9 mb-3">
                    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Product Test" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="mb-3">
                    <h6>Выберите размер:</h6>
                    <select class="form-select" onchange="updatePrice(${product.id}, this.value)">
                        ${product.sizes.map((size, index) => `
                            <option value="${index}" ${index === 0 ? 'selected' : ''}>
                                ${size.name} - ${size.price.toLocaleString()} ₸
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="product-price mb-3">
                    ${product.originalPrice ? `<span class="product-old-price">${product.originalPrice.toLocaleString()} ₸</span>` : ''}
                    <span class="product-new-price">${product.price.toLocaleString()} ₸</span>
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary" onclick="openOrderModal(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Заказать
                    </button>
                    <button class="btn btn-outline-primary" onclick="showProductDetails(${product.id})">
                        <i class="fas fa-info-circle"></i> Подробная информация
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.show();
}

// Show product details
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Get first image or placeholder
    const productImage = product.images && product.images.length > 0 ? product.images[0] : `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center`;
    
    modalTitle.textContent = `${product.name} - Подробная информация`;
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${productImage}" alt="${product.name}" class="img-fluid rounded mb-3" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'">
                <div class="product-rating mb-3">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="reviews-count">${product.rating} (${product.reviews} отзывов)</span>
                </div>
            </div>
            <div class="col-md-6">
                <h5>Описание</h5>
                <p class="mb-3">${product.description}</p>
                
                <h6>Характеристики:</h6>
                <div class="product-features mb-3">
                    ${product.features.map(feature => `
                        <div class="product-feature">
                            <i class="fas fa-check"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
                
                <h6>Выберите размер:</h6>
                <select class="form-select mb-3" onchange="updateModalPrice(${product.id}, this.value)">
                    ${product.sizes.map((size, index) => `
                        <option value="${index}" ${index === 0 ? 'selected' : ''}>
                            ${size.name} - ${size.price.toLocaleString()} ₸
                        </option>
                    `).join('')}
                </select>
                
                <div class="product-price mb-3">
                    ${product.originalPrice ? `<span class="product-old-price">${product.originalPrice.toLocaleString()} ₸</span>` : ''}
                    <span class="product-new-price">${product.price.toLocaleString()} ₸</span>
                </div>
                
                <div class="d-grid gap-2">
                    <button class="btn btn-primary" onclick="openOrderModal(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Заказать
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.show();
}

// Update price based on size selection
function updatePrice(productId, sizeIndex) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const size = product.sizes[sizeIndex];
    if (!size) return;
    
    // Update the price display in the modal
    const priceElement = document.querySelector('.product-new-price');
    const oldPriceElement = document.querySelector('.product-old-price');
    
    if (priceElement) {
        priceElement.textContent = `${size.price.toLocaleString()} ₸`;
    }
    
    if (oldPriceElement && size.originalPrice) {
        oldPriceElement.textContent = `${size.originalPrice.toLocaleString()} ₸`;
        oldPriceElement.style.display = 'inline';
    } else if (oldPriceElement) {
        oldPriceElement.style.display = 'none';
    }
}

// Update price in modal (for detailed view)
function updateModalPrice(productId, sizeIndex) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const size = product.sizes[sizeIndex];
    if (!size) return;
    
    // Update the price display in the modal
    const priceElement = document.querySelector('.product-new-price');
    const oldPriceElement = document.querySelector('.product-old-price');
    
    if (priceElement) {
        priceElement.textContent = `${size.price.toLocaleString()} ₸`;
    }
    
    if (oldPriceElement && size.originalPrice) {
        oldPriceElement.textContent = `${size.originalPrice.toLocaleString()} ₸`;
        oldPriceElement.style.display = 'inline';
    } else if (oldPriceElement) {
        oldPriceElement.style.display = 'none';
    }
    
    // Also update price in product card
    updateProductCardPrice(productId, size);
}

// Update price in product card
function updateProductCardPrice(productId, size) {
    const priceElements = document.querySelectorAll(`[data-product-id="${productId}"]`);
    priceElements.forEach(element => {
        element.textContent = `${size.price.toLocaleString()} ₸`;
    });
}

// Open order modal
function openOrderModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Get selected size
    const sizeSelect = document.querySelector('select');
    const selectedSizeIndex = sizeSelect ? sizeSelect.selectedIndex : 0;
    const selectedSize = product.sizes[selectedSizeIndex];
    
    // Store current order data
    currentOrderProduct = product;
    currentOrderSize = selectedSize;
    
    // Update order summary
    updateOrderSummary();
    
    // Show order modal
    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show();
    
    // Close product modal if open
    const productModal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    if (productModal) {
        productModal.hide();
    }
}

// Update order summary
function updateOrderSummary() {
    if (!currentOrderProduct || !currentOrderSize) return;
    
    const orderDetails = document.getElementById('orderDetails');
    const discountAmount = currentOrderSize.originalPrice ? 
        currentOrderSize.originalPrice - currentOrderSize.price : 0;
    
    orderDetails.innerHTML = `
        <div class="order-item">
            <span><strong>${currentOrderProduct.name}</strong></span>
            <span></span>
        </div>
        <div class="order-item">
            <span>Размер:</span>
            <span>${currentOrderSize.name}</span>
        </div>
        ${currentOrderSize.originalPrice ? `
        <div class="order-item">
            <span>Цена без скидки:</span>
            <span>${currentOrderSize.originalPrice.toLocaleString()} ₸</span>
        </div>
        <div class="order-item">
            <span>Скидка:</span>
            <span style="color: #28a745;">-${discountAmount.toLocaleString()} ₸</span>
        </div>
        ` : ''}
        <div class="order-item">
            <span><strong>Итого к оплате:</strong></span>
            <span><strong>${currentOrderSize.price.toLocaleString()} ₸</strong></span>
        </div>
        <div class="order-item" style="border: none; padding-top: 1rem; color: #28a745;">
            <span><i class="fas fa-gift"></i> <strong>Подарок:</strong></span>
            <span>Водозащитный наматрасник</span>
        </div>
    `;
}

// Handle order form submission
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOrder();
        });
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('8')) {
                value = '7' + value.slice(1);
            }
            if (value.startsWith('7')) {
                value = value.slice(0, 11);
                const formatted = value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
                e.target.value = formatted;
            }
        });
    }
});

// Submit order to WhatsApp
function submitOrder() {
    if (!currentOrderProduct || !currentOrderSize) return;
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const comment = document.getElementById('customerComment').value.trim();
    
    if (!name || !phone) {
        alert('Пожалуйста, заполните обязательные поля (имя и телефон)');
        return;
    }
    
    // Create WhatsApp message
    let message = `🛏️ *НОВЫЙ ЗАКАЗ*\n\n`;
    message += `👤 *Клиент:* ${name}\n`;
    message += `📱 *Телефон:* ${phone}\n\n`;
    message += `🛏️ *Товар:* ${currentOrderProduct.name}\n`;
    message += `📏 *Размер:* ${currentOrderSize.name}\n`;
    message += `💰 *Цена:* ${currentOrderSize.price.toLocaleString()} ₸\n`;
    
    if (currentOrderSize.originalPrice) {
        const discount = currentOrderSize.originalPrice - currentOrderSize.price;
        message += `🔥 *Скидка:* ${discount.toLocaleString()} ₸\n`;
    }
    
    message += `🎁 *Подарок:* Водозащитный наматрасник\n\n`;
    
    if (address) {
        message += `📍 *Адрес доставки:* ${address}\n\n`;
    }
    
    if (comment) {
        message += `💬 *Комментарий:* ${comment}\n\n`;
    }
    
    message += `⏰ *Время заказа:* ${new Date().toLocaleString('ru-RU')}`;
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/77758747861?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Close modal and show success message
    const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    if (orderModal) {
        orderModal.hide();
    }
    
    // Reset form
    document.getElementById('orderForm').reset();
    
    // Show success notification
    showSuccessNotification();
}

// Show success notification
function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-check-circle me-2"></i>
            <div>
                <strong>Заказ отправлен!</strong><br>
                <small>Мы свяжемся с вами в ближайшее время</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Carousel auto-play
document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel
    const carousel = new bootstrap.Carousel(document.getElementById('heroCarousel'), {
        interval: 5000,
        wrap: true
    });
    
    // Load products from JSON
    loadProductsFromJSON();
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.advantage-card, .product-card, .review-card, .delivery-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Counter animation
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    }
    
    // Trigger counter animation when in view
    const counterSection = document.querySelector('.advantages-section');
    if (counterSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        counterObserver.observe(counterSection);
    }
    
    // Smooth reveal animation for sections
    const revealSections = document.querySelectorAll('section');
    revealSections.forEach(section => {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        
        sectionObserver.observe(section);
    });
    
    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add typing effect to hero title
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
    
    // Initialize typing effect on first carousel item
    const firstTitle = document.querySelector('.hero-title');
    if (firstTitle) {
        const originalText = firstTitle.textContent;
        typeWriter(firstTitle, originalText, 50);
    }
});

// Add floating animation to elements
function addFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.advantage-icon, .delivery-icon');
    floatingElements.forEach((element, index) => {
        element.style.animation = `floating 3s ease-in-out infinite ${index * 0.2}s`;
    });
}

// Add CSS for floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floating {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .revealed {
        animation: fadeInUp 0.8s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize floating animations
document.addEventListener('DOMContentLoaded', addFloatingAnimation);

// Performance optimizations
function optimizePerformance() {
    // Defer non-critical CSS
    const deferredStyles = document.querySelectorAll('link[media="print"]');
    deferredStyles.forEach(link => {
        link.addEventListener('load', function() {
            this.media = 'all';
        });
    });
    
    // Preload critical resources
    const preloadLinks = [
        { href: 'img/logo-text-white.png', as: 'image' },
        { href: 'products.json', as: 'fetch', crossorigin: 'anonymous' }
    ];
    
    preloadLinks.forEach(link => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = link.href;
        preloadLink.as = link.as;
        if (link.crossorigin) preloadLink.crossOrigin = link.crossorigin;
        document.head.appendChild(preloadLink);
    });
}
