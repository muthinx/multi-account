// src/app.js
const app = document.getElementById('app');

// Hide loading screen after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.visibility = 'hidden';
    }
    loadDashboard();
  }, 1000);
});

// Data akun disimpan di localStorage
let accounts = JSON.parse(localStorage.getItem('multiAccountContainerAccounts')) || [];

function render(layoutHtml) {
  app.innerHTML = layoutHtml;
  initThemeToggle();
}

function loadDashboard() {
  render(`
    <div class="app-shell">
      <nav class="top-nav">
        <div class="nav-left">
          <div class="nav-brand">
            <i class="fa-sharp fa-solid fa-address-book"></i>
            <h1><span>SC</span></h1>
          </div>
        </div>
        
        <div class="nav-center">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="account-search" placeholder="Cari akun...">
          </div>
        </div>
        
        <div class="nav-right">
          <button class="nav-btn theme-toggle-btn" id="dashboard-theme-toggle">
            <i class="fas fa-moon"></i>
          </button>
          <button class="btn btn-primary" id="add-account-btn">
            <i class="fas fa-plus"></i>
          </button>
          <div class="nav-dropdown">
            <button class="btn btn-secondary" id="sync-menu-btn">
              <i class="fas fa-sync-alt"></i> Sync
              <i class="fas fa-chevron-down" style="margin-left: 0.5rem;"></i>
            </button>
          </div>
          <div class="dropdown-menu" id="sync-menu">
              <button class="dropdown-item" id="export-btn">
                <i class="fas fa-file-export"></i> Export Data
              </button>
              <button class="dropdown-item" id="import-btn">
                <i class="fas fa-file-import"></i> Import Data
              </button>
              <button class="dropdown-item" id="clipboard-export-btn">
                <i class="fas fa-copy"></i> Copy to Clipboard
              </button>
              <button class="dropdown-item" id="clipboard-import-btn">
                <i class="fas fa-paste"></i> Paste from Clipboard
              </button>
            </div>
        </div>
      </nav>
      
      <div class="main-content">
        <!-- SIDEBAR -->
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-section">
            <h3><i class="fas fa-chart-pie"></i> Statistik</h3>
            <div class="sidebar-stats">
              <div class="stat-item">
                <span class="stat-label">Total Akun</span>
                <span class="stat-value" id="stat-total">${accounts.length}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Ditambahkan Hari Ini</span>
                <span class="stat-value" id="stat-today">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Aksi Terakhir</span>
                <span class="stat-value" id="stat-last">-</span>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h3><i class="fas fa-bolt"></i> Aksi Cepat</h3>
            <button class="sidebar-btn" id="add-account-btn">
              <i class="fas fa-plus"></i>
              Tambah Akun
            </button>
            <button class="sidebar-btn" id="random-account-btn">
              <i class="fas fa-random"></i> Buka Acak
            </button>
            <button class="sidebar-btn" id="quick-export-btn">
              <i class="fas fa-file-export"></i> Backup Sekarang
            </button>
            <button class="sidebar-btn" id="quick-paste-btn">
              <i class="fas fa-paste"></i> Paste Data
            </button>
          </div>

          <div class="sidebar-section">
            <h3><i class="fas fa-info-circle"></i> Info</h3>
            <div class="info-box">
              <p><i class="fas fa-database"></i> Data tersimpan: <span id="storage-size">${calculateStorageSize()} KB</span></p>
              <p><i class="fas fa-calendar"></i> Backup terakhir: <span id="last-backup">-</span></p>
              <p><i class="fas fa-sync-alt"></i> Auto-save: <span class="status-on">ON</span></p>
            </div>
          </div>
        </aside>
        
        <!-- MAIN CONTENT AREA -->
        <div class="content-area">
          <div class="page-header">
            <div>
              <h2>SessionCOD</h2>
              <p>Kelola dan akses akun-akun Anda dengan cepat</p>
            </div>
          </div>
          <div id="accounts-container" class="accounts-grid">
            <!-- Accounts will be loaded here -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal untuk Tambah/Edit Akun -->
    <div id="popup"></div>
    <div id="account-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modal-title">Tambah Akun Baru</h3>
          <button class="modal-close" id="modal-close">&times;</button>
        </div>
        <form id="account-form" class="modal-form">
          <div class="form-group">
            <label for="account-name">Nama Akun *</label>
            <input type="text" id="account-name" class="form-control" placeholder="Contoh: John Doe" required>
          </div>
          
          <div class="form-group">
            <label for="account-url">URL/Link *</label>
            <input type="url" id="account-url" class="form-control" placeholder="https://example.com" required>
          </div>
          
          <div class="form-group">
            <label for="account-avatar">Avatar URL (opsional)</label>
            <input type="url" id="account-avatar" class="form-control" placeholder="https://example.com/avatar.jpg">
            <small>Kosongkan untuk menggunakan avatar otomatis</small>
          </div>
          
          <div class="form-group">
            <label for="account-background">Background URL (opsional)</label>
            <input type="url" id="account-background" class="form-control" placeholder="https://example.com/background.jpg">
            <small>Kosongkan untuk gradient otomatis</small>
          </div>
          
          <div class="form-group">
            <label for="account-notes">Catatan (opsional)</label>
            <textarea id="account-notes" class="form-control" placeholder="Informasi tambahan..." rows="3"></textarea>
          </div>
          
          <!-- Preview Section -->
          <div class="preview-section" id="preview-section" style="display: none;">
            <h4>Preview Card:</h4>
            <div class="preview-card" id="preview-card">
              <div class="preview-card-header" id="preview-header"></div>
              <div class="preview-card-body">
                <h4 id="preview-name">Nama Akun</h4>
                <p id="preview-url">https://example.com</p>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="cancel-btn">Batal</button>
            <button type="submit" class="btn btn-primary" id="save-btn">Simpan Akun</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal untuk Import Data -->
    <div id="import-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Import Data Akun</h3>
          <button class="modal-close" id="import-modal-close">&times;</button>
        </div>
        <div class="modal-form">
          <div class="import-options">
            <h4>Pilih Sumber Data:</h4>
            <div class="option-group">
              <label class="option-label">
                <input type="radio" name="import-source" value="file" checked>
                <span>Import dari File JSON</span>
              </label>
              <p class="option-help">Pilih file backup yang sebelumnya diexport</p>
            </div>
            <div class="option-group">
              <label class="option-label">
                <input type="radio" name="import-source" value="clipboard">
                <span>Import dari Clipboard</span>
              </label>
              <p class="option-help">Tempel data JSON dari clipboard</p>
            </div>
          </div>
          
          <div id="file-import-section">
            <div class="form-group">
              <label for="import-file">Pilih File JSON</label>
              <input type="file" id="import-file" class="form-control" accept=".json">
            </div>
          </div>
          
          <div id="clipboard-import-section" style="display: none;">
            <div class="form-group">
              <label for="import-data">Data JSON</label>
              <textarea id="import-data" class="form-control" rows="8" placeholder="Tempel data JSON di sini..."></textarea>
            </div>
            <div id="import-preview" class="data-preview" style="display: none;"></div>
          </div>
          
          <div class="import-options">
            <h4>Metode Import:</h4>
            <div class="option-group">
              <label class="option-label">
                <input type="radio" name="import-method" value="replace" checked>
                <span>Ganti Semua Data</span>
              </label>
              <p class="option-help">Data saat ini akan diganti dengan data baru</p>
            </div>
            <div class="option-group">
              <label class="option-label">
                <input type="radio" name="import-method" value="merge">
                <span>Gabungkan Data</span>
              </label>
              <p class="option-help">Hanya tambahkan data baru yang belum ada</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="import-cancel-btn">Batal</button>
            <button type="button" class="btn btn-primary" id="import-confirm-btn">Import Data</button>
          </div>
          
        </div>
      </div>
    </div>
    
    <!-- Input file hidden untuk export -->
    <input type="file" id="hidden-import-file" accept=".json" style="display: none;">
  `);
  
  // Load accounts
  renderAccounts();
  
  // Event listeners untuk navbar
  document.getElementById('add-account-btn').addEventListener('click', () => {
    openAccountModal();
  });
  
  document.getElementById('account-search').addEventListener('input', (e) => {
    filterAccounts(e.target.value);
  });
  
  // Modal events
  document.getElementById('modal-close').addEventListener('click', closeAccountModal);
  document.getElementById('cancel-btn').addEventListener('click', closeAccountModal);
  
  document.getElementById('account-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveAccount();
  });
  
  // Sync menu events
  document.getElementById('sync-menu-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('sync-menu');
    menu.classList.toggle('show');
  });
  
  // Close sync menu when clicking outside
  document.addEventListener('click', () => {
    const menu = document.getElementById('sync-menu');
    if (menu.classList.contains('show')) {
      menu.classList.remove('show');
    }
  });
  
  // Sync actions
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-btn').addEventListener('click', openImportModal);
  document.getElementById('clipboard-export-btn').addEventListener('click', exportToClipboard);
  document.getElementById('clipboard-import-btn').addEventListener('click', () => {
    openImportModal();
    document.querySelector('input[name="import-source"][value="clipboard"]').click();
  });
  
  // Import modal events
  document.getElementById('import-modal-close').addEventListener('click', closeImportModal);
  document.getElementById('import-cancel-btn').addEventListener('click', closeImportModal);
  
  // Toggle import source
  document.querySelectorAll('input[name="import-source"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const source = e.target.value;
      document.getElementById('file-import-section').style.display = source === 'file' ? 'block' : 'none';
      document.getElementById('clipboard-import-section').style.display = source === 'clipboard' ? 'block' : 'none';
      
      if (source === 'clipboard') {
        document.getElementById('import-data').focus();
      }
    });
  });
  
  // Preview clipboard data
  document.getElementById('import-data').addEventListener('input', previewImportData);
  
  // Confirm import
  document.getElementById('import-confirm-btn').addEventListener('click', handleImport);
  
  // File import
  document.getElementById('import-file').addEventListener('change', handleFileSelect);
  
  // Sidebar button events
  document.getElementById('random-account-btn').addEventListener('click', openRandomAccount);
  document.getElementById('quick-export-btn').addEventListener('click', exportData);
  document.getElementById('quick-paste-btn').addEventListener('click', () => {
    openImportModal();
    document.querySelector('input[name="import-source"][value="clipboard"]').click();
  });
  
  // Update sidebar stats
  updateSidebarStats();

  window.addEventListener('storage', function(e) {
    if (e.key === 'multiAccountContainerAccounts') {
      accounts = JSON.parse(e.newValue || '[]');
      updateSidebarStats();
      renderAccounts();
    }
  });

}

