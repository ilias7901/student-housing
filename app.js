/* ============================================================
   StudyNest — Student Housing Platform
   Application Logic
   ============================================================ */

// ─── Data ───────────────────────────────────────────────────

const properties = [];

const cities = [
  { name: "Casablanca",  listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Casa_finance_city_6_%28cropped%29.jpg/960px-Casa_finance_city_6_%28cropped%29.jpg", emoji: "🏙️" },
  { name: "Rabat",       listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Morocco_-_Rabat_%2831387775324%29.jpg/960px-Morocco_-_Rabat_%2831387775324%29.jpg", emoji: "🏛️" },
  { name: "Marrakech",   listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Pavillon_Menarag%C3%A4rten.jpg/960px-Pavillon_Menarag%C3%A4rten.jpg", emoji: "🕌" },
  { name: "Fes",         listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Bab_Bou_Jeloud_Frame_Minaret_Fes_Nov25_A7CR_09127-8_HDR3.jpg/960px-Bab_Bou_Jeloud_Frame_Minaret_Fes_Nov25_A7CR_09127-8_HDR3.jpg", emoji: "📖" },
  { name: "Tangier",     listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Tanger_cor.jpg", emoji: "🌊" },
  { name: "Agadir",      listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/South_view_sea_side_from_Kasbah_of_Agadir_Oufella.jpg/960px-South_view_sea_side_from_Kasbah_of_Agadir_Oufella.jpg", emoji: "🏖️" },
  { name: "Meknes",      listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Entrada_a_Meknes%2C_Marruecos._-_panoramio.jpg/960px-Entrada_a_Meknes%2C_Marruecos._-_panoramio.jpg", emoji: "🏰" },
  { name: "Oujda",       listings: 0, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Oujda.mosque_et_mairie.jpg/960px-Oujda.mosque_et_mairie.jpg", emoji: "🌿" }
];

const testimonials = [
  {
    text: "StudyNest m'a vraiment facilité la vie ! Je venais de Khouribga pour étudier à Casa, et en deux semaines j'avais trouvé une chambre parfaite près de la fac. Les filtres sont super pratiques.",
    name: "Youssef El Amrani",
    university: "Hassan II University, Casablanca",
    avatar: "YA",
    color: "#667eea"
  },
  {
    text: "J'adore la transparence de la plateforme. On voit les photos, les équipements, et même le temps de réponse du propriétaire. J'ai trouvé un studio génial à Guéliz !",
    name: "Salma Benhida",
    university: "Cadi Ayyad University, Marrakech",
    avatar: "SB",
    color: "#00A56A"
  },
  {
    text: "En tant que propriétaire, StudyNest m'a aidé à trouver des locataires étudiants fiables rapidement. La plateforme est professionnelle et le processus est simple. Je recommande !",
    name: "Karim Fassi",
    university: "Property Owner, Rabat",
    avatar: "KF",
    color: "#F8C051"
  }
];

// ─── State ──────────────────────────────────────────────────

let favorites = new Set();
let activeFilter = 'all';
let activeSort = 'featured';
let searchCity = '';
let searchType = '';
let searchPrice = '';

// ─── SVG Icons ──────────────────────────────────────────────

const icons = {
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  size: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  heart: '♡',
  heartFilled: '♥'
};

// ─── Render Functions ───────────────────────────────────────

function renderCities() {
  const grid = document.getElementById('cities-grid');
  if (!grid) return;

  grid.innerHTML = cities.map(c => `
    <article class="city-card animate-on-scroll" onclick="filterByCity('${c.name}')" role="button" tabindex="0" aria-label="Browse listings in ${c.name}">
      <div class="city-image" style="background: linear-gradient(to top, rgba(0,22,63,0.8), rgba(0,0,0,0.1)), url('${c.image}') center/cover no-repeat;">
      </div>
      <div class="city-info">
        <h3 class="city-name">${c.name}</h3>
        <p class="city-count" style="color: var(--accent); font-weight: 600;">${c.listings} ${t('cities.properties')}</p>
      </div>
    </article>
  `).join('');
}

function renderListings(list) {
  const grid = document.getElementById('listings-grid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>${t('noResults.title')}</h3>
        <p>${t('noResults.desc')}</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="property-card" onclick="openModal(${p.id})" role="button" tabindex="0" aria-label="View details for ${p.title}">
      <div class="property-image" style="background: ${p.gradient}; background-image: url('${p.image}'); background-size: cover; background-position: center;">
        <span class="property-badge">${p.type}</span>
        <button class="property-favorite ${favorites.has(p.id) ? 'liked' : ''}" onclick="toggleFavorite(event, ${p.id})" aria-label="Save to favorites">
          ${favorites.has(p.id) ? icons.heartFilled : icons.heart}
        </button>
      </div>
      <div class="property-info">
        <div class="property-price">${p.price.toLocaleString()} DH <span>${t('property.month')}</span></div>
        <h3 class="property-title">${p.title}</h3>
        <div class="property-location">
          ${icons.pin}
          <span>${p.neighborhood}, ${p.city}</span>
        </div>
        <div class="property-features">
          <span class="property-feature">${icons.size} ${p.size}m²</span>
          ${p.furnished ? `<span class="property-feature">✓ ${t('property.furnished')}</span>` : ''}
          ${p.features.slice(0, 2).map(f => `<span class="property-feature">${f}</span>`).join('')}
        </div>
      </div>
      <div class="property-footer">
        <div class="property-available">
          ${icons.calendar}
          <span>${p.available}</span>
        </div>
        <span>⭐ ${p.landlord.rating}</span>
      </div>
    </article>
  `).join('');
}

function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  grid.innerHTML = testimonials.map(t => `
    <article class="testimonial-card animate-on-scroll">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar" style="background: ${t.color}">${t.avatar}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-role">${t.university}</div>
        </div>
      </div>
    </article>
  `).join('');
}

// ─── Filtering & Sorting ───────────────────────────────────

function getFilteredListings() {
  // Merge preset + user-submitted listings
  var customListings = getCustomListings();
  let result = [...properties, ...customListings];

  // Type filter
  if (activeFilter !== 'all') {
    result = result.filter(p => p.type === activeFilter);
  }

  // Search filters
  if (searchCity) {
    const term = searchCity.toLowerCase();
    result = result.filter(p =>
      p.city.toLowerCase().includes(term) ||
      p.neighborhood.toLowerCase().includes(term)
    );
  }
  if (searchType) {
    result = result.filter(p => p.type === searchType);
  }
  if (searchPrice) {
    const max = parseInt(searchPrice);
    result = result.filter(p => p.price <= max);
  }

  // Sort
  switch (activeSort) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'size':
      result.sort((a, b) => b.size - a.size);
      break;
    case 'newest':
      result.sort((a, b) => new Date(a.available) - new Date(b.available));
      break;
    case 'featured':
    default:
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return result;
}

function updateListings() {
  renderListings(getFilteredListings());
}

// ─── Custom Selects ─────────────────────────────────────────

function setupCustomSelects() {
  document.querySelectorAll('.search-field select').forEach(select => {
    // Hide original select
    select.style.display = 'none';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    const selectedOpt = select.options[select.selectedIndex] || select.options[0];
    trigger.innerHTML = `<span>${selectedOpt.text}</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    wrapper.appendChild(trigger);

    const optionsList = document.createElement('div');
    optionsList.className = 'custom-select-options';
    Array.from(select.options).forEach(opt => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'custom-select-option';
      if (opt.selected) optionDiv.classList.add('selected');
      optionDiv.dataset.value = opt.value;
      optionDiv.textContent = opt.text;
      
      optionDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event('change'));
        
        trigger.querySelector('span').textContent = opt.text;
        optionsList.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
        optionDiv.classList.add('selected');
        wrapper.classList.remove('open');
      });
      optionsList.appendChild(optionDiv);
    });
    wrapper.appendChild(optionsList);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      wrapper.classList.toggle('open');
    });

    // Update on programmatic change
    select.addEventListener('change', () => {
      const newOpt = select.options[select.selectedIndex];
      trigger.querySelector('span').textContent = newOpt.text;
      optionsList.querySelectorAll('.custom-select-option').forEach(o => {
        o.classList.toggle('selected', o.dataset.value === newOpt.value);
      });
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
  });
}

function syncCustomSelects() {
  document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
    const select = wrapper.querySelector('select');
    const triggerSpan = wrapper.querySelector('.custom-select-trigger span');
    const optionDivs = wrapper.querySelectorAll('.custom-select-option');
    
    triggerSpan.textContent = select.options[select.selectedIndex].text;
    
    Array.from(select.options).forEach((opt, i) => {
      if (optionDivs[i]) {
        optionDivs[i].textContent = opt.text;
      }
    });
  });
}

// ─── Event Handlers ─────────────────────────────────────────

function searchByCity(cityName) {
  const input = document.getElementById('search-city');
  if (input) input.value = cityName;
  searchCity = cityName;
  searchType = '';
  searchPrice = '';

  // Reset type and price selects
  const typeSelect = document.getElementById('search-type');
  const priceSelect = document.getElementById('search-price');
  if (typeSelect) typeSelect.value = '';
  if (priceSelect) priceSelect.value = '';

  // Reset filter chips
  activeFilter = 'all';
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === 'all');
  });

  updateListings();

  // Scroll to listings
  document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
}

