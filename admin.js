/**
 * SAHAYAK-DRISHTI — Admin Panel JavaScript
 * admin.js
 *
 * All CRUD operations talk to the Spring Boot REST API:
 *   GET    /api/admin/stats
 *   GET    /api/admin/locations
 *   GET    /api/admin/locations/{id}
 *   POST   /api/admin/locations
 *   PUT    /api/admin/locations/{id}
 *   DELETE /api/admin/locations/{id}
 *   PATCH  /api/admin/locations/{id}/activate
 *   PATCH  /api/admin/locations/{id}/deactivate
 *   GET    /api/admin/search?q=keyword
 *
 * Auth: HTTP Basic (credentials stored in sessionStorage only for convenience)
 */

'use strict';

// ── STATE ─────────────────────────────────────────────────
const adminState = {
  allLocations: [],
  editMode: false,
  editId: null,
  searchTimer: null,
};

// ── AUTH HEADER ──────────────────────────────────────────
// Spring Security HTTP Basic — browser will prompt once.
// We use fetch with credentials: 'include' so the browser handles it.
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadRecentLocations();
  setupCharCounters();
});

// ── TAB NAVIGATION ───────────────────────────────────────
window.showTab = function(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById(`tab-${name}`);
  if (section) section.classList.add('active');

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(name)) {
      n.classList.add('active');
    }
  });

  const titles = { dashboard: 'Dashboard', locations: 'All Locations', add: 'Add / Edit Location' };
  document.getElementById('page-title').textContent = titles[name] || name;

  if (name === 'locations') loadAllLocations();
  if (name === 'dashboard') { loadStats(); loadRecentLocations(); }
};

// ── API HELPER ───────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include', // Send Basic auth cookie/header managed by browser
    headers: API_HEADERS,
    ...options,
  });

  if (res.status === 401) {
    alert('Session expired. Please log in again.');
    window.location.reload();
    return null;
  }

  return res;
}

