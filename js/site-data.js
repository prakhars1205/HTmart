// Loads content from Supabase and renders it into the page.
// Runs after main.js, so window.initReveal / window.goTo are available.

(function () {
  async function loadServices() {
    const { data, error } = await supabaseClient
      .from('services')
      .select('*')
      .order('sort_order');
    if (error || !data) return [];

    // Home page service cards
    const homeGrid = document.getElementById('servicesHomeGrid');
    if (homeGrid) {
      homeGrid.innerHTML = data.map(s => `
        <div class="svc-card reveal" onclick="goTo('services')">
          <div class="svc-icon">${s.icon || ''}</div>
          <h3>${s.title || ''}</h3>
          <p>${s.description || ''}</p>
          <div class="svc-arrow">→</div>
        </div>
      `).join('');
    }

    // Scrolling marquee
    const marquee = document.getElementById('marqueeTrack');
    if (marquee) {
      const items = data.map(s => `<div class="marquee-item"><span class="dot">✦</span>${s.title || ''}</div>`).join('');
      marquee.innerHTML = items + items;
    }

    // Services page detailed rows
    const detailed = document.getElementById('servicesDetailed');
    if (detailed) {
      detailed.innerHTML = data.map((s, i) => `
        <div class="svc-row ${i % 2 === 1 ? 'flip' : ''} reveal">
          <div>
            <div class="svc-row-num">${String(i + 1).padStart(2, '0')} — ${s.title || ''}</div>
            <h2>${s.headline || ''}</h2>
            <p>${s.detail || s.description || ''}</p>
            <div class="tags-row">${(s.tags || []).map(t => `<span class="pill">${t}</span>`).join('')}</div>
          </div>
          <div class="svc-row-visual">${s.icon || ''}</div>
        </div>
      `).join('');
    }

    // Portfolio filter buttons
    const filters = document.getElementById('portfolioFilters');
    if (filters) {
      filters.innerHTML = '<button class="filter-btn active">All</button>' +
        data.map(s => `<button class="filter-btn">${s.title || ''}</button>`).join('');
    }

    // Contact form "Service Needed" dropdown
    const select = document.getElementById('service');
    if (select) {
      select.innerHTML = '<option value="">Select a service...</option>' +
        data.map(s => `<option>${s.title || ''}</option>`).join('') +
        '<option>Full Package — Everything!</option>';
    }

    return data;
  }

  function portfolioMedia(p, withLabel) {
    if (p.video_url) {
      return `<video src="${p.video_url}" muted loop playsinline autoplay></video>`;
    }
    if (p.image_url) {
      return `<img src="${p.image_url}" alt="${p.title || ''}">`;
    }
    return `<div class="port-overlay-icon">${p.icon || ''}</div><div class="port-play">▶</div>${withLabel ? '<span class="port-video-label">Sample Work</span>' : ''}`;
  }

  async function loadPortfolio() {
    const { data, error } = await supabaseClient
      .from('portfolio_items')
      .select('*')
      .order('sort_order');
    if (error || !data) return [];

    const featured = data.filter(p => p.featured);

    const homeGrid = document.getElementById('portfolioHomeGrid');
    if (homeGrid) {
      homeGrid.innerHTML = featured.map(p => `
        <div class="port-card ${p.size === 'large' ? 'large' : ''} reveal">
          <div class="port-video port-gradient-${p.gradient || 1}">
            ${portfolioMedia(p)}
          </div>
          <div class="port-info">
            <div class="port-cat">${p.category || ''}</div>
            <div class="port-title">${p.title || ''}</div>
          </div>
        </div>
      `).join('');
    }

    const masonry = document.getElementById('portfolioMasonry');
    if (masonry) {
      masonry.innerHTML = data.map(p => `
        <div class="port-item ${p.size === 'span2' ? 'span2' : ''} reveal" data-category="${p.category || ''}">
          <div class="port-video-thumb port-gradient-${p.gradient || 1}" ${p.size === 'span2' ? 'style="min-height:280px;"' : ''}>
            ${portfolioMedia(p, true)}
          </div>
          <div class="port-item-info">
            <div class="port-item-cat">${p.category || ''}</div>
            <div class="port-item-title">${p.title || ''}</div>
            <div class="port-item-desc">${p.description || ''}</div>
          </div>
        </div>
      `).join('');
    }

    return data;
  }

  async function loadTestimonials() {
    const { data, error } = await supabaseClient
      .from('testimonials')
      .select('*')
      .order('sort_order');
    if (error || !data) return;

    const grid = document.getElementById('testiGrid');
    if (!grid) return;
    grid.innerHTML = data.map(t => {
      const initials = (t.client_name || '')
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const avatar = t.photo_url ? `<img src="${t.photo_url}" alt="${t.client_name || ''}">` : (initials || 'XX');
      return `
        <div class="testi-card reveal">
          <div class="testi-stars">★★★★★</div>
          <p class="testi-text">${t.quote || ''}</p>
          <div class="testi-author">
            <div class="testi-avatar">${avatar}</div>
            <div><div class="testi-name">${t.client_name || ''}</div><div class="testi-role">${t.client_role || ''}</div></div>
          </div>
        </div>
      `;
    }).join('');
    if (window.initReveal) setTimeout(window.initReveal, 50);
  }

  async function loadTeam() {
    const { data, error } = await supabaseClient
      .from('team_members')
      .select('*')
      .order('sort_order');
    if (error || !data) return;

    const grid = document.getElementById('teamGrid');
    if (!grid) return;
    grid.innerHTML = data.map(m => `
      <div class="team-card reveal">
        <div class="team-photo">${m.photo_url ? `<img src="${m.photo_url}" alt="${m.name || ''}">` : '👤'}</div>
        <div class="team-info"><h4>${m.name || ''}</h4><span>${m.role || ''}</span></div>
      </div>
    `).join('');
    if (window.initReveal) setTimeout(window.initReveal, 50);
  }

  async function loadSiteSettings() {
    const { data, error } = await supabaseClient.from('site_settings').select('*');
    if (error || !data) return;

    const s = {};
    data.forEach(row => { s[row.key] = row.value; });

    document.querySelectorAll('.dyn-email').forEach(el => {
      el.textContent = s.contact_email || '';
      el.href = 'mailto:' + (s.contact_email || '');
    });
    document.querySelectorAll('.dyn-phone').forEach(el => {
      el.textContent = s.contact_phone || '';
      el.href = 'tel:' + (s.contact_phone || '').replace(/\s/g, '');
    });
    document.querySelectorAll('.dyn-address').forEach(el => { el.textContent = s.contact_address || ''; });
    document.querySelectorAll('.dyn-address-note').forEach(el => { el.textContent = s.contact_address_note || ''; });
    document.querySelectorAll('.dyn-hours').forEach(el => { el.textContent = s.contact_hours || ''; });
    document.querySelectorAll('.dyn-tagline').forEach(el => { el.textContent = s.footer_tagline || ''; });
    document.querySelectorAll('.dyn-copyright').forEach(el => { el.textContent = s.copyright || ''; });
    document.querySelectorAll('.dyn-social-instagram').forEach(el => { el.href = s.social_instagram || '#'; });
    document.querySelectorAll('.dyn-social-linkedin').forEach(el => { el.href = s.social_linkedin || '#'; });
    document.querySelectorAll('.dyn-social-twitter').forEach(el => { el.href = s.social_twitter || '#'; });
    document.querySelectorAll('.dyn-social-youtube').forEach(el => { el.href = s.social_youtube || '#'; });

    // Logo
    if (s.site_logo) {
      document.querySelectorAll('.dyn-logo').forEach(img => { img.src = s.site_logo; });
    }

    // Hero section text
    const setText = (id, value) => {
      if (!value) return;
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText('heroBadge', s.hero_badge);
    setText('heroLine1', s.hero_heading_line1);
    setText('heroHighlight', s.hero_heading_highlight);
    setText('heroLine2', s.hero_heading_line2);
    setText('heroDesc', s.hero_description);

    // Hero video
    if (s.hero_video_url) {
      const wrap = document.getElementById('heroVideoWrap');
      if (wrap) wrap.innerHTML = `<video src="${s.hero_video_url}" autoplay muted loop playsinline></video>`;
    }

    // About page text
    setText('aboutP1', s.about_p1);
    setText('aboutP2', s.about_p2);
    setText('aboutP3', s.about_p3);
  }

  function bindPortfolioFilters() {
    const filters = document.getElementById('portfolioFilters');
    const masonry = document.getElementById('portfolioMasonry');
    if (!filters || !masonry) return;

    filters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.textContent.trim();
        masonry.querySelectorAll('.port-item').forEach(item => {
          const itemCat = item.getAttribute('data-category') || '';
          item.style.display = (cat === 'All' || itemCat.includes(cat)) ? '' : 'none';
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    Promise.all([loadServices(), loadPortfolio()]).then(() => {
      bindPortfolioFilters();
      if (window.initReveal) setTimeout(window.initReveal, 50);
    });
    loadTestimonials();
    loadTeam();
    loadSiteSettings();
  });
})();
