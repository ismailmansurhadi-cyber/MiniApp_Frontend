// API URL للواجهة الخلفية (Backend)
const API_URL = 'https://mini-app-pubg-backend-3r6c.vercel.app//api/sensitivities';

// دالة لجلب الحساسيات وعرضها
async function fetchSensitivities() {
    try {
        const response = await fetch(API_URL);
        const sensitivities = await response.json();
        
        // هنا يجب استبدال YOUR_OWNER_ID بمعرّف المستخدم الخاص بك في تيليجرام
        const isOwner = Telegram.WebApp.initDataUnsafe.user.id == '658500340';
        
        if (isOwner) {
            document.getElementById('main-view').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            renderAdminList(sensitivities);
        } else {
            document.getElementById('admin-panel').style.display = 'none';
            document.getElementById('main-view').style.display = 'block';
            renderSensitivityList(sensitivities);
        }
    } catch (error) {
        console.error('Failed to fetch sensitivities:', error);
    }
}

// عرض الحساسيات للمستخدم العادي
function renderSensitivityList(sensitivities) {
    const list = document.getElementById('sensitivity-list');
    list.innerHTML = '';
    sensitivities.forEach(s => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${s.name}</h3>
            <p>${s.code}</p>
        `;
        list.appendChild(div);
    });
}

// عرض الحساسيات في لوحة التحكم
function renderAdminList(sensitivities) {
    const list = document.getElementById('admin-list');
    list.innerHTML = '';
    sensitivities.forEach(s => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${s.name}</h3>
            <p>${s.code}</p>
            <button onclick="deleteSensitivity(${s.id})">حذف</button>
        `;
        list.appendChild(div);
    });
}

// إضافة حساسية جديدة
document.getElementById('add-sensitivity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name-input').value;
    const code = document.getElementById('code-input').value;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code })
    });

    fetchSensitivities();
    document.getElementById('add-sensitivity-form').reset();
});

// حذف حساسية
async function deleteSensitivity(id) {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    fetchSensitivities();
}

// تهيئة التطبيق
Telegram.WebApp.ready();
fetchSensitivities();