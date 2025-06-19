// Configurazione
const CONFIG = {
    defaultCategories: ['fumetti', 'videogiochi', 'lego', 'carte', 'altro'],
    categoryNames: {
        'fumetti': 'Fumetti',
        'videogiochi': 'Videogiochi',
        'lego': 'LEGO',
        'carte': 'Carte',
        'altro': 'Altro'
    },
    categoryColors: {
        'fumetti': '#ff6b6b',
        'videogiochi': '#4dabf7',
        'lego': '#fcc419',
        'carte': '#51cf66',
        'altro': '#868e96'
    },
    maxImageSize: 2 * 1024 * 1024 // 2MB
};

// Stato applicazione
const state = {
    collection: [],
    currentItem: null,
    isSyncing: false,
    cloudEnabled: false
};

// Elementi DOM
const DOM = {
    addForm: document.getElementById('add-form'),
    addScreen: document.getElementById('add-screen'),
    viewScreen: document.getElementById('view-screen'),
    collectionList: document.getElementById('collection-list'),
    itemId: document.getElementById('item-id'),
    itemName: document.getElementById('item-name'),
    itemCategory: document.getElementById('item-category'),
    itemValue: document.getElementById('item-value'),
    itemDate: document.getElementById('item-date'),
    itemNotes: document.getElementById('item-notes'),
    itemImage: document.getElementById('item-image'),
    imagePreview: document.getElementById('image-preview'),
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    itemCount: document.getElementById('item-count'),
    totalValue: document.getElementById('total-value'),
    syncStatus: document.getElementById('sync-status'),
    syncBtn: document.getElementById('sync-btn'),
    exportBtn: document.getElementById('export-btn'),
    scanBarcode: document.getElementById('scan-barcode'),
    scannerModal: document.getElementById('scanner-modal'),
    scannerContainer: document.getElementById('scanner-container'),
    scannerResult: document.getElementById('scanner-result'),
    toastContainer: document.getElementById('toast-container')
};

// Inizializzazione
function init() {
    loadCollection();
    setupEventListeners();
    populateCategoryDropdowns();
    setCurrentDate();
    renderCollection();
    updateStats();
    
    // Mostra la schermata corretta all'avvio
    setTimeout(() => showScreen('add-screen'), 100);
}

// Caricamento iniziale
function loadCollection() {
    const saved = localStorage.getItem('collection');
    try {
        state.collection = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Errore nel caricamento della collezione:", e);
        state.collection = [];
    }
}

// Event Listeners
function setupEventListeners() {
    // Form
    DOM.addForm.addEventListener('submit', handleFormSubmit);
    DOM.itemImage.addEventListener('change', handleImageUpload);
    
    // Toolbar
    DOM.searchInput.addEventListener('input', debounce(filterCollection, 300));
    DOM.categoryFilter.addEventListener('change', filterCollection);
    DOM.syncBtn.addEventListener('click', syncWithCloud);
    DOM.exportBtn.addEventListener('click', exportCollection);
    DOM.scanBarcode.addEventListener('click', openScanner);
    
    // Modal
    document.querySelector('.close').addEventListener('click', closeScanner);
    window.addEventListener('click', (e) => {
        if (e.target === DOM.scannerModal) closeScanner();
    });
}

// Gestione Form
function handleFormSubmit(e) {
    e.preventDefault();
    
    const item = {
        id: DOM.itemId.value || Date.now().toString(),
        name: DOM.itemName.value.trim(),
        category: DOM.itemCategory.value,
        value: parseFloat(DOM.itemValue.value) || 0,
        date: DOM.itemDate.value || new Date().toISOString().split('T')[0],
        notes: DOM.itemNotes.value,
        image: DOM.imagePreview.querySelector('img')?.src || null,
        lastUpdated: new Date().toISOString()
    };

    if (!validateItem(item)) return;

    if (DOM.itemId.value) {
        updateItem(item);
    } else {
        addItem(item);
    }

    saveCollection();
    resetForm();
    showScreen('view-screen');
    showToast('Oggetto salvato con successo!', 'success');
}

function validateItem(item) {
    if (!item.name) {
        showToast('Il nome è obbligatorio', 'error');
        DOM.itemName.focus();
        return false;
    }
    
    if (!item.category) {
        showToast('La categoria è obbligatoria', 'error');
        DOM.itemCategory.focus();
        return false;
    }
    
    return true;
}

