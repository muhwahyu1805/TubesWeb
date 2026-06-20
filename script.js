// --- DATA & STATE MANAGEMENT ---
let users = JSON.parse(localStorage.getItem('kas_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('kas_currentUser')) || null;
let allTransactions = []; 
let allInstallments = JSON.parse(localStorage.getItem('kas_installments')) || []; 

const categories = {
    pemasukan: ['Gaji', 'Bonus', 'Hasil Penjualan', 'Investasi', 'Lainnya'],
    pengeluaran: ['Makanan & Minuman', 'Transportasi', 'Tagihan & Utilitas', 'Belanja', 'Hiburan', 'Kesehatan', 'Cicilan Barang', 'Utang', 'Lainnya']
};

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const settingsScreen = document.getElementById('settings-screen');
const deleteModal = document.getElementById('delete-modal');
const transactionModal = document.getElementById('transaction-modal');

const txType = document.getElementById('tx-type');
const txCategory = document.getElementById('tx-category');
const isCicilanCheckbox = document.getElementById('is-cicilan');
const cicilanDurationGroup = document.getElementById('cicilan-duration-group');
const labelAmount = document.getElementById('label-amount');

// FITUR TOAST NOTIFICATION
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    toast.className = toast.className + " show";
    setTimeout(function(){ 
        toast.className = toast.className.replace("show", ""); 
    }, 3000);
}

// AUTO FORMAT TITIK RUPIAH SAAT MENGETIK
const amountInput = document.getElementById('tx-amount');
amountInput.addEventListener('keyup', function(e) {
    this.value = formatRupiahInput(this.value);
});

function formatRupiahInput(angka) {
    let number_string = angka.replace(/[^,\d]/g, '').toString(),
    split   = number_string.split(','),
    sisa    = split[0].length % 3,
    rupiah  = split[0].substr(0, sisa),
    ribuan  = split[0].substr(sisa).match(/\d{3}/gi);

    if(ribuan){
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }
    return rupiah;
}

window.onload = () => {
    if (currentUser) {
        showApp();
    } else {
        authScreen.classList.add('active-screen');
    }
};

// --- NAVIGASI HALAMAN & MODAL ---
function switchScreen(screenToShow) {
    authScreen.classList.remove('active-screen');
    appScreen.classList.remove('active-screen');
    settingsScreen.classList.remove('active-screen');
    screenToShow.classList.add('active-screen');
}

function openSettings() {
    document.getElementById('settings-email').value = currentUser.email;
    document.getElementById('settings-old-password').value = '';
    document.getElementById('settings-new-password').value = '';
    switchScreen(settingsScreen);
}

function closeSettings() {
    switchScreen(appScreen);
}

// FUNGSI PENGONTROL MODAL TRANSAKSI BARU
function openTransactionModal(menuType) {
    const modalTitle = document.getElementById('modal-title');
    document.getElementById('transactionForm').reset();
    document.getElementById('tx-date').valueAsDate = new Date();
    
    if (menuType === 'pemasukan') {
        txType.value = 'pemasukan';
        isCicilanCheckbox.checked = false;
        modalTitle.innerText = 'Tambah Pemasukan 💰';
        modalTitle.style.color = 'var(--success)';
    } else if (menuType === 'pengeluaran') {
        txType.value = 'pengeluaran';
        isCicilanCheckbox.checked = false;
        modalTitle.innerText = 'Tambah Pengeluaran 💸';
        modalTitle.style.color = 'var(--danger)';
    } else if (menuType === 'cicilan') {
        txType.value = 'pengeluaran';
        isCicilanCheckbox.checked = true;
        modalTitle.innerText = 'Tambah Cicilan Bulanan 🗓️';
        modalTitle.style.color = 'var(--warning)';
    }
    
    handleTypeChange();
    toggleCicilanFields();
    transactionModal.classList.add('show');
}

function closeTransactionModal() {
    transactionModal.classList.remove('show');
}

// --- SISTEM PENGATURAN AKUN ---
function updatePassword() {
    const oldPassword = document.getElementById('settings-old-password').value;
    const newPassword = document.getElementById('settings-new-password').value;
    
    if(oldPassword === '' || newPassword.trim() === '') {
        showToast('Semua kolom password harus diisi!', true);
        return;
    }

    if(oldPassword !== currentUser.password) {
        showToast('Password lama yang Anda masukkan salah!', true);
        return;
    }

    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if(userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('kas_users', JSON.stringify(users));
        currentUser.password = newPassword;
        localStorage.setItem('kas_currentUser', JSON.stringify(currentUser));
        showToast('Password berhasil diperbarui!');
        document.getElementById('settings-old-password').value = '';
        document.getElementById('settings-new-password').value = '';
    }
}

function promptDeleteAccount(e) {
    e.preventDefault();
    document.getElementById('delete-confirm-password').value = '';
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
}

function confirmDeleteAccount() {
    const confirmPass = document.getElementById('delete-confirm-password').value;

    if (confirmPass !== currentUser.password) {
        showToast('Password salah! Gagal menghapus akun.', true);
        return;
    }

    users = users.filter(u => u.email !== currentUser.email);
    localStorage.setItem('kas_users', JSON.stringify(users));
    allInstallments = allInstallments.filter(inst => inst.userEmail !== currentUser.email);
    localStorage.setItem('kas_installments', JSON.stringify(allInstallments));

    closeDeleteModal();
    showToast('Akun beserta datanya berhasil dihapus.');
    logout(new Event('click'));
}

// --- SISTEM AUTENTIKASI ---
function toggleAuth(type) {
    document.getElementById('login-form-container').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('register-form-container').style.display = type === 'register' ? 'block' : 'none';
}

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if(users.some(u => u.email === email)) {
        showToast('Email sudah terdaftar!', true);
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem('kas_users', JSON.stringify(users));
    showToast('Registrasi berhasil! Silakan login.');
    document.getElementById('registerForm').reset();
    toggleAuth('login');
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if(user) {
        currentUser = user;
        localStorage.setItem('kas_currentUser', JSON.stringify(currentUser));
        document.getElementById('loginForm').reset();
        showApp();
        showToast('Berhasil masuk!');
    } else {
        showToast('Email atau Password salah!', true);
    }
});

