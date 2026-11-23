const D = window.MH;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- nav ---------- */
const nav = $('#nav'), burger = $('#burger'), links = $('#links');
if (!document.body.classList.contains('page')) {
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 30);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
}
burger.addEventListener('click', () => { links.classList.toggle('open'); burger.classList.toggle('x'); });
links.addEventListener('click', e => {
  if (e.target.closest('.dd-btn')) { e.target.closest('.dd').classList.toggle('open'); return; }
  if (e.target.closest('a')) { links.classList.remove('open'); burger.classList.remove('x'); }
});

// Specialities dropdown: speciality → categories
$('#spec-menu').innerHTML = Object.entries(D.specialities).map(([k, s]) => {
  const cats = Object.keys(D.categories).filter(c => D.products.some(p => p.s === k && p.c === c));
  return `<div class="dd-col"><a class="dd-title" href="products.html?s=${k}">${s.name}</a>${cats.map(c => `<a href="products.html?s=${k}&c=${c}">${D.categories[c]}</a>`).join('')}</div>`;
}).join('');

/* ---------- reveal + counters ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
const observe = () => document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));

const countIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
  const tick = t => { const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick); countIO.unobserve(el);
}), { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(c => countIO.observe(c));

/* ---------- home: feedback, installations, knowledge ---------- */
const empty = (title, text) => `<div class="empty reveal"><h3>${title}</h3><p>${text}</p></div>`;
if ($('#testimonials')) {
  $('#testimonials').innerHTML = D.testimonials.length
    ? D.testimonials.map(t => `<figure class="quote reveal"><blockquote>“${esc(t.quote)}”</blockquote><figcaption><b>${esc(t.name)}</b><span>${esc(t.place)}</span></figcaption></figure>`).join('')
    : empty('Customer stories coming soon', 'Feedback from the hospitals we serve will be shared here.');
  $('#installations').innerHTML = D.installations.length
    ? D.installations.map(i => `<article class="inst reveal">${i.image ? `<img src="${esc(i.image)}" alt="">` : ''}<span class="date">${esc(i.date)}</span><h3>${esc(i.title)}</h3><p>${esc(i.place)}</p></article>`).join('')
    : empty('Installation updates coming soon', 'Our latest equipment installations across Gujarat will appear here.');
  $('#posts').innerHTML = D.posts.length
    ? D.posts.map(p => `<a class="post reveal" href="${esc(p.url) || '#'}"><span class="date">${esc(p.date)}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="more-link">Read more →</span></a>`).join('')
    : empty('Articles coming soon', 'Clinical insights, product updates and educational resources will be published here.');
}

