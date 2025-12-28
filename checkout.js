// بيانات المحافظات والمناطق (Database كاملة)
const egyptData = {
    "القاهرة": ["مدينة نصر", "مصر الجديدة", "التجمع الخامس", "المعادي", "وسط البلد", "شبرا", "عين شمس", "المرج", "حلوان", "المقطم", "الرحاب", "مدينتي", "الشروق", "حدائق القبة"],
    "الجيزة": ["الدقي", "المهندسين", "الهرم", "فيصل", "6 أكتوبر", "الشيخ زايد", "إمبابة", "الوراق", "المنيب", "العجوزة", "أبو النمرس"],
    "الإسكندرية": ["سموحة", "ميامي", "المنتزه", "محطة الرمل", "العجمي", "سيدي جابر", "العصافرة", "لوران", "كامب شيزار", "برج العرب"],
    "القليوبية": ["بنها", "شبرا الخيمة", "قليوب", "طوخ", "القناطر الخيرية", "الخانكة", "العبور", "كفر شكر"],
    "الدقهلية": ["المنصورة", "ميت غمر", "السنبلاوين", "طلخا", "بلقاس", "دكرنس", "شربين", "أجا"],
    "الشرقية": ["الزقازيق", "العشر من رمضان", "منيا القمح", "بلبيس", "فاقوس", "أبو حماد", "ديرب نجم", "كفر صقر"],
    "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "بسيون", "قطور"],
    "المنوفية": ["شبين الكوم", "منوف", "أشمون", "قويسنا", "بركة السبع", "تلا", "الباجور", "الشهداء"],
    "البحيرة": ["دمنهور", "كفر الدوار", "إيتاي البارود", "رشيد", "كوم حمادة", "أبو حمص", "حوش عيسى", "الدلنجات"],
    "الإسماعيلية": ["الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "التل الكبير", "أبو صوير"],
    "السويس": ["السويس", "الأربعين", "الجناين", "عتاقة", "العين السخنة"],
    "بورسعيد": ["بورسعيد", "بورفؤاد", "حي الشرق", "حي الزهور", "حي العرب"],
    "دمياط": ["دمياط", "رأس البر", "فارسكور", "الزرقا", "دمياط الجديدة", "كفر سعد"],
    "كفر الشيخ": ["كفر الشيخ", "دسوق", "فوه", "مطوبس", "بلطيم", "سيدي سالم", "الحامول"],
    "مطروح": ["مرسى مطروح", "العلمين", "الضبعة", "سيوة", "الحمام", "مارينا"],
    "شمال سيناء": ["العريش", "الشيخ زويد", "رفح", "بئر العبد"],
    "جنوب سيناء": ["شرم الشيخ", "دهب", "نويبع", "طابا", "سانت كاترين", "الطور"],
    "البحر الأحمر": ["الغردقة", "سفاجا", "القصير", "مرسى علم", "رأس غارب", "الجونة"],
    "الفيوم": ["الفيوم", "إبشواي", "إطسا", "سنورس", "طامية", "يوسف الصديق"],
    "بني سويف": ["بني سويف", "الواسطى", "ناصر", "اهناسيا", "ببا", "الفشن", "سمسطا"],
    "المنيا": ["المنيا", "ملوي", "مغاغة", "بني مزار", "سمالوط", "أبو قرقاص", "ديرمواس"],
    "أسيوط": ["أسيوط", "ديروط", "القوصية", "أبنوب", "منفلوط", "أبو تيج", "صدفا", "الغنايم"],
    "سوهاج": ["سوهاج", "جرجا", "طمه", "طهطا", "المراغة", "أخميم", "المنشأة", "ساقلتة"],
    "قنا": ["قنا", "نجع حمادي", "قوص", "أبو تشت", "دشنا", "فرشوط", "قفط"],
    "الأقصر": ["الأقصر", "إسنا", "أرمنت", "القرنة", "طيبة"],
    "أسوان": ["أسوان", "كوم أمبو", "إدفو", "دراو", "نصر النوبة", "أبو سمبل"],
    "الوادي الجديد": ["الخارجة", "الداخلة", "الفرافرة"]
};

document.addEventListener('DOMContentLoaded', () => {
    
    const govSelect = document.getElementById('govSelect');
    const citySelect = document.getElementById('citySelect');
    const shippingDisplay = document.getElementById('shippingCost');
    const totalDisplay = document.getElementById('finalTotal');
    const subTotalDisplay = document.getElementById('subTotal');
    const itemsList = document.getElementById('checkoutItemsList');
    const checkoutForm = document.getElementById('checkoutForm'); // الفورم نفسه

    // 1. ملء قائمة المحافظات
    if (govSelect) {
        for (let gov in egyptData) {
            let option = document.createElement('option');
            option.value = gov;
            option.innerText = gov;
            govSelect.appendChild(option);
        }
    }

    // 2. تحديث المناطق وحساب الشحن عند تغيير المحافظة
    window.updateRegions = function() {
        const selectedGov = govSelect.value;
        const cities = egyptData[selectedGov];

        // تفريغ المناطق القديمة
        citySelect.innerHTML = '<option value="" disabled selected>اختر المنطقة</option>';
        
        if (cities) {
            cities.forEach(city => {
                let option = document.createElement('option');
                option.value = city;
                option.innerText = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
        }

        // حساب مصاريف الشحن
        let shippingFees = 0;
        if (selectedGov === "القاهرة" || selectedGov === "الجيزة") {
            shippingFees = 50;
        } else if (selectedGov === "الإسكندرية") {
            shippingFees = 75;
        } else {
            shippingFees = 100; // باقي المحافظات
        }

        // عرض الشحن وتحديث الإجمالي
        if(shippingDisplay) shippingDisplay.innerText = shippingFees + " ج.م";
        updateTotal(shippingFees);
    };

    // 3. جلب المنتجات من LocalStorage وعرضها
    let cart = JSON.parse(localStorage.getItem('DISKA_CART')) || [];
    let subTotal = 0;

    if (itemsList) {
        itemsList.innerHTML = '';
        
        if(cart.length === 0) {
            itemsList.innerHTML = '<p style="text-align:center">السلة فارغة</p>';
        } else {
            cart.forEach(item => {
                let itemTotal = item.price * item.qty;
                subTotal += itemTotal;

                itemsList.innerHTML += `
                    <div class="c-item">
                        <img src="${item.image}">
                        <div>
                            <h4>${item.title}</h4>
                            <small>العدد: ${item.qty}</small>
                        </div>
                        <span>${itemTotal.toFixed(2)} ج.م</span>
                    </div>
                `;
            });
        }
    }

    if(subTotalDisplay) subTotalDisplay.innerText = subTotal.toFixed(2) + " ج.م";

    // دالة تحديث الإجمالي النهائي
    function updateTotal(shipping) {
        let final = subTotal + shipping;
        if(totalDisplay) totalDisplay.innerText = final.toFixed(2) + " ج.م";
    }


    // =========================================================
    // 4. إتمام الطلب (التحقق + خصم المخزون + إنهاء الطلب)
    // =========================================================
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault(); // منع إعادة تحميل الصفحة

            // أ. التحقق من البيانات (المحافظة والمنطقة)
            // باقي الحقول بيتحقق منها الـ required في الـ HTML
            if (govSelect.value === "" || citySelect.value === "") {
                alert('يرجى اختيار المحافظة والمنطقة لحساب الشحن.');
                return;
            }

            if (cart.length === 0) {
                alert('السلة فارغة! لا يمكن إتمام الطلب.');
                return;
            }

            // ب. خصم الكميات من مخزون التاجر
            let merchantProducts = JSON.parse(localStorage.getItem('DISKA_MERCHANT_PRODUCTS')) || [];
            let stockUpdated = false;

            cart.forEach(cartItem => {
                // البحث عن المنتج في قائمة التاجر باستخدام الـ ID
                let productIndex = merchantProducts.findIndex(p => p.id == cartItem.id);
                
                if (productIndex > -1) {
                    // خصم الكمية
                    let newStock = merchantProducts[productIndex].stock - cartItem.qty;
                    // التأكد إنها متنزلش عن صفر
                    merchantProducts[productIndex].stock = newStock < 0 ? 0 : newStock;
                    stockUpdated = true;
                }
            });

            // ج. حفظ المخزون الجديد
            if (stockUpdated) {
                localStorage.setItem('DISKA_MERCHANT_PRODUCTS', JSON.stringify(merchantProducts));
            }

            // د. حفظ الطلب في سجل الطلبات (اختياري للعرض في البروفايل)
            // let orders = JSON.parse(localStorage.getItem('DISKA_ORDERS')) || [];
            // orders.push({ id: Date.now(), total: document.getElementById('finalTotal').innerText, date: new Date().toLocaleDateString() });
            // localStorage.setItem('DISKA_ORDERS', JSON.stringify(orders));

            // هـ. إنهاء العملية
            localStorage.removeItem('DISKA_CART'); // تفريغ السلة
            alert('تم تأكيد طلبك بنجاح! وتم خصم الكمية من المخزون.');
            window.location.href = 'index.html'; // العودة للرئيسية
        });
    }

});