function toggleFavorite(event, id) {
  event.stopPropagation();
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  updateListings();
}

function openModal(id) {
  // Search both preset and custom listings
  var allListings = [...properties, ...getCustomListings()];
  const property = allListings.find(p => p.id === id);
  if (!property) return;

  const modal = document.getElementById('property-modal');
  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <div class="modal-image" style="background: ${property.gradient}; background-image: url('${property.image}'); background-size: cover; background-position: center;">
    </div>
    <div class="modal-details">
      <div class="modal-price">${property.price.toLocaleString()} DH <span>${t('property.month')}</span></div>
      <h2 class="modal-title">${property.title}</h2>
      <div class="modal-location">
        ${icons.pin}
        <span>${property.neighborhood}, ${property.city}</span>
      </div>

      <h3 class="modal-section-title">${t('modal.about')}</h3>
      <p class="modal-description">${property.description}</p>

      <h3 class="modal-section-title">${t('modal.details')}</h3>
      <div class="modal-amenities">
        <span class="modal-amenity">${icons.size} ${property.size}m²</span>
        <span class="modal-amenity">${property.furnished ? '✓ Furnished' : '✗ Unfurnished'}</span>
        <span class="modal-amenity">📅 Available ${property.available}</span>
        <span class="modal-amenity">🏷️ ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</span>
      </div>

      <h3 class="modal-section-title">${t('modal.amenities')}</h3>
      <div class="modal-amenities">
        ${property.features.map(f => `<span class="modal-amenity">${icons.check} ${f}</span>`).join('')}
      </div>

      <div class="modal-landlord">
        <div class="modal-landlord-avatar">${property.landlord.initials}</div>
        <div>
          <div class="modal-landlord-name">${property.landlord.name}</div>
          <div class="modal-landlord-meta">⭐ ${property.landlord.rating} · Responds ${property.landlord.responseTime}</div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-green btn-lg">${t('modal.contact')}</button>
        <button class="btn btn-outline btn-lg" onclick="toggleFavorite(event, ${property.id}); openModal(${property.id});">
          ${favorites.has(property.id) ? t('modal.saved') : t('modal.save')}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('property-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ─── Setup ──────────────────────────────────────────────────

function setupFilterChips() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      updateListings();
    });
  });
}

