/* MedicoHues admin dashboard */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const fmtDT = d => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
const toast = (m, bad) => { const t = $('#toast'); t.textContent = m; t.className = 'toast show' + (bad ? ' bad' : ''); clearTimeout(t._t); t._t = setTimeout(() => t.className = 'toast', 2800); };
const slugify = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

const SPEC = { gastro: 'Gastroenterology', pulmo: 'Pulmonology', uro: 'Urology' };
const CAT = { capital: 'Capital Equipment', consumables: 'Consumables & Accessories', implants: 'Implants' };
const STATUS = { new: 'New', read: 'Read', replied: 'Replied', closed: 'Closed' };

/* ---------- content types (generic editor) ---------- */
const TYPES = {
  products: {
    label: 'Products', icon: '▦', key: 'id', order: 'sort', singular: 'product',
    cols: [['image', 'img'], ['name', 'title', 'brand'], ['speciality', 'map', SPEC], ['category', 'map', CAT], ['published', 'bool']],
    filters: [['speciality', SPEC], ['category', CAT]],
    fields: [
      { k: 'name', l: 'Product name', t: 'text', req: true },
      { k: 'brand', l: 'Brand / manufacturer', t: 'text' },
      { k: 'speciality', l: 'Speciality', t: 'select', opts: SPEC, req: true },
      { k: 'category', l: 'Category', t: 'select', opts: CAT, req: true },
      { k: 'brief', l: 'Short description (shown on the card)', t: 'textarea', rows: 2 },
      { k: 'details', l: 'Full details (shown when opened)', t: 'textarea', rows: 5 },
      { k: 'image', l: 'Product photo', t: 'image' },
      { k: 'representative', l: 'Show “Representative Photo” label', t: 'bool' },
      { k: 'brochure', l: 'Brochure (PDF)', t: 'file' },
      { k: 'source', l: 'Manufacturer page link', t: 'url' },
      { k: 'sort', l: 'Display order (lower shows first)', t: 'number' },
      { k: 'published', l: 'Visible on website', t: 'bool', def: true }
    ],
    beforeSave: r => { if (!r.id) r.id = slugify(r.name) + '-' + Math.random().toString(36).slice(2, 6); }
  },
  articles: {
    label: 'Articles', icon: '✎', key: 'id', order: 'published_at', desc: true, singular: 'article',
    cols: [['cover', 'img'], ['title', 'title', 'summary'], ['published_at', 'date'], ['published', 'bool']],
    fields: [
      { k: 'title', l: 'Title', t: 'text', req: true },
      { k: 'summary', l: 'Summary (shown on the card)', t: 'textarea', rows: 2 },
      { k: 'cover', l: 'Cover image', t: 'image' },
      { k: 'body', l: 'Article', t: 'markdown' },
      { k: 'published_at', l: 'Publish date', t: 'date' },
      { k: 'published', l: 'Published (visible on website)', t: 'bool', def: false }
    ],
    beforeSave: r => { if (!r.slug) r.slug = slugify(r.title) + '-' + Math.random().toString(36).slice(2, 5); },
    link: r => `../article.html?slug=${encodeURIComponent(r.slug)}`
  },
  partners: {
    label: 'Partners', icon: '◇', key: 'id', order: 'sort', singular: 'partner',
    cols: [['name', 'title', 'chip'], ['origin', 'text'], ['sub_distributor', 'bool', 'Sub-distributor'], ['published', 'bool']],
    fields: [
      { k: 'name', l: 'Company name', t: 'text', req: true },
      { k: 'chip', l: 'Tag (e.g. Gastro, Pulmo)', t: 'text' },
      { k: 'description', l: 'Description', t: 'textarea', rows: 3 },
      { k: 'origin', l: 'Country / tagline', t: 'text' },
      { k: 'sub_distributor', l: 'We are sub-distributor (shown separately)', t: 'bool' },
      { k: 'sort', l: 'Display order', t: 'number' },
      { k: 'published', l: 'Visible on website', t: 'bool', def: true }
    ]
  },
  customers: {
    label: 'Customers', icon: '⌂', key: 'id', order: 'sort', singular: 'customer',
    cols: [['name', 'title'], ['published', 'bool']],
    fields: [
      { k: 'name', l: 'Hospital / clinic name', t: 'text', req: true },
      { k: 'sort', l: 'Display order', t: 'number' },
      { k: 'published', l: 'Visible on website', t: 'bool', def: true }
    ]
  },
  testimonials: {
    label: 'Feedback', icon: '❝', key: 'id', order: 'sort', singular: 'feedback',
    cols: [['name', 'title', 'place'], ['quote', 'text'], ['published', 'bool']],
    fields: [
      { k: 'quote', l: 'Feedback', t: 'textarea', rows: 4, req: true },
      { k: 'name', l: 'Name (e.g. Dr. …)', t: 'text' },
      { k: 'place', l: 'Hospital / designation', t: 'text' },
      { k: 'sort', l: 'Display order', t: 'number' },
      { k: 'published', l: 'Visible on website', t: 'bool', def: true }
    ]
  },
  installations: {
    label: 'Installations', icon: '✓', key: 'id', order: 'date', desc: true, singular: 'installation',
    cols: [['image', 'img'], ['title', 'title', 'place'], ['date', 'date'], ['published', 'bool']],
    fields: [
      { k: 'title', l: 'What was installed', t: 'text', req: true },
      { k: 'place', l: 'Hospital / location', t: 'text' },
      { k: 'date', l: 'Date', t: 'date' },
      { k: 'image', l: 'Photo', t: 'image' },
      { k: 'published', l: 'Visible on website', t: 'bool', def: true }
    ]
  }
};