// Tambahkan fungsi-fungsi baru untuk sidebar
function calculateStorageSize() {
  const data = localStorage.getItem('multiAccountContainerAccounts') || '[]';
  return Math.round((data.length * 2) / 1024); // Approximate KB
}

function updateSidebarStats() {
  // Hitung akun yang ditambahkan hari ini
  const today = new Date().toISOString().split('T')[0];
  const todayAccounts = accounts.filter(acc => {
    const accDate = new Date(acc.createdAt).toISOString().split('T')[0];
    return accDate === today;
  });
  
  // Update sidebar stats
  const statTotal = document.getElementById('stat-total');
  const statToday = document.getElementById('stat-today');
  const storageSize = document.getElementById('storage-size');
  
  if (statTotal) statTotal.textContent = accounts.length;
  if (statToday) statToday.textContent = todayAccounts.length;
  if (storageSize) storageSize.textContent = calculateStorageSize() + ' KB';
  
  // Update last backup info jika ada
  const lastBackup = document.getElementById('last-backup');
  if (lastBackup) {
    const backupTime = localStorage.getItem('lastBackupTime');
    if (backupTime) {
      const time = new Date(backupTime);
      lastBackup.textContent = time.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      lastBackup.textContent = 'Belum ada';
    }
  }
}

function openRandomAccount() {
  if (accounts.length === 0) {
    showPopup('Belum ada akun yang bisa dibuka!', 'error');
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * accounts.length);
  const randomAccount = accounts[randomIndex];
  window.open(randomAccount.url, '_blank');
  
  // Add activity log
  addActivity(`Membuka akun "${randomAccount.name}" secara acak`);
  showPopup(`Membuka: ${randomAccount.name}`, 'success');
}