function addItem(item) {
    state.collection.unshift(item);
}

function updateItem(item) {
    const index = state.collection.findIndex(i => i.id === item.id);
    if (index !== -1) state.collection[index] = item;
}

// Gestione Immagini
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > CONFIG.maxImageSize) {
        showToast(`L'immagine è troppo grande (max ${CONFIG.maxImageSize/1024/1024}MB)`, 'error');
        DOM.itemImage.value = '';
        return;
    }

    compressImage(file, 0.7, (compressedDataUrl) => {
        DOM.imagePreview.innerHTML = `
            <img src="${compressedDataUrl}" alt="Anteprima">
            <button class="btn-remove-image"><i class="fas fa-times"></i></button>
        `;
        
        document.querySelector('.btn-remove-image').addEventListener('click', () => {
            DOM.imagePreview.innerHTML = '';
            DOM.itemImage.value = '';
        });
    });
}

function compressImage(file, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calcola dimensioni mantenendo aspect ratio
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            callback(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Scanner Codice a Barre
function openScanner() {
    DOM.scannerModal.style.display = 'flex';
    DOM.scannerResult.innerHTML = '<div class="scan-result">Preparando lo scanner...</div>';
    
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: DOM.scannerContainer,
            constraints: {
                width: 480,
                height: 320,
                facingMode: "environment"
            },
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
        }
    }, function(err) {
        if (err) {
            DOM.scannerResult.innerHTML = `
                <div class="scan-result scan-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Errore inizializzazione scanner: ${err.message}</p>
                </div>
            `;
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        DOM.scannerResult.innerHTML = `
            <div class="scan-result scan-success">
                <i class="fas fa-check-circle"></i>
                <p>Codice rilevato: <strong>${code}</strong></p>
                <button class="btn-primary" id="use-scan-result">
                    <i class="fas fa-check"></i> Usa questo codice
                </button>
            </div>
        `;
        
        document.getElementById('use-scan-result').addEventListener('click', () => {
            DOM.itemName.value = `Prodotto ${code}`;
            closeScanner();
        });
    });
}

function closeScanner() {
    if (Quagga && Quagga.stop) {
        Quagga.stop();
    }
    DOM.scannerModal.style.display = 'none';
}

// Sincronizzazione Cloud
async function syncWithCloud() {
    if (!state.cloudEnabled) {
        showToast('Collegare un account cloud nelle impostazioni', 'error');
        return;
    }

    state.isSyncing = true;
    updateSyncStatus();
    
    try {
        // Simula una chiamata API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In una reale implementazione:
        // const response = await fetch('your-api-endpoint', {...});
        // Gestire la risposta
        
        showToast('Collezione sincronizzata (simulazione)', 'success');
    } catch (error) {
        showToast(`Errore durante la sincronizzazione: ${error.message}`, 'error');
        console.error('Sync error:', error);
    } finally {
        state.isSyncing = false;
        updateSyncStatus();
    }
}

function updateSyncStatus() {
    if (!state.cloudEnabled) {
        DOM.syncStatus.innerHTML = '<i class="fas fa-cloud-slash"></i> <span>Disconnesso</span>';
        return;
    }
    
    if (state.isSyncing) {
        DOM.syncStatus.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> <span>Sincronizzazione...</span>';
    } else {
        DOM.syncStatus.innerHTML = '<i class="fas fa-cloud-check"></i> <span>Sincronizzato</span>';
    }
}

// Gestione Collezione
function saveCollection() {
    try {
        localStorage.setItem('collection', JSON.stringify(state.collection));
        updateStats();
        refreshCategoryFilters();
        renderCollection();
    } catch (e) {
        console.error("Errore nel salvataggio:", e);
        showToast('Errore nel salvataggio locale', 'error');
    }
}

function updateStats() {
    DOM.itemCount.textContent = `${state.collection.length} ${state.collection.length === 1 ? 'oggetto' : 'oggetti'}`;
    
    const totalValue = state.collection.reduce((sum, item) => sum + item.value, 0);
    DOM.totalValue.textContent = `€${totalValue.toFixed(2)}`;
}

function filterCollection() {
    const searchTerm = DOM.searchInput.value.toLowerCase();
    const category = DOM.categoryFilter.value;

    const filtered = state.collection.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                            (item.notes && item.notes.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || item.category === category;
        return matchesSearch && matchesCategory;
    });

    renderCollection(filtered);
}