// ── LOAD STATS ───────────────────────────────────────────
async function loadStats() {
  try {
    const res = await apiFetch('/api/admin/stats');
    if (!res || !res.ok) return;
    const data = await res.json();

    document.getElementById('stat-total').textContent     = data.totalLocations;
    document.getElementById('stat-active').textContent    = data.activeLocations;
    document.getElementById('stat-inactive').textContent  = data.inactiveLocations;
    document.getElementById('stat-buildings').textContent = data.totalBuildings;

    // Remove pulse animation once data loads
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('loading-pulse'));
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// ── LOAD RECENT LOCATIONS (dashboard) ───────────────────
async function loadRecentLocations() {
  const container = document.getElementById('recent-list');
  if (!container) return;

  try {
    const res = await apiFetch('/api/admin/locations');
    if (!res || !res.ok) { container.innerHTML = '<p class="empty-state">Failed to load.</p>'; return; }
    const data = await res.json();
    adminState.allLocations = data;

    const recent = data.slice(0, 5); // Show last 5
    container.innerHTML = renderTable(recent, true);
  } catch (err) {
    container.innerHTML = '<p class="empty-state">⚠️ Could not connect to server.</p>';
  }
}

// ── LOAD ALL LOCATIONS ───────────────────────────────────
window.loadAllLocations = async function() {
  const container = document.getElementById('location-list');
  container.innerHTML = '<div class="spinner"></div>';

  try {
    const res = await apiFetch('/api/admin/locations');
    if (!res || !res.ok) { container.innerHTML = '<p class="empty-state">Failed to load.</p>'; return; }
    const data = await res.json();
    adminState.allLocations = data;

    if (data.length === 0) {
      container.innerHTML = '<div class="empty-state"><span>📍</span>No locations yet. <a href="#" onclick="showTab(\'add\')">Add the first one →</a></div>';
      return;
    }
    container.innerHTML = renderTable(data, false);
  } catch (err) {
    container.innerHTML = '<p class="empty-state">⚠️ Server unreachable. Is Spring Boot running?</p>';
  }
};

// ── RENDER TABLE ─────────────────────────────────────────
function renderTable(locations, compact) {
  if (!locations.length) {
    return '<div class="empty-state"><span>🔍</span>No results found.</div>';
  }

  const rows = locations.map(loc => `
    <tr>
      <td><span class="loc-key">${esc(loc.locationKey)}</span></td>
      <td>
        <div class="loc-name">${esc(loc.nameEn)}</div>
        <div class="loc-building">${esc(loc.building || '')} ${loc.floor ? '· ' + esc(loc.floor) : ''}</div>
      </td>
      ${compact ? '' : `<td class="loc-building">${esc(loc.building || '—')}</td>`}
      <td><span class="badge ${loc.active ? 'badge-active' : 'badge-inactive'}">${loc.active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="action-row">
          <button class="action-btn" onclick="editLocation(${loc.id})">✎ Edit</button>
          <button class="action-btn btn-qr"  onclick="showQR('${esc(loc.locationKey)}', '${esc(loc.nameEn)}')">QR</button>
          <button class="action-btn btn-tog" onclick="toggleActive(${loc.id}, ${loc.active})">${loc.active ? '🚫 Disable' : '✅ Enable'}</button>
          ${compact ? '' : `<button class="action-btn btn-del" onclick="confirmDelete(${loc.id}, '${esc(loc.nameEn)}')">✕ Delete</button>`}
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <table class="loc-table">
      <thead>
        <tr>
          <th>Key</th>
          <th>Name</th>
          ${compact ? '' : '<th>Building</th>'}
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ── SEARCH ───────────────────────────────────────────────
window.debounceSearch = function(value) {
  clearTimeout(adminState.searchTimer);
  adminState.searchTimer = setTimeout(() => runSearch(value), 350);
};

async function runSearch(keyword) {
  const container = document.getElementById('location-list');
  if (!keyword.trim()) { loadAllLocations(); return; }

  container.innerHTML = '<div class="spinner"></div>';
  try {
    const res = await apiFetch(`/api/admin/search?q=${encodeURIComponent(keyword)}`);
    if (!res || !res.ok) return;
    const data = await res.json();
    container.innerHTML = renderTable(data, false);
  } catch (err) {
    console.error(err);
  }
}

// ── FORM: SUBMIT (CREATE or UPDATE) ─────────────────────
window.submitForm = async function() {
  clearErrors();

  const payload = {
    locationKey: val('f-key'),
    nameEn:      val('f-name-en'),
    nameHi:      val('f-name-hi'),
    scriptEn:    val('f-script-en'),
    scriptHi:    val('f-script-hi'),
    floor:       val('f-floor'),
    building:    val('f-building'),
    active:      document.getElementById('f-active').checked,
  };

  // Client-side validation
  let hasError = false;
  if (!payload.locationKey) { setError('err-key', 'Required'); hasError = true; }
  if (!/^[a-z0-9_]+$/.test(payload.locationKey)) { setError('err-key', 'Only lowercase, digits, underscores'); hasError = true; }
  if (!payload.nameEn)   { setError('err-name-en', 'Required'); hasError = true; }
  if (!payload.nameHi)   { setError('err-name-hi', 'Required'); hasError = true; }
  if (!payload.scriptEn) { setError('err-script-en', 'Required'); hasError = true; }
  if (!payload.scriptHi) { setError('err-script-hi', 'Required'); hasError = true; }
  if (hasError) return;

  const submitBtn = document.getElementById('btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>⟳ Saving...</span>';

  try {
    let res, method, url;

    if (adminState.editMode && adminState.editId) {
      url    = `/api/admin/locations/${adminState.editId}`;
      method = 'PUT';
    } else {
      url    = '/api/admin/locations';
      method = 'POST';
    }

    res = await apiFetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (!res) return;

    if (res.ok) {
      const created = await res.json();
      showToast(`✅ Location "${created.nameEn}" ${adminState.editMode ? 'updated' : 'created'} successfully!`, 'success');
      resetForm();
      document.getElementById('btn-preview').style.display = 'inline-flex';
    } else {
      const err = await res.json();
      if (err.error === 'DUPLICATE_KEY') {
        setError('err-key', 'This key already exists. Choose a different one.');
      } else if (err.fields) {
        Object.entries(err.fields).forEach(([f, msg]) => {
          const map = { locationKey: 'err-key', nameEn: 'err-name-en', nameHi: 'err-name-hi', scriptEn: 'err-script-en', scriptHi: 'err-script-hi' };
          if (map[f]) setError(map[f], msg);
        });
      } else {
        showToast(`❌ Error: ${err.message || err.error || 'Unknown error'}`, 'error-toast');
      }
    }
  } catch (err) {
    showToast('❌ Network error. Is the server running?', 'error-toast');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span id="submit-label">${adminState.editMode ? '✓ Update Location' : '＋ Create Location'}</span>`;
  }
};

// ── FORM: LOAD FOR EDIT ──────────────────────────────────
window.editLocation = async function(id) {
  showTab('add');

  try {
    const res = await apiFetch(`/api/admin/locations/${id}`);
    if (!res || !res.ok) { alert('Failed to load location.'); return; }
    const data = await res.json();

    // Populate form
    set('f-key',       data.locationKey);
    set('f-name-en',   data.nameEn);
    set('f-name-hi',   data.nameHi);
    set('f-script-en', data.scriptEn);
    set('f-script-hi', data.scriptHi);
    set('f-floor',     data.floor || '');
    set('f-building',  data.building || '');
    document.getElementById('f-active').checked = data.active;
    document.getElementById('edit-id').value = data.id;

    // Update char counts
    updateCharCount('f-script-en', 'cnt-en');
    updateCharCount('f-script-hi', 'cnt-hi');

    // Switch to edit mode UI
    adminState.editMode = true;
    adminState.editId   = id;
    document.getElementById('form-title').textContent    = '✎ Edit Location';
    document.getElementById('form-subtitle').textContent = `Editing: ${data.nameEn} (${data.locationKey})`;
    document.getElementById('submit-label').textContent  = '✓ Update Location';
    document.getElementById('btn-preview').style.display = 'inline-flex';

  } catch (err) {
    alert('Error loading location for edit.');
  }
};

// ── FORM: RESET ───────────────────────────────────────────
window.resetForm = function() {
  ['f-key','f-name-en','f-name-hi','f-script-en','f-script-hi','f-floor','f-building'].forEach(id => set(id, ''));
  document.getElementById('f-active').checked   = true;
  document.getElementById('edit-id').value       = '';
  adminState.editMode = false;
  adminState.editId   = null;
  clearErrors();
  hideToast();
  document.getElementById('cnt-en').textContent = '0';
  document.getElementById('cnt-hi').textContent = '0';
  document.getElementById('form-title').textContent    = 'Add New Location';
  document.getElementById('form-subtitle').textContent = 'Fill in bilingual details for the new QR code location.';
  document.getElementById('submit-label').textContent  = '＋ Create Location';
  document.getElementById('btn-preview').style.display = 'none';
};

// ── TOGGLE ACTIVE / INACTIVE ─────────────────────────────
window.toggleActive = async function(id, currentlyActive) {
  const action = currentlyActive ? 'deactivate' : 'activate';
  try {
    const res = await apiFetch(`/api/admin/locations/${id}/${action}`, { method: 'PATCH' });
    if (res && res.ok) {
      loadAllLocations();
      loadStats();
    }
  } catch (err) {
    alert('Failed to update status.');
  }
};

// ── CONFIRM DELETE ───────────────────────────────────────
window.confirmDelete = function(id, name) {
  document.getElementById('confirm-msg').textContent = `Permanently delete "${name}"? This cannot be undone.`;
  document.getElementById('confirm-yes-btn').onclick = () => deleteLocation(id);
  document.getElementById('confirm-modal').classList.remove('hidden');
};

async function deleteLocation(id) {
  closeModal('confirm-modal');
  try {
    const res = await apiFetch(`/api/admin/locations/${id}`, { method: 'DELETE' });
    if (res && res.ok) {
      loadAllLocations();
      loadStats();
    } else {
      alert('Failed to delete location.');
    }
  } catch (err) {
    alert('Network error while deleting.');
  }
}

// ── QR MODAL ─────────────────────────────────────────────
window.showQR = function(key, name) {
  document.getElementById('qr-modal-title').textContent = `QR — ${name}`;
  document.getElementById('qr-img').src    = `/api/location/${key}/qr`;
  document.getElementById('qr-url').textContent = `${window.location.origin}/index.html?loc=${key}`;
  document.getElementById('qr-download-link').href = `/api/location/${key}/qr/download`;
  document.getElementById('qr-download-link').download = `sahayak-${key}.png`;
  document.getElementById('qr-modal').classList.remove('hidden');
};

// ── PREVIEW AUDIO ────────────────────────────────────────
window.previewAudio = function() {
  const script = val('f-script-en') || val('f-script-hi');
  if (!script) { alert('Please enter a script first.'); return; }
  const u = new SpeechSynthesisUtterance(script);
  u.lang = val('f-script-en') ? 'en-IN' : 'hi-IN';
  u.rate = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};

// ── LOGOUT ───────────────────────────────────────────────
window.logout = function() {
  // Force 401 by sending wrong credentials — clears browser cached Basic auth
  fetch('/api/admin/stats', { credentials: 'include', headers: { Authorization: 'Basic invalid' } })
    .finally(() => { window.location.href = '/index.html'; });
};

// ── MODALS ───────────────────────────────────────────────
window.closeModal = function(id) {
  document.getElementById(id).classList.add('hidden');
};

// ── CHAR COUNTERS ────────────────────────────────────────
function setupCharCounters() {
  document.getElementById('f-script-en').addEventListener('input', () => updateCharCount('f-script-en', 'cnt-en'));
  document.getElementById('f-script-hi').addEventListener('input', () => updateCharCount('f-script-hi', 'cnt-hi'));
}
function updateCharCount(inputId, countId) {
  const len = document.getElementById(inputId).value.length;
  const el  = document.getElementById(countId);
  if (el) { el.textContent = len; el.style.color = len > 1800 ? 'var(--red)' : 'var(--grey)'; }
}

// ── TOAST NOTIFICATIONS ───────────────────────────────────
function showToast(msg, type) {
  const t = document.getElementById('form-toast');
  t.textContent = msg;
  t.className = `form-toast ${type}`;
  setTimeout(() => hideToast(), 4000);
}
function hideToast() {
  const t = document.getElementById('form-toast');
  if (t) t.className = 'form-toast hidden';
}

// ── FORM HELPERS ─────────────────────────────────────────
function val(id) { return (document.getElementById(id)?.value || '').trim(); }
function set(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
function setError(id, msg)  { const el = document.getElementById(id); if (el) el.textContent = msg; const inp = el?.previousElementSibling; if (inp?.classList) inp.classList.add('error'); }
function clearErrors() { document.querySelectorAll('.field-error').forEach(e => e.textContent = ''); document.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error')); }

// ── HTML ESCAPING ─────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
