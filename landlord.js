/* ============================================================
   StudyNest — Landlord Dashboard Logic
   ============================================================ */

// ─── Page Init ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function() {
  await loadCustomListingsFromAPI();
  updateDashboardUI();
  setupLandlordForm();
  setupLangSwitcher();
  setupMobileMenu();
  setupHeaderScroll();

  // Escape closes modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAuthModalLL('signup');
      closeAuthModalLL('login');
    }
  });

  // Close modals on overlay click
  ['signup-modal', 'login-modal'].forEach(function(id) {
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
});

// ─── Dashboard UI ───────────────────────────────────────────

function updateDashboardUI() {
  var user = getCurrentUser();
  var authGate = document.getElementById('auth-gate');
  var dashboard = document.getElementById('dashboard');
  var loginBtn = document.getElementById('login-btn');
  var signupBtn = document.getElementById('signup-btn');
  var menuSlot = document.getElementById('user-menu-slot');

  if (user) {
    // Show dashboard
    authGate.style.display = 'none';
    dashboard.style.display = 'block';

    // Header: show user menu
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    menuSlot.innerHTML = '<div class="user-menu">' +
      '<div class="user-avatar">' + getUserInitials(user.name) + '</div>' +
      '<span class="user-name">' + user.name.split(' ')[0] + '</span>' +
      '<button class="btn-logout" onclick="handleLandlordLogout()">Logout</button>' +
    '</div>';

    // Dashboard name
    document.getElementById('dash-user-name').textContent = user.name.split(' ')[0];

    // Render listings
    renderMyListings();
  } else {
    // Show auth gate
    authGate.style.display = '';
    dashboard.style.display = 'none';

    if (loginBtn) loginBtn.style.display = '';
    if (signupBtn) signupBtn.style.display = '';
    menuSlot.innerHTML = '';
  }
}

// ─── My Listings ────────────────────────────────────────────