function setupSort() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', () => {
    activeSort = sortSelect.value;
    updateListings();
  });
}

function setupSearch() {
  const btn = document.getElementById('search-btn');
  const cityInput = document.getElementById('search-city');
  const typeSelect = document.getElementById('search-type');
  const priceSelect = document.getElementById('search-price');

  function performSearch() {
    searchCity = cityInput?.value || '';
    searchType = typeSelect?.value || '';
    searchPrice = priceSelect?.value || '';

    // Sync filter chips with search type
    if (searchType) {
      activeFilter = searchType;
      document.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === searchType);
      });
    } else {
      activeFilter = 'all';
      document.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === 'all');
      });
    }

    updateListings();
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  }

  btn?.addEventListener('click', performSearch);

  // Enter key on city input
  cityInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

function setupModal() {
  const modal = document.getElementById('property-modal');
  const closeBtn = document.getElementById('modal-close');

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Escape key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeAuthModal('signup');
      closeAuthModal('login');
      closeListingModal();
    }
  });
}

function setupMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('main-nav');

  btn?.addEventListener('click', () => {
    btn.classList.toggle('active');
    nav.classList.toggle('open');
  });

  // Close on nav link click
  nav?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      nav.classList.remove('open');
    });
  });
}

function setupHeaderScroll() {
  const header = document.getElementById('header');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    lastY = y;
  }, { passive: true });
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ─── Auth UI ────────────────────────────────────────────────

