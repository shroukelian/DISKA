document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. البيانات والإعدادات (LocalStorage)
    // =========================================
    let cart = JSON.parse(localStorage.getItem('DISKA_CART')) || [];
    let merchantProducts = JSON.parse(localStorage.getItem('DISKA_MERCHANT_PRODUCTS')) || [];
    let wishlist = JSON.parse(localStorage.getItem('DISKA_WISHLIST')) || [];
    let notifications = JSON.parse(localStorage.getItem('DISKA_NOTIFICATIONS')) || [];

    // --- تحديث العدادات (سلة وإشعارات) ---
    const updateCounts = () => {
        // عداد السلة
        document.querySelectorAll('.badge').forEach(b => b.innerText = cart.length);

        // نقطة الإشعارات الحمراء
        const notifBadge = document.querySelector('.notif-badge');
        if (notifBadge) {
            // نظهر النقطة لو فيه إشعارات غير مقروءة (أو أي إشعار)
            notifBadge.style.display = notifications.length > 0 ? 'block' : 'none';
        }

        updateInCartIndicators(); // تحديث بادج "في سلتك"
    };

    // --- دوال الحفظ ---
    const saveCart = () => {
        localStorage.setItem('DISKA_CART', JSON.stringify(cart));
        updateCounts();
    };
    const saveProducts = () => {
        localStorage.setItem('DISKA_MERCHANT_PRODUCTS', JSON.stringify(merchantProducts));
    };
    const saveWishlist = () => {
        localStorage.setItem('DISKA_WISHLIST', JSON.stringify(wishlist));
    };
    const saveNotifications = () => {
        localStorage.setItem('DISKA_NOTIFICATIONS', JSON.stringify(notifications));
        updateCounts();
    };

    // --- دالة إضافة إشعار جديد ---
    window.addNotification = function (title, message, type = 'stock') {
        const notif = {
            id: Date.now(),
            title: title,
            message: message,
            type: type, // stock, order, price
            date: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG'),
            read: false
        };
        notifications.unshift(notif); // إضافة في البداية
        saveNotifications();
    };

    // --- دالة التوست (رسائل منبثقة) ---
    window.showToast = function (message, type = 'success') {
        // أنيميشن السلة
        // const cartIcon = document.querySelector('.cart-icon');
        // cartIcon.classList.add('shake');
        // setTimeout(() => cartIcon.classList.remove('shake'), 500);
        const container = document.querySelector('.toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' :
            type === 'error' ? '<i class="fas fa-times-circle"></i>' :
                '<i class="fas fa-exclamation-circle"></i>';

        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
    };

    function createToastContainer() {
        const div = document.createElement('div');
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    }

    // --- تحديث بادج الكمية داخل الكارت ---
    function updateInCartIndicators() {
        document.querySelectorAll('.merchant-product').forEach(card => {
            const id = card.getAttribute('data-id');
            const cartItem = cart.find(i => i.id == id);
            const indicator = card.querySelector('.in-cart-indicator');
            if (indicator) {
                if (cartItem) {
                    indicator.innerText = `في سلتك: ${cartItem.qty}`;
                    indicator.classList.add('show');
                } else {
                    indicator.classList.remove('show');
                }
            }
        });
    }

    updateCounts(); // تشغيل عند البدء


    // =========================================
    // 2. منطق صفحة الإشعارات (Notifications Page)
    // =========================================
    const notifList = document.getElementById('notifList');
    const clearNotifBtn = document.getElementById('clearNotifBtn');

    if (notifList) {
        renderNotifications();

        if (clearNotifBtn) {
            clearNotifBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من مسح جميع الإشعارات؟')) {
                    notifications = [];
                    saveNotifications();
                    renderNotifications();
                }
            });
        }
    }

    function renderNotifications() {
        if (!notifList) return;
        notifList.innerHTML = '';

        if (notifications.length === 0) {
            notifList.innerHTML = '<p style="text-align:center; padding:30px; color:#777;">لا توجد إشعارات حالياً</p>';
            return;
        }

        notifications.forEach(n => {
            let iconClass = n.type === 'order' ? 'fa-box' : (n.type === 'stock' ? 'fa-bell' : 'fa-tag');
            notifList.innerHTML += `
                <div class="notif-card ${n.type}">
                    <div class="icon"><i class="fas ${iconClass}"></i></div>
                    <div class="content">
                        <h4>${n.title}</h4>
                        <p>${n.message}</p>
                        <span class="time">${n.date}</span>
                    </div>
                </div>
            `;
        });
    }


    // =========================================
    // 3. إدارة التاجر (إضافة - تعديل - حذف)
    // =========================================
    const productForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const merchantList = document.getElementById('merchantProductsList');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editIndexInput = document.getElementById('editIndex');

    // أ. عرض الصورة
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { imagePreview.src = e.target.result; imagePreview.style.display = 'block'; }
                reader.readAsDataURL(file);
            }
        });
    }

    // ب. حفظ المنتج (إضافة / تعديل)
    if (productForm) {
        // دالة التعديل (Global)
        window.editProduct = function (index) {
            const p = merchantProducts[index];
            document.getElementById('productName').value = p.name;
            document.getElementById('productPrice').value = p.price;
            document.getElementById('oldPrice').value = p.oldPrice;
            document.getElementById('unitsPerCarton').value = p.units;
            document.getElementById('stockQty').value = p.stock;
            document.getElementById('productDesc').value = p.desc;
            document.getElementById('productCat').value = p.category;
            document.getElementById('prodDate').value = p.prodDate || '';
            document.getElementById('expDate').value = p.expDate || '';

            imagePreview.src = p.image;
            imagePreview.style.display = 'block';

            submitBtn.innerText = 'تحديث المنتج';
            cancelEditBtn.style.display = 'block';
            editIndexInput.value = index;
            window.scrollTo(0, 0);
        };

        // زر إلغاء التعديل
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                productForm.reset();
                imagePreview.style.display = 'none';
                submitBtn.innerText = 'نشر المنتج';
                cancelEditBtn.style.display = 'none';
                editIndexInput.value = '';
            });
        }

        productForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const index = editIndexInput.value;
            const file = imageInput.files[0];

            const saveLogic = (imgSrc) => {
                const productData = {
                    id: index ? merchantProducts[index].id : Date.now(),
                    name: document.getElementById('productName').value,
                    price: parseFloat(document.getElementById('productPrice').value),
                    oldPrice: parseFloat(document.getElementById('oldPrice').value),
                    units: document.getElementById('unitsPerCarton').value,
                    stock: parseInt(document.getElementById('stockQty').value),
                    desc: document.getElementById('productDesc').value,
                    category: document.getElementById('productCat').value,
                    prodDate: document.getElementById('prodDate').value,
                    expDate: document.getElementById('expDate').value,
                    image: imgSrc
                };

                if (index) {
                    merchantProducts[index] = productData;
                    showToast('تم تحديث المنتج');
                } else {
                    merchantProducts.push(productData);
                    showToast('تم النشر بنجاح');
                }

                saveProducts();
                renderMerchantList();
                if (cancelEditBtn) cancelEditBtn.click(); // ريسيت للفورم

                // الانتقال للرئيسية بعد ثانية لو إضافة جديدة
                if (!index) setTimeout(() => window.location.href = 'index.html', 1000);
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => saveLogic(e.target.result);
                reader.readAsDataURL(file);
            } else if (index) {
                saveLogic(merchantProducts[index].image);
            } else {
                showToast('صورة المنتج مطلوبة', 'error');
            }
        });
    }

    // ج. دالة رسم قائمة التاجر
    function renderMerchantList() {
        if (!merchantList) return;
        merchantList.innerHTML = '';
        if (merchantProducts.length === 0) {
            merchantList.innerHTML = '<p style="text-align:center; padding:10px; color:#777;">لا توجد منتجات.</p>';
            return;
        }
        merchantProducts.forEach((p, index) => {
            merchantList.innerHTML += `
                <div class="merchant-item" style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #eee; padding:10px; border-radius:8px; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.image}" style="width:40px; height:40px; border-radius:5px;">
                        <div>
                            <strong>${p.name}</strong>
                            <small style="display:block; color:#666;">مخزون: ${p.stock}</small>
                        </div>
                    </div>
                    <div class="merchant-actions" style="display:flex; gap:5px;">
                        <button class="btn-edit" onclick="editProduct(${index})" style="background:#e0f2fe; color:#0284c7; border:none; padding:5px; border-radius:4px;"><i class="fas fa-pen"></i></button>
                        <button class="btn-delete" onclick="deleteProduct(${index})" style="background:#fee2e2; color:#dc2626; border:none; padding:5px; border-radius:4px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        });
    }
    if (merchantList) renderMerchantList();

    // د. دالة الحذف (Global)
    window.deleteProduct = function (index) {
        if (confirm('حذف هذا المنتج نهائياً؟')) {
            merchantProducts.splice(index, 1);
            saveProducts();
            renderMerchantList();
            showToast('تم الحذف', 'warning');
        }
    };


    // =========================================
    // 4. عرض المنتجات في الرئيسية والمفضلة (Render Functions)
    // =========================================
    const productsGrid = document.querySelector('.products-grid');
    const wishlistContainer = document.getElementById('wishlistContainer');

    function renderProductCard(product, container) {
        // حساب الخصم
        let discountBadge = '';
        if (product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price)) {
            let discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            discountBadge = `<div class="flash-badge"><i class="fas fa-star"></i> خصم ${discount}%</div>`;
        }

        // فحص المخزون
        let isOutOfStock = product.stock <= 0;
        let stockClass = isOutOfStock ? 'low' : (product.stock < 10 ? 'low' : '');
        let stockText = isOutOfStock ? 'نفذت الكمية' : `متاح: ${product.stock}`;

        // الأزرار (أعلمني أو أضف)
        let actionArea = isOutOfStock ?
            `<button class="btn notify-btn" style="width:100%; margin-top:10px; background:#ff9800; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;"><i class="fas fa-bell"></i> أعلمني عند التوفر</button>` :
            `<div class="card-actions" style="display:flex; gap:10px; margin-top:10px;">
                <div class="qty-control-card" style="display:flex; border:1px solid #ddd; border-radius:5px;">
                    <button class="card-minus" style="border:none; background:#eee; width:30px; cursor:pointer;">-</button>
                    <input type="number" class="manual-qty" value="1" min="1" max="${product.stock}" style="width:50px; text-align:center; border:none; font-weight:bold;">
                    <button class="card-plus" style="border:none; background:#eee; width:30px; cursor:pointer;">+</button>
                </div>
                <button class="add-btn" style="flex:1; border:none; background:var(--primary); color:#fff; border-radius:5px; cursor:pointer;">أضف <i class="fas fa-cart-plus"></i></button>
            </div>`;

        // حالة المفضلة
        let isFav = wishlist.some(w => w.id == product.id) ? 'active' : '';

        const html = `
            <div class="product-card merchant-product" data-id="${product.id}" data-stock="${product.stock}">
                <button class="fav-btn ${isFav}"><i class="fas fa-heart"></i></button>
                ${discountBadge}
                
                <a href="product.html?id=${product.id}" style="text-decoration:none;">
                    <div class="product-img"><img src="${product.image}" alt="${product.name}"></div>
                </a>
                
                <div class="product-info">
                    <div class="in-cart-indicator"></div>
                    
                    <a href="product.html?id=${product.id}" style="text-decoration:none; color:inherit;">
                        <h4>${product.name}</h4>
                    </a>
                    
                    <p class="product-desc-short">${product.desc}</p>

                    <div class="product-meta">
                        <span><i class="fas fa-box-open"></i> ${product.units} / كرتونة</span>
                        <span class="stock-info ${stockClass}">${stockText}</span>
                    </div>

                    <div class="pricing">
                        <span class="current-price">${product.price} ج.م</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice} ج.م</span>` : ''}
                    </div>
                    
                    ${actionArea}
                </div>
            </div>`;

        container.insertAdjacentHTML('afterbegin', html);
    }

    // رسم الرئيسية
    if (productsGrid) {
        if (merchantProducts.length > 0) {
            merchantProducts.slice().reverse().forEach(product => {
                renderProductCard(product, productsGrid);
            });
        }
        updateInCartIndicators();
    }

    // رسم المفضلة
    if (wishlistContainer) {
        wishlistContainer.innerHTML = '';
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = '<p style="text-align:center; padding:30px; width:100%;">المفضلة فارغة ❤️</p>';
        } else {
            wishlist.forEach(favItem => {
                let product = merchantProducts.find(p => p.id == favItem.id);
                // لو المنتج مش موجود في قائمة التاجر (اتحذف أو منتج ثابت)، نستخدم بيانات المفضلة
                if (!product) {
                    product = favItem;
                    if (!product.stock) product.stock = 100;
                    if (!product.units) product.units = 1;
                }
                renderProductCard(product, wishlistContainer);
            });
        }
    }


    // =========================================
    // 5. صفحة السلة (Render Cart)
    // =========================================
    const cartPageContainer = document.querySelector('.cart-items');

    function renderCartPage() {
        if (!cartPageContainer) return;
        cartPageContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartPageContainer.innerHTML = '<p style="text-align:center; padding:30px;">السلة فارغة 🛒</p>';
            updateTotals(0);
            return;
        }

        cart.forEach((item, index) => {
            total += item.price * item.qty;
            cartPageContainer.innerHTML += `
                <div class="cart-item" data-index="${index}" data-id="${item.id}">
                    <img src="${item.image}">
                    <div class="item-details">
                        <h4>${item.title}</h4>
                        <span class="price">${item.price} ج.م</span>
                    </div>
                    <div class="item-actions">
                        <div class="qty-control small">
                            <button class="cart-minus">-</button>
                            <input type="number" class="manual-qty-cart" value="${item.qty}" min="1">
                            <button class="cart-plus">+</button>
                        </div>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                        <button class="cart-remove"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        updateTotals(total);
    }

    function updateTotals(total) {
        const sub = document.querySelector('.summary-row span:last-child');
        const tot = document.querySelector('.summary-row.total span:last-child');
        if (sub) sub.innerText = total.toFixed(2) + ' ج.م';
        if (tot) tot.innerText = (total * 1.14).toFixed(2) + ' ج.م';
    }

    if (cartPageContainer) renderCartPage();


    // =========================================
    // 6. التفاعلات العامة (Event Delegation)
    // =========================================
    document.addEventListener('click', function (e) {

        // --- تفاعلات السلة (حذف / زيادة / نقصان) ---
        if (e.target.closest('.cart-remove')) {
            const index = e.target.closest('.cart-item').dataset.index;
            cart.splice(index, 1);
            saveCart(); renderCartPage();
        }

        if (e.target.closest('.cart-plus')) {
            const item = e.target.closest('.cart-item');
            const idx = item.dataset.index;
            const id = item.dataset.id;

            let original = merchantProducts.find(p => p.id == id);
            let max = original ? parseInt(original.stock) : 9999;

            if (cart[idx].qty + 1 > max) { showToast('الكمية غير متاحة', 'error'); return; }
            cart[idx].qty++;
            saveCart(); renderCartPage();
        }

        if (e.target.closest('.cart-minus')) {
            const idx = e.target.closest('.cart-item').dataset.index;
            if (cart[idx].qty > 1) { cart[idx].qty--; saveCart(); renderCartPage(); }
        }

        // --- تفاعلات الرئيسية (عداد الكارت) ---
        if (e.target.classList.contains('card-plus')) {
            const input = e.target.previousElementSibling;
            const max = parseInt(e.target.closest('.product-card').dataset.stock);
            let val = parseInt(input.value) || 1;
            if (val < max) input.value = val + 1;
            else showToast(`أقصى كمية متاحة ${max}`, 'warning');
        }

        if (e.target.classList.contains('card-minus')) {
            const input = e.target.nextElementSibling;
            let val = parseInt(input.value) || 1;
            if (val > 1) input.value = val - 1;
        }

        // --- زر الإضافة للسلة ---
        if (e.target.closest('.add-btn')) {
            const btn = e.target.closest('.add-btn');
            if (btn.hasAttribute('disabled')) return;

            const card = btn.closest('.product-card');
            const productId = card.getAttribute('data-id');
            const qtyInput = card.querySelector('.manual-qty');
            let qtyToAdd = parseInt(qtyInput.value) || 1;

            let originalProduct = merchantProducts.find(p => p.id == productId);
            let maxStock = originalProduct ? parseInt(originalProduct.stock) : 9999;
            let cartItem = cart.find(item => item.id == productId);
            let currentQtyInCart = cartItem ? cartItem.qty : 0;

            if (currentQtyInCart + qtyToAdd > maxStock) {
                showToast(`الكمية غير متاحة! المتبقي ${maxStock - currentQtyInCart}`, 'error');
                return;
            }

            let title = card.querySelector('h4').innerText;
            let price = parseFloat(card.querySelector('.current-price').innerText.replace(/[^0-9.]/g, ''));
            let img = card.querySelector('img').src;

            if (cartItem) {
                cartItem.qty += qtyToAdd;
            } else {
                cart.push({ id: productId, title, price, image: img, qty: qtyToAdd });
            }
            saveCart();
            qtyInput.value = 1;
            showToast(`تم إضافة ${qtyToAdd} للسلة`, 'success');
        }

        // --- زر المفضلة ---
        if (e.target.closest('.fav-btn')) {
            const btn = e.target.closest('.fav-btn');
            const card = btn.closest('.product-card');
            const id = card.getAttribute('data-id');

            btn.classList.toggle('active');

            if (btn.classList.contains('active')) {
                if (!wishlist.some(w => w.id == id)) {
                    let title = card.querySelector('h4').innerText;
                    let priceRaw = card.querySelector('.current-price').innerText;
                    let price = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
                    let img = card.querySelector('img').src;
                    // جلب السعر القديم
                    let oldPriceElem = card.querySelector('.old-price');
                    let oldPrice = oldPriceElem ? parseFloat(oldPriceElem.innerText.replace(/[^0-9.]/g, '')) : null;

                    wishlist.push({ id, title, name: title, price, oldPrice, image: img });
                    showToast('تمت الإضافة للمفضلة');
                }
            } else {
                wishlist = wishlist.filter(w => w.id != id);
                showToast('تم الحذف من المفضلة', 'warning');
                if (wishlistContainer) { card.remove(); if (wishlist.length == 0) wishlistContainer.innerHTML = '<p style="text-align:center;">المفضلة فارغة</p>'; }
            }
            saveWishlist();
        }

        // --- زر التنبيه ---
        if (e.target.closest('.notify-btn')) {
            const card = e.target.closest('.product-card');
            const name = card.querySelector('h4').innerText;
            addNotification('تنبيه توفر المنتج', `تم تسجيل طلبك لمنتج "${name}"، سنعلمك عند التوفر.`, 'stock');
        }
    });

    // --- مراقبة الكتابة اليدوية (Validation) ---
    document.addEventListener('change', function (e) {
        // في الرئيسية
        if (e.target.classList.contains('manual-qty')) {
            const max = parseInt(e.target.closest('.product-card').dataset.stock) || 9999;
            let val = parseInt(e.target.value);
            if (val > max) { showToast(`أقصى كمية ${max}`, 'error'); e.target.value = max; }
            else if (val < 1 || isNaN(val)) { e.target.value = 1; }
        }
        // في السلة
        if (e.target.classList.contains('manual-qty-cart')) {
            const idx = e.target.closest('.cart-item').dataset.index;
            const id = e.target.closest('.cart-item').dataset.id;
            let val = parseInt(e.target.value);
            let original = merchantProducts.find(p => p.id == id);
            let max = original ? parseInt(original.stock) : 9999;
            if (val > max) { showToast(`أقصى كمية ${max}`, 'error'); val = max; }
            if (val < 1) val = 1;
            cart[idx].qty = val;
            saveCart(); renderCartPage();
        }
    });


    // =========================================
    // 7. القائمة الجانبية (Mobile)
    // =========================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.menu-overlay');
    const closeBtn = document.querySelector('.close-menu');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => { sidebar.classList.add('active'); if (overlay) overlay.classList.add('active'); });
    }
    const closeMenu = () => { if (sidebar) sidebar.classList.remove('active'); if (overlay) overlay.classList.remove('active'); };
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    // =========================================
    // 8. أنيميشن الظهور عند السكرول (Scroll Reveal)
    // =========================================

    // 1. نضيف كلاس reveal لكل العناصر اللي عايزينها تتحرك
    const revealElements = document.querySelectorAll('.product-card, .cat-item, .section-header, .banner-card');

    revealElements.forEach(element => {
        element.classList.add('reveal');
    });

    // 2. دالة التحقق من السكرول
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // مسافة الرؤية

        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;

            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            } else {
                // شيل السطر ده لو عايز الأنيميشن يحصل مرة واحدة بس وميتكررش
                // reveal.classList.remove('active'); 
            }
        });
    };

    // تشغيل الدالة مع السكرول
    window.addEventListener('scroll', revealOnScroll);
    // تشغيلها مرة في البداية عشان العناصر الظاهرة
    revealOnScroll();


    // =========================================
    // 9. تأثير اهتزاز السلة عند الإضافة
    // =========================================
    // (ده تعديل صغير هنضيفه جوه دالة زر الإضافة الموجودة عندك)
    // ابحث عن كود: document.addEventListener('click', function(e) { ... if (e.target.closest('.add-btn')) ...
    // وضيف السطرين دول جوه الـ if بتاع النجاح:


    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.classList.add('shake');
    setTimeout(() => cartIcon.classList.remove('shake'), 500);

    document.addEventListener('DOMContentLoaded', () => {
    // قائمة الكلمات اللي هتتكتب
    const words = ["بيبسي", "زيت كريستال", "شيبسي", "منظفات", "شاي العروسة"];
    let i = 0;
    let timer;

    function typeWriter() {
        const input = document.querySelector('.search-box input');
        if (!input) return;
        
        let word = words[i];
        let currentText = input.getAttribute('placeholder') || "";
        
        // مسح النص القديم (محاكاة بسيطة بتغيير الكلمة كل ثانيتين)
        input.setAttribute('placeholder', `ابحث عن ${word}...`);
        
        if (i < words.length - 1) {
            i++;
        } else {
            i = 0;
        }
        setTimeout(typeWriter, 2000); // تغيير كل 2 ثانية
    }

    typeWriter();
});

});