function logout(e) {
    if(e) e.preventDefault();
    currentUser = null;
    localStorage.removeItem('kas_currentUser');
    switchScreen(authScreen);
    toggleAuth('login');
}

function showApp() {
    switchScreen(appScreen);
    document.getElementById('user-display').innerText = currentUser.name;
    document.getElementById('tx-date').valueAsDate = new Date(); 
    handleTypeChange();
    processInstallments();
    updateUI();
}

function handleTypeChange() {
    updateCategoryOptions();
    if (txType.value === 'pengeluaran') {
        txCategory.value = 'Cicilan Barang';
    }
}

function updateCategoryOptions() {
    const selectedType = txType.value;
    txCategory.innerHTML = ''; 
    categories[selectedType].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        txCategory.appendChild(option);
    });
}

function toggleCicilanFields() {
    if (isCicilanCheckbox.checked) {
        cicilanDurationGroup.style.display = 'block';
        labelAmount.innerText = 'Jumlah per Bulan (Rp)';
        document.getElementById('btn-submit').innerText = 'Simpan Cicilan';
        document.getElementById('tx-tenor').required = true;
    } else {
        cicilanDurationGroup.style.display = 'none';
        labelAmount.innerText = 'Jumlah (Rp)';
        document.getElementById('btn-submit').innerText = 'Simpan Transaksi';
        document.getElementById('tx-tenor').required = false;
        document.getElementById('tx-tenor').value = '';
    }
}

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// --- SUBMIT TRANSAKSI / CICILAN KE DATABASE ---
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const isCicilan = isCicilanCheckbox.checked;
    const rawAmount = document.getElementById('tx-amount').value.replace(/\./g, '');
    const amount = parseInt(rawAmount) || 0;
    const dateStr = document.getElementById('tx-date').value;
    const desc = document.getElementById('tx-desc').value;

    if (isCicilan) {
        const tenor = parseInt(document.getElementById('tx-tenor').value) || 0;
        
        if (tenor <= 0) {
            showToast('Gagal: Lama cicilan (Bulan) harus diisi lebih dari 0!', true);
            return; 
        }

        const startDate = new Date(dateStr);
        startDate.setMonth(startDate.getMonth() + 1); 
        
        const nextDueDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

        const installment = {
            id: Math.floor(Math.random() * 100000000),
            userEmail: currentUser.email,
            desc: desc,
            category: txCategory.value,
            amountPerMonth: amount,
            totalMonths: tenor,
            monthsPaid: 0,
            nextDueDate: nextDueDateStr
        };
        
        allInstallments.push(installment);
        localStorage.setItem('kas_installments', JSON.stringify(allInstallments));
        
        showToast('Cicilan dicatat! Potongan pertama berjalan bulan depan.');
        document.getElementById('transactionForm').reset();
        closeTransactionModal();
        
        processInstallments(); 
        updateUI(); 

    } else {
        const payload = {
            userEmail: currentUser.email,
            type: txType.value,
            category: txCategory.value,
            Keterangan: desc,
            amount: amount,
            Tanggal: dateStr
        };

        try {
            const response = await fetch('simpan_transaksi.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        
            const result = await response.text();

            if (result.includes("Sukses")) {
                showToast('Transaksi berhasil disimpan!');
                document.getElementById('transactionForm').reset();
                closeTransactionModal();
                updateUI(); 
            } else {
                showToast('Gagal menyimpan: ' + result, true);
            }
        } catch (error) {
            showToast('Error koneksi ke server!', true);
        }
    }
});

