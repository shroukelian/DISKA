document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. تعريف وإعداد السلة (Local Storage)
    // =========================================
    let cart = JSON.parse(localStorage.getItem('DISKA_CART')) || [];

    const updateCartCount = () => {
        const badges = document.querySelectorAll('.cart-icon .badge');
        badges.forEach(badge => badge.innerText = cart.length);
    };

    const saveCart = () => {
        localStorage.setItem('DISKA_CART', JSON.stringify(cart));
        updateCartCount();
    };

    // تحديث العداد عند تحميل الصفحة
    updateCartCount();


    // =========================================
    // 2. كود إضافة منتج للسلة (في الصفحة الرئيسية أو المنتج)
    // =========================================
    // =========================================
    // 2. كود إضافة منتج للسلة (مصحح 100%)
    // =========================================
    const addToCartBtns = document.querySelectorAll('.add-btn, .add-big-btn');

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 1. تحديد الكارت الأب للزرار اللي اتداس عليه
            const card = e.target.closest('.product-card') || e.target.closest('.details-info');
            
            if(!card) return;

            // 2. استخراج البيانات من "داخل الكارت فقط" (card.querySelector) مش الصفحة كلها
            
            // الاسم: بندور على h4 (في الرئيسية) أو h1 (في صفحة المنتج)
            let titleElement = card.querySelector('h4') || card.querySelector('h1');
            let title = titleElement ? titleElement.innerText : 'منتج غير معروف';

            // السعر: بندور على الكلاس .current-price
            let priceElement = card.querySelector('.current-price');
            let priceText = priceElement ? priceElement.innerText : '0';
            let price = parseFloat(priceText.replace(/[^0-9.]/g, '')); // بناخد الأرقام بس

            // الصورة: بنجيب الصورة اللي جوه الكارت ده
            let imgElement = card.querySelector('img') || document.querySelector('.details-img img'); 
            // ملحوظة: في صفحة التفاصيل الصورة بتكون برا الـ info، عشان كدا حطينا الاختيار التاني
            let imgSrc = imgElement ? imgElement.src : '';

            // الكمية: لو فيه حقل إدخال بناخد منه، لو مفيش بنفترض 1
            let qtyInput = card.querySelector('input');
            let quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            if(quantity === 0) quantity = 1; // لو الكمية 0 خليها 1

            // 3. إنشاء كائن المنتج
            const product = {
                id: Date.now(), // رقم فريد عشان المنتجات متدخلش في بعض
                title: title,
                price: price,
                image: imgSrc,
                qty: quantity
            };

            // 4. التأكد هل المنتج موجود قبل كدا؟ لو اه زود الكمية بس
            const existingItemIndex = cart.findIndex(item => item.title === product.title);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].qty += quantity;
            } else {
                cart.push(product);
            }

            // 5. حفظ وتحديث
            saveCart();

            // تأثير بصري للزر
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> تم';
            btn.style.background = 'var(--success)';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 1000);
        });
    });

    // =========================================
    // 3. كود عرض المنتجات في صفحة السلة (cart.html)
    // =========================================
    const cartContainer = document.querySelector('.cart-items');
    const summaryTotal = document.querySelector('.summary-row.total span:last-child');
    const summarySubtotal = document.querySelector('.summary-row span:last-child'); // المجموع الفرعي

    if (cartContainer) {
        renderCart();
    }

    function renderCart() {
        cartContainer.innerHTML = ''; // تفريغ السلة الأول
        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; padding:20px;">السلة فارغة، ابدأ التسوق الآن!</p>';
        }

        cart.forEach((item, index) => {
            let itemTotal = item.price * item.qty;
            total += itemTotal;

            const cartItemHTML = `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="item-details">
                        <h4>${item.title}</h4>
                        <span class="price">${item.price} ج.م</span>
                    </div>
                    <div class="item-actions">
                        <div class="qty-control small">
                            <button class="minus">-</button>
                            <input type="number" value="${item.qty}" readonly>
                            <button class="plus">+</button>
                        </div>
                        <span class="total-item-price">${itemTotal.toFixed(2)} ج.م</span>
                        <button class="remove-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            cartContainer.innerHTML += cartItemHTML;
        });

        // تحديث الفاتورة
        if(summarySubtotal) summarySubtotal.innerText = total.toFixed(2) + ' ج.م';
        
        let tax = total * 0.14; // ضريبة 14%
        let finalTotal = total + tax;
        
        if(summaryTotal) summaryTotal.innerText = finalTotal.toFixed(2) + ' ج.م';

        // إعادة تفعيل أزرار السلة (بعد ما رسمنا العناصر)
        activateCartButtons();
    }

    function activateCartButtons() {
        // زر الحذف
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.cart-item').dataset.index;
                cart.splice(index, 1); // حذف من المصفوفة
                saveCart(); // حفظ
                renderCart(); // إعادة رسم
            });
        });

        // زر الزيادة
        document.querySelectorAll('.cart-item .plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.cart-item').dataset.index;
                cart[index].qty++;
                saveCart();
                renderCart();
            });
        });

        // زر النقصان
        document.querySelectorAll('.cart-item .minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.cart-item').dataset.index;
                if (cart[index].qty > 1) {
                    cart[index].qty--;
                    saveCart();
                    renderCart();
                }
            });
        });
    }


    // =========================================
    // 4. القائمة الجانبية (Mobile Menu)
    // =========================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.mobile-sidebar');
    const closeBtn = document.querySelector('.close-menu');
    const overlay = document.querySelector('.menu-overlay');

    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    const closeMenu = () => {
        if(sidebar) sidebar.classList.remove('active');
        if(overlay) overlay.classList.remove('active');
    };

    if(closeBtn) closeBtn.addEventListener('click', closeMenu);
    if(overlay) overlay.addEventListener('click', closeMenu);

});
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. منطق صفحة التاجر (رفع المنتج) ---
    const productForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');

    // عرض الصورة قبل الرفع
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

    // حفظ المنتج عند الضغط على "نشر"
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const file = imageInput.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                // تجميع بيانات المنتج
                const newProduct = {
                    id: Date.now(),
                    name: document.getElementById('productName').value,
                    price: document.getElementById('productPrice').value,
                    oldPrice: document.getElementById('oldPrice').value || '',
                    desc: document.getElementById('productDesc').value,
                    category: document.getElementById('productCat').value,
                    image: e.target.result // الصورة ككود Base64
                };

                // الحفظ في LocalStorage
                let products = JSON.parse(localStorage.getItem('DISKA_MERCHANT_PRODUCTS')) || [];
                products.push(newProduct);
                localStorage.setItem('DISKA_MERCHANT_PRODUCTS', JSON.stringify(products));

                alert('تم نشر المنتج بنجاح! سيظهر الآن للمشترين.');
                window.location.href = 'index.html'; // الذهاب للرئيسية
            };

            if (file) {
                reader.readAsDataURL(file);
            } else {
                alert('يرجى اختيار صورة للمنتج');
            }
        });
    }


    // --- 2. منطق الصفحة الرئيسية (عرض المنتجات المضافة) ---
    const productsGrid = document.querySelector('.products-grid');
    
    // تأكد إننا في صفحة فيها عرض منتجات
    if (productsGrid) {
        let storedProducts = JSON.parse(localStorage.getItem('DISKA_MERCHANT_PRODUCTS')) || [];

        // عرض المنتجات الجديدة في الأول
        storedProducts.reverse().forEach(product => {
            // حساب نسبة الخصم لو وجد
            let discountBadge = '';
            if (product.oldPrice && product.oldPrice > product.price) {
                let discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
                discountBadge = `<div class="badges"><span class="discount-badge">خصم ${discount}%</span></div>`;
            }

            const productHTML = `
                <div class="product-card merchant-product">
                    ${discountBadge}
                    <div class="product-img">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p style="font-size:0.8rem; color:#666; height:30px; overflow:hidden;">${product.desc}</p>
                        <div class="pricing">
                            <span class="current-price">${product.price} ج.م</span>
                            ${product.oldPrice ? `<span class="old-price">${product.oldPrice} ج.م</span>` : ''}
                        </div>
                        <div class="add-to-cart">
                            <button class="add-btn">أضف للسلة <i class="fas fa-cart-plus"></i></button>
                        </div>
                    </div>
                </div>
            `;
            
            // إضافة المنتج في بداية الشبكة
            productsGrid.insertAdjacentHTML('afterbegin', productHTML);
        });
    }

    // ... (باقي كود السلة والعداد القديم يظل كما هو بالأسفل) ...
    // ... (تأكد من نسخ باقي كود السلة من الردود السابقة هنا) ...
    
    // --- كود السلة القديم (مختصر للتذكير) ---
    let cart = JSON.parse(localStorage.getItem('DISKA_CART')) || [];
    const updateCartCount = () => {
        document.querySelectorAll('.badge').forEach(b => b.innerText = cart.length);
    };
    updateCartCount();

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-btn')) {
            const card = e.target.closest('.product-card');
            const title = card.querySelector('h4').innerText;
            const price = parseFloat(card.querySelector('.current-price').innerText);
            const img = card.querySelector('img').src;
            
            cart.push({ title, price, image: img, qty: 1 });
            localStorage.setItem('DISKA_CART', JSON.stringify(cart));
            updateCartCount();
            
            const btn = e.target;
            btn.innerHTML = 'تم';
            btn.style.background = 'green';
            setTimeout(() => { btn.innerHTML = 'أضف للسلة'; btn.style.background = ''; }, 1000);
        }
    });
});