const NAV = [
  ['overview', 'Overview', '◔'], ['enquiries', 'Enquiries', '✉'],
  ...Object.entries(TYPES).map(([k, t]) => [k, t.label, t.icon]),
  ['settings', 'Settings', '⚙']
];

/* ---------- auth ---------- */
let mode = 'signin', session = null;
const authMsg = (m, ok) => { const e = $('#auth-msg'); e.textContent = m; e.className = 'auth-msg' + (ok ? ' ok' : ''); };
function setMode(m) {
  mode = m;
  $('#auth-title').textContent = { signin: 'Sign in to your dashboard', signup: 'Create your account', reset: 'Reset your password', newpw: 'Set a new password' }[m];
  $('#auth-sub').textContent = { signin: 'Manage enquiries, products, articles and more.', signup: 'Use the business email address registered with your website.', reset: 'We will email you a link to set a new password.', newpw: 'Choose a password with at least 8 characters.' }[m];
  $('#auth-btn').textContent = { signin: 'Sign in', signup: 'Create account', reset: 'Send reset link', newpw: 'Save password' }[m];
  $('#pw-wrap').hidden = m === 'reset';
  $('#auth-form').email.closest('label').hidden = m === 'newpw';
  $('#auth-form').password.required = m !== 'reset';
  document.querySelectorAll('[data-mode]').forEach(a => a.hidden = a.dataset.mode === m || (m !== 'signin' && a.dataset.mode !== 'signin'));
  authMsg('');
}
document.querySelectorAll('[data-mode]').forEach(a => a.onclick = e => { e.preventDefault(); setMode(a.dataset.mode); });

$('#auth-form').onsubmit = async e => {
  e.preventDefault();
  const f = e.target, email = f.email.value.trim(), password = f.password.value;
  const redirect = location.origin + location.pathname;
  $('#auth-btn').disabled = true; authMsg('Please wait…', true);
  let r;
  if (mode === 'signin') r = await sb.auth.signInWithPassword({ email, password });
  if (mode === 'signup') r = await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect } });
  if (mode === 'reset') r = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirect });
  if (mode === 'newpw') r = await sb.auth.updateUser({ password });
  $('#auth-btn').disabled = false;
  if (r.error) return authMsg(r.error.message);
  if (mode === 'signup') return authMsg('Account created. Check your inbox and click the confirmation link, then sign in here.', true);
  if (mode === 'reset') return authMsg('Reset link sent. Check your inbox.', true);
  if (mode === 'newpw') { toast('Password updated'); start(); }
};

sb.auth.onAuthStateChange((ev, s) => {
  session = s;
  if (ev === 'PASSWORD_RECOVERY') { showAuth(); setMode('newpw'); }
});

function showAuth() { $('#auth').hidden = false; $('#app').hidden = true; }

async function start() {
  const { data } = await sb.auth.getSession();
  session = data.session;
  if (!session) { showAuth(); setMode('signin'); return; }
  const { data: ok } = await sb.rpc('claim_admin');
  if (!ok) {
    showAuth(); setMode('signin');
    authMsg(`${session.user.email} is not authorised for this dashboard. Ask your administrator to add this email in Settings.`);
    await sb.auth.signOut(); return;
  }
  $('#auth').hidden = true; $('#app').hidden = false;
  buildNav(); route();
}
$('#logout').onclick = async () => { await sb.auth.signOut(); location.hash = ''; showAuth(); setMode('signin'); };

/* ---------- layout & routing ---------- */
function buildNav() {
  $('#side-nav').innerHTML = NAV.map(([k, l, i]) => `<a href="#${k}" data-k="${k}"><span class="ico">${i}</span>${l}<span class="badge" id="badge-${k}"></span></a>`).join('');
  refreshBadge();
}
async function refreshBadge() {
  const { count } = await sb.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new');
  const b = $('#badge-enquiries'); if (b) b.textContent = count || '';
}
$('#menu-btn').onclick = () => $('#side').classList.toggle('open');
window.addEventListener('hashchange', route);
let charts = [];
function route() {
  if ($('#app').hidden) return;
  const [k, id] = location.hash.slice(1).split('/');
  const page = NAV.find(n => n[0] === k) ? k : 'overview';
  document.querySelectorAll('#side-nav a').forEach(a => a.classList.toggle('on', a.dataset.k === page));
  $('#side').classList.remove('open');
  $('#page-title').textContent = NAV.find(n => n[0] === page)[1];
  $('#top-actions').innerHTML = '';
  charts.forEach(c => c.destroy()); charts = [];
  if (!$('#panel-bg').hidden) { $('#panel-bg').classList.remove('show'); $('#panel-bg').hidden = true; }
  $('#content').innerHTML = '<div class="loading">Loading…</div>';
  if (page === 'overview') return overview();
  if (page === 'enquiries') return enquiries(id);
  if (page === 'settings') return settings();
  return list(page);
}

