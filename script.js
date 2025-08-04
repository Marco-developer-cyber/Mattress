// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth animations
    initSmoothAnimations();
});

// Smooth animations system
function initSmoothAnimations() {
    const animatedElements = document.querySelectorAll('.advantage-card, .product-card, .review-card, .delivery-card, .consultation-card, .about-image, .section-title, .section-subtitle');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach((el, index) => {
        // Add appropriate animation class based on element type
        if (el.classList.contains('advantage-card') || el.classList.contains('delivery-card')) {
            el.classList.add('fade-in');
        } else if (el.classList.contains('product-card') || el.classList.contains('review-card')) {
            el.classList.add('scale-in');
        } else if (el.classList.contains('about-image')) {
            el.classList.add('slide-in-right');
        } else if (el.classList.contains('consultation-card')) {
            el.classList.add('slide-in-left');
        } else {
            el.classList.add('fade-in');
        }
        
        observer.observe(el);
    });
}

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
        const response = await fetch('products.json');
        products = await response.json();
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
        }
    });
    
    // Create category sections
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        if (category.products.length > 0) {
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
                const productCard = createProductCard(product, index);
                cardsContainer.appendChild(productCard);
            });
            
            // Add "Show All" button if there are more than 3 products
            if (category.products.length > 3) {
                const showAllButton = document.createElement('div');
                showAllButton.className = 'col-12 text-center mt-4';
                showAllButton.innerHTML = `
                    <button class="btn btn-outline-primary show-all-btn" onclick="showAllProducts('${categoryKey}', event)">
                        Показать все (${category.products.length})
                    </button>
                `;
                container.appendChild(showAllButton);
                
                // Store remaining products for later display
                const remainingProducts = category.products.slice(3);
                showAllButton.querySelector('button').setAttribute('data-products', JSON.stringify(remainingProducts));
            }
        }
    });
}

// Show all products in category
function showAllProducts(categoryKey, event) {
    if (event) event.preventDefault();
    
    const button = event ? event.target : document.querySelector(`[onclick="showAllProducts('${categoryKey}')"]`);
    if (!button) return;
    
    const remainingProducts = JSON.parse(button.getAttribute('data-products'));
    const cardsContainer = document.getElementById(`category-${categoryKey}`);
    
    if (!cardsContainer) return;
    
    // Add remaining products
    remainingProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index + 3);
        cardsContainer.appendChild(productCard);
    });
    
    // Hide the button
    button.parentElement.style.display = 'none';
}

// Create product card
function createProductCard(product, index) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    col.classList.add('fade-in');
    
    // Get discount percentage from product or calculate if not provided
    const discountPercent = product.discountPercent !== undefined ? product.discountPercent : 
        (product.originalPrice ? Math.round((1 - product.price/product.originalPrice) * 100) : 0);
    
    // Get first image or placeholder
    const productImage = product.images && product.images.length > 0 ? product.images[0] : `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center`;
    
    // Create unique URL for product with SEO-friendly slug
    const productSlug = createProductSlug(product.name);
    const productUrl = `${window.location.origin}${window.location.pathname}#product-${product.id}-${productSlug}`;
    
    col.innerHTML = `
        <div class="product-card" onclick="openProductFromUrl(${product.id})" data-product-url="${productUrl}">
            <div class="product-image">
                <img src="${productImage}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'">
                <button class="product-test-btn" onclick="event.stopPropagation(); showProductModal(${product.id})">
                    <i class="fas fa-play"></i> Тест
                </button>
                ${discountPercent > 0 ? `<div class="product-badge">-${discountPercent}%</div>` : ''}
                ${product.badge ? `<div class="product-badge product-badge-secondary">${product.badge}</div>` : ''}
            </div>
            <div class="product-content">
                <h4 class="product-title">${product.name}</h4>
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="reviews-count">(${product.reviews} отзывов)</span>
                </div>
                <div class="product-price">
                    ${product.originalPrice ? `<span class="product-old-price">${product.originalPrice.toLocaleString()} ₸</span>` : ''}
                    <span class="product-new-price" data-product-id="${product.id}">${product.price.toLocaleString()} ₸</span>
                </div>
                <div class="product-price-note">*цена за размер ${product.sizes[0].name}</div>
                <div class="product-features">
                    ${product.features.slice(0, 3).map(feature => `
                        <div class="product-feature">
                            <i class="fas fa-check"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openOrderModal(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Хочу заказать
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); showProductDetails(${product.id})">
                        <i class="fas fa-search"></i> Подробнее
                    </button>
                </div>
                <div class="product-gift">
                    Наматрасник в подарок 🎁
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Open product from URL
function openProductFromUrl(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Create SEO-friendly URL
    const productSlug = createProductSlug(product.name);
    const newUrl = `${window.location.origin}${window.location.pathname}#product-${productId}-${productSlug}`;
    window.history.pushState({productId}, '', newUrl);
    
    // Update social sharing meta tags
    updateMetaTags(productId);
    
    // Show product details
    showProductDetails(productId);
}

