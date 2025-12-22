document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. تعريفات عامة
    // =========================================
    let cart = JSON.parse(localStorage.getItem('DISKA_CART')) || [];
    let merchantProducts = JSON.parse(localStorage.getItem('DISKA_MERCHANT_PRODUCTS')) || [];
    let wishlist = JSON.parse(localStorage.getItem('DISKA_WISHLIST')) || [];

    const updateCartCount = () => {
        document.querySelectorAll('.badge').forEach(b => b.innerText = cart.length);
    };

    const saveCart = () => {
        localStorage.setItem('DISKA_CART', JSON.stringify(cart));
        updateCartCount();
    };

    const saveWishlist = () => {
        localStorage.setItem('DISKA_WISHLIST', JSON.stringify(wishlist));
    };
    
    updateCartCount();


    // =========================================
    // 2. كود رسم السلة
    // =========================================
    const cartContainer = document.querySelector('.cart-items');
    const summaryTotal = document.querySelector('.summary-row.total span:last-child');
    const summarySubtotal = document.querySelector('.summary-row span:last-child');

    function renderCart() {
        if (!cartContainer) return;
        
        cartContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; padding:20px; font-size:1.1rem;">السلة فارغة 🛒</p>';
            if(summarySubtotal) summarySubtotal.innerText = '0.00 ج.م';
            if(summaryTotal) summaryTotal.innerText = '0.00 ج.م';
            return;
        }

        cart.forEach((item, index) => {
            let itemTotal = item.price * item.qty;
            total += itemTotal;

            cartContainer.innerHTML += `
                <div class="cart-item" data-index="${index}" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="item-details">
                        <h4>${item.title}</h4>
                        <span class="price">${item.price} ج.م</span>
                    </div>
                    <div class="item-actions">
                        <div class="qty-control small">
                            <button class="minus cart-minus">-</button>
                            <input type="number" value="${item.qty}" readonly>
                            <button class="plus cart-plus">+</button>
                        </div>
                        <span class="total-item-price">${itemTotal.toFixed(2)}</span>
                        <button class="remove-btn cart-remove"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        });

        if(summarySubtotal) summarySubtotal.innerText = total.toFixed(2) + ' ج.م';
        let tax = total * 0.14; 
        let final = total + tax; 
        if(summaryTotal) summaryTotal.innerText = final.toFixed(2) + ' ج.م';
    }

    if (cartContainer) renderCart();


    // =========================================
    // 3. التفاعلات (الرادار)
    // =========================================
    document.addEventListener('click', function(e) {
        
        // --- أ. أزرار السلة ---
        if (e.target.closest('.cart-remove')) {
            const index = e.target.closest('.cart-item').dataset.index;
            cart.splice(index, 1);
            saveCart(); renderCart();
        }

        if (e.target.closest('.cart-plus')) {
            const itemElement = e.target.closest('.cart-item');
            const index = itemElement.dataset.index;
            const id = itemElement.dataset.id;
            
            // فحص المخزون
            let originalProduct = merchantProducts.find(p => p.id == id);
            let maxStock = originalProduct ? parseInt(originalProduct.stock) : 9999;

            if (cart[index].qty + 1 > maxStock) {
                alert(`عفواً، الكمية المتاحة ${maxStock} فقط.`);
                return;
            }
            cart[index].qty++;
            saveCart(); renderCart();
        }

        if (e.target.closest('.cart-minus')) {
            const index = e.target.closest('.cart-item').dataset.index;
            if (cart[index].qty > 1) {
                cart[index].qty--;
                saveCart(); renderCart();
            }
        }


        // --- ب. أزرار الرئيسية (العداد) ---
        if (e.target.classList.contains('card-plus')) {
            const input = e.target.previousElementSibling;
            const max = parseInt(e.target.closest('.product-card').dataset.stock);
            let val = parseInt(input.value);
            if (val < max) input.value = val + 1;
            else alert('وصلت للحد الأقصى للمتاح');
        }
        
        if (e.target.classList.contains('card-minus')) {
            const input = e.target.nextElementSibling;
            let val = parseInt(input.value);
            if (val > 1) input.value = val - 1;
        }

        // --- ج. زر الإضافة للسلة ---
        if (e.target.closest('.add-btn')) {
            const btn = e.target.closest('.add-btn');
            if (btn.hasAttribute('disabled')) return; // لو الزر معطل ميعملش حاجة

            const card = btn.closest('.product-card');
            const productId = card.getAttribute('data-id');
            const qtyInput = card.querySelector('input[type="number"]');
            const qtyToAdd = qtyInput ? parseInt(qtyInput.value) : 1;

            let originalProduct = merchantProducts.find(p => p.id == productId);
            let maxStock = originalProduct ? parseInt(originalProduct.stock) : 9999;
            
            let cartItem = cart.find(item => item.id == productId);
            let currentQtyInCart = cartItem ? cartItem.qty : 0;

            if (currentQtyInCart + qtyToAdd > maxStock) {
                alert(`عفواً، الكمية المتاحة ${maxStock} فقط!`);
                return;
            }

            let title = card.querySelector('h4').innerText;
            let price = parseFloat(card.querySelector('.current-price').innerText.replace(/[^0-9.]/g, ''));
            let img = card.querySelector('img').src;

            if (cartItem) {
                cartItem.qty += qtyToAdd;
            } else {
                cart.push({ id: productId, title: title, price: price, image: img, qty: qtyToAdd });
            }
            saveCart();

            if(qtyInput) qtyInput.value = 1;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = '#22c55e';
            setTimeout(() => { btn.innerHTML = originalHTML; btn.style.background = ''; }, 1000);
        }

        // --- د. زر التنبيه (لما الكمية تخلص) ---
        if (e.target.closest('.notify-btn')) {
            alert('تم تسجيل طلبك! سنرسل لك إشعاراً فور توفر المنتج.');
        }

        // --- هـ. زر المفضلة (القلب) ---
        if (e.target.closest('.fav-btn')) {
            const btn = e.target.closest('.fav-btn');
            const card = btn.closest('.product-card');
            const id = card.getAttribute('data-id') || Date.now();
            
            btn.classList.toggle('active');

            if (btn.classList.contains('active')) {
                // إضافة للمفضلة
                if (!wishlist.some(w => w.id == id)) {
                    let title = card.querySelector('h4').innerText;
                    let price = card.querySelector('.current-price').innerText;
                    let img = card.querySelector('img').src;
                    wishlist.push({ id, title, price, img });
                }
            } else {
                // إزالة
                wishlist = wishlist.filter(w => w.id != id);
            }
            saveWishlist();
        }
    });


    // =========================================
    // 4. عرض المنتجات في الرئيسية (مع زر التنبيه والمفضلة)
    // =========================================
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        merchantProducts.slice().reverse().forEach(product => {
            
            // خصم
            let discountBadge = '';
            if (product.oldPrice > product.price) {
                let discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
                discountBadge = `<div class="flash-badge"><i class="fas fa-star"></i> خصم ${discount}%</div>`;
            }

            // مخزون وحالة الزر
            let isOutOfStock = product.stock <= 0;
            let stockClass = isOutOfStock ? 'low' : (product.stock < 10 ? 'low' : '');
            let stockText = isOutOfStock ? 'نفذت الكمية' : `متاح: ${product.stock}`;
            
            // لو خلصت الكمية، اعرض زر التنبيه، لو مخلصتش اعرض العداد وزر الإضافة
            let actionArea = '';
            if (isOutOfStock) {
                actionArea = `
                    <button class="btn notify-btn" style="width:100%; margin-top:10px; background:#ff9800; border:none; color:white; padding:10px; border-radius:5px; cursor:pointer;">
                        <i class="fas fa-bell"></i> أعلمني عند التوفر
                    </button>
                `;
            } else {
                actionArea = `
                    <div class="card-actions" style="display:flex; gap:10px; margin-top:10px;">
                        <div class="qty-control-card" style="display:flex; border:1px solid #ddd; border-radius:5px;">
                            <button class="card-minus" style="border:none; background:#eee; width:30px; cursor:pointer;">-</button>
                            <input type="number" value="1" min="1" max="${product.stock}" readonly style="width:40px; text-align:center; border:none;">
                            <button class="card-plus" style="border:none; background:#eee; width:30px; cursor:pointer;">+</button>
                        </div>
                        <button class="add-btn" style="flex:1; border:none; background:var(--primary); color:#fff; border-radius:5px; cursor:pointer;">
                            أضف <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                `;
            }

            // حالة المفضلة
            let isFav = wishlist.some(w => w.id == product.id) ? 'active' : '';

            const productHTML = `
                <div class="product-card merchant-product" data-id="${product.id}" data-stock="${product.stock}">
                    <!-- زر المفضلة (تمت إضافته هنا) -->
                    <button class="fav-btn ${isFav}"><i class="fas fa-heart"></i></button>

                    ${discountBadge}
                    <div class="product-img"><img src="${product.image}" alt="${product.name}"></div>
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <div class="product-meta">
                            <span><i class="fas fa-box-open"></i> ${product.units} / كرتونة</span>
                            <span class="stock-info ${stockClass}">${stockText}</span>
                        </div>
                        <div class="pricing">
                            <span class="current-price">${product.price} ج.م</span>
                            ${product.oldPrice ? `<span class="old-price">${product.oldPrice} ج.م</span>` : ''}
                        </div>
                        
                        <!-- منطقة الأزرار (تتغير حسب المخزون) -->
                        ${actionArea}

                    </div>
                </div>`;
            
            productsGrid.insertAdjacentHTML('afterbegin', productHTML);
        });
    }

    // =========================================
    // 2. منطق صفحة التاجر (رفع + عرض القائمة)
    // =========================================
    const productForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const merchantList = document.getElementById('merchantProductsList'); // القائمة الجانبية

    // أ. عرض الصورة قبل الرفع
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // ب. دالة رسم قائمة المنتجات في لوحة التاجر (التعديل هنا)
    function renderMerchantList() {
        // لو العنصر مش موجود (يعني احنا مش في صفحة التاجر)، اخرج
        if (!merchantList) return;

        merchantList.innerHTML = ''; // تنظيف القائمة

        if (merchantProducts.length === 0) {
            merchantList.innerHTML = '<p style="text-align:center; color:#777; padding:10px;">لا توجد منتجات مضافة حالياً.</p>';
            return;
        }

        merchantProducts.forEach((p, index) => {
            merchantList.innerHTML += `
                <div class="merchant-item" style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #eee; padding:10px; border-radius:8px; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.image}" style="width:40px; height:40px; object-fit:cover; border-radius:5px;">
                        <div style="line-height:1.2;">
                            <strong style="font-size:0.9rem; display:block;">${p.name}</strong>
                            <small style="color:#666;">مخزون: ${p.stock}</small>
                        </div>
                    </div>
                    <button onclick="deleteProduct(${index})" style="background:#ffebee; color:#d32f2f; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    // ج. تشغيل الدالة فوراً عند فتح الصفحة (ده السطر اللي كان ناقص)
    if (merchantList) {
        renderMerchantList();
    }

    // د. دالة الحذف (Global)
    window.deleteProduct = function(index) {
        if(confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) {
            merchantProducts.splice(index, 1); // حذف من المصفوفة
            localStorage.setItem('DISKA_MERCHANT_PRODUCTS', JSON.stringify(merchantProducts)); // تحديث الذاكرة
            renderMerchantList(); // إعادة رسم القائمة في لوحة التاجر
            alert('تم الحذف بنجاح');
        }
    };

    // هـ. حفظ المنتج الجديد
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const file = imageInput.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const newProduct = {
                    id: Date.now(),
                    name: document.getElementById('productName').value,
                    price: parseFloat(document.getElementById('productPrice').value),
                    oldPrice: parseFloat(document.getElementById('oldPrice').value),
                    units: document.getElementById('unitsPerCarton').value,
                    stock: parseInt(document.getElementById('stockQty').value),
                    desc: document.getElementById('productDesc').value,
                    category: document.getElementById('productCat').value,
                    // التواريخ
                    prodDate: document.getElementById('prodDate').value,
                    expDate: document.getElementById('expDate').value,
                    image: e.target.result
                };

                merchantProducts.push(newProduct);
                localStorage.setItem('DISKA_MERCHANT_PRODUCTS', JSON.stringify(merchantProducts));

                renderMerchantList(); // تحديث القائمة فوراً بعد الإضافة
                productForm.reset();
                imagePreview.style.display = 'none';
                alert('تم نشر المنتج بنجاح!');
            };

            if (file) {
                reader.readAsDataURL(file);
            } else {
                alert('يرجى اختيار صورة للمنتج');
            }
        });
    }
    // =========================================
    // 7. منطق صفحة المفضلة (Wishlist Page) - جديد
    // =========================================
    const wishlistContainer = document.getElementById('wishlistContainer');

    if (wishlistContainer) {
        wishlistContainer.innerHTML = ''; // تنظيف
        
        // لو المفضلة فاضية
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = `
                <div style="text-align:center; width:100%; padding:50px;">
                    <i class="fas fa-heart-broken" style="font-size:50px; color:#ccc;"></i>
                    <p style="margin-top:20px; font-size:1.2rem; color:#666;">لم تقم بإضافة منتجات للمفضلة بعد.</p>
                    <a href="index.html" class="btn primary" style="margin-top:20px; display:inline-block; text-decoration:none;">تصفح المنتجات</a>
                </div>
            `;
        } else {
            // الفلترة: نجيب تفاصيل المنتجات اللي الـ ID بتاعها موجود في المفضلة
            // بنعمل Loop على المنتجات الأصلية (عشان نضمن إن السعر والمخزون محدثين)
            // ونشوف هل المنتج ده موجود في قائمة الـ wishlist ولا لأ
            
            let foundProducts = merchantProducts.filter(p => wishlist.some(w => w.id == p.id));

            foundProducts.forEach(product => {
                
                // (نفس كود رسم الكارت بالظبط عشان الشكل يبقى واحد)
                // بس هنخلي زرار القلب واخد كلاس active
                
                // حساب الخصم
                let discountBadge = '';
                if (product.oldPrice > product.price) {
                    let discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
                    discountBadge = `<div class="flash-badge"><i class="fas fa-star"></i> خصم ${discount}%</div>`;
                }

                // المخزون
                let isOutOfStock = product.stock <= 0;
                let stockClass = isOutOfStock ? 'low' : (product.stock < 10 ? 'low' : '');
                let stockText = isOutOfStock ? 'نفذت الكمية' : `متاح: ${product.stock}`;
                
                // الأزرار
                let actionArea = '';
                if (isOutOfStock) {
                    actionArea = `<button class="btn notify-btn" style="width:100%; margin-top:10px; background:#ff9800; border:none; color:white; padding:10px; border-radius:5px;"><i class="fas fa-bell"></i> أعلمني</button>`;
                } else {
                    actionArea = `
                        <div class="card-actions" style="display:flex; gap:10px; margin-top:10px;">
                            <div class="qty-control-card" style="display:flex; border:1px solid #ddd; border-radius:5px;">
                                <button class="card-minus" style="border:none; background:#eee; width:30px;">-</button>
                                <input type="number" value="1" min="1" max="${product.stock}" readonly style="width:40px; text-align:center; border:none;">
                                <button class="card-plus" style="border:none; background:#eee; width:30px;">+</button>
                            </div>
                            <button class="add-btn" style="flex:1; border:none; background:var(--primary); color:#fff; border-radius:5px;">أضف <i class="fas fa-cart-plus"></i></button>
                        </div>
                    `;
                }

                const productHTML = `
                    <div class="product-card merchant-product" data-id="${product.id}" data-stock="${product.stock}">
                        <!-- زر القلب واخد active عشان ينور أحمر -->
                        <button class="fav-btn active"><i class="fas fa-heart"></i></button>
                        ${discountBadge}
                        <div class="product-img"><img src="${product.image}" alt="${product.name}"></div>
                        <div class="product-info">
                            <h4>${product.name}</h4>
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
                
                wishlistContainer.insertAdjacentHTML('afterbegin', productHTML);
            });
        }
    }
// =========================================
    // 6. تشغيل القائمة الجانبية (Mobile Menu Fix)
    // =========================================
    const openMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.menu-overlay');

    // فتح القائمة
    if (openMenuBtn) {
        openMenuBtn.addEventListener('click', (e) => {
            e.preventDefault(); // منع أي سلوك افتراضي
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    // إغلاق القائمة (عند الضغط على X أو الخلفية)
    const closeMenu = () => {
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    };

    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
});
