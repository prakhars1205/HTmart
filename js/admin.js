// HT Mart Admin Panel
// Handles login, role check, and editing of all site content stored in Supabase.

const TABLES = {
  services: {
    table: 'services',
    label: 'Services',
    orderBy: 'sort_order',
    fields: [
      { name: 'icon', label: 'Icon (emoji)', type: 'text' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'headline', label: 'Headline (Services page heading)', type: 'text' },
      { name: 'description', label: 'Short Description (Home card)', type: 'textarea' },
      { name: 'detail', label: 'Detailed Description (Services page)', type: 'textarea' },
      { name: 'tags', label: 'Tags (comma-separated)', type: 'tags' },
      { name: 'sort_order', label: 'Order (lower = first)', type: 'number' },
    ],
  },
  portfolio: {
    table: 'portfolio_items',
    label: 'Portfolio',
    orderBy: 'sort_order',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon (emoji)', type: 'text' },
      { name: 'image_url', label: 'Photo', type: 'file', accept: 'image/*' },
      { name: 'video_url', label: 'Video', type: 'file', accept: 'video/*' },
      { name: 'gradient', label: 'Color Style (1-5, used if no photo/video)', type: 'number' },
      { name: 'featured', label: 'Show on Homepage', type: 'checkbox' },
      { name: 'size', label: 'Size (normal / large / span2)', type: 'text' },
      { name: 'sort_order', label: 'Order (lower = first)', type: 'number' },
    ],
  },
  testimonials: {
    table: 'testimonials',
    label: 'Testimonials',
    orderBy: 'sort_order',
    fields: [
      { name: 'client_name', label: 'Client Name', type: 'text' },
      { name: 'client_role', label: 'Role / Company', type: 'text' },
      { name: 'quote', label: 'Quote', type: 'textarea' },
      { name: 'photo_url', label: 'Client Photo', type: 'file', accept: 'image/*' },
      { name: 'sort_order', label: 'Order (lower = first)', type: 'number' },
    ],
  },
  team: {
    table: 'team_members',
    label: 'Team',
    orderBy: 'sort_order',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'bio', label: 'Bio', type: 'textarea' },
      { name: 'photo_url', label: 'Photo', type: 'file', accept: 'image/*' },
      { name: 'sort_order', label: 'Order (lower = first)', type: 'number' },
    ],
  },
};

