// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize smooth animations
    initSmoothAnimations();
    
    // Start hero animations
    document.querySelector('.new-hero-section').classList.add('hero-animations-start');
    
    // Force load products after a short delay
    setTimeout(() => {
        console.log('Loading products...');
        loadProductsFromJSON();
    }, 1000);
    
    // Initialize automatic modal and discount circle
    initAutomaticModal();
    initFloatingDiscount();
    
    // Initialize video carousel
    initVideoCarousel();

    const fabContainer = document.getElementById('fabContainer');
    const fabMainBtn = document.getElementById('fabMainBtn');
    if (fabContainer && fabMainBtn) {
        const toggle = () => {
            const isOpen = fabContainer.classList.toggle('open');
            fabMainBtn.classList.toggle('open', isOpen);
        };
        fabMainBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggle();
        });
        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!fabContainer.contains(e.target)) {
                fabContainer.classList.remove('open');
                fabMainBtn.classList.remove('open');
            }
        });
        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                fabContainer.classList.remove('open');
                fabMainBtn.classList.remove('open');
            }
        });
    }
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
let productsLoaded = false;
window.loadProductsFromJSON = async function() {
    if (productsLoaded) {
        return;
    }
    
    try {
        console.log('Loading products from JSON...');
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        products = await response.json();
        console.log('Products loaded successfully:', products.length, 'products');
        productsLoaded = true;
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
        productsLoaded = true;
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
    console.log('Loading products display...');
    const container = document.getElementById('products-container');
    if (!container) {
        console.error('Products container not found!');
        // Retry after a short delay
        setTimeout(loadProducts, 100);
        return;
    }
    
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
            console.warn('Unknown category for product:', product.name, 'category:', product.category);
        }
    });
    
    // Create category sections
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        if (category.products.length > 0) {
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'col-12 mb-4';
            categoryHeader.classList.add('visible');
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
    
    console.log('Products display completed');
}