/* ---------- products page ---------- */
const grid = $('#product-grid');
if (grid) {
  const q = new URLSearchParams(location.search);
  let spec = D.specialities[q.get('s')] ? q.get('s') : 'gastro';
  let cat = D.categories[q.get('c')] ? q.get('c') : 'all';

  const render = () => {
    const s = D.specialities[spec];
    document.title = `${s.name} | MedicoHues`;
    $('#p-title').textContent = s.name;
    $('#p-blurb').textContent = s.blurb;
    $('#crumb').textContent = `Specialities / ${s.name}${cat !== 'all' ? ' / ' + D.categories[cat] : ''}`;
    $('#spec-tabs').innerHTML = Object.entries(D.specialities).map(([k, v]) => `<button class="${k === spec ? 'on' : ''}" data-s="${k}">${v.name}</button>`).join('');
    const avail = Object.keys(D.categories).filter(c => D.products.some(p => p.s === spec && p.c === c));
    if (cat !== 'all' && !avail.includes(cat)) cat = 'all';
    $('#cat-tabs').innerHTML = ['all', ...avail].map(c => `<button class="${c === cat ? 'on' : ''}" data-c="${c}">${c === 'all' ? 'All products' : D.categories[c]}</button>`).join('');
    const list = D.products.filter(p => p.s === spec && (cat === 'all' || p.c === cat));
    grid.innerHTML = list.map(p => `
      <article class="product reveal" data-id="${p.id}" tabindex="0">
        <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : `<img class="ph" src="assets/logo-mark.png" alt="">`}</div>
        <div class="p-body">
          <span class="chip">${D.categories[p.c]}</span>
          <h3>${esc(p.name)}</h3>
          <p class="brandname">${esc(p.brand)}</p>
          <p>${esc(p.brief)}</p>
          <span class="more-link">View details →</span>
        </div>
      </article>`).join('');
    history.replaceState(null, '', `?s=${spec}${cat !== 'all' ? '&c=' + cat : ''}`);
    observe();
  };

  $('#spec-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { spec = b.dataset.s; cat = 'all'; render(); } });
  $('#cat-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { cat = b.dataset.c; render(); } });
  window.addEventListener('popstate', () => location.reload());
  document.querySelectorAll('#spec-menu a').forEach(a => a.addEventListener('click', e => {
    const u = new URL(a.href); e.preventDefault(); spec = u.searchParams.get('s'); cat = u.searchParams.get('c') || 'all'; render(); scrollTo({ top: 0, behavior: 'smooth' });
  }));

  const drawer = $('#drawer');
  const open = id => {
    const p = D.products.find(x => x.id === id); if (!p) return;
    $('#drawer-body').innerHTML = `
      <div class="d-img">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : `<img class="ph" src="assets/logo-mark.png" alt="">`}</div>
      <span class="chip">${D.specialities[p.s].name} · ${D.categories[p.c]}</span>
      <h2>${esc(p.name)}</h2>
      <p class="brandname">${esc(p.brand)}</p>
      <p>${esc(p.brief)}</p><p>${esc(p.details)}</p>
      <div class="cta">
        ${p.brochure ? `<a class="btn" href="${esc(p.brochure)}" download>Download brochure</a>` : ''}
        <a class="btn ${p.brochure ? 'btn-ghost' : ''}" href="#" data-enquire="${esc(p.name)}">${p.brochure ? 'Enquire' : 'Request brochure / enquire'}</a>
      </div>`;
    drawer.classList.add('show'); drawer.setAttribute('aria-hidden', 'false');
  };
  grid.addEventListener('click', e => { const c = e.target.closest('.product'); if (c) open(c.dataset.id); });
  grid.addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.product'); if (c) open(c.dataset.id); } });
  drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('[data-close]')) drawer.classList.remove('show'); });
  render();
}

/* ---------- enquiry modal (→ Google Sheets) ---------- */
document.body.insertAdjacentHTML('beforeend', `
<div class="modal" id="enq" aria-hidden="true">
  <form class="modal-panel" id="enq-form" role="dialog" aria-modal="true">
    <button type="button" class="close" data-close aria-label="Close">×</button>
    <p class="eyebrow">Enquiry</p>
    <h2>Tell us what you need</h2>
    <div class="fields">
      <label>Name*<input name="name" required></label>
      <label>Hospital / Organisation<input name="organisation"></label>
      <label>Phone*<input name="phone" type="tel" required pattern="[0-9+ ()-]{8,}"></label>
      <label>Email<input name="email" type="email"></label>
      <label>Speciality<select name="speciality"><option value="">Select</option>${Object.values(D.specialities).map(s => `<option>${s.name}</option>`).join('')}<option>Other</option></select></label>
      <label>Product of interest<input name="product"></label>
      <label class="full">Message<textarea name="message" rows="3"></textarea></label>
    </div>
    <button class="btn" type="submit">Submit enquiry</button>
    <p class="form-msg" id="enq-msg"></p>
  </form>
</div>`);
const modal = $('#enq'), form = $('#enq-form'), msg = $('#enq-msg');
document.addEventListener('click', e => {
  const t = e.target.closest('[data-enquire]'); if (!t) return;
  e.preventDefault();
  if (t.dataset.enquire) form.product.value = t.dataset.enquire;
  $('#drawer')?.classList.remove('show');
  msg.textContent = ''; modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
});
modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) modal.classList.remove('show'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.classList.remove('show'); $('#drawer')?.classList.remove('show'); } });

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  data.page = location.href; data.submittedAt = new Date().toISOString();
  const btn = form.querySelector('button[type=submit]'); btn.disabled = true; msg.textContent = 'Sending…';
  try {
    if (!D.SHEET_ENDPOINT) throw new Error('no endpoint');
    await fetch(D.SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
    msg.textContent = 'Thank you! We will get back to you shortly.'; form.reset();
  } catch {
    const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
    location.href = `mailto:medicohues@gmail.com?subject=${encodeURIComponent('Website enquiry — ' + (data.product || data.speciality || data.name))}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Opening your email app to send the enquiry…';
  } finally { btn.disabled = false; }
});

observe();
$('#yr').textContent = new Date().getFullYear();
