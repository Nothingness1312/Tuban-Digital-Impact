let tenants = [];
let scrollObserver = null;

document.addEventListener('DOMContentLoaded', () => {
    window.lucide?.createIcons();

    const searchInput = document.getElementById('search-input');
    const filterCat = document.getElementById('filter-cat');
    const filterLoc = document.getElementById('filter-loc');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterCat) filterCat.addEventListener('change', applyFilters);
    if (filterLoc) filterLoc.addEventListener('change', applyFilters);

    const detailModal = document.getElementById('detail-modal');
    if (detailModal) detailModal.addEventListener('click', closeModal);

    initScrollObserver();
    initHeaderScroll();
    initImageAnimations();
    animateHeroSection();
    animateCategoryButtons();

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

function animateHeroSection() {
    const h1 = document.querySelector('section:first-of-type h1');
    const paragraphs = document.querySelectorAll('section:first-of-type > div > p');
    const buttons = document.querySelectorAll('section:first-of-type a');

    if (h1) h1.classList.add('hero-title');
    paragraphs.forEach((p, i) => p.classList.add('hero-paragraph'));
    buttons.forEach((btn, i) => btn.classList.add('hero-button'));
}

function animateCategoryButtons() {
    const categoryBtns = document.querySelectorAll('#category-grid button');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function initScrollObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        if (!section.id.includes('detail-modal')) {
            section.classList.add('scroll-fade-up');
            scrollObserver.observe(section);
        }
    });

    document.querySelector('footer')?.classList.add('scroll-fade-up');
    document.querySelector('footer') && scrollObserver.observe(document.querySelector('footer'));
}

function initHeaderScroll() {
    const header = document.querySelector('header');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 10 && lastScrollY <= 10) {
            header?.classList.add('scrolled');
        } else if (scrollY <= 10 && lastScrollY > 10) {
            header?.classList.remove('scrolled');
        }
        lastScrollY = scrollY;
    }, { passive: true });
}

function initImageAnimations() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.classList.add('loading');
        img.addEventListener('load', function() {
            this.classList.remove('loading');
        });
        if (img.complete) {
            img.classList.remove('loading');
        }
    });
}

function renderDirectory(data) {
    const grid = document.getElementById('directory-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;

    const existingCards = grid.querySelectorAll('.directory-card');
    if (existingCards.length > 0) {
        existingCards.forEach(card => {
            card.style.animation = 'fadeIn 0.3s ease-out reverse';
        });
        setTimeout(() => {
            grid.innerHTML = '';
            renderDirectoryContent(data, grid, emptyState);
        }, 300);
    } else {
        grid.innerHTML = '';
        renderDirectoryContent(data, grid, emptyState);
    }
}

function renderDirectoryContent(data, grid, emptyState) {
    if (!data || data.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('empty-state');
        }
        return;
    } else {
        if (emptyState) {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('empty-state');
        }
    }

    data.forEach((tenant, index) => {
        const card = document.createElement('div');
        const delay = index * 0.05; // 50ms stagger
        card.className = "directory-card bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md flex flex-col justify-between";
        card.style.animationDelay = `${delay}s`;
        
        card.innerHTML = `
            <div>
                <div class="h-44 bg-stone-100 relative overflow-hidden">
                    <img src="${tenant.image}" alt="Foto usaha ${tenant.name} - kategori ${tenant.category} di Tuban" loading="lazy" decoding="async" class="w-full h-full object-cover loading">
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
                    <a href="https://wa.me/${tenant.whatsapp}" target="_blank" rel="noopener noreferrer" class="social-link flex items-center justify-center border border-stone-200 text-stone-600 rounded-xl py-1.5 text-xs font-semibold hover:bg-stone-50 transition-colors">
                        <i class="fa-brands fa-whatsapp w-3.5 h-3.5 mr-1 text-emerald-600"></i> WA
                    </a>
                    <a href="https://instagram.com/${tenant.instagram}" target="_blank" rel="noopener noreferrer" class="social-link flex items-center justify-center border border-stone-200 text-stone-600 rounded-xl py-1.5 text-xs font-semibold hover:bg-stone-50 transition-colors">
                        <i class="fa-brands fa-instagram w-3.5 h-3.5 mr-1 text-pink-600"></i> IG
                    </a>
                </div>
                <button onclick="openModal(${tenant.id})" class="w-full text-center bg-stone-50 hover:bg-stone-100 border border-stone-200 text-warm-dark rounded-xl py-2 text-xs font-bold transition-all">
                    Lihat Detail
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    const cards = grid.querySelectorAll('.directory-card');
    cards.forEach(card => {
        card.classList.add('scroll-fade-up');
        scrollObserver?.observe(card);
    });

    window.lucide?.createIcons();
    initImageAnimations();
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

    const mapSection = document.getElementById('modal-location-section');
    const mapFrame = document.getElementById('modal-map');
    const mapAddress = document.getElementById('modal-address');

    if (tenant.mapsEmbed) {
        mapSection.classList.remove('hidden');
        mapFrame.src = tenant.mapsEmbed;
        mapAddress.textContent = tenant.address || '';
    } else {
        mapSection.classList.add('hidden');
        mapFrame.src = '';
        mapAddress.textContent = '';
    }

    const productGrid = document.getElementById('modal-products');
    productGrid.innerHTML = '';

    if (!tenant.products || tenant.products.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full border border-dashed border-stone-200 p-4 text-center rounded-xl text-stone-400 text-xs">
                Belum ada item katalog yang ditambahkan.
            </div>
        `;
    } else {
        tenant.products.forEach((p, index) => {
            const pCard = document.createElement('div');
            pCard.className = "product-card bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col justify-between";
            pCard.style.animation = `slideUp 0.4s ease-out ${index * 0.08}s both`;
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
    const modalContent = modal.querySelector('div:first-child');

    modal.classList.remove('hidden');
    modal.classList.add('flex', 'modal-overlay');
    modalContent.classList.add('modal-content');
    modalContent.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    window.lucide?.createIcons();
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    const modalContent = modal.querySelector('div:first-child');

    modalContent.classList.add('closing');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modalContent.classList.remove('modal-content', 'closing');
        document.body.style.overflow = '';
    }, 300);
}
