// بيانات المحافظات والمناطق (Database مصغرة)
const egyptData = {
    "القاهرة": ["مدينة نصر", "مصر الجديدة", "التجمع الخامس", "المعادي", "وسط البلد", "شبرا", "عين شمس", "المرج", "حلوان"],
    "الجيزة": ["الدقي", "المهندسين", "الهرم", "فيصل", "6 أكتوبر", "الشيخ زايد", "إمبابة", "الوراق"],
    "الإسكندرية": ["سموحة", "ميامي", "المنتزه", "محطة الرمل", "العجمي", "سيدي جابر"],
    "القليوبية": ["بنها", "شبرا الخيمة", "قليوب", "طوخ"],
    "الدقهلية": ["المنصورة", "ميت غمر", "السنبلاوين"],
    "الشرقية": ["الزقازيق", "العشر من رمضان", "منيا القمح"],
    "الغربية": ["طنطا", "المحلة الكبرى"],
    "المنوفية": ["شبين الكوم", "منوف"],
    // يمكن إضافة باقي المحافظات
};

document.addEventListener('DOMContentLoaded', () => {
    
    const govSelect = document.getElementById('govSelect');
    const citySelect = document.getElementById('citySelect');
    const shippingDisplay = document.getElementById('shippingCost');
    const totalDisplay = document.getElementById('finalTotal');
    const subTotalDisplay = document.getElementById('subTotal');
    const itemsList = document.getElementById('checkoutItemsList');

    // 1. ملء قائمة المحافظات
    for (let gov in egyptData) {
        let option = document.createElement('option');
        option.value = gov;
        option.innerText = gov;
        govSelect.appendChild(option);
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
        shippingDisplay.innerText = shippingFees + " ج.م";
        updateTotal(shippingFees);
    };

    // 3. جلب المنتجات من LocalStorage وعرضها
    let cart = JSON.parse(localStorage.getItem('DISKA_CART')) || [];
    let subTotal = 0;

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

    subTotalDisplay.innerText = subTotal.toFixed(2) + " ج.م";

    // دالة تحديث الإجمالي النهائي
    function updateTotal(shipping) {
        let final = subTotal + shipping;
        totalDisplay.innerText = final.toFixed(2) + " ج.م";
    }

});