function addActivity(message) {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return; // Pastikan elemen ada
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Tentukan icon berdasarkan pesan
  let iconClass = 'fas fa-info-circle primary';
  if (message.includes('tambah') || message.includes('Tambahkan')) {
    iconClass = 'fas fa-plus-circle success';
  } else if (message.includes('hapus') || message.includes('Menghapus')) {
    iconClass = 'fas fa-trash-alt danger';
  } else if (message.includes('edit') || message.includes('Mengedit')) {
    iconClass = 'fas fa-edit warning';
  } else if (message.includes('backup') || message.includes('export')) {
    iconClass = 'fas fa-file-export primary';
  } else if (message.includes('import')) {
    iconClass = 'fas fa-file-import success';
  }
  
  const activityItem = `
    <div class="activity-item">
      <i class="${iconClass}"></i>
      <div>
        <p>${message}</p>
        <small>${timeStr}</small>
      </div>
    </div>
  `;
  
  // Add to top of list
  activityList.insertAdjacentHTML('afterbegin', activityItem);
  
  // Keep only last 5 activities
  const items = activityList.querySelectorAll('.activity-item');
  if (items.length > 5) {
    items[items.length - 1].remove();
  }
  
  // Update last action
  const statLast = document.getElementById('stat-last');
  if (statLast) {
    statLast.textContent = timeStr;
  }
}

