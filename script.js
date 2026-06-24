let tenants = [];

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const searchInput = document.getElementById('search-input');
    const filterCat = document.getElementById('filter-cat');
    const filterLoc = document.getElementById('filter-loc');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterCat) filterCat.addEventListener('change', applyFilters);
    if (filterLoc) filterLoc.addEventListener('change', applyFilters);

    const detailModal = document.getElementById('detail-modal');
    if (detailModal) detailModal.addEventListener('click', closeModal);

    fetch('data/tenants.json')
        .then(res => res.json())
        .then(data => {
            tenants = data;
            renderDirectory(tenants);
        })
        .catch(err => {
            console.error('Gagal memuat data tenants.json', err);
            renderDirectory([]);
        });
});

function renderDirectory(data) {
    const grid = document.getElementById('directory-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;
    grid.innerHTML = '';

    if (!data || data.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    data.forEach(tenant => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <div class="h-44 bg-stone-100 relative overflow-hidden">
                    <img src="${tenant.image}" alt="${tenant.name}" class="w-full h-full object-cover">
                    <span class="absolute top-3 left-3 bg-white/95 text-warm-dark font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md shadow-xs">
                        ${tenant.category}
                    </span>
                </div>
                <div class="p-4 space-y-2">
                    <div class="flex items-center text-[11px] text-stone-400 font-medium">
                        <i data-lucide="map-pin" class="w-3 h-3 text-stone-400 mr-1"></i> Kec. ${tenant.location}
                    </div>
                    <h3 class="font-bold text-base text-warm-dark tracking-tight line-clamp-1">${tenant.name}</h3>
                    <p class="text-warm-body text-xs leading-relaxed line-clamp-2">${tenant.shortDesc}</p>
                </div>
            </div>
            <div class="p-4 pt-0 space-y-2">
                <div class="grid grid-cols-2 gap-2">
                    <a href="https://wa.me/${tenant.whatsapp}" target="_blank" class="flex items-center justify-center border border-stone-200 text-stone-600 rounded-xl py-1.5 text-xs font-semibold hover:bg-stone-50 transition-colors">
                        <i data-lucide="message-circle" class="w-3.5 h-3.5 mr-1 text-emerald-600"></i> WA
                    </a>
                    <a href="https://instagram.com/${tenant.instagram}" target="_blank" class="flex items-center justify-center border border-stone-200 text-stone-600 rounded-xl py-1.5 text-xs font-semibold hover:bg-stone-50 transition-colors">
                        <i data-lucide="instagram" class="w-3.5 h-3.5 mr-1 text-pink-600"></i> IG
                    </a>
                </div>
                <button onclick="openModal(${tenant.id})" class="w-full text-center bg-stone-50 hover:bg-stone-100 border border-stone-200 text-warm-dark rounded-xl py-2 text-xs font-bold transition-all">
                    Lihat Detail
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function applyFilters() {
    const searchValEl = document.getElementById('search-input');
    const catEl = document.getElementById('filter-cat');
    const locEl = document.getElementById('filter-loc');
    if (!searchValEl || !catEl || !locEl) return;

    const searchVal = searchValEl.value.toLowerCase();
    const catVal = catEl.value;
    const locVal = locEl.value;

    const filtered = tenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchVal) || t.shortDesc.toLowerCase().includes(searchVal);
        const matchesCat = catVal === 'all' || t.category === catVal;
        const matchesLoc = locVal === 'all' || t.location === locVal;
        return matchesSearch && matchesCat && matchesLoc;
    });

    renderDirectory(filtered);
}

function filterCategory(catName) {
    const catEl = document.getElementById('filter-cat');
    if (!catEl) return;
    catEl.value = catName;
    document.getElementById('eksplor').scrollIntoView({ behavior: 'smooth' });
    applyFilters();
}

function openModal(id) {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;

    document.getElementById('modal-cat').innerText = tenant.category;
    document.getElementById('modal-name').innerText = tenant.name;
    document.getElementById('modal-loc').innerText = `Kecamatan ${tenant.location}, Tuban`;
    document.getElementById('modal-img').src = tenant.image;
    document.getElementById('modal-img').alt = tenant.name;
    document.getElementById('modal-desc').innerText = tenant.longDesc;
    document.getElementById('modal-wa').href = `https://wa.me/${tenant.whatsapp}`;
    document.getElementById('modal-ig').href = `https://instagram.com/${tenant.instagram}`;

    const productGrid = document.getElementById('modal-products');
    productGrid.innerHTML = '';

    if (!tenant.products || tenant.products.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full border border-dashed border-stone-200 p-4 text-center rounded-xl text-stone-400 text-xs">
                Belum ada item katalog yang ditambahkan.
            </div>
        `;
    } else {
        tenant.products.forEach(p => {
            const pCard = document.createElement('div');
            pCard.className = "bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col justify-between";
            pCard.innerHTML = `
                <div>
                    <h5 class="font-bold text-xs text-warm-dark line-clamp-1">${p.name}</h5>
                    <p class="text-warm-brand font-bold text-[11px] mt-0.5">${p.price}</p>
                </div>
            `;
            productGrid.appendChild(pCard);
        });
    }

    const modal = document.getElementById('detail-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}