function renderMyListings() {
  var user = getCurrentUser();
  if (!user) return;

  var grid = document.getElementById('my-listings-grid');
  var allCustom = getCustomListings();
  var myListings = allCustom.filter(function(l) { return l.userId === user.id; });

  // Update stat
  document.getElementById('stat-listings').textContent = myListings.length;

  if (myListings.length === 0) {
    grid.innerHTML = '<div class="listings-empty">' +
      '<div class="listings-empty-icon">🏠</div>' +
      '<h3>No listings yet</h3>' +
      '<p>Fill out the form to publish your first property listing and start reaching students!</p>' +
    '</div>';
    return;
  }

  var typeImages = { room: 'images/room1.jpg', studio: 'images/room2.jpg', apartment: 'images/room4.jpg', shared: 'images/room3.jpg' };

  grid.innerHTML = myListings.map(function(l) {
    var img = l.image || typeImages[l.type] || 'images/room1.jpg';
    var grad = l.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    return '<div class="my-listing-card">' +
      '<div class="my-listing-thumb" style="background: ' + grad + '; background-image: url(\'' + img + '\'); background-size: cover; background-position: center;"></div>' +
      '<div class="my-listing-info">' +
        '<div class="my-listing-title">' + l.title + '</div>' +
        '<div class="my-listing-meta">📍 ' + l.neighborhood + ', ' + l.city + ' · ' + l.size + 'm²</div>' +
        '<div class="my-listing-price">' + l.price.toLocaleString() + ' DH<span style="font-weight:400;color:var(--text-muted);font-size:0.75rem"> /month</span></div>' +
      '</div>' +
      '<div class="my-listing-actions">' +
        '<span class="my-listing-badge">' + l.type + '</span>' +
        '<div class="my-listing-buttons">' +
          '<button class="btn-edit" onclick="editListing(' + l.id + ')" title="Edit listing">✏️ Edit</button>' +
          '<button class="btn-delete" onclick="deleteListing(' + l.id + ')" title="Delete listing">🗑️ Delete</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ─── Form Handling ──────────────────────────────────────────

let currentEditingId = null;

function setupLandlordForm() {
  // Character counter for description
  var desc = document.getElementById('ll-description');
  var counter = document.getElementById('ll-char-count');
  if (desc && counter) {
    desc.addEventListener('input', function() {
      counter.textContent = desc.value.length;
    });
  }

  // Set min date to today
  var dateInput = document.getElementById('ll-available');
  if (dateInput) {
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
  }
}

async function handleLandlordSubmit(e) {
  e.preventDefault();
  var errorEl = document.getElementById('ll-error');
  errorEl.textContent = '';

  // Collect amenities
  var amenities = [];
  document.querySelectorAll('#ll-amenities input[type="checkbox"]:checked').forEach(function(cb) {
    amenities.push(cb.value);
  });

  var data = {
    title: document.getElementById('ll-title').value.trim(),
    city: document.getElementById('ll-city').value,
    neighborhood: document.getElementById('ll-neighborhood').value.trim(),
    type: document.getElementById('ll-type').value,
    price: document.getElementById('ll-price').value,
    size: document.getElementById('ll-size').value,
    available: document.getElementById('ll-available').value,
    furnished: document.getElementById('ll-furnished').checked,
    features: amenities,
    description: document.getElementById('ll-description').value.trim()
  };

  var fileInput = document.getElementById('ll-image');
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

  if (currentEditingId) {
    await updateCustomListing(currentEditingId, data);
    showToast('Listing updated successfully! 🎉');
    cancelEdit();
  } else {
    await saveCustomListing(data);
    showToast('Property published successfully! 🎉');
    document.getElementById('landlord-form').reset();
    document.getElementById('ll-char-count').textContent = '0';
  }

  // Refresh listings
  renderMyListings();

  // Scroll to listings panel on mobile
  if (window.innerWidth < 1024) {
    document.querySelector('.dash-listings-panel').scrollIntoView({ behavior: 'smooth' });
  }
}

async function deleteListing(id) {
  if (!confirm('Are you sure you want to delete this listing?')) return;
  await deleteCustomListing(id);
  renderMyListings();
  showToast('Listing deleted');
}

function editListing(id) {
  var allCustom = getCustomListings();
  var listing = allCustom.find(function(l) { return l.id === id; });
  if (!listing) return;

  currentEditingId = id;
  
  // Populate form
  document.getElementById('ll-title').value = listing.title;
  document.getElementById('ll-city').value = listing.city;
  document.getElementById('ll-neighborhood').value = listing.neighborhood;
  document.getElementById('ll-type').value = listing.type;
  document.getElementById('ll-price').value = listing.price;
  document.getElementById('ll-size').value = listing.size;
  document.getElementById('ll-available').value = listing.available;
  document.getElementById('ll-furnished').checked = listing.furnished;
  document.getElementById('ll-description').value = listing.description;
  document.getElementById('ll-char-count').textContent = listing.description.length;

  // Checkboxes
  document.querySelectorAll('#ll-amenities input[type="checkbox"]').forEach(function(cb) {
    cb.checked = listing.features.includes(cb.value);
  });

  // Change UI
  document.getElementById('ll-submit-btn').innerHTML = '💾 Update Listing';
  var cancelBtn = document.getElementById('ll-cancel-btn');
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';
  
  document.querySelector('.dash-form-card').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  currentEditingId = null;
  document.getElementById('landlord-form').reset();
  document.getElementById('ll-char-count').textContent = '0';
  document.getElementById('ll-submit-btn').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"></polyline></svg> Publish Listing';
  var cancelBtn = document.getElementById('ll-cancel-btn');
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// ─── Toast ──────────────────────────────────────────────────

function showToast(message) {
  var toast = document.getElementById('toast');
  var text = document.getElementById('toast-text');
  text.textContent = message;
  toast.style.display = 'flex';

  setTimeout(function() {
    toast.style.display = 'none';
  }, 3000);
}

// ─── Auth (Landlord Page) ───────────────────────────────────

function openSignupRedirect() {
  var modal = document.getElementById('signup-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openLoginRedirect() {
  var modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModalLL(type) {
  var modal = document.getElementById(type + '-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  var err = document.getElementById(type + '-error');
  if (err) err.textContent = '';
}

function switchModal(to) {
  closeAuthModalLL(to === 'login' ? 'signup' : 'login');
  if (to === 'login') openLoginRedirect();
  else openSignupRedirect();
}

async function handleSignupLL(e) {
  e.preventDefault();
  var name = document.getElementById('signup-name').value.trim();
  var email = document.getElementById('signup-email').value.trim();
  var password = document.getElementById('signup-password').value;
  var confirm = document.getElementById('signup-confirm').value;
  var errorEl = document.getElementById('signup-error');

  if (password !== confirm) { errorEl.textContent = 'Passwords do not match.'; return; }
  var result = await signupUser(name, email, password);
  if (!result.success) { errorEl.textContent = result.error; return; }
  closeAuthModalLL('signup');
  updateDashboardUI();
}

async function handleLoginLL(e) {
  e.preventDefault();
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errorEl = document.getElementById('login-error');

  var result = await loginUser(email, password);
  if (!result.success) { errorEl.textContent = result.error; return; }
  closeAuthModalLL('login');
  updateDashboardUI();
}

function handleLandlordLogout() {
  logoutUser();
  updateDashboardUI();
}

// ─── Language Switcher ──────────────────────────────────────

function setupLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      currentLang = btn.dataset.lang;
      localStorage.setItem('studynest-lang', currentLang);
      document.documentElement.lang = currentLang;
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
      document.querySelectorAll('.lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.lang === currentLang);
      });
    });
  });

  // Apply saved lang
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
}

// ─── Mobile Menu ────────────────────────────────────────────

function setupMobileMenu() {
  var btn = document.getElementById('mobile-menu-btn');
  var nav = document.getElementById('main-nav');
  if (btn && nav) {
    btn.addEventListener('click', function() {
      btn.classList.toggle('active');
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        btn.classList.remove('active');
        nav.classList.remove('open');
      });
    });
  }
}

function setupHeaderScroll() {
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }
}