function renderAccounts() {
  const container = document.getElementById('accounts-container');
  
  if (accounts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-user-friends"></i>
        <h3>Belum ada akun</h3>
        <p>Tambahkan akun pertama Anda untuk memulai</p>
        <button class="btn btn-primary" id="add-first-account">
          <i class="fas fa-plus"></i> Tambah Akun Pertama
        </button>
        <div class="clipboard-section" style="margin-top: 2rem;">
          <h4>Ingin sync dengan browser lain?</h4>
          <p>Gunakan fitur Export/Import di menu Sync</p>
          <div class="clipboard-actions">
            <button class="btn btn-secondary" id="quick-export">
              <i class="fas fa-file-export"></i> Export Data
            </button>
            <button class="btn btn-secondary" id="quick-import">
              <i class="fas fa-file-import"></i> Import Data
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('add-first-account').addEventListener('click', () => {
      openAccountModal();
    });
    
    document.getElementById('quick-export').addEventListener('click', exportData);
    document.getElementById('quick-import').addEventListener('click', openImportModal);
    
    return;
  }
  
  container.innerHTML = accounts.map((account, index) => `
    <div class="account-card" data-id="${account.id}">
      <div class="account-card-header" style="${getCardHeaderStyle(account)}">
        <div class="account-card-overlay"></div>
        <img src="${getAvatarUrl(account)}" alt="${account.name}" class="account-avatar">
        <div class="account-actions">
          <button class="btn-icon edit-account" data-index="${index}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-account" data-index="${index}" title="Hapus">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="account-card-body">
        <h3 class="account-name">${account.name}</h3>
        <p class="account-date">Ditambahkan: ${formatDate(account.createdAt)}</p>
        ${account.notes ? `<p class="account-notes">${account.notes}</p>` : ''}
      </div>
      <div class="account-card-footer">
        <button class="btn btn-outline open-account" data-url="${account.url}profile.php">
          <i class="fa-solid fa-house"></i> Home 
        </button>
        <button class="btn btn-outline open-account" data-url="${account.url}messages">
          <i class="fa-solid fa-message"></i> Pesan
        </button>
        <button class="btn btn-outline open-account" data-url="${account.url}marketplace%2Fyou%2Fdashboard">
          <i class="fa-solid fa-shop"></i> Shop 
        </button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners
  document.querySelectorAll('.open-account').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      window.open(url, '_blank');
    });
  });
  
  document.querySelectorAll('.edit-account').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.getAttribute('data-index'));
      openAccountModal(index);
    });
  });
  
  document.querySelectorAll('.delete-account').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.getAttribute('data-index'));
      deleteAccount(index);
    });
  });
}

function getAvatarUrl(account) {
  if (account.avatar) return account.avatar;
  // Generate avatar from name
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=4f46e5&color=fff&bold=true&size=128`;
}

function getCardHeaderStyle(account) {
  let style = '';
  
  // Jika ada background image
  if (account.background) {
    style += `background-image: url('${account.background}'); `;
    style += `background-size: cover; `;
    style += `background-position: center; `;
  } else {
    // Gradient default berdasarkan nama
    const colors = generateGradient(account.name);
    style += `background: linear-gradient(135deg, ${colors[0]}, ${colors[1]}); `;
  }
  
  return style;
}


function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function openAccountModal(index = null) {
  const modal = document.getElementById('account-modal');
  const form = document.getElementById('account-form');
  const title = document.getElementById('modal-title');
  const previewSection = document.getElementById('preview-section');
  
  if (index !== null && accounts[index]) {
    // Edit mode
    title.textContent = 'Edit Akun';
    const account = accounts[index];
    
    document.getElementById('account-name').value = account.name;
    document.getElementById('account-url').value = account.url;
    document.getElementById('account-avatar').value = account.avatar || '';
    document.getElementById('account-background').value = account.background || '';
    document.getElementById('account-notes').value = account.notes || '';
    
    form.dataset.editIndex = index;
  } else {
    // Add mode
    title.textContent = 'Tambah Akun Baru';
    form.reset();
    delete form.dataset.editIndex;
  }
  
  // Tampilkan preview section
  previewSection.style.display = 'block';
  
  // Update preview
  updatePreview();
  
  // Event listeners untuk live preview
  document.getElementById('account-name').addEventListener('input', updatePreview);
  document.getElementById('account-avatar').addEventListener('input', updatePreview);
  document.getElementById('account-background').addEventListener('input', updatePreview);
  
  modal.classList.add('active');
  document.getElementById('account-name').focus();
}

function closeAccountModal() {
  const modal = document.getElementById('account-modal');
  modal.classList.remove('active');
  document.getElementById('account-form').reset();
}

function saveAccount() {
  const form = document.getElementById('account-form');
  const name = document.getElementById('account-name').value.trim();
  const url = document.getElementById('account-url').value.trim();
  const avatar = document.getElementById('account-avatar').value.trim();
  const background = document.getElementById('account-background').value.trim();
  const notes = document.getElementById('account-notes').value.trim();
  
  if (!name || !url) {
    showPopup('Nama dan URL harus diisi!', 'error');
    return;
  }
  
  const accountData = {
    id: Date.now().toString(),
    name,
    url: url.startsWith('http') ? url : `https://${url}`,
    avatar: avatar || null,
    background: background || null,
    notes: notes || null,
    createdAt: new Date().toISOString()
  };
  
  let activityMessage = '';
  
  if (form.dataset.editIndex !== undefined) {
    // Edit existing account
    const index = parseInt(form.dataset.editIndex);
    const oldName = accounts[index].name;
    accounts[index] = { ...accounts[index], ...accountData };
    activityMessage = `Mengedit akun "${oldName}" menjadi "${name}"`;
    showPopup('Akun berhasil diperbarui!', 'success');
  } else {
    // Add new account
    accounts.push(accountData);
    activityMessage = `Menambahkan akun "${name}"`;
    showPopup('Akun baru berhasil ditambahkan!', 'success');
  }
  
  // Save to localStorage
  saveToLocalStorage();
  
  // Update UI
  renderAccounts();
  updateStats();
  updateSidebarStats();
  addActivity(activityMessage);
  closeAccountModal();
}

function deleteAccount(index) {
  if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
    const deletedAccount = accounts[index];
    accounts.splice(index, 1);
    saveToLocalStorage();
    renderAccounts();
    updateStats();
    updateSidebarStats(); // TAMBAHKAN INI
    addActivity(`Menghapus akun "${deletedAccount.name}"`); // TAMBAHKAN INI
    showPopup('Akun berhasil dihapus!', 'success');
  }
}