function renderCollection(items = state.collection) {
    DOM.collectionList.innerHTML = '';

    if (items.length === 0) {
        DOM.collectionList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nessun oggetto trovato</h3>
                <p>${state.collection.length === 0 ? 'Aggiungi il tuo primo oggetto!' : 'Prova a modificare i filtri'}</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'collection-item';
        
        const categoryColor = CONFIG.categoryColors[item.category] || CONFIG.categoryColors['altro'];
        const categoryName = CONFIG.categoryNames[item.category] || item.category;

        itemEl.innerHTML = `
            <div class="item-image" style="${item.image ? `background-image: url(${item.image})` : ''}">
                ${!item.image ? '<i class="fas fa-image"></i>' : ''}
            </div>
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <div class="item-meta">
                    <span>${formatDate(item.date)}</span>
                    <span>€${item.value.toFixed(2)}</span>
                </div>
                <span class="item-category" style="background-color: ${categoryColor}20; color: ${categoryColor}">
                    ${categoryName}
                </span>
                <div class="item-actions">
                    <button class="action-btn edit-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i> Modifica
                    </button>
                    <button class="action-btn delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Elimina
                    </button>
                </div>
            </div>
        `;

        itemEl.querySelector('.edit-btn').addEventListener('click', () => editItem(item.id));
        itemEl.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item.id));

        DOM.collectionList.appendChild(itemEl);
    });
}

function editItem(id) {
    const item = state.collection.find(i => i.id === id);
    if (!item) {
        showToast('Oggetto non trovato', 'error');
        return;
    }

    state.currentItem = item;
    DOM.itemId.value = item.id;
    DOM.itemName.value = item.name;
    DOM.itemCategory.value = item.category;
    DOM.itemValue.value = item.value;
    DOM.itemDate.value = item.date;
    DOM.itemNotes.value = item.notes || '';
    
    if (item.image) {
        DOM.imagePreview.innerHTML = `
            <img src="${item.image}" alt="Anteprima">
            <button class="btn-remove-image"><i class="fas fa-times"></i></button>
        `;
        document.querySelector('.btn-remove-image').addEventListener('click', () => {
            DOM.imagePreview.innerHTML = '';
            DOM.itemImage.value = '';
        });
    } else {
        DOM.imagePreview.innerHTML = '';
    }

    showScreen('add-screen');
    DOM.itemName.focus();
}

function deleteItem(id) {
    if (!confirm('Eliminare questo oggetto dalla collezione?')) return;
    
    state.collection = state.collection.filter(item => item.id !== id);
    saveCollection();
    showToast('Oggetto eliminato', 'success');
}

// Utility
function showScreen(screenId) {
    if (screenId === 'view-screen') {
        document.body.classList.add('view-active');
        filterCollection();
    } else {
        document.body.classList.remove('view-active');
    }
}

function resetForm() {
    DOM.addForm.reset();
    DOM.itemId.value = '';
    DOM.imagePreview.innerHTML = '';
    state.currentItem = null;
    setCurrentDate();
}

function setCurrentDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    DOM.itemDate.value = localDate.toISOString().split('T')[0];
}

function formatDate(dateString) {
    if (!dateString) return 'N/D';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data invalida';
    
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function refreshCategoryFilters() {
    const allCategories = [...new Set([
        ...CONFIG.defaultCategories,
        ...state.collection.map(item => item.category)
    ])];

    // Aggiorna dropdown form
    DOM.itemCategory.innerHTML = '<option value="">Seleziona...</option>';
    allCategories.forEach(cat => {
        const displayName = CONFIG.categoryNames[cat] || cat;
        DOM.itemCategory.innerHTML += `<option value="${cat}">${displayName}</option>`;
    });
    
    // Aggiorna filtro view
    DOM.categoryFilter.innerHTML = '<option value="all">Tutte le categorie</option>';
    allCategories.forEach(cat => {
        const displayName = CONFIG.categoryNames[cat] || cat;
        DOM.categoryFilter.innerHTML += `<option value="${cat}">${displayName}</option>`;
    });
}

function exportCollection() {
    const data = {
        meta: {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            itemCount: state.collection.length
        },
        collection: state.collection
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `collezione-${new Date().toISOString().split('T')[0]}.json`;
    
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = dataUri;
    link.download = exportName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Collezione esportata', 'success');
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${getToastIcon(type)}"></i> ${message}`;
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

// Avvio applicazione
document.addEventListener('DOMContentLoaded', init);