// --- MESIN CICILAN OLEH CLIENT ---
async function processInstallments() {
    let modified = false;
    const today = new Date();
    today.setHours(0,0,0,0); 

    for (let inst of allInstallments) {
        if (inst.userEmail !== currentUser.email) continue;

        let nextDue = new Date(inst.nextDueDate);
        nextDue.setHours(0,0,0,0);

        while (nextDue <= today && inst.monthsPaid < inst.totalMonths) {
            inst.monthsPaid++;
            
            const payload = {
                userEmail: currentUser.email,
                type: 'pengeluaran',
                category: inst.category,
                Keterangan: `Cicilan: ${inst.desc} (Bulan ${inst.monthsPaid}/${inst.totalMonths})`,
                amount: inst.amountPerMonth,
                Tanggal: `${nextDue.getFullYear()}-${String(nextDue.getMonth() + 1).padStart(2, '0')}-${String(nextDue.getDate()).padStart(2, '0')}`
            };
            
            try {
                await fetch('simpan_transaksi.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.error(err);
            }
            
            nextDue.setMonth(nextDue.getMonth() + 1);
            inst.nextDueDate = `${nextDue.getFullYear()}-${String(nextDue.getMonth() + 1).padStart(2, '0')}-${String(nextDue.getDate()).padStart(2, '0')}`;
            modified = true;
        }
    }

    if (modified) {
        localStorage.setItem('kas_installments', JSON.stringify(allInstallments));
        updateUI();
    }
}

// --- MENGHAPUS TRANSAKSI ---
async function deleteTransaction(id) {
    if(confirm('Hapus transaksi ini dari database? (Aksi ini tidak bisa dibatalkan)')) {
        try {
            const response = await fetch('hapus_transaksi.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            const result = await response.text();

            if (result.includes("Sukses")) {
                showToast('Transaksi berhasil dihapus!');
                updateUI(); 
            } else {
                showToast('Gagal menghapus: ' + result, true);
            }
        } catch (error) {
            showToast('Error koneksi ke server saat menghapus!', true);
        }
    }
}

function stopInstallment(id) {
    if(confirm('Hentikan sistem cicilan ini? (Transaksi yang sudah terpotong tidak akan dihapus)')) {
        allInstallments = allInstallments.filter(inst => inst.id !== id);
        localStorage.setItem('kas_installments', JSON.stringify(allInstallments));
        updateUI();
        showToast('Cicilan dihentikan', true);
    }
}

// --- UPDATE TAMPILAN DASHBOARD & LIST ---
async function updateUI() {
    if (!currentUser) return;

    try {
        const response = await fetch(`get_transaksi.php?email=${encodeURIComponent(currentUser.email)}`);
        const textResponse = await response.text(); 
        
        let fetchedData;
        try {
            fetchedData = JSON.parse(textResponse); 
        } catch (e) {
            console.error("Gagal membaca JSON. Respons dari server:", textResponse);
            return; 
        }

        if (fetchedData.error_sql) {
            console.error("Error MySQL:", fetchedData.error_sql);
            return;
        }

        allTransactions = Array.isArray(fetchedData) ? fetchedData : [];
        
        const listContainer = document.getElementById('transaction-list');
        listContainer.innerHTML = '';
        let totalIncome = 0;
        let totalExpense = 0;

        allTransactions.forEach(tx => {
            const txAmount = parseInt(tx.amount) || 0;
            if (tx.type === 'pemasukan') totalIncome += txAmount;
            else totalExpense += txAmount;

            const isIncome = tx.type === 'pemasukan';
            const sign = isIncome ? '+' : '-';
            const colorClass = isIncome ? 'text-success' : 'text-danger';

            const item = document.createElement('div');
            item.classList.add('transaction-item');
            
            // Menggunakan pengaman pencocokan huruf besar-kecil nama kolom database Anda
            item.innerHTML = `
                <div class="tx-info">
                    <span class="tx-title">${tx.keterangan || tx.Keterangan}</span>
                    <span class="tx-date-cat">${tx.Tanggal || tx.tanggal} • ${tx.category}</span>
                </div>
                <div class="tx-actions">
                    <span class="tx-amount ${colorClass}">${sign} ${formatRupiah(txAmount)}</span>
                    <button onclick="deleteTransaction(${tx.id})" class="btn btn-danger">X</button>
                </div>
            `;
            listContainer.appendChild(item);
        });

        if(allTransactions.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color:#6b7280; font-size: 14px; margin-top:20px;">Belum ada riwayat transaksi.</p>';
        }

        const instContainer = document.getElementById('installment-list');
        instContainer.innerHTML = '';
        
        const userInstallments = allInstallments.filter(inst => inst.userEmail === currentUser.email && inst.monthsPaid < inst.totalMonths);

        userInstallments.forEach(inst => {
            const item = document.createElement('div');
            item.classList.add('transaction-item');
            item.innerHTML = `
                <div class="tx-info">
                    <span class="tx-title">${inst.desc}</span>
                    <span class="tx-date-cat">Sisa: ${inst.totalMonths - inst.monthsPaid} Bulan • Potongan: ${formatRupiah(inst.amountPerMonth)}</span>
                </div>
                <div class="tx-actions">
                    <span class="tx-amount" style="font-size:12px; color:var(--text-light); margin-right:10px;">Jatuh Tempo:<br>${inst.nextDueDate}</span>
                    <button onclick="stopInstallment(${inst.id})" class="btn btn-warning" title="Hentikan Cicilan">Stop</button>
                </div>
            `;
            instContainer.appendChild(item);
        });

        if(userInstallments.length === 0) {
            instContainer.innerHTML = '<p style="text-align:center; color:#6b7280; font-size: 14px; margin-top:20px;">Tidak ada cicilan aktif.</p>';
        }

        const balance = totalIncome - totalExpense;
        const balanceEl = document.getElementById('total-balance');
        balanceEl.innerText = formatRupiah(balance);
        if(balance < 0) balanceEl.style.color = 'var(--danger)';
        else balanceEl.style.color = 'var(--text)';

        document.getElementById('total-income').innerText = formatRupiah(totalIncome);
        document.getElementById('total-expense').innerText = formatRupiah(totalExpense);

    } catch (error) {
        console.error(error);
    }
}