const SETTINGS_FIELDS = [
  { key: 'site_logo', label: 'Site Logo', type: 'file', accept: 'image/*' },
  { key: 'hero_badge', label: 'Hero Badge Text' },
  { key: 'hero_heading_line1', label: 'Hero Heading — Line 1' },
  { key: 'hero_heading_highlight', label: 'Hero Heading — Highlighted Words' },
  { key: 'hero_heading_line2', label: 'Hero Heading — Line 2 (outlined)' },
  { key: 'hero_description', label: 'Hero Description', type: 'textarea' },
  { key: 'hero_video_url', label: 'Hero Video', type: 'file', accept: 'video/*' },
  { key: 'about_p1', label: 'About Page — Paragraph 1', type: 'textarea' },
  { key: 'about_p2', label: 'About Page — Paragraph 2', type: 'textarea' },
  { key: 'about_p3', label: 'About Page — Paragraph 3', type: 'textarea' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'contact_phone', label: 'Contact Phone' },
  { key: 'contact_address', label: 'Address' },
  { key: 'contact_address_note', label: 'Address Note' },
  { key: 'contact_hours', label: 'Business Hours' },
  { key: 'footer_tagline', label: 'Footer Tagline' },
  { key: 'copyright', label: 'Copyright Line' },
  { key: 'social_instagram', label: 'Instagram URL' },
  { key: 'social_linkedin', label: 'LinkedIn URL' },
  { key: 'social_twitter', label: 'Twitter / X URL' },
  { key: 'social_youtube', label: 'YouTube URL' },
];

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function uploadFile(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext ? '.' + ext : ''}`;
  const { error } = await supabaseClient.storage.from('media').upload(path, file);
  if (error) throw error;
  const { data } = supabaseClient.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

function fieldInput(field, value) {
  if (field.type === 'file') {
    const isVideo = (field.accept || '').startsWith('video');
    const preview = value
      ? (isVideo
          ? `<video src="${escapeHtml(value)}" class="admin-preview" controls></video>`
          : `<img src="${escapeHtml(value)}" class="admin-preview" alt="">`)
      : '';
    return `<div class="f-group">
      <label>${field.label}</label>
      ${preview}
      <input type="file" data-field="${field.name}" data-type="file" accept="${field.accept || 'image/*'}" class="f-control">
      <input type="hidden" data-field="${field.name}" data-type="file-current" value="${escapeHtml(value || '')}">
    </div>`;
  }
  if (field.type === 'textarea') {
    return `<div class="f-group"><label>${field.label}</label><textarea data-field="${field.name}" class="f-control">${escapeHtml(value)}</textarea></div>`;
  }
  if (field.type === 'checkbox') {
    return `<div class="f-group f-checkbox"><label><input type="checkbox" data-field="${field.name}" ${value ? 'checked' : ''}> ${field.label}</label></div>`;
  }
  if (field.type === 'tags') {
    const str = Array.isArray(value) ? value.join(', ') : (value || '');
    return `<div class="f-group"><label>${field.label}</label><input type="text" data-field="${field.name}" data-type="tags" class="f-control" value="${escapeHtml(str)}"></div>`;
  }
  if (field.type === 'number') {
    return `<div class="f-group"><label>${field.label}</label><input type="number" data-field="${field.name}" class="f-control" value="${escapeHtml(value == null ? '' : value)}"></div>`;
  }
  return `<div class="f-group"><label>${field.label}</label><input type="text" data-field="${field.name}" class="f-control" value="${escapeHtml(value)}"></div>`;
}

async function collectFormData(formEl, fields) {
  const obj = {};
  for (const field of fields) {
    if (field.type === 'file') {
      const fileInput = formEl.querySelector(`input[type="file"][data-field="${field.name}"]`);
      const currentInput = formEl.querySelector(`input[data-type="file-current"][data-field="${field.name}"]`);
      if (fileInput.files && fileInput.files[0]) {
        obj[field.name] = await uploadFile(fileInput.files[0]);
      } else {
        obj[field.name] = currentInput.value || null;
      }
      continue;
    }
    const input = formEl.querySelector(`[data-field="${field.name}"]:not([type="file"]):not([data-type="file-current"])`);
    if (field.type === 'checkbox') {
      obj[field.name] = input.checked;
    } else if (field.type === 'number') {
      obj[field.name] = input.value === '' ? null : Number(input.value);
    } else if (field.type === 'tags') {
      obj[field.name] = input.value.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      obj[field.name] = input.value;
    }
  }
  return obj;
}

async function renderTable(key) {
  const cfg = TABLES[key];
  const container = document.getElementById('section-' + key);
  const { data, error } = await supabaseClient.from(cfg.table).select('*').order(cfg.orderBy, { ascending: true });
  if (error) {
    container.innerHTML = `<h2>${cfg.label}</h2><p class="admin-error">${escapeHtml(error.message)}</p>`;
    return;
  }

  let html = `<h2>${cfg.label}</h2>`;
  html += `<div class="admin-card admin-add-card">
    <h3>Add New</h3>
    <form class="admin-item-form" data-action="add">
      ${cfg.fields.map(f => fieldInput(f, '')).join('')}
      <button type="submit" class="f-submit">Add</button>
    </form>
  </div>`;

  data.forEach(item => {
    html += `<div class="admin-card">
      <form class="admin-item-form" data-action="update" data-id="${item.id}">
        ${cfg.fields.map(f => fieldInput(f, item[f.name])).join('')}
        <div class="admin-card-actions">
          <button type="submit" class="f-submit">Save</button>
          <button type="button" class="admin-delete-btn" data-id="${item.id}">Delete</button>
        </div>
      </form>
    </div>`;
  });

  container.innerHTML = html;

  container.querySelector('form[data-action="add"]').addEventListener('submit', async e => {
    e.preventDefault();
    let obj;
    try {
      obj = await collectFormData(e.target, cfg.fields);
    } catch (err) { alert('Upload failed: ' + err.message); return; }
    const { error } = await supabaseClient.from(cfg.table).insert(obj);
    if (error) { alert(error.message); return; }
    renderTable(key);
  });

  container.querySelectorAll('form[data-action="update"]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let obj;
      try {
        obj = await collectFormData(form, cfg.fields);
      } catch (err) { alert('Upload failed: ' + err.message); return; }
      const { error } = await supabaseClient.from(cfg.table).update(obj).eq('id', form.dataset.id);
      if (error) { alert(error.message); return; }
      alert('Saved!');
      renderTable(key);
    });
  });

  container.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this item? This cannot be undone.')) return;
      const { error } = await supabaseClient.from(cfg.table).delete().eq('id', btn.dataset.id);
      if (error) { alert(error.message); return; }
      renderTable(key);
    });
  });
}

async function renderSettings() {
  const container = document.getElementById('section-settings');
  const { data, error } = await supabaseClient.from('site_settings').select('*');
  if (error) {
    container.innerHTML = `<h2>Site Settings</h2><p class="admin-error">${escapeHtml(error.message)}</p>`;
    return;
  }
  const map = {};
  data.forEach(row => { map[row.key] = row.value; });

  const fields = SETTINGS_FIELDS.map(f => ({ name: f.key, label: f.label, type: f.type || 'text', accept: f.accept }));

  let html = `<h2>Site Settings</h2><div class="admin-card"><form id="settingsForm">`;
  fields.forEach(f => { html += fieldInput(f, map[f.name] || ''); });
  html += `<button type="submit" class="f-submit">Save Settings</button></form></div>`;
  container.innerHTML = html;

  document.getElementById('settingsForm').addEventListener('submit', async e => {
    e.preventDefault();
    let obj;
    try {
      obj = await collectFormData(e.target, fields);
    } catch (err) { alert('Upload failed: ' + err.message); return; }
    const updates = Object.entries(obj).map(([key, value]) => ({ key, value: value == null ? '' : String(value) }));
    const { error } = await supabaseClient.from('site_settings').upsert(updates, { onConflict: 'key' });
    if (error) { alert(error.message); return; }
    alert('Settings saved!');
    renderSettings();
  });
}

async function renderUsers() {
  const container = document.getElementById('section-users');
  const { data, error } = await supabaseClient.from('profiles').select('*').order('email');
  if (error) {
    container.innerHTML = `<h2>Users</h2><p class="admin-error">${escapeHtml(error.message)}</p>`;
    return;
  }

  let html = `<h2>Users</h2>
  <p class="admin-hint">To create a new admin or editor account, add the user in Supabase → Authentication → Users (with "Auto Confirm User" on), then set their role here.</p>`;

  data.forEach(u => {
    html += `<div class="admin-card">
      <p style="margin-bottom:12px;"><strong>${escapeHtml(u.email)}</strong></p>
      <div class="f-group"><label>Role</label>
        <select data-id="${u.id}" class="f-control admin-role-select">
          <option value="editor" ${u.role === 'editor' ? 'selected' : ''}>Editor</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </div>
    </div>`;
  });
  container.innerHTML = html;

  container.querySelectorAll('.admin-role-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const { error } = await supabaseClient.from('profiles').update({ role: sel.value }).eq('id', sel.dataset.id);
      if (error) { alert(error.message); return; }
      alert('Role updated!');
    });
  });
}

function loadAllSections() {
  renderTable('services');
  renderTable('portfolio');
  renderTable('testimonials');
  renderTable('team');
  renderSettings();
  renderUsers();
}

function showLogin() {
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('dashboardView').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('dashboardView').classList.remove('hidden');
}

async function onLogin(user) {
  const { data: profile, error } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
  const role = error ? 'editor' : (profile?.role || 'editor');

  document.getElementById('currentUserEmail').textContent = user.email;
  document.getElementById('currentUserRole').textContent = role;
  document.getElementById('usersNavBtn').classList.toggle('hidden', role !== 'admin');

  showDashboard();
  loadAllSections();
}

// NAVIGATION
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + btn.dataset.section).classList.add('active');
  });
});

// LOGIN
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent = error.message;
    return;
  }
  await onLogin(data.user);
});

document.getElementById('loginPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

// CHECK EXISTING SESSION ON LOAD
(async function init() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    await onLogin(session.user);
  } else {
    showLogin();
  }
})();