/* ---------- overview / analytics ---------- */
async function overview() {
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const prev = new Date(Date.now() - 60 * 864e5).toISOString();
  const [pv, enq, prods, arts] = await Promise.all([
    sb.from('page_views').select('created_at,path,session_id,device,referrer').gte('created_at', prev).order('created_at').limit(50000),
    sb.from('enquiries').select('id,created_at,name,product,speciality,status').gte('created_at', prev).order('created_at', { ascending: false }),
    sb.from('products').select('id,name'),
    sb.from('articles').select('id', { count: 'exact', head: true })
  ]);
  const views = pv.data || [], enqs = enq.data || [];
  const cur = views.filter(v => v.created_at >= since && !v.path.startsWith('product:'));
  const old = views.filter(v => v.created_at < since && !v.path.startsWith('product:'));
  const ce = enqs.filter(e => e.created_at >= since), oe = enqs.filter(e => e.created_at < since);
  const uniq = a => new Set(a.map(v => v.session_id)).size;
  const delta = (a, b) => b ? Math.round((a - b) / b * 100) : null;
  const { count: newCount } = await sb.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new');
  const kpi = (l, v, d, sub) => `<div class="kpi"><span>${l}</span><b>${v}</b>${d !== null && d !== undefined ? `<em class="${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}% vs prev. 30 days</em>` : `<em>${sub || '&nbsp;'}</em>`}</div>`;

  // per-day series
  const days = [...Array(30)].map((_, i) => { const d = new Date(Date.now() - (29 - i) * 864e5); return d.toISOString().slice(0, 10); });
  const by = (arr, f) => days.map(d => arr.filter(x => x.created_at.slice(0, 10) === d && f(x)).length);
  const vDay = by(cur, () => true);
  const uDay = days.map(d => new Set(cur.filter(x => x.created_at.slice(0, 10) === d).map(x => x.session_id)).size);
  const eDay = by(ce, () => true);

  const tally = (arr, f) => Object.entries(arr.reduce((m, x) => { const k = f(x); if (k) m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
  const pageName = p => { const u = p.replace(/^\/+/, '/'); if (u === '/' || u.startsWith('/index')) return 'Home'; if (u.startsWith('/products')) { const s = new URLSearchParams(u.split('?')[1]).get('s'); return 'Products · ' + (SPEC[s] || 'All'); } if (u.startsWith('/article')) return 'Article · ' + decodeURIComponent(new URLSearchParams(u.split('?')[1]).get('slug') || ''); return u; };
  const topPages = tally(cur, v => pageName(v.path)).slice(0, 6);
  const pmap = Object.fromEntries((prods.data || []).map(p => [p.id, p.name]));
  const topProducts = tally(views.filter(v => v.created_at >= since && v.path.startsWith('product:')), v => pmap[v.path.slice(8)] || v.path.slice(8)).slice(0, 6);
  const sources = tally(cur, v => { if (!v.referrer) return 'Direct'; try { const h = new URL(v.referrer).hostname.replace('www.', ''); return h === location.hostname.replace('www.', '') ? null : h; } catch { return 'Other'; } }).slice(0, 5);
  const bySpec = tally(ce, e => e.speciality || 'Not specified');
  const devices = tally(cur, v => v.device === 'mobile' ? 'Mobile' : 'Desktop');
  const bars = (rows, total) => rows.length ? rows.map(([k, v]) => `<div class="bar"><span>${esc(k)}</span><i style="width:${Math.max(4, v / (total || rows[0][1]) * 100)}%"></i><b>${v}</b></div>`).join('') : '<p class="muted small">No data yet</p>';

  $('#content').innerHTML = `
    <div class="kpis">
      ${kpi('Visitors (30 days)', uniq(cur), delta(uniq(cur), uniq(old)))}
      ${kpi('Page views (30 days)', cur.length, delta(cur.length, old.length))}
      ${kpi('Enquiries (30 days)', ce.length, delta(ce.length, oe.length))}
      ${kpi('Awaiting reply', newCount || 0, null, `<a href="#enquiries">View enquiries →</a>`)}
    </div>
    <div class="grid2">
      <div class="card wide"><h3>Website traffic — last 30 days</h3><div class="chart"><canvas id="c-traffic"></canvas></div></div>
    </div>
    <div class="grid3">
      <div class="card"><h3>Most visited pages</h3>${bars(topPages)}</div>
      <div class="card"><h3>Most viewed products</h3>${bars(topProducts)}</div>
      <div class="card"><h3>Where visitors come from</h3>${bars(sources)}</div>
    </div>
    <div class="grid3">
      <div class="card"><h3>Enquiries per day</h3><div class="chart sm"><canvas id="c-enq"></canvas></div></div>
      <div class="card"><h3>Enquiries by speciality</h3>${bars(bySpec)}</div>
      <div class="card"><h3>Devices</h3>${bars(devices, cur.length)}</div>
    </div>
    <div class="card"><div class="card-head"><h3>Latest enquiries</h3><a href="#enquiries" class="link">See all →</a></div>
      ${enqs.slice(0, 5).map(e => `<a class="row-link" href="#enquiries/${e.id}"><span class="pill s-${e.status}">${STATUS[e.status]}</span><b>${esc(e.name)}</b><span class="muted">${esc(e.product || e.speciality || '')}</span><span class="muted right">${fmtDT(e.created_at)}</span></a>`).join('') || '<p class="muted small">No enquiries yet. They will appear here as soon as someone submits the form.</p>'}
    </div>
    <p class="muted small">Content: ${(prods.data || []).length} products · ${arts.count || 0} articles. Visits are counted once per page load; admin visits are not counted.</p>`;

  const labels = days.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
  Chart.defaults.font.family = 'Inter, sans-serif'; Chart.defaults.color = '#5b6b82';
  charts.push(new Chart($('#c-traffic'), {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Page views', data: vDay, borderColor: '#1565c0', backgroundColor: 'rgba(21,101,192,.08)', fill: true, tension: .35, pointRadius: 0, borderWidth: 2 },
      { label: 'Visitors', data: uDay, borderColor: '#f39200', tension: .35, pointRadius: 0, borderWidth: 2 }] },
    options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef2f7' } }, x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } } } }
  }));
  charts.push(new Chart($('#c-enq'), {
    type: 'bar', data: { labels, datasets: [{ label: 'Enquiries', data: eDay, backgroundColor: '#00b8d4', borderRadius: 4 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef2f7' } }, x: { grid: { display: false }, ticks: { maxTicksLimit: 5 } } } }
  }));
}

/* ---------- enquiries ---------- */
let enqFilter = 'open', enqSearch = '';
async function enquiries(openId) {
  $('#top-actions').innerHTML = `<button class="btn ghost sm" id="exp">Export CSV</button>`;
  const { data, error } = await sb.from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) return $('#content').innerHTML = `<p class="err">${esc(error.message)}</p>`;
  $('#exp').onclick = () => csv(data, 'enquiries');
  const render = () => {
    const rows = data.filter(e => (enqFilter === 'all' || (enqFilter === 'open' ? e.status !== 'closed' : e.status === enqFilter)) &&
      (!enqSearch || JSON.stringify(e).toLowerCase().includes(enqSearch)));
    $('#content').innerHTML = `
      <div class="toolbar">
        <div class="seg">${[['open', 'Open'], ['new', 'New'], ['replied', 'Replied'], ['closed', 'Closed'], ['all', 'All']].map(([k, l]) => `<button class="${enqFilter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
        <input class="search" placeholder="Search name, phone, product…" value="${esc(enqSearch)}" id="esearch">
      </div>
      <div class="card flush">${rows.length ? `<table class="tbl"><thead><tr><th>Status</th><th>From</th><th>Interested in</th><th>Contact</th><th>Received</th></tr></thead><tbody>
        ${rows.map(e => `<tr data-id="${e.id}" class="${e.status === 'new' ? 'unread' : ''}"><td><span class="pill s-${e.status}">${STATUS[e.status]}</span></td><td><b>${esc(e.name)}</b><div class="muted small">${esc(e.organisation || '')}</div></td><td>${esc(e.product || e.speciality || '—')}<div class="muted small clip">${esc(e.message || '')}</div></td><td>${esc(e.phone || '')}<div class="muted small">${esc(e.email || '')}</div></td><td class="muted small">${fmtDT(e.created_at)}</td></tr>`).join('')}
        </tbody></table>` : `<div class="empty-state"><b>No enquiries here</b><p class="muted">New enquiries from the website appear here and are emailed to you.</p></div>`}</div>`;
    document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { enqFilter = b.dataset.f; render(); });
    const s = $('#esearch'); s.oninput = () => { enqSearch = s.value.toLowerCase(); const p = s.selectionStart; render(); const n = $('#esearch'); n.focus(); n.setSelectionRange(p, p); };
    document.querySelectorAll('tr[data-id]').forEach(tr => tr.onclick = () => location.hash = 'enquiries/' + tr.dataset.id);
  };
  render();
  if (openId) openEnquiry(data.find(e => e.id === openId), data, render);
}

async function openEnquiry(e, all, rerender) {
  if (!e) return;
  if (e.status === 'new') { await sb.from('enquiries').update({ status: 'read' }).eq('id', e.id); e.status = 'read'; refreshBadge(); rerender(); }
  const { data: replies } = await sb.from('enquiry_replies').select('*').eq('enquiry_id', e.id).order('created_at');
  const phone = (e.phone || '').replace(/[^\d]/g, ''), wa = phone ? (phone.length === 10 ? '91' + phone : phone) : '';
  const greeting = `Dear ${e.name},\n\nThank you for your enquiry${e.product ? ' about ' + e.product : ''}.\n\n\n\nRegards,\nNirav Shah\nMedicoHues LLP\n+91 99240 99600`;
  openPanel(`
    <div class="panel-head"><h2>${esc(e.name)}</h2><button class="x" data-close>×</button></div>
    <div class="panel-body">
      <div class="meta">
        ${[['Organisation', e.organisation], ['Phone', e.phone && `<a href="tel:${esc(e.phone)}">${esc(e.phone)}</a>`], ['Email', e.email && `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>`], ['Speciality', e.speciality], ['Product', e.product], ['Received', fmtDT(e.created_at)], ['From page', e.page && `<a href="${esc(e.page)}" target="_blank">${esc(e.page.replace(/^https?:\/\/[^/]+/, '') || '/')}</a>`]]
          .filter(r => r[1]).map(([k, v]) => `<div><span>${k}</span><p>${k === 'Phone' || k === 'Email' || k === 'From page' ? v : esc(v)}</p></div>`).join('')}
      </div>
      ${e.message ? `<div class="msg">${esc(e.message)}</div>` : ''}
      <label class="fld">Status <select id="e-status">${Object.entries(STATUS).map(([k, l]) => `<option value="${k}" ${e.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="fld">Private notes <textarea id="e-notes" rows="2" placeholder="Only visible to you">${esc(e.notes || '')}</textarea></label>
      <h3 class="sec">Reply</h3>
      ${replies && replies.length ? `<div class="thread">${replies.map(r => `<div class="reply"><span class="muted small">${r.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} · ${fmtDT(r.created_at)}</span><p>${esc(r.body)}</p></div>`).join('')}</div>` : ''}
      <textarea id="r-body" rows="8">${esc(greeting)}</textarea>
      <div class="reply-actions">
        <button class="btn" id="r-email" ${e.email ? '' : 'disabled title="No email address provided"'}>Send email</button>
        <button class="btn green" id="r-wa" ${wa ? '' : 'disabled'}>Reply on WhatsApp</button>
      </div>
      <p class="muted small" id="r-msg"></p>
    </div>
    <div class="panel-foot"><button class="btn danger ghost sm" id="e-del">Delete enquiry</button><button class="btn sm" id="e-save">Save</button></div>`);
  $('#e-save').onclick = async () => {
    const { error } = await sb.from('enquiries').update({ status: $('#e-status').value, notes: $('#e-notes').value || null }).eq('id', e.id);
    if (error) return toast(error.message, true);
    Object.assign(e, { status: $('#e-status').value, notes: $('#e-notes').value }); toast('Saved'); refreshBadge(); rerender();
  };
  $('#e-del').onclick = async () => {
    if (!confirm(`Delete the enquiry from ${e.name}? This cannot be undone.`)) return;
    const { error } = await sb.from('enquiries').delete().eq('id', e.id);
    if (error) return toast(error.message, true);
    all.splice(all.indexOf(e), 1); closePanel(); toast('Enquiry deleted'); refreshBadge(); rerender();
  };
  const logReply = async (channel, body) => {
    await sb.from('enquiry_replies').insert({ enquiry_id: e.id, body, channel });
    await sb.from('enquiries').update({ status: 'replied' }).eq('id', e.id); e.status = 'replied'; refreshBadge(); rerender();
  };
  $('#r-wa').onclick = async () => {
    const body = $('#r-body').value;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(body)}`, '_blank');
    await logReply('whatsapp', body); toast('Opened WhatsApp — marked as replied');
  };
  $('#r-email').onclick = async () => {
    const body = $('#r-body').value, btn = $('#r-email'); btn.disabled = true; $('#r-msg').textContent = 'Sending…';
    const { data: { session: s } } = await sb.auth.getSession();
    let res; try { res = await fetch('/api/reply', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + s.access_token }, body: JSON.stringify({ enquiry_id: e.id, body }) }); } catch { }
    btn.disabled = false;
    if (res && res.ok) { $('#r-msg').textContent = ''; toast('Email sent'); e.status = 'replied'; refreshBadge(); rerender(); return openEnquiry(e, all, rerender); }
    const err = res ? (await res.json().catch(() => ({}))).error : 'network';
    if (err === 'email_not_configured' || err === 'mail_failed' || err === 'network') {
      // fallback: open Gmail compose and log the reply
      const subj = `Re: Your enquiry with MedicoHues${e.product ? ' — ' + e.product : ''}`;
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(e.email)}&su=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`, '_blank');
      await logReply('email', body);
      $('#r-msg').textContent = 'Direct sending is not set up yet, so Gmail was opened with your reply ready to send.';
    } else toast('Could not send: ' + err, true);
  };
}

/* ---------- generic list + editor ---------- */
const filt = {};
async function list(type) {
  const T = TYPES[type];
  $('#top-actions').innerHTML = `<button class="btn sm" id="add">+ Add ${T.singular}</button>`;
  const { data, error } = await sb.from(type).select('*').order(T.order, { ascending: !T.desc, nullsFirst: false });
  if (error) return $('#content').innerHTML = `<p class="err">${esc(error.message)}</p>`;
  $('#add').onclick = () => edit(type, null, data);
  filt[type] = filt[type] || {};
  const cell = (r, [k, kind, extra]) => {
    const v = r[k];
    if (kind === 'img') return `<td class="thumb">${v ? `<img src="${esc(v)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="noimg"></div>'}</td>`;
    if (kind === 'title') return `<td><b>${esc(v)}</b>${extra ? `<div class="muted small clip">${esc(r[extra] || '')}</div>` : ''}</td>`;
    if (kind === 'map') return `<td>${esc(extra[v] || v)}</td>`;
    if (kind === 'bool') return `<td>${k === 'published' ? `<label class="switch" data-stop><input type="checkbox" data-pub="${esc(r[T.key])}" ${v ? 'checked' : ''}><i></i></label>` : (v ? (extra || 'Yes') : '')}</td>`;
    if (kind === 'date') return `<td class="muted small">${fmtDate(v)}</td>`;
    return `<td class="clip">${esc(v)}</td>`;
  };
  const render = () => {
    const q = (filt[type].q || '').toLowerCase();
    const rows = data.filter(r => (!q || JSON.stringify(r).toLowerCase().includes(q)) && (T.filters || []).every(([k]) => !filt[type][k] || r[k] === filt[type][k]));
    $('#content').innerHTML = `
      <div class="toolbar">
        <input class="search" id="lsearch" placeholder="Search ${T.label.toLowerCase()}…" value="${esc(filt[type].q || '')}">
        ${(T.filters || []).map(([k, opts]) => `<select data-filter="${k}"><option value="">All ${k === 'speciality' ? 'specialities' : 'categories'}</option>${Object.entries(opts).map(([v, l]) => `<option value="${v}" ${filt[type][k] === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`).join('')}
        <span class="muted small">${rows.length} of ${data.length}</span>
      </div>
      <div class="card flush">${rows.length ? `<table class="tbl"><thead><tr>${T.cols.map(c => `<th>${c[1] === 'img' ? '' : c[0] === 'published' ? 'Visible' : (c[2] && c[1] === 'bool' ? c[2] : c[0].replace('_at', '').replace('_', ' '))}</th>`).join('')}</tr></thead><tbody>
        ${rows.map(r => `<tr data-id="${esc(r[T.key])}">${T.cols.map(c => cell(r, c)).join('')}</tr>`).join('')}</tbody></table>`
        : `<div class="empty-state"><b>No ${T.label.toLowerCase()} yet</b><p class="muted">Click “Add ${T.singular}” to create the first one.</p></div>`}</div>`;
    const s = $('#lsearch'); s.oninput = () => { filt[type].q = s.value; const p = s.selectionStart; render(); const n = $('#lsearch'); n.focus(); n.setSelectionRange(p, p); };
    document.querySelectorAll('[data-filter]').forEach(sel => sel.onchange = () => { filt[type][sel.dataset.filter] = sel.value; render(); });
    document.querySelectorAll('tr[data-id]').forEach(tr => tr.onclick = ev => { if (ev.target.closest('[data-stop]')) return; edit(type, data.find(r => String(r[T.key]) === tr.dataset.id), data, render); });
    document.querySelectorAll('[data-pub]').forEach(cb => cb.onchange = async () => {
      const { error } = await sb.from(type).update({ published: cb.checked }).eq(T.key, cb.dataset.pub);
      if (error) { cb.checked = !cb.checked; return toast(error.message, true); }
      data.find(r => String(r[T.key]) === cb.dataset.pub).published = cb.checked;
      toast(cb.checked ? 'Now visible on website' : 'Hidden from website');
    });
  };
  render();
  list._render = render;
}

function fieldHTML(f, v) {
  const val = v ?? f.def ?? '';
  const lab = `${f.l}${f.req ? ' *' : ''}`;
  switch (f.t) {
    case 'textarea': return `<label class="fld">${lab}<textarea name="${f.k}" rows="${f.rows || 3}" ${f.req ? 'required' : ''}>${esc(val)}</textarea></label>`;
    case 'markdown': return `<div class="fld">${lab}
      <div class="md-tools">${[['**', '**', 'B'], ['*', '*', 'I'], ['\n## ', '', 'H2'], ['\n### ', '', 'H3'], ['\n- ', '', '• List'], ['[', '](https://)', 'Link']].map(([a, b, l]) => `<button type="button" data-md="${esc(a)}|${esc(b)}">${l}</button>`).join('')}<button type="button" data-mdimg>Image</button><button type="button" data-mdprev class="right">Preview</button></div>
      <textarea name="${f.k}" rows="16" class="md">${esc(val)}</textarea><div class="md-prev" hidden></div></div>`;
    case 'select': return `<label class="fld">${lab}<select name="${f.k}" ${f.req ? 'required' : ''}><option value="">Select…</option>${Object.entries(f.opts).map(([k, l]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
    case 'bool': return `<label class="fld check"><input type="checkbox" name="${f.k}" ${val === true || val === 'true' ? 'checked' : ''}> ${lab}</label>`;
    case 'number': return `<label class="fld">${lab}<input type="number" name="${f.k}" value="${esc(val === '' ? 0 : val)}"></label>`;
    case 'date': return `<label class="fld">${lab}<input type="date" name="${f.k}" value="${esc(val || new Date().toISOString().slice(0, 10))}"></label>`;
    case 'image': case 'file': return `<div class="fld">${lab}
      <div class="upload" data-up="${f.k}">${f.t === 'image' ? `<div class="up-prev">${val ? `<img src="${esc(val)}" referrerpolicy="no-referrer">` : '<span>No image</span>'}</div>` : `<div class="up-file">${val ? `<a href="${esc(val)}" target="_blank">${esc(val.split('/').pop().slice(0, 50))}</a>` : '<span class="muted">No file</span>'}</div>`}
        <div class="up-actions"><label class="btn ghost sm">Upload<input type="file" hidden accept="${f.t === 'image' ? 'image/*' : '.pdf,application/pdf'}"></label><button type="button" class="btn ghost sm" data-clear>Remove</button></div>
        <input type="url" name="${f.k}" value="${esc(val)}" placeholder="…or paste a link"></div></div>`;
    default: return `<label class="fld">${lab}<input type="${f.t === 'url' ? 'url' : 'text'}" name="${f.k}" value="${esc(val)}" ${f.req ? 'required' : ''}></label>`;
  }
}

async function upload(file) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, file, { cacheControl: '31536000', contentType: file.type });
  if (error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

function edit(type, row, data, rerender) {
  const T = TYPES[type], isNew = !row;
  openPanel(`
    <form id="ed" novalidate>
      <div class="panel-head"><h2>${isNew ? 'New ' + T.singular : 'Edit ' + T.singular}</h2>${!isNew && T.link ? `<a class="link small" target="_blank" href="${T.link(row)}">View on site ↗</a>` : ''}<button type="button" class="x" data-close>×</button></div>
      <div class="panel-body">${T.fields.map(f => fieldHTML(f, row ? row[f.k] : undefined)).join('')}</div>
      <div class="panel-foot">${isNew ? '<span></span>' : `<button type="button" class="btn danger ghost sm" id="del">Delete</button>`}<button class="btn sm" type="submit">${isNew ? 'Create' : 'Save changes'}</button></div>
    </form>`, true);
  const form = $('#ed');
  // uploads
  form.querySelectorAll('[data-up]').forEach(box => {
    const inp = box.querySelector('input[type=url]'), file = box.querySelector('input[type=file]');
    const show = () => { const p = box.querySelector('.up-prev'); if (p) p.innerHTML = inp.value ? `<img src="${esc(inp.value)}" referrerpolicy="no-referrer">` : '<span>No image</span>'; const fl = box.querySelector('.up-file'); if (fl) fl.innerHTML = inp.value ? `<a href="${esc(inp.value)}" target="_blank">${esc(inp.value.split('/').pop().slice(0, 50))}</a>` : '<span class="muted">No file</span>'; };
    inp.oninput = show;
    box.querySelector('[data-clear]').onclick = () => { inp.value = ''; show(); };
    file.onchange = async () => {
      if (!file.files[0]) return;
      if (file.files[0].size > 20 * 1024 * 1024) return toast('File is larger than 20 MB', true);
      toast('Uploading…');
      try { inp.value = await upload(file.files[0]); show(); toast('Uploaded'); } catch (err) { toast(err.message, true); }
    };
  });
  // markdown helpers
  form.querySelectorAll('[data-md]').forEach(b => b.onclick = () => {
    const ta = form.querySelector('textarea.md'), [a, z] = b.dataset.md.split('|');
    const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || 'text';
    ta.setRangeText(a + sel + z, s, e, 'end'); ta.focus();
  });
  const mdImg = form.querySelector('[data-mdimg]');
  if (mdImg) mdImg.onclick = () => {
    const fi = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' });
    fi.onchange = async () => { toast('Uploading…'); try { const u = await upload(fi.files[0]); const ta = form.querySelector('textarea.md'); ta.setRangeText(`\n![](${u})\n`, ta.selectionStart, ta.selectionStart, 'end'); toast('Image added'); } catch (err) { toast(err.message, true); } };
    fi.click();
  };
  const prevBtn = form.querySelector('[data-mdprev]');
  if (prevBtn) prevBtn.onclick = async () => {
    if (!window.marked) await new Promise(r => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js'; s.onload = r; document.head.appendChild(s); });
    const ta = form.querySelector('textarea.md'), pv = form.querySelector('.md-prev');
    const on = pv.hidden; pv.hidden = !on; ta.hidden = on; prevBtn.textContent = on ? 'Edit' : 'Preview';
    if (on) pv.innerHTML = marked.parse(ta.value.replace(/</g, '&lt;'));
  };
  form.onsubmit = async ev => {
    ev.preventDefault();
    const rec = {};
    for (const f of T.fields) {
      const el = form.elements[f.k];
      if (f.t === 'bool') rec[f.k] = el.checked;
      else if (f.t === 'number') rec[f.k] = Number(el.value) || 0;
      else rec[f.k] = el.value.trim() || null;
      if (f.req && !rec[f.k]) { el.focus(); return toast(`Please fill in “${f.l}”`, true); }
    }
    if (isNew) { T.beforeSave && T.beforeSave(rec); }
    const q = isNew ? sb.from(type).insert(rec).select().single() : sb.from(type).update(rec).eq(T.key, row[T.key]).select().single();
    const { data: saved, error } = await q;
    if (error) return toast(error.message, true);
    if (isNew) data.unshift(saved); else Object.assign(row, saved);
    closePanel(); toast(isNew ? 'Created' : 'Saved'); (rerender || list._render)();
  };
  const del = $('#del');
  if (del) del.onclick = async () => {
    if (!confirm(`Delete “${row.name || row.title}”? This cannot be undone.`)) return;
    const { error } = await sb.from(type).delete().eq(T.key, row[T.key]);
    if (error) return toast(error.message, true);
    data.splice(data.indexOf(row), 1); closePanel(); toast('Deleted'); (rerender || list._render)();
  };
}

/* ---------- settings ---------- */
async function settings() {
  const { data: emails } = await sb.from('admin_emails').select('*');
  $('#content').innerHTML = `
    <div class="card"><h3>Your account</h3><p>Signed in as <b>${esc(session.user.email)}</b></p>
      <form id="pw" class="inline"><input type="password" name="pw" minlength="8" placeholder="New password (min 8 characters)" required><button class="btn sm">Change password</button></form></div>
    <div class="card"><h3>Who can access this dashboard</h3><p class="muted small">People with these email addresses can create an account and sign in. Remove an email to revoke future access.</p>
      <div class="chips">${(emails || []).map(e => `<span class="chipx">${esc(e.email)}${e.email.toLowerCase() === session.user.email.toLowerCase() ? '' : ` <button data-rm="${esc(e.email)}">×</button>`}</span>`).join('')}</div>
      <form id="addmail" class="inline"><input type="email" name="em" placeholder="colleague@example.com" required><button class="btn ghost sm">Add</button></form></div>
    <div class="card"><h3>Enquiry emails</h3><p class="muted small">New enquiries are emailed to you automatically, and you can reply from the Enquiries page. Until email sending is connected, the “Send email” button opens Gmail with your reply ready, and WhatsApp replies always work.</p></div>`;
  $('#pw').onsubmit = async e => { e.preventDefault(); const { error } = await sb.auth.updateUser({ password: e.target.pw.value }); toast(error ? error.message : 'Password changed', !!error); e.target.reset(); };
  $('#addmail').onsubmit = async e => { e.preventDefault(); const { error } = await sb.from('admin_emails').insert({ email: e.target.em.value.trim().toLowerCase() }); if (error) return toast(error.message, true); toast('Added'); settings(); };
  document.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { if (!confirm('Remove ' + b.dataset.rm + '?')) return; await sb.from('admin_emails').delete().eq('email', b.dataset.rm); toast('Removed'); settings(); });
}

/* ---------- panel + helpers ---------- */
function openPanel(html, wide) {
  $('#panel').innerHTML = html; $('#panel').classList.toggle('wide', !!wide);
  $('#panel-bg').hidden = false; requestAnimationFrame(() => $('#panel-bg').classList.add('show'));
  $('#panel').querySelectorAll('[data-close]').forEach(b => b.onclick = closePanel);
}
function closePanel() {
  $('#panel-bg').classList.remove('show'); setTimeout(() => $('#panel-bg').hidden = true, 250);
  if (location.hash.startsWith('#enquiries/')) history.replaceState(null, '', '#enquiries');
}
$('#panel-bg').onclick = e => { if (e.target.id === 'panel-bg') closePanel(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#panel-bg').hidden) closePanel(); });

function csv(rows, name) {
  if (!rows.length) return toast('Nothing to export', true);
  const keys = Object.keys(rows[0]).filter(k => k !== 'notified');
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const blob = new Blob(['﻿' + [keys.join(','), ...rows.map(r => keys.map(k => q(r[k])).join(','))].join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${name}-${new Date().toISOString().slice(0, 10)}.csv` }); a.click();
}

start();