// Show all products in category
window.showAllProducts = function(categoryKey, event) {
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
window.createProductCard = function(product, index) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    col.classList.add('fade-in', 'visible'); // Сразу делаем видимым
    
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
                <img src="${productImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'">
                <button class="product-test-btn" onclick="event.stopPropagation(); showProductModal(${product.id})">
                    <i class="fas fa-flask"></i> Эксперименты
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
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); showProductDetails(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Посмотреть и заказать
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
window.openProductFromUrl = function(productId) {
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



// Generate stars for rating (kept for rating display)
window.generateStars = function(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// Show product modal
window.showProductModal = function(productId) {
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

    modalTitle.textContent = `${product.name} - Эксперименты и тесты`;
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
    
    // Обработчик закрытия модала
    modal._element.addEventListener('hidden.bs.modal', function() {
        resetUrl();
    }, { once: true });
}

// Show product details
window.showProductDetails = function(productId) {
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
    
    // Обработчик закрытия модала
    modal._element.addEventListener('hidden.bs.modal', function() {
        resetUrl();
    }, { once: true });
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
window.openOrderModal = function(productId) {
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
    
    // Обработчик закрытия модала заказа
    orderModal._element.addEventListener('hidden.bs.modal', function() {
        resetUrl();
    }, { once: true });
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
            <span style="color: #229ED9;">-${discountAmount.toLocaleString()} ₸</span>
        </div>
        ` : ''}
        <div class="order-item">
            <span><strong>Итого к оплате:</strong></span>
            <span><strong>${currentOrderSize.price.toLocaleString()} ₸</strong></span>
        </div>
        <div class="order-item" style="border: none; padding-top: 1rem; color: #229ED9;">
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

// Submit order to Telegram
function submitOrder() {
    if (!currentOrderProduct || !currentOrderSize) return;
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const comment = document.getElementById('customerComment').value.trim();
    
    if (!name || !phone) {
        alert('Пожалуйста, заполните обязательные поля (имя и телефон)');
        return;
    }

    const payload = {
        name,
        phone,
        comment,
        productName: currentOrderProduct.name,
        sizeName: currentOrderSize.name,
        price: currentOrderSize.price,
        originalPrice: currentOrderSize.originalPrice || null,
        gift: 'Наматрасник',
        orderedAt: new Date().toISOString()
    };

    fetch('send_telegram.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || 'Ошибка отправки в Telegram');
        }
        return data;
    })
    .then(() => {
        const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        if (orderModal) orderModal.hide();
        document.getElementById('orderForm').reset();
        showSuccessNotification();
    })
    .catch((err) => {
        console.error('Ошибка отправки в Telegram:', err);
        alert('Не удалось отправить заказ в Telegram. Попробуйте позже.');
    });
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
    
    // Load products from JSON after DOM is ready (removed to avoid conflicts)
    // Products will be loaded in DOMContentLoaded event
    
    // Test button removed - products will load automatically
    
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

// Функция воспроизведения звука уведомления
function playNotificationSound() {
  try {
    // Создаем простой звук уведомления
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Звук не может быть воспроизведен:', error);
  }
}

// Функция отправки данных в Telegram
function submitToTelegram(name, phone, source) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('source', source);
    
    fetch('send_telegram.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Telegram response:', data);
        if (data.success) {
            console.log('Сообщение успешно отправлено в Telegram');
        } else {
            console.error('Ошибка отправки в Telegram:', data.message);
        }
    })
    .catch(error => {
        console.error('Error sending to Telegram:', error);
    });
}

// Функция инициализации плавающего конверта
function initAutomaticModal() {
    // Функция для сброса состояния модала (для разработчиков)
    window.resetModalState = function() {
        sessionStorage.removeItem('exclusiveModalShown');
        location.reload();
    };
    
    // Добавляем кнопку сброса в консоль для разработчиков
    console.log('Для сброса состояния модала выполните: resetModalState()');
    
    // Проверяем, показывался ли уже модал в этой сессии
    if (!sessionStorage.getItem('exclusiveModalShown')) {
        // Показываем модал через 7 секунд
        setTimeout(() => {
            const modalElement = document.getElementById('exclusiveOfferModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Добавляем анимацию появления и звук
            modalElement.addEventListener('shown.bs.modal', function() {
                const modalContent = modalElement.querySelector('.modal-content');
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
                
                // Воспроизводим звук уведомления
                playNotificationSound();
            });
            
            // Помечаем, что модал был показан
            sessionStorage.setItem('exclusiveModalShown', 'true');
        }, 7000);
    }
}

// Функция инициализации плавающего круга со скидкой
function initFloatingDiscount() {
    const discount = document.getElementById('floatingDiscount');
    const heroSection = document.querySelector('.new-hero-section');
    
    console.log('Discount element:', discount);
    console.log('Hero section:', heroSection);
    
    if (heroSection && discount) {
        // Перемещаем круг в hero-section
        heroSection.appendChild(discount);
        console.log('Discount moved to hero section');
        
        // Показываем круг со скидкой сразу
        discount.style.display = 'block';
        discount.style.opacity = '0';
        discount.style.transform = 'scale(0.5) rotate(-5deg)';
        
        // Анимация появления
        setTimeout(() => {
            discount.style.transition = 'all 0.5s ease';
            discount.style.opacity = '1';
            discount.style.transform = 'scale(1.2) rotate(-5deg)';
            console.log('Discount animation started');
        }, 100);
    } else {
        console.log('Hero section or discount element not found');
    }
}

// Submit consultation form to Telegram
function submitConsultationForm() {
    const name = document.getElementById('consultationName').value.trim();
    const phone = document.getElementById('consultationPhone').value.trim();
    
    if (!name || !phone) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    // Показываем индикатор загрузки
    const submitButton = document.querySelector('#consultationForm button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
    submitButton.disabled = true;
    
    // Отправляем данные в PHP скрипт
    fetch('send_telegram.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            phone: phone
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Спасибо, что выбрали нас! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
            document.getElementById('consultationForm').reset();
        } else {
            showNotification(data.message || 'Произошла ошибка при отправке', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Произошла ошибка при отправке. Попробуйте позже.', 'error');
    })
    .finally(() => {
        // Восстанавливаем кнопку
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed`;
    notification.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        border-radius: 8px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    const icon = type === 'error' ? 'fas fa-exclamation-circle' : 
                 type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${icon} me-2"></i>
            <div>
                <div>${message}</div>
            </div>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

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
    
    setupExclusiveOfferForm();
});

// Setup exclusive offer form
function setupExclusiveOfferForm() {
    const form = document.getElementById('exclusiveOfferForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const name = formData.get('name') || form.querySelector('input[type="text"]').value;
            const phone = formData.get('phone') || form.querySelector('input[type="tel"]').value;
            
            if (!name || !phone) {
                alert('Незаполнено');
            }
            
            // Отправляем в Telegram (даже если пусто)
            submitToTelegram(name || '—', phone || '—', 'Эксклюзивное предложение - модальное окно');
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('exclusiveOfferModal'));
            if (modal) {
                modal.hide();
            }
            
            // Показываем уведомление об успехе
            showNotification('Спасибо! Мы свяжемся с вами в ближайшее время', 'success');
            
            // Очищаем форму
            form.reset();
        });
    }
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
window.createProductSlug = function(name) {
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
// Функция для сброса URL к базовому состоянию
function resetUrl() {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({}, '', baseUrl);
    
    // Сброс мета-тегов к базовым значениям
    document.title = 'Территория Сна - Ортопедические матрасы от производителя в Таразе | Купить матрас с доставкой';
    updateMetaTag('og:title', 'Территория Сна - Ортопедические матрасы от производителя в Таразе');
    updateMetaTag('og:description', '✅ Ортопедические матрасы от производителя ✅ Бесплатная доставка ✅ Гарантия до 10 лет ✅ Доказываем качество!');
    updateMetaTag('og:url', baseUrl);
    updateMetaTag('twitter:title', 'Территория Сна - Ортопедические матрасы от производителя');
    updateMetaTag('twitter:description', '✅ Ортопедические матрасы от производителя ✅ Бесплатная доставка ✅ Гарантия до 10 лет');
}

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

  (function () {
    const allImages = [
      'img/отзывы/отзывы-1.JPG',
      'img/отзывы/отзывы-2.JPG',
      'img/отзывы/отзывы-3.JPG',
      'img/отзывы/отзывы-4.JPG',
      'img/отзывы/отзывы-5.JPG',
      'img/отзывы/отзывы-6.JPG',
      'img/отзывы/отзывы-7.JPG',
      'img/отзывы/отзывы-8.JPG',
      'img/отзывы/отзывы-9.JPG',
      'img/отзывы/отзывы-10.JPG',
      'img/отзывы/отзывы-11.JPG',
      'img/отзывы/отзывы-12.JPG',
      'img/отзывы/отзывы-13.JPG',
      'img/отзывы/отзывы-14.JPG'
    ];

    let startIndex = 0; // начальный сдвиг
    const visibleCountDesktop = 5;
    const track = document.getElementById('screenshotTrack');

    function getVisible() {
      const res = [];
      for (let i = 0; i < visibleCountDesktop; i++) {
        const idx = (startIndex + i) % allImages.length;
        res.push(allImages[idx]);
      }
      return res;
    }

    function makeCard(src, absoluteIndex) {
      const div = document.createElement('div');
      div.className = 'screenshot-card';
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Скриншот отзыва';
      img.setAttribute('data-index', absoluteIndex);
      div.appendChild(img);
      // клик открывает модал
      div.addEventListener('click', () => {
        openModalAt(absoluteIndex);
      });
      return div;
    }

    function renderTrack() {
      track.innerHTML = '';
      const visible = getVisible();
      for (let i = 0; i < visible.length; i++) {
        const absIdx = (startIndex + i) % allImages.length;
        track.appendChild(makeCard(visible[i], absIdx));
      }
    }

    function shiftRight() {
      startIndex = (startIndex + 1) % allImages.length;
      renderTrack();
    }

    function shiftLeft() {
      startIndex = (startIndex - 1 + allImages.length) % allImages.length;
      renderTrack();
    }

    document.getElementById('nextArrow').addEventListener('click', () => {
      shiftRight();
    });
    document.getElementById('prevArrow').addEventListener('click', () => {
      shiftLeft();
    });

    // автопрокрутка
    setInterval(() => {
      shiftRight();
    }, 5000);

    // модал и большая карусель
    const bigCarousel = document.getElementById('bigCarousel');
    function buildBigCarousel() {
      const inner = bigCarousel.querySelector('.carousel-inner');
      inner.innerHTML = '';
      allImages.forEach((src, idx) => {
        const item = document.createElement('div');
        item.className = 'carousel-item' + (idx === 0 ? ' active' : '');
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Скриншот крупно';
        img.className = 'd-block w-100';
        img.style.objectFit = 'contain';
        img.style.maxHeight = '80vh';
        item.appendChild(img);
        inner.appendChild(item);
      });
    }

    function openModalAt(index) {
      buildBigCarousel();
      const carouselInstance = bootstrap.Carousel.getOrCreateInstance(bigCarousel);
      carouselInstance.to(index);
      const modal = new bootstrap.Modal(document.getElementById('screenshotModal'));
      modal.show();
    }

    // init
    renderTrack();
  })();
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        history.pushState(null, null, this.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Поддержка прямого перехода по якорю при загрузке страницы
  window.addEventListener('load', () => {
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // Обновленный JavaScript код
document.addEventListener('DOMContentLoaded', function() {
  // Модальное окно теперь показывается только при клике на конверт
  // Автоматический показ убран в пользу интерактивного конверта

  // Обработчик формы
  document.getElementById('exclusiveOfferForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('button[type="submit"]');
    const nameInput = this.querySelector('input[type="text"]');
    const phoneInput = this.querySelector('input[type="tel"]');
    
    // Валидация
    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    // Изменяем кнопку при отправке
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Отправка...';
    submitBtn.disabled = true;
    
    // Отправляем данные в Telegram
    submitToTelegram(nameInput.value, phoneInput.value, 'Эксклюзивное предложение');
    
    // Имитация отправки данных
    setTimeout(() => {
      alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
      bootstrap.Modal.getInstance(document.getElementById('exclusiveOfferModal')).hide();
    }, 1500);
  });
  
  // Обработчик ввода телефона
  const phoneInput = document.querySelector('#exclusiveOfferForm input[type="tel"]');
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




// Массив видео с описаниями и обложками
const videoSources = [
    {
        src: 'videos/IMG_2338.mp4',
        type: 'video/mp4',
        title: 'Назим Мисанов',
        cover: 'img/video-covers/IMG_2315.PNG',
        rating: 5,
        description: 'Страдал грыжей позвоночника. Для меня сон - важная часть жизни. Так как если я сплю плохо - целый день коту под хвост и каждое утро чувствую будто всю ночь меня били толпой!',
        status: 'Блогер'
    },
    {
        src: 'videos/IMG_2329.mp4',
        type: 'video/mp4',
        title: 'Михаил Козлов',
        cover: 'img/video-covers/video2-cover.jpg',
        rating: 5,
        description: 'Второй раз покупаю матрасы от Территории сна. Оба раза очень довольна. В первый раз-родителям. Во второй раз себе. Ребята прлфессионалы своего дела! В обоих покупала модель Зима-Лето))',
        status: 'Специалист пищевой безопасности'
    },
    {
        src: 'videos/IMG_2351.mp4',
        type: 'video/mp4',
        title: 'Ильхам',
        cover: 'img/video-covers/video3-cover.jpg',
        rating: 5,
        description: 'Моя мама несколько лет назад покупала матрас ортопедический. Долго не проспала на нем. Вылезли пружины, у мамы появилась протрузия. С тех пор спала на полу. С приобретением матраса от братьев мама довольна, спит спокойно. Спасибо братьям. Подобрали самый удобный!',
        status: 'Эксперт с медицинским образованием'
    }
    // Добавьте новые видео здесь:
    // {
    //     src: 'videos/новое_видео.mp4',
    //     type: 'video/mp4',
    //     title: 'Имя клиента',
    //     cover: 'img/video-covers/новое-видео-cover.jpg',
    //     rating: 5,
    //     description: 'Описание отзыва',
    //     status: 'Статус клиента'
    // }
];

function initVideoCarousel() {
    const carousel = document.getElementById('videoCarousel');
    if (!carousel) return;
    
    // Получаем все видео
    const videos = carousel.querySelectorAll('.advantage-video');
    console.log(`Найдено ${videos.length} видео`);
    
    // Настраиваем остановку других видео при воспроизведении
    videos.forEach((video, index) => {
        // Убеждаемся, что обложка отображается
        video.poster = video.getAttribute('poster');
        
        // Останавливаем все другие видео при воспроизведении
        video.addEventListener('play', function() {
            videos.forEach((otherVideo, otherIndex) => {
                if (otherIndex !== index) {
                    otherVideo.pause();
                    otherVideo.currentTime = 0;
                }
            });
        });
        
        // Добавляем обработчик для показа обложки после паузы
        video.addEventListener('pause', function() {
            // Небольшая задержка для корректного отображения обложки
            setTimeout(() => {
                video.currentTime = 0;
            }, 100);
        });
    });
    
    // Инициализируем Bootstrap карусель
    const bsCarousel = new bootstrap.Carousel(carousel, {
        interval: false, // Отключаем автоматическое переключение
        wrap: true // Зацикливаем
    });
    
    console.log('Bootstrap видеокарусель инициализирована');
}





