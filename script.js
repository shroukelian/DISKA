document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. المتغيرات والبيانات (LocalStorage)
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
        if(notifBadge) {
            notifBadge.style.display = notifications.length > 0 ? 'block' : 'none';
        }

        updateInCartIndicators();
    };

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
    window.addNotification = function(title, message, type = 'stock') {
        const notif = {
            id: Date.now(),
            title: title,
            message: message,
            type: type, 
            date: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG'),
            read: false
        };
        notifications.unshift(notif);
        saveNotifications();
    };

    // --- دالة التوست (رسائل منبثقة) ---
    window.showToast = function(message, type = 'success') {
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

    updateCounts();


    // =========================================
    // 2. منطق صفحة التاجر (إضافة / تعديل / حذف)
    // =========================================
    const productForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const merchantList = document.getElementById('merchantProductsList');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editIndexInput = document.getElementById('editIndex');

    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { imagePreview.src = e.target.result; imagePreview.style.display = 'block'; }
                reader.readAsDataURL(file);
            }
        });
    }

    if (productForm) {
        window.editProduct = function(index) {
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
            imagePreview.src = p.image; imagePreview.style.display = 'block';
            submitBtn.innerText = 'تحديث المنتج';
            cancelEditBtn.style.display = 'block';
            editIndexInput.value = index;
            window.scrollTo(0,0);
        };

        if(cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                productForm.reset();
                imagePreview.style.display = 'none';
                submitBtn.innerText = 'نشر المنتج';
                cancelEditBtn.style.display = 'none';
                editIndexInput.value = '';
            });
        }

        productForm.addEventListener('submit', function(e) {
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
                saveProducts(); renderMerchantList();
                if(cancelEditBtn) cancelEditBtn.click();
                if(!index) setTimeout(() => window.location.href = 'index.html', 1000);
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

    function renderMerchantList() {
        if (!merchantList) return;
        merchantList.innerHTML = '';
        if (merchantProducts.length === 0) {
            merchantList.innerHTML = '<p style="text-align:center; padding:10px; color:#777;">لا توجد منتجات.</p>';
            return;
        }
        merchantProducts.forEach((p, index) => {
            merchantList.innerHTML += `
                <div class="merchant-item">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.image}" style="width:40px; height:40px; border-radius:5px;">
                        <div><strong>${p.name}</strong><small style="display:block; color:#666;">مخزون: ${p.stock}</small></div>
                    </div>
                    <div class="merchant-actions" style="display:flex; gap:5px;">
                        <button class="btn-edit" onclick="editProduct(${index})" style="background:#e0f2fe; color:#0284c7; border:none; padding:5px; border-radius:4px;"><i class="fas fa-pen"></i></button>
                        <button class="btn-delete" onclick="deleteProduct(${index})" style="background:#fee2e2; color:#dc2626; border:none; padding:5px; border-radius:4px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        });
    }
    if (merchantList) renderMerchantList();

    window.deleteProduct = function(index) {
        if(confirm('حذف المنتج نهائياً؟')) {
            merchantProducts.splice(index, 1);
            saveProducts(); renderMerchantList(); showToast('تم الحذف', 'warning');
        }
    };


    // =========================================
    // 3. عرض المنتجات (الرئيسية والمفضلة)
    // =========================================
    const productsGrid = document.querySelector('.products-grid');
    const wishlistContainer = document.getElementById('wishlistContainer');

    function renderProductCard(product, container) {
        let discountBadge = '';
        if (product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price)) {
            let discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            discountBadge = `<div class="flash-badge"><i class="fas fa-star"></i> خصم ${discount}%</div>`;
        }

        let isOutOfStock = product.stock <= 0;
        let stockClass = isOutOfStock ? 'low' : (product.stock < 10 ? 'low' : '');
        let stockText = isOutOfStock ? 'نفذت الكمية' : `متاح: ${product.stock}`;
        
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

        let isFav = wishlist.some(w => w.id == product.id) ? 'active' : '';

        const html = `
            <div class="product-card merchant-product reveal" data-id="${product.id}" data-stock="${product.stock}">
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

    if (productsGrid) {
        if (merchantProducts.length > 0) merchantProducts.slice().reverse().forEach(p => renderProductCard(p, productsGrid));
        updateInCartIndicators();
    }
    
    if (wishlistContainer) {
        wishlistContainer.innerHTML = '';
        if (wishlist.length === 0) wishlistContainer.innerHTML = '<p style="text-align:center;">المفضلة فارغة</p>';
        else wishlist.forEach(fav => {
            let p = merchantProducts.find(x => x.id == fav.id) || fav;
            if(!p.stock) p.stock=100; if(!p.units) p.units=1;
            renderProductCard(p, wishlistContainer);
        });
    }


    // =========================================
    // 4. التفاعلات الشاملة (Event Delegation)
    // =========================================
 // =========================================
    // 4. التفاعلات الشاملة (Event Delegation)
    // =========================================
    document.addEventListener('click', function(e) {

        // أ. زر الإضافة للسلة
       // --- زر الإضافة للسلة ---
        if (e.target.closest('.add-btn')) {
            const btn = e.target.closest('.add-btn');
            if (btn.hasAttribute('disabled')) return;

            const card = btn.closest('.product-card');
            const productId = card.getAttribute('data-id');
            const qtyInput = card.querySelector('.manual-qty');
            let qtyToAdd = parseInt(qtyInput.value) || 1;

            // 1. فحص المخزون
            let originalProduct = merchantProducts.find(p => p.id == productId);
            // لو منتج ثابت (مش تاجر) بناخد المخزون من HTML data-stock
            let maxStock = originalProduct ? parseInt(originalProduct.stock) : (parseInt(card.getAttribute('data-stock')) || 9999);
            
            let cartItem = cart.find(item => item.id == productId);
            let currentQtyInCart = cartItem ? cartItem.qty : 0;

            if (currentQtyInCart + qtyToAdd > maxStock) {
                showToast(`الكمية غير متاحة! المتبقي ${maxStock - currentQtyInCart}`, 'error');
                return;
            }

            // 2. تجميع البيانات (التعديل هنا عشان يشتغل في كل الصفحات)
            
            // الاسم: بندور على h4 (في الرئيسية) أو h1 (في صفحة المنتج)
            let titleElement = card.querySelector('h4') || card.querySelector('h1');
            let title = titleElement ? titleElement.innerText : 'منتج';
            
            // السعر
            let price = parseFloat(card.querySelector('.current-price').innerText.replace(/[^0-9.]/g, ''));
            
            // الصورة: لو مش جوه الكارت (زي صفحة المنتج)، هاتها من الكلاس بتاعها
            let imgElement = card.querySelector('img') || document.querySelector('.details-img img');
            let img = imgElement ? imgElement.src : '';

            // السعر القديم
            let oldPriceElem = card.querySelector('.old-price');
            let oldPrice = oldPriceElem ? parseFloat(oldPriceElem.innerText.replace(/[^0-9.]/g, '')) : null;

            // 3. الإضافة للسلة
            if (cartItem) {
                cartItem.qty += qtyToAdd;
            } else {
                cart.push({ id: productId, title, price, image: img, qty: qtyToAdd, oldPrice });
            }
            saveCart();
            
            qtyInput.value = 1;
            
            // أنيميشن اهتزاز السلة
            const cartIcon = document.querySelector('.cart-icon');
            if(cartIcon) {
                cartIcon.classList.add('shake');
                setTimeout(() => cartIcon.classList.remove('shake'), 500);
            }
            
            // تغيير شكل الزر مؤقتاً
            const originalHTML = btn.innerHTML;
            const originalBg = btn.style.backgroundColor; // نحفظ اللون الأصلي
            
            btn.innerHTML = '<i class="fas fa-check"></i> تم الإضافة';
            btn.style.backgroundColor = '#22c55e'; // لون أخضر
            btn.style.color = '#fff';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.backgroundColor = originalBg; // نرجعه أصفر (أو لونه الأصلي)
                btn.style.color = '#0F172A';
            }, 1000);

            showToast(`تم إضافة ${qtyToAdd} للسلة`, 'success');
        }

        // ب. أزرار العداد (+ / -) في الكارت
        if (e.target.classList.contains('card-plus')) {
            const input = e.target.previousElementSibling;
            // قراءة الحد الأقصى مباشرة من كود الـ HTML (سواء منتج تاجر أو ثابت)
            const max = parseInt(e.target.closest('.product-card').getAttribute('data-stock')) || 9999;
            let val = parseInt(input.value) || 1;
            
            if (val < max) {
                input.value = val + 1;
            } else {
                showToast('وصلت للحد الأقصى للمتاح', 'warning');
            }
        }
        
        if (e.target.classList.contains('card-minus')) {
            const input = e.target.nextElementSibling;
            let val = parseInt(input.value) || 1;
            if (val > 1) input.value = val - 1;
        }

        // ج. زر المفضلة
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
                    let oldPriceElem = card.querySelector('.old-price');
                    let oldPrice = oldPriceElem ? parseFloat(oldPriceElem.innerText.replace(/[^0-9.]/g, '')) : null;
                    let stock = parseInt(card.getAttribute('data-stock')) || 100;

                    wishlist.push({ 
                        id, title, name: title, price, oldPrice, image: img,
                        stock: stock, units: 1 
                    });
                    showToast('تمت الإضافة للمفضلة');
                }
            } else {
                wishlist = wishlist.filter(w => w.id != id);
                showToast('تم الحذف من المفضلة', 'warning');
                if (typeof wishlistContainer !== 'undefined' && wishlistContainer) { 
                    card.remove(); 
                    if(wishlist.length === 0) wishlistContainer.innerHTML = '<p style="text-align:center;">المفضلة فارغة</p>';
                }
            }
            saveWishlist();
        }

        // د. زر التنبيه
        if (e.target.closest('.notify-btn')) {
            const card = e.target.closest('.product-card');
            const name = card.querySelector('h4').innerText;
            addNotification('تنبيه توفر المنتج', `تم تسجيل طلبك لـ "${name}"`, 'stock');
        }
    });
    // هـ. مراقبة الكتابة اليدوية (Validation)
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('manual-qty')) {
            const max = parseInt(e.target.closest('.product-card').dataset.stock) || 9999;
            let val = parseInt(e.target.value);
            if (val > max) { showToast(`أقصى كمية ${max}`, 'error'); e.target.value = max; } 
            else if (val < 1 || isNaN(val)) { e.target.value = 1; }
        }
    });


    // =========================================
    // 5. صفحة السلة (Render & Logic)
    // =========================================
    const cartPageContainer = document.querySelector('.cart-items');
    
    function renderCartPage() {
        if (!cartPageContainer) return;
        cartPageContainer.innerHTML = '';
        let total = 0;
        if(cart.length === 0) { cartPageContainer.innerHTML = '<p style="text-align:center;">السلة فارغة 🛒</p>'; updateTotals(0); return; }
        
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            cartPageContainer.innerHTML += `
                <div class="cart-item" data-index="${index}" data-id="${item.id}">
                    <img src="${item.image}">
                    <div class="item-details"><h4>${item.title}</h4><span class="price">${item.price} ج.م</span></div>
                    <div class="item-actions">
                        <div class="qty-control small">
                            <button class="cart-minus">-</button>
                            <input type="number" class="manual-qty-cart" value="${item.qty}" min="1">
                            <button class="cart-plus">+</button>
                        </div>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                        <button class="cart-remove"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        });
        updateTotals(total);
        attachCartEvents();
    }

    function updateTotals(total) {
        const sub = document.querySelector('.summary-row span:last-child');
        const tot = document.querySelector('.summary-row.total span:last-child');
        if(sub) sub.innerText = total.toFixed(2) + ' ج.م';
        if(tot) tot.innerText = (total * 1.14).toFixed(2) + ' ج.م';
    }

    function attachCartEvents() {
        document.querySelectorAll('.cart-remove').forEach(btn => btn.onclick = function() {
            cart.splice(this.closest('.cart-item').dataset.index, 1); saveCart(); renderCartPage();
        });
        document.querySelectorAll('.cart-plus').forEach(btn => btn.onclick = function() {
            const id = this.closest('.cart-item').dataset.id;
            const idx = this.closest('.cart-item').dataset.index;
            let original = merchantProducts.find(p => p.id == id);
            let max = original ? parseInt(original.stock) : 9999;
            if(cart[idx].qty + 1 > max) { showToast('الكمية غير متاحة', 'error'); return; }
            cart[idx].qty++; saveCart(); renderCartPage();
        });
        document.querySelectorAll('.cart-minus').forEach(btn => btn.onclick = function() {
            const idx = this.closest('.cart-item').dataset.index;
            if(cart[idx].qty > 1) { cart[idx].qty--; saveCart(); renderCartPage(); }
        });
        document.querySelectorAll('.manual-qty-cart').forEach(inp => {
            inp.onchange = function() {
                const idx = this.closest('.cart-item').dataset.index;
                const id = this.closest('.cart-item').dataset.id;
                let val = parseInt(this.value);
                let original = merchantProducts.find(p => p.id == id);
                let max = original ? parseInt(original.stock) : 9999;
                if (val > max) { showToast(`أقصى كمية ${max}`, 'error'); val = max; }
                if (val < 1) val = 1;
                cart[idx].qty = val; saveCart(); renderCartPage();
            }
        });
    }
    if(cartPageContainer) renderCartPage();


    // =========================================
    // 6. القوائم والأنيميشن والإضافات
    // =========================================
    
    // القائمة الجانبية
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.menu-overlay');
    const closeBtn = document.querySelector('.close-menu');
    if(menuBtn) menuBtn.addEventListener('click', () => { sidebar.classList.add('active'); if(overlay) overlay.classList.add('active'); });
    const closeMenu = () => { if(sidebar) sidebar.classList.remove('active'); if(overlay) overlay.classList.remove('active'); };
    if(closeBtn) closeBtn.addEventListener('click', closeMenu);
    if(overlay) overlay.addEventListener('click', closeMenu);

    // صفحة الإشعارات
    const notifList = document.getElementById('notifList');
    if (notifList) {
        if(notifications.length === 0) notifList.innerHTML = '<p style="text-align:center;">لا توجد إشعارات</p>';
        else notifications.forEach(n => notifList.innerHTML += `<div class="notif-card"><div class="content"><h4>${n.title}</h4><p>${n.message}</p><span>${n.date}</span></div></div>`);
        const clearBtn = document.getElementById('clearNotifBtn');
        if(clearBtn) clearBtn.onclick = () => { if(confirm('مسح الكل؟')) { notifications=[]; saveNotifications(); location.reload(); } };
    }

    // أنيميشن الكتابة التلقائية في البحث
    const words = ["بيبسي", "زيت كريستال", "شيبسي", "منظفات", "شاي العروسة"];
    let i = 0;
    function typeWriter() {
        const input = document.querySelector('.search-box input');
        if (!input) return;
        input.setAttribute('placeholder', `ابحث عن ${words[i]}...`);
        i = (i < words.length - 1) ? i + 1 : 0;
        setTimeout(typeWriter, 2500);
    }
    typeWriter();

    // أنيميشن ظهور العناصر عند السكرول
    const revealElements = document.querySelectorAll('.product-card, .cat-item, .section-header, .banner-card');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) reveal.classList.add('active');
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
});