// Update meta tags for social sharing
function updateMetaTags(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const productSlug = createProductSlug(product.name);
    const productUrl = `${window.location.origin}${window.location.pathname}#product-${productId}-${productSlug}`;
    const productImage = product.images && product.images.length > 0 ? product.images[0] : '';
    
    // Update Open Graph tags
    updateMetaTag('og:title', `${product.name} - Территория Сна`);
    updateMetaTag('og:description', product.description);
    updateMetaTag('og:url', productUrl);
    if (productImage) {
        updateMetaTag('og:image', productImage);
    }
    
    // Update Twitter Card tags
    updateMetaTag('twitter:title', `${product.name} - Территория Сна`);
    updateMetaTag('twitter:description', product.description);
    
    // Update page title
    document.title = `${product.name} - Территория Сна`;
}

// Helper function to update meta tags
function updateMetaTag(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`) || 
               document.querySelector(`meta[name="${property}"]`);
    
    if (!meta) {
        meta = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
            meta.setAttribute('property', property);
        } else {
            meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
}
// Handle URL changes
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.productId) {
        showProductDetails(event.state.productId);
    } else {
        // Handle direct URL access with new format
        const hash = window.location.hash;
        if (hash.startsWith('#product-')) {
            const productMatch = hash.match(/#product-(\d+)-/);
            if (productMatch) {
                const productId = parseInt(productMatch[1]);
                if (productId) {
                    showProductDetails(productId);
                }
            }
        }
    }
});

// Check URL on page load
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash;
    if (hash.startsWith('#product-')) {
        // Extract product ID from new format: #product-id-name
        const productMatch = hash.match(/#product-(\d+)-/);
        if (productMatch) {
            const productId = parseInt(productMatch[1]);
            if (productId) {
                setTimeout(() => {
                    showProductDetails(productId);
                }, 1000);
            }
        }
    }
});

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
    
    // Update URL with product slug for test modal
    const productSlug = createProductSlug(product.name);
    const newUrl = `${window.location.origin}${window.location.pathname}#product-${productId}-${productSlug}-test`;
    window.history.pushState({productId, type: 'test'}, '', newUrl);
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    // Получаем основное изображение или используем заглушку
    const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center';

    modalTitle.textContent = `${product.name} - Подробная информация`;
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${productImage}" alt="${product.name}" 
                     class="img-fluid rounded mb-3" 
                     onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'">
                
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
                <!-- Наш новый блок с подсказкой и Instagram -->
                <div class="instagram-promo-container">
                    <div class="promo-card">
                        <div class="promo-image-part">
                            <img src="${productImage}" alt="Обзор матраса" class="img-fluid h-100">
                        </div>
                        <div class="promo-text-part">
                            <div class="promo-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <h6>Видеообзор</h6>
                            <p>Посмотрите наш матрас в действии! Убедитесь в его качестве и комфорте.</p>
                        </div>
                    </div>
                    
                    ${product.instagramVideo ? `
                        <a href="${product.instagramVideo}" target="_blank" class="btn btn-instagram-promo">
                            <i class="fab fa-instagram"></i> Смотреть видео в Instagram
                        </a>
                    ` : `
                        <button class="btn btn-secondary" disabled>
                            <i class="fas fa-info-circle"></i> Видео временно недоступно
                        </button>
                    `}
                </div>
                
                <div class="product-options mt-4">
                    <h6>Выберите размер:</h6>
                    <select class="form-select mb-3" onchange="updateModalPrice(${product.id}, this.value)">
                        ${product.sizes.map((size, index) => `
                            <option value="${index}" ${index === 0 ? 'selected' : ''}>
                                ${size.name} - ${size.price.toLocaleString()} ₸
                            </option>
                        `).join('')}
                    </select>
                    
                    <div class="product-price mb-3">
                        ${product.originalPrice ? `
                            <span class="product-old-price">${product.originalPrice.toLocaleString()} ₸</span>
                        ` : ''}
                        <span class="product-new-price">${product.price.toLocaleString()} ₸</span>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="openOrderModal(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Заказать
                        </button>
                    </div>
                    
                    <div class="product-gift mt-2">
                        <i class="fas fa-gift"></i> Наматрасник в подарок
                    </div>
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
    
    // Update URL with product slug
    const productSlug = createProductSlug(product.name);
    const newUrl = `${window.location.origin}${window.location.pathname}#product-${productId}-${productSlug}`;
    window.history.pushState({productId}, '', newUrl);
    
    // Update meta tags
    updateMetaTags(productId);
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Получаем первое изображение или заглушку
    const productImage = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/600x400?text=No+Image';
    
    modalTitle.textContent = `${product.name} - Подробная информация`;
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <!-- Основное изображение -->
                <div class="main-image-container mb-3">
                    <img src="${productImage}" 
                         alt="${product.name}" 
                         class="img-fluid rounded main-product-image"
                         loading="lazy"
                         id="mainProductImage"
                         onerror="this.src='https://via.placeholder.com/600x400?text=Image+Error'">
                </div>
                
                <!-- Галерея миниатюр -->
                <div class="thumbnails-row d-flex flex-wrap gap-2 mb-4">
                    ${product.images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active-thumb' : ''}" 
                             onclick="changeMainImage('${img}', this)">
                            <img src="${img}" 
                                 alt="Thumbnail ${index + 1}" 
                                 class="img-thumbnail"
                                 loading="lazy"
                                 onerror="this.src='https://via.placeholder.com/100x100?text=Thumb'">
                        </div>
                    `).join('')}
                </div>
                
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

// Функция для смены основного изображения
function changeMainImage(newSrc, clickedThumb) {
    const mainImg = document.getElementById('mainProductImage');
    if (!mainImg) return;
    
    // Плавное исчезновение
    mainImg.style.opacity = '0';
    
    setTimeout(() => {
        // Установка нового изображения
        mainImg.src = newSrc;
        
        // Плавное появление
        mainImg.style.opacity = '1';
        
        // Обновление активной миниатюры
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active-thumb');
        });
        clickedThumb.classList.add('active-thumb');
        
    }, 300);
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
    
    // Update the price display in the modal - use more specific selectors
    const modal = document.getElementById('productModal');
    const priceElement = modal.querySelector('.product-new-price');
    const oldPriceElement = modal.querySelector('.product-old-price');
    
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
            <span>Наматрасник</span>
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
    
    message += `🎁 *Подарок:* Наматрасник\n\n`;
    
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
        interval: 6000,
        wrap: true
    });
    
    // Load products from JSON
    loadProductsFromJSON();
    
    // Initialize lazy loading
    initLazyLoading();
    
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
`;
document.head.appendChild(style);

// Initialize floating animations
document.addEventListener('DOMContentLoaded', addFloatingAnimation);

// Consultation form handling
document.addEventListener('DOMContentLoaded', function() {
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitConsultationForm();
        });
    }
    
    // Phone number formatting for consultation form
    const consultationPhoneInput = document.getElementById('consultationPhone');
    if (consultationPhoneInput) {
        consultationPhoneInput.addEventListener('input', function(e) {
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

// Submit consultation form to Telegram
async function submitConsultationForm() {
    const name = document.getElementById('consultationName').value.trim();
    const phone = document.getElementById('consultationPhone').value.trim();
    
    if (!name || !phone) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Create message for Telegram
    const message = `🔔 *ЗАЯВКА НА КОНСУЛЬТАЦИЮ*\n\n👤 *Имя:* ${name}\n📱 *Телефон:* ${phone}\n\n⏰ *Время:* ${new Date().toLocaleString('ru-RU')}\n\n💬 *Источник:* Сайт territoria-sna.kz`;
    
    const botToken = '7618751385:AAGLKry1_Rnd7rwFY5QkqjDxIfFu1WqB654';
    const chatIds = ['@Olzhiki', '@TerritoriaSna1', '@boranbay07'];
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-consultation');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
    submitBtn.disabled = true;
    
    try {
        // Send to all three Telegram accounts
        const promises = chatIds.map(chatId => 
            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            })
        );
        
        await Promise.all(promises);
        
        // Reset form and show success
        consultationForm.reset();
        showConsultationSuccess();
        
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show consultation success notification
function showConsultationSuccess() {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        border-radius: 10px;
    `;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-check-circle me-3" style="font-size: 1.5rem; color: #28a745;"></i>
            <div>
                <strong>Заявка отправлена!</strong><br>
                <small>Наш специалист свяжется с вами в течение 5 минут</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add entrance animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

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

// Helper function to create SEO-friendly URL from product name
function createProductSlug(name) {
    return name
        .toLowerCase()
        .replace(/[а-яё]/g, char => {
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
        .trim('-');
}
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger-menu');
    const navbar = document.getElementById('navbarNav');
    
    // Initialize with collapsed class if navbar is hidden
    if (navbar.classList.contains('show')) {
        burger.classList.remove('collapsed');
    } else {
        burger.classList.add('collapsed');
    }
    
    // Sync with Bootstrap collapse events
    navbar.addEventListener('shown.bs.collapse', function() {
        burger.classList.remove('collapsed');
    });
    
    navbar.addEventListener('hidden.bs.collapse', function() {
        burger.classList.add('collapsed');
    });
});