function saveToLocalStorage() {
  localStorage.setItem('multiAccountContainerAccounts', JSON.stringify(accounts));
}

function filterAccounts(searchTerm) {
  const container = document.getElementById('accounts-container');
  const allCards = container.querySelectorAll('.account-card');

  // Jika input kosong → tampilkan semua
  if (!searchTerm) {
    allCards.forEach(card => card.style.display = 'block');
    return;
  }

  const term = searchTerm.toLowerCase();

  allCards.forEach(card => {
    // Nama akun (wajib ada)
    const name = card
      .querySelector('.account-name')
      .textContent
      .toLowerCase();

    // Catatan (opsional)
    const notesEl = card.querySelector('.account-notes');
    const notes = notesEl ? notesEl.textContent.toLowerCase() : '';

    // URL dari data-url tombol (bisa lebih dari satu)
    const urls = Array.from(card.querySelectorAll('.open-account'))
      .map(btn => btn.dataset.url || '')
      .join(' ')
      .toLowerCase();

    // Logika pencarian
    const isMatch =
      name.includes(term) ||
      notes.includes(term) ||
      urls.includes(term);

    // Tampilkan / sembunyikan card
    card.style.display = isMatch ? 'block' : 'none';
  });
}

function updateStats() {
  const statsCard = document.querySelector('.stats-card .stat-info h3');
  if (statsCard) {
    statsCard.textContent = accounts.length;
    statsCard.classList.add('updated');
    setTimeout(() => statsCard.classList.remove('updated'), 1000);
  }
  
  // Juga update stat di sidebar
  updateSidebarStats();
}