function openAuthModal(type) {
  var modal = document.getElementById(type + '-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal(type) {
  var modal = document.getElementById(type + '-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  // Clear errors
  var err = document.getElementById(type + '-error');
  if (err) err.textContent = '';
}

function switchAuthModal(to) {
  closeAuthModal(to === 'login' ? 'signup' : 'login');
  openAuthModal(to);
}

async function handleSignup(e) {
  e.preventDefault();
  var name = document.getElementById('signup-name').value.trim();
  var email = document.getElementById('signup-email').value.trim();
  var password = document.getElementById('signup-password').value;
  var confirm = document.getElementById('signup-confirm').value;
  var errorEl = document.getElementById('signup-error');

  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.';
    return;
  }
  var result = await signupUser(name, email, password);
  if (!result.success) {
    errorEl.textContent = result.error;
    return;
  }
  closeAuthModal('signup');
  updateAuthUI();
  document.getElementById('signup-form').reset();
}

async function handleLogin(e) {
  e.preventDefault();
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errorEl = document.getElementById('login-error');

  var result = await loginUser(email, password);
  if (!result.success) {
    errorEl.textContent = result.error;
    return;
  }
  closeAuthModal('login');
  updateAuthUI();
  document.getElementById('login-form').reset();
}

function handleLogout() {
  logoutUser();
  updateAuthUI();
}

function updateAuthUI() {
  var user = getCurrentUser();
  var actions = document.querySelector('.header-actions');
  var loginBtn = document.getElementById('login-btn');
  var signupBtn = document.getElementById('signup-btn');
  var mobileAuth = document.getElementById('mobile-auth-actions');

  // Remove existing user menu if any
  var existingMenu = document.getElementById('user-menu');
  if (existingMenu) existingMenu.remove();

  if (user) {
    // Hide login/signup, show user menu
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (mobileAuth) mobileAuth.style.display = 'none';

    var userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.id = 'user-menu';
    userMenu.innerHTML = `
      <div class="user-avatar">${getUserInitials(user.name)}</div>
      <span class="user-name">${user.name.split(' ')[0]}</span>
      <button class="btn-logout" onclick="handleLogout()">Logout</button>
    `;
    // Insert before lang switcher
    var langSwitcher = actions.querySelector('.lang-switcher');
    if (langSwitcher) {
      actions.insertBefore(userMenu, langSwitcher);
    } else {
      actions.appendChild(userMenu);
    }
  } else {
    // Show login/signup
    if (loginBtn) loginBtn.style.display = '';
    if (signupBtn) signupBtn.style.display = '';
    if (mobileAuth) mobileAuth.style.display = '';
  }
}

function setupAuthButtons() {
  var loginBtn = document.getElementById('login-btn');
  var signupBtn = document.getElementById('signup-btn');
  var mLoginBtn = document.getElementById('mobile-login-btn');
  var mSignupBtn = document.getElementById('mobile-signup-btn');
  
  if (loginBtn) loginBtn.addEventListener('click', function() { openAuthModal('login'); });
  if (signupBtn) signupBtn.addEventListener('click', function() { openAuthModal('signup'); });
  if (mLoginBtn) mLoginBtn.addEventListener('click', function() { openAuthModal('login'); });
  if (mSignupBtn) mSignupBtn.addEventListener('click', function() { openAuthModal('signup'); });

  // Close modals on overlay click
  ['signup-modal', 'login-modal', 'listing-modal'].forEach(function(id) {
    var overlay = document.getElementById(id);
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });
}

// ─── Listing Form ───────────────────────────────────────────

function openListingModal() {
  var user = getCurrentUser();
  if (!user) {
    openAuthModal('signup');
    return;
  }
  // Reset form
  var formBody = document.getElementById('listing-form-body');
  var form = document.getElementById('listing-form');
  if (form) form.reset();
  // Restore form if it was replaced by success message
  if (!form) location.reload();
  var modal = document.getElementById('listing-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeListingModal() {
  var modal = document.getElementById('listing-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

async function handleListingSubmit(e) {
  e.preventDefault();
  var errorEl = document.getElementById('listing-error');

  // Collect amenities
  var amenities = [];
  document.querySelectorAll('#amenity-checkboxes input[type="checkbox"]:checked').forEach(function(cb) {
    amenities.push(cb.value);
  });

  var data = {
    title: document.getElementById('listing-title').value.trim(),
    city: document.getElementById('listing-city').value,
    neighborhood: document.getElementById('listing-neighborhood').value.trim(),
    type: document.getElementById('listing-type').value,
    price: document.getElementById('listing-price').value,
    size: document.getElementById('listing-size').value,
    available: document.getElementById('listing-available').value,
    furnished: document.getElementById('listing-furnished').checked,
    features: amenities,
    description: document.getElementById('listing-description').value.trim()
  };

  var fileInput = document.getElementById('listing-image');
  if (fileInput && fileInput.files.length > 0) {
    var formData = new FormData();
    formData.append('file', fileInput.files[0]);
    try {
      var uploadRes = await fetch(API_URL + '/upload', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        var uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.imageUrl) {
          data.imageUrl = uploadJson.imageUrl;
        }
      }
    } catch (e) {
      console.error('Image upload failed', e);
    }
  }

  // Validate
  if (!data.title || !data.city || !data.type || !data.price || !data.size || !data.description) {
    errorEl.textContent = 'Please fill in all required fields.';
    return;
  }

  // Save listing
  var listing = await saveCustomListing(data);

  // Show success
  var formBody = document.getElementById('listing-form-body');
  formBody.innerHTML = `
    <div class="form-success">
      <div class="form-success-icon">🎉</div>
      <h3>Listing Published!</h3>
      <p>Your property has been published successfully!<br>Students can now see it in the listings section.</p>
      <button class="btn btn-green btn-lg" onclick="closeListingModal(); updateListings();">View Listings</button>
    </div>
  `;

  // Update the listings grid
  updateListings();
}

// ─── Language Switching ─────────────────────────────────────

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('studynest-lang', lang);
  applyTranslations();
}

function applyTranslations() {
  // Direction and lang attribute
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

  // Navigation links
  var navLinks = document.querySelectorAll('#main-nav .nav-link');
  var navKeys = ['nav.browse', 'nav.cities', 'nav.how', 'nav.landlords'];
  navLinks.forEach(function(link, i) { if (navKeys[i]) link.textContent = t(navKeys[i]); });

  // Header buttons
  var loginBtn = document.getElementById('login-btn');
  var signupBtn = document.getElementById('signup-btn');
  if (loginBtn) loginBtn.textContent = t('btn.login');
  if (signupBtn) signupBtn.textContent = t('btn.signup');

  // Hero
  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle) heroTitle.innerHTML = t('hero.title1') + '<br><span class="text-accent">' + t('hero.title2') + '</span>';
  var heroSub = document.querySelector('.hero-subtitle');
  if (heroSub) heroSub.textContent = t('hero.subtitle');

  // Search inputs
  var cityInput = document.getElementById('search-city');
  if (cityInput) cityInput.placeholder = t('search.city');

  var typeSelect = document.getElementById('search-type');
  if (typeSelect) {
    var typeKeys = ['search.allTypes', 'search.room', 'search.studio', 'search.apartment', 'search.shared'];
    Array.from(typeSelect.options).forEach(function(opt, i) { if (typeKeys[i]) opt.text = t(typeKeys[i]); });
  }

  var priceSelect = document.getElementById('search-price');
  if (priceSelect) priceSelect.options[0].text = t('search.maxPrice');

  // Search button
  var searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> ' + t('search.btn');
  }

  // Stats
  var statLabels = document.querySelectorAll('.stat-label');
  var statKeys = ['stats.listings', 'stats.cities', 'stats.students', 'stats.rating'];
  statLabels.forEach(function(label, i) { if (statKeys[i]) label.textContent = t(statKeys[i]); });

  // Section headers
  var sectionMap = [
    { sel: '#cities', t: 'cities.title', s: 'cities.subtitle' },
    { sel: '#listings', t: 'listings.title', s: 'listings.subtitle' },
    { sel: '#how-it-works', t: 'how.title', s: 'how.subtitle' },
    { sel: '#testimonials', t: 'testimonials.title', s: 'testimonials.subtitle' }
  ];
  sectionMap.forEach(function(sec) {
    var el = document.querySelector(sec.sel);
    if (el) {
      var title = el.querySelector('.section-title');
      var sub = el.querySelector('.section-subtitle');
      if (title) title.textContent = t(sec.t);
      if (sub) sub.textContent = t(sec.s);
    }
  });

  // Filter chips
  var chips = document.querySelectorAll('.filter-chip');
  var chipKeys = ['filter.all', 'filter.rooms', 'filter.studios', 'filter.apartments', 'filter.shared'];
  chips.forEach(function(chip, i) { if (chipKeys[i]) chip.textContent = t(chipKeys[i]); });

  // Sort select
  var sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    var sortKeys = ['sort.featured', 'sort.priceLow', 'sort.priceHigh', 'sort.size', 'sort.newest'];
    Array.from(sortSelect.options).forEach(function(opt, i) { if (sortKeys[i]) opt.text = t(sortKeys[i]); });
  }

  // How it works steps
  var stepCards = document.querySelectorAll('.step-card');
  var stepData = [
    { t: 'step1.title', d: 'step1.desc' }, { t: 'step2.title', d: 'step2.desc' },
    { t: 'step3.title', d: 'step3.desc' }, { t: 'step4.title', d: 'step4.desc' }
  ];
  stepCards.forEach(function(card, i) {
    if (stepData[i]) {
      var ti = card.querySelector('.step-title');
      var de = card.querySelector('.step-desc');
      if (ti) ti.textContent = t(stepData[i].t);
      if (de) de.textContent = t(stepData[i].d);
    }
  });

  // CTA section
  var ctaTitle = document.querySelector('.cta-title');
  var ctaDesc = document.querySelector('.cta-desc');
  var ctaBtn = document.querySelector('.cta-section .btn');
  if (ctaTitle) ctaTitle.textContent = t('cta.title');
  if (ctaDesc) ctaDesc.textContent = t('cta.desc');
  if (ctaBtn) ctaBtn.textContent = t('cta.btn');

  // View All button
  var viewAllBtn = document.getElementById('load-more-btn');
  if (viewAllBtn) viewAllBtn.textContent = t('property.viewAll');

  // Footer
  var footerDesc = document.querySelector('.footer-desc');
  if (footerDesc) footerDesc.textContent = t('footer.desc');

  var footerHeadings = document.querySelectorAll('.footer-links h4');
  var fhKeys = ['footer.students', 'footer.landlords', 'footer.company'];
  footerHeadings.forEach(function(h, i) { if (fhKeys[i]) h.textContent = t(fhKeys[i]); });

  var footerSections = document.querySelectorAll('.footer-links');
  var flKeys = [
    ['footer.browseRooms', 'footer.howItWorks', 'footer.studentTips', 'footer.faq'],
    ['footer.listProperty', 'footer.pricing', 'footer.landlordGuide', 'footer.support'],
    ['footer.about', 'footer.contact', 'footer.privacy', 'footer.terms']
  ];
  footerSections.forEach(function(sec, i) {
    if (flKeys[i]) {
      var links = sec.querySelectorAll('a');
      links.forEach(function(a, j) { if (flKeys[i][j]) a.textContent = t(flKeys[i][j]); });
    }
  });

  var copyright = document.querySelector('.footer-bottom p');
  if (copyright) copyright.textContent = t('footer.copyright');

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  // Re-render dynamic content with new language
  renderCities();
  updateListings();
  syncCustomSelects();
}

function setupLanguageSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchLanguage(btn.dataset.lang);
    });
  });
}

// ─── Initialize ─────────────────────────────────────────────

async function init() {
  // Load listings from API/localStorage before first render
  await loadCustomListingsFromAPI();

  renderCities();
  renderListings(getFilteredListings());
  renderTestimonials();

  setupFilterChips();
  setupSort();
  setupSearch();
  setupModal();
  setupMobileMenu();
  setupHeaderScroll();
  setupLanguageSwitcher();
  setupAuthButtons();
  updateAuthUI();
  setupCustomSelects();

  // Apply saved language preference
  applyTranslations();

  // Delay observer setup to let DOM render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setupIntersectionObserver();
    });
  });
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
