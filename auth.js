/* ============================================================
   StudyNest — Authentication & Listing Storage
   Now connects to FastAPI backend with localStorage fallback
   ============================================================ */

var API_URL = (function() {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.origin && window.location.origin !== 'null') {
      return window.location.origin + '/api';
    }
  }
  return 'http://127.0.0.1:8000/api';
})();
var AUTH_SESSION_KEY = 'studynest-session';
var CUSTOM_LISTINGS_KEY = 'studynest-custom-listings';

// ─── Listings Cache (keeps getCustomListings synchronous) ────
var cachedCustomListings = [];
var nextLocalId = 1000;

// ─── API Helper ─────────────────────────────────────────────

async function apiPost(endpoint, data) {
  try {
    var res = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    var json = await res.json();
    if (!res.ok) return { success: false, error: json.detail || 'Request failed.' };
    json.success = true;
    return json;
  } catch (err) {
    return { success: false, error: 'Cannot connect to server. Using offline mode.' };
  }
}

// ─── Session Management (always localStorage) ───────────────

function setSession(user) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    id: user.id, name: user.name, email: user.email
  }));
}

function getCurrentUser() {
  try {
    var s = localStorage.getItem(AUTH_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

function logoutUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function getUserInitials(name) {
  return name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
}

// ─── Signup ─────────────────────────────────────────────────

async function signupUser(name, email, password) {
  // Try API first
  var result = await apiPost('/signup', { name: name, email: email, password: password });
  if (result.success && result.user) {
    setSession(result.user);
    return { success: true, user: result.user };
  }
  // If API returned an error (like "email already registered"), return it
  if (result.error && !result.error.includes('Cannot connect')) {
    return result;
  }
  // Fallback: localStorage signup
  var users = getLocalUsers();
  if (users.find(function(u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
    return { success: false, error: 'This email is already registered.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }
  var user = { id: Date.now(), name: name.trim(), email: email.toLowerCase().trim(), password: password };
  users.push(user);
  localStorage.setItem('studynest-users', JSON.stringify(users));
  setSession(user);
  return { success: true, user: user };
}

// ─── Login ──────────────────────────────────────────────────

async function loginUser(email, password) {
  // Try API first
  var result = await apiPost('/login', { email: email, password: password });
  if (result.success && result.user) {
    setSession(result.user);
    return { success: true, user: result.user };
  }
  // Fallback: localStorage login (e.g. user registered when offline/bugged)
  var users = getLocalUsers();
  var user = users.find(function(u) {
    return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
  });
  if (user) {
    setSession(user);
    return { success: true, user: user };
  }
  return result;
}

// ─── Local user storage (fallback) ──────────────────────────

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem('studynest-users') || '[]'); }
  catch (e) { return []; }
}

// ─── Load Listings from API (populates cache) ───────────────

async function loadCustomListingsFromAPI() {
  try {
    var res = await fetch(API_URL + '/listings');
    if (res.ok) {
      cachedCustomListings = await res.json();
      return;
    }
  } catch (e) { /* API offline */ }
  // Fallback: localStorage
  try {
    cachedCustomListings = JSON.parse(localStorage.getItem(CUSTOM_LISTINGS_KEY) || '[]');
  } catch (e) {
    cachedCustomListings = [];
  }
}

// ─── Get Listings (synchronous — reads from cache) ──────────

function getCustomListings() {
  return cachedCustomListings;
}

// ─── Save Listing ───────────────────────────────────────────

async function saveCustomListing(data) {
  var user = getCurrentUser();
  var payload = {
    title: data.title,
    city: data.city,
    neighborhood: data.neighborhood,
    type: data.type,
    price: parseInt(data.price),
    size: parseInt(data.size),
    available: data.available,
    furnished: data.furnished || false,
    features: data.features || [],
    description: data.description,
    imageUrl: data.imageUrl,
    userId: user ? user.id : null
  };

  // Try API
  try {
    var res = await fetch(API_URL + '/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      var json = await res.json();
      await loadCustomListingsFromAPI(); // refresh cache from API
      return json;
    }
  } catch (e) { /* API offline, fall through */ }

  // Fallback: localStorage
  var gradientPool = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)"
  ];
  var typeIcons = { room: '🛏️', studio: '🏙️', apartment: '🏢', shared: '🏠' };
  var typeImages = { room: 'images/room1.jpg', studio: 'images/room2.jpg', apartment: 'images/room4.jpg', shared: 'images/room3.jpg' };
  var localListings = JSON.parse(localStorage.getItem(CUSTOM_LISTINGS_KEY) || '[]');

  var listing = {
    id: nextLocalId++,
    title: payload.title, city: payload.city, neighborhood: payload.neighborhood,
    price: payload.price, type: payload.type, size: payload.size,
    furnished: payload.furnished, available: payload.available,
    features: payload.features, description: payload.description,
    gradient: gradientPool[localListings.length % gradientPool.length],
    image: payload.imageUrl || typeImages[payload.type] || 'images/room1.jpg',
    icon: typeIcons[payload.type] || '🏠',
    landlord: { name: user ? user.name : 'Anonymous', initials: user ? getUserInitials(user.name) : 'AN', rating: 0, responseTime: 'New' },
    featured: false, isCustom: true, userId: payload.userId,
    createdAt: new Date().toISOString()
  };

  localListings.push(listing);
  localStorage.setItem(CUSTOM_LISTINGS_KEY, JSON.stringify(localListings));
  cachedCustomListings = localListings;
  return listing;
}

async function updateCustomListing(id, data) {
  try {
    var res = await fetch(API_URL + '/listings/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      await loadCustomListingsFromAPI();
    }
  } catch (e) {
    console.error('Failed to update listing', e);
  }
}

// ─── Delete Listing ─────────────────────────────────────────

async function deleteCustomListing(id) {
  // Try API
  try {
    var res = await fetch(API_URL + '/listings/' + id, { method: 'DELETE' });
    if (res.ok) {
      await loadCustomListingsFromAPI();
      return;
    }
  } catch (e) { /* API offline */ }

  // Fallback: localStorage
  var localListings = JSON.parse(localStorage.getItem(CUSTOM_LISTINGS_KEY) || '[]');
  localListings = localListings.filter(function(l) { return l.id !== id; });
  localStorage.setItem(CUSTOM_LISTINGS_KEY, JSON.stringify(localListings));
  cachedCustomListings = localListings;
}