function updatePreview() {
  const name = document.getElementById('account-name').value || 'Nama Akun';
  const url = document.getElementById('account-url').value || 'https://example.com';
  const avatar = document.getElementById('account-avatar').value;
  const background = document.getElementById('account-background').value;
  
  // Update preview name dan URL
  document.getElementById('preview-name').textContent = name;
  document.getElementById('preview-url').textContent = url;
  
  // Update preview header background
  const previewHeader = document.getElementById('preview-header');
  
  if (background) {
    // Jika ada background image
    previewHeader.style.backgroundImage = `url('${background}')`;
    previewHeader.style.backgroundSize = 'cover';
    previewHeader.style.backgroundPosition = 'center';
  } else {
    // Gradient default berdasarkan nama
    const colors = generateGradient(name);
    previewHeader.style.backgroundImage = 'none';
    previewHeader.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  }
  
  // Update preview avatar
  const avatarUrl = avatar || getDefaultAvatarUrl(name);
  previewHeader.innerHTML = `
    <img src="${avatarUrl}" alt="${name}" class="preview-avatar">
  `;
}

function getDefaultAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&bold=true`;
}

function generateGradient(text) {
  // Generate warna konsisten berdasarkan text
  const hash = Array.from(text).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = hash % 360;
  const color1 = `hsl(${hue}, 70%, 60%)`;
  const color2 = `hsl(${(hue + 150) % 360}, 70%, 50%)`;
  
  return [color1, color2];
}


// ========== EXPORT/IMPORT FUNCTIONS ==========

function exportData() {
  const dataStr = JSON.stringify(accounts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  a.href = url;
  a.download = `accounts_backup_${timestamp}.json`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Simpan waktu backup terakhir
  localStorage.setItem('lastBackupTime', new Date().toISOString());
  
  // Update sidebar
  updateSidebarStats();
  addActivity(`Melakukan backup data (${accounts.length} akun)`);
  
  showPopup(`Data berhasil diexport (${accounts.length} akun)!`, 'success');
}

function exportToClipboard() {
  const dataStr = JSON.stringify(accounts, null, 2);
  
  navigator.clipboard.writeText(dataStr)
    .then(() => {
      showPopup('Data berhasil disalin ke clipboard!', 'success');
    })
    .catch(err => {
      showPopup('Gagal menyalin ke clipboard: ' + err.message, 'error');
    });
}

function openImportModal() {
  const modal = document.getElementById('import-modal');
  modal.classList.add('active');
  
  // Reset form
  document.getElementById('import-file').value = '';
  document.getElementById('import-data').value = '';
  document.getElementById('import-preview').style.display = 'none';
  document.getElementById('import-preview').textContent = '';
  
  // Set default source
  document.querySelector('input[name="import-source"][value="file"]').checked = true;
  document.getElementById('file-import-section').style.display = 'block';
  document.getElementById('clipboard-import-section').style.display = 'none';
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  modal.classList.remove('active');
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      previewImportDataHelper(data);
    } catch (err) {
      showPopup('File tidak valid: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function previewImportData(event) {
  const jsonText = event.target.value.trim();
  if (!jsonText) {
    document.getElementById('import-preview').style.display = 'none';
    return;
  }
  
  try {
    const data = JSON.parse(jsonText);
    previewImportDataHelper(data);
  } catch (err) {
    document.getElementById('import-preview').style.display = 'block';
    document.getElementById('import-preview').textContent = '❌ Format JSON tidak valid';
    document.getElementById('import-preview').style.color = 'var(--danger-color)';
  }
}

function previewImportDataHelper(data) {
  const preview = document.getElementById('import-preview');
  
  if (!Array.isArray(data)) {
    preview.textContent = '❌ Data harus berupa array';
    preview.style.color = 'var(--danger-color)';
    preview.style.display = 'block';
    return;
  }
  
  const validCount = data.filter(item => item.name && item.url).length;
  const duplicateCount = data.filter(item => 
    accounts.some(existing => existing.id === item.id || 
      (existing.name === item.name && existing.url === item.url))
  ).length;
  
  preview.textContent = `✅ ${validCount} akun valid ditemukan\n`;
  preview.textContent += `📊 ${data.length} total data\n`;
  preview.textContent += `🔄 ${duplicateCount} data duplikat (akan diabaikan jika merge)`;
  preview.style.color = 'var(--success-color)';
  preview.style.display = 'block';
}

function handleImport() {
  const source = document.querySelector('input[name="import-source"]:checked').value;
  const method = document.querySelector('input[name="import-method"]:checked').value;
  
  let importedData;
  
  if (source === 'file') {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
      showPopup('Pilih file terlebih dahulu!', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        importedData = JSON.parse(e.target.result);
        processImport(importedData, method);
      } catch (err) {
        showPopup('File tidak valid: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  } else {
    // Clipboard source
    const jsonText = document.getElementById('import-data').value.trim();
    if (!jsonText) {
      showPopup('Masukkan data JSON terlebih dahulu!', 'error');
      return;
    }
    
    try {
      importedData = JSON.parse(jsonText);
      processImport(importedData, method);
    } catch (err) {
      showPopup('Data JSON tidak valid: ' + err.message, 'error');
    }
  }
}

function processImport(importedData, method) {
  if (!Array.isArray(importedData)) {
    showPopup('Data harus berupa array!', 'error');
    return;
  }
  
  // Validasi data
  const validData = importedData.filter(item => item.name && item.url);
  
  if (validData.length === 0) {
    showPopup('Tidak ada data yang valid!', 'error');
    return;
  }
  
  let activityMessage = '';
  let addedCount = 0;
  
  if (method === 'replace') {
    // Replace all data
    if (confirm(`Anda akan mengganti ${accounts.length} akun dengan ${validData.length} akun baru. Lanjutkan?`)) {
      accounts = validData.map(item => ({
        id: item.id || Date.now().toString(),
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `https://${item.url}`,
        avatar: item.avatar || null,
        notes: item.notes || null,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      
      addedCount = validData.length;
      activityMessage = `Mengganti semua data dengan ${addedCount} akun baru`;
    }
  } else {
    // Merge data
    const existingIds = new Set(accounts.map(acc => acc.id));
    const existingCombos = new Set(accounts.map(acc => `${acc.name}|${acc.url}`));
    
    let skippedCount = 0;
    
    validData.forEach(item => {
      const id = item.id || Date.now().toString();
      const combo = `${item.name}|${item.url}`;
      
      if (!existingIds.has(id) && !existingCombos.has(combo)) {
        accounts.push({
          id: id,
          name: item.name,
          url: item.url.startsWith('http') ? item.url : `https://${item.url}`,
          avatar: item.avatar || null,
          notes: item.notes || null,
          createdAt: item.createdAt || new Date().toISOString()
        });
        existingIds.add(id);
        existingCombos.add(combo);
        addedCount++;
      } else {
        skippedCount++;
      }
    });
    
    activityMessage = `Menggabungkan data: ${addedCount} ditambahkan, ${skippedCount} duplikat`;
  }
  
  if (addedCount > 0 || method === 'replace') {
    saveToLocalStorage();
    renderAccounts();
    updateStats();
    updateSidebarStats(); 
    addActivity(activityMessage);
  }
  
  closeImportModal();
  showPopup(`Data berhasil diimport! (${addedCount} akun)`, 'success');
}

function showPopup(message, type = "info") {
  const popup = document.getElementById("popup");
  popup.innerHTML = `
    <i class="fas fa-info-circle" style="margin-right: .5rem;"></i> 
    ${message}
  `;

  // Warna berdasarkan tipe
  if (type === "success") popup.style.borderLeftColor = "var(--success-color)";
  else if (type === "error") popup.style.borderLeftColor = "var(--danger-color)";
  else popup.style.borderLeftColor = "var(--primary-color)";

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2500);
}

function initThemeToggle() {
  const themeToggleBtn = document.getElementById('dashboard-theme-toggle');
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      html.setAttribute('data-theme', newTheme);
      
      // Update button icon
      const icon = themeToggleBtn.querySelector('i');
      if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    });
  }
}

// Tambahkan style untuk dropdown menu
const dropdownStyle = document.createElement('style');
dropdownStyle.textContent = `
.nav-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 0.5rem;
  min-width: 200px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: none;
  margin-top: 0.5rem;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--border-color);
}

.dropdown-item i {
  width: 1rem;
}
`;
document.head.appendChild(dropdownStyle);
