document.addEventListener('DOMContentLoaded', () => {
    // 1. تعريف رابط الواجهة الخلفية (Backend API)
    const API_BASE_URL = 'https://mini-app-pubg-backend-3r6c.vercel.app';
    const ADMIN_USER_ID = '658500340';

    // 2. تعريف العناصر الرئيسية في الواجهة
    const initialView = document.getElementById('initial-choice-view');
    const proView = document.getElementById('pro-sensitivities-view');
    const beginnerView = document.getElementById('beginner-sensitivities-view');
    const proButtonsContainer = document.getElementById('pro-buttons-container');
    const beginnerButtonsContainer = document.getElementById('beginner-buttons-container');
    const displayContainer = document.getElementById('display-container');
    const codeOutput = document.getElementById('code-output');
    const displayImage = document.getElementById('display-image');
    
    // عناصر لوحة التحكم
    const adminPanel = document.getElementById('admin-panel');
    const openAdminBtn = document.getElementById('open-admin-btn');
    const goBackBtn = document.getElementById('go-back-btn');
    const addSensitivityForm = document.getElementById('add-sensitivity-form');
    const adminNameInput = document.getElementById('admin-name-input');
    const adminCodeInput = document.getElementById('admin-code-input');
    const adminImageInput = document.getElementById('admin-image-input');
    const adminTypeSelect = document.getElementById('admin-type-select');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const adminList = document.getElementById('admin-list');
    
    // أزرار الاختيار الأولي
    const proChoiceBtn = document.getElementById('pro-choice');
    const beginnerChoiceBtn = document.getElementById('beginner-choice');
    
    let editingId = null;
    
    const showView = (viewToShow) => {
        initialView.classList.add('hidden');
        proView.classList.add('hidden');
        beginnerView.classList.add('hidden');
        displayContainer.classList.add('hidden');
        adminPanel.classList.add('hidden');
        
        viewToShow.classList.remove('hidden');
    };

    const createSensitivityButtons = (data, container) => {
        container.innerHTML = '';
        data.forEach(item => {
            const button = document.createElement('button');
            button.classList.add('sensitivity-btn');
            button.textContent = item.name;
            button.setAttribute('data-sensitivity-code', item.code);
            button.setAttribute('data-image-url', item.imageUrl);
            
            button.addEventListener('click', () => {
                handleSensitivityClick(button);
            });
            
            container.appendChild(button);
        });
    };
    
    const handleSensitivityClick = (button) => {
        const sensitivityCode = button.getAttribute('data-sensitivity-code');
        const imageUrl = button.getAttribute('data-image-url');

        displayContainer.classList.remove('hidden');

        codeOutput.textContent = sensitivityCode;
        displayImage.src = imageUrl;
        displayImage.style.display = 'block';

        const copyBtn = document.getElementById('copy-code-btn');
        if (copyBtn) {
            copyBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(sensitivityCode);
                    Telegram.WebApp.showAlert('تم نسخ الكود بنجاح!');
                } catch (err) {
                    Telegram.WebApp.showAlert('حدث خطأ أثناء نسخ الكود.');
                }
            };
        }
    };
    
    // **دالة الاتصال بالواجهة الخلفية (تم تعديلها)**
    const fetchSensitivities = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/sensitivities`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // استلام جميع الحساسيات في قائمة واحدة
            const allSensitivities = await response.json();
            
            // فلترة (تقسيم) الحساسيات إلى مجموعتي "محترف" و "مبتدئ"
            const proSensitivities = allSensitivities.filter(item => item.type === 'pro');
            const beginnerSensitivities = allSensitivities.filter(item => item.type === 'beginner');

            // إنشاء الأزرار لكل مجموعة
            createSensitivityButtons(proSensitivities, proButtonsContainer);
            createSensitivityButtons(beginnerSensitivities, beginnerButtonsContainer);
            
            // عرض القائمة في لوحة التحكم
            renderAdminList(allSensitivities);
            
        } catch (error) {
            console.error('Failed to fetch sensitivities:', error);
            alert('فشل في جلب البيانات من الواجهة الخلفية.');
        }
    };
    
    const addSensitivity = async (newSensitivity) => {
        try {
            await fetch(`${API_BASE_URL}/api/sensitivities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSensitivity)
            });
            await fetchSensitivities();
            alert('تم إضافة الحساسية بنجاح!');
        } catch (error) {
            console.error('Failed to add sensitivity:', error);
            alert('فشل في إضافة الحساسية.');
        }
    };
    
    const updateSensitivity = async (id, updatedSensitivity) => {
        try {
            await fetch(`${API_BASE_URL}/api/sensitivities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSensitivity)
            });
            await fetchSensitivities();
            alert('تم تعديل الحساسية بنجاح!');
        } catch (error) {
            console.error('Failed to update sensitivity:', error);
            alert('فشل في تعديل الحساسية.');
        }
    };

    const deleteSensitivity = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/sensitivities/${id}`, {
                method: 'DELETE'
            });
            await fetchSensitivities();
            alert('تم حذف الحساسية بنجاح!');
        } catch (error) {
            console.error('Failed to delete sensitivity:', error);
            alert('فشل في حذف الحساسية.');
        }
    };

    // **دالة عرض قائمة التحكم (تم تعديلها)**
    const renderAdminList = (allSensitivities) => {
        adminList.innerHTML = '';
        allSensitivities.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('admin-list-item');
            
            itemDiv.innerHTML = `
                <span>${item.name} (${item.type})</span>
                <div class="admin-actions">
                    <button class="edit-btn" data-id="${item.id}">تعديل</button>
                    <button class="delete-btn" data-id="${item.id}">حذف</button>
                </div>
            `;
            adminList.appendChild(itemDiv);
        });
    };

    const resetForm = () => {
        addSensitivityForm.reset();
        formSubmitBtn.textContent = 'إضافة';
        editingId = null;
    };

    // **إدارة لوحة التحكم**
    openAdminBtn.addEventListener('click', () => {
        showView(adminPanel);
    });

    goBackBtn.addEventListener('click', () => {
        showView(initialView);
    });

    addSensitivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = adminTypeSelect.value;
        const newOrUpdatedSensitivity = {
            name: adminNameInput.value,
            code: adminCodeInput.value,
            imageUrl: adminImageInput.value,
            type: type
        };

        if (editingId) {
            await updateSensitivity(editingId, newOrUpdatedSensitivity);
        } else {
            await addSensitivity(newOrUpdatedSensitivity);
        }
        
        resetForm();
    });
    
    // **التعامل مع أزرار التعديل والحذف**
    adminList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.getAttribute('data-id');

        if (target.classList.contains('edit-btn')) {
            const response = await fetch(`${API_BASE_URL}/api/sensitivities`);
            const allSensitivities = await response.json();
            const itemToEdit = allSensitivities.find(item => item.id === id);
            
            if (itemToEdit) {
                adminNameInput.value = itemToEdit.name;
                adminCodeInput.value = itemToEdit.code;
                adminImageInput.value = itemToEdit.imageUrl;
                adminTypeSelect.value = itemToEdit.type;
                
                formSubmitBtn.textContent = 'تعديل';
                editingId = id;
            }
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('هل أنت متأكد من حذف هذه الحساسية؟')) {
                await deleteSensitivity(id);
            }
        }
    });

    // **إدارة واجهة التليجرام**
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        const currentUser = window.Telegram.WebApp.initDataUnsafe.user;
        const openAdminBtn = document.getElementById('open-admin-btn');
        
        if (openAdminBtn && currentUser.id != ADMIN_USER_ID) {
            openAdminBtn.style.display = 'none';
        }
    }

    // جلب وعرض البيانات عند تحميل الصفحة لأول مرة
    fetchSensitivities();

    // 6. ربط الأحداث بأزرار الواجهة الرئيسية
    proChoiceBtn.addEventListener('click', () => {
        showView(proView);
    });

    beginnerChoiceBtn.addEventListener('click', () => {
        showView(beginnerView);
    });
});

// الكود الخاص بالزر الجديد في الصفحة الرئيسية (تم حذفه لأنك لا تريده)
// الكود الخاص بصفحة تحليل الأداء الجديدة (تم حذفه لأنك لا تريده)