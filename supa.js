/* Supabase connection + page-view tracking + live content loader.
   The publishable key is safe to expose; all access is governed by row-level security. */
window.SUPA_URL = 'https://znzensjmhxytvgbxcrpc.supabase.co';
window.SUPA_KEY = 'sb_publishable_cgGMmpsbvgjW4wt9ksXLmw_hQ3DYOU0';
window.sb = window.supabase ? window.supabase.createClient(SUPA_URL, SUPA_KEY) : null;

(function track() {
  if (!window.sb || /\/admin/.test(location.pathname)) return;
  let sid;
  try { sid = sessionStorage.getItem('mh_sid') || crypto.randomUUID(); sessionStorage.setItem('mh_sid', sid); } catch { sid = crypto.randomUUID(); }
  window.mhTrack = path => sb.from('page_views').insert({
    path: String(path).slice(0, 300),
    referrer: (document.referrer || '').slice(0, 500),
    session_id: sid,
    device: matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop'
  }).then(() => {}, () => {});
  mhTrack(location.pathname + location.search);
})();

/* Load published content; falls back to data.js if the database is unreachable. */
window.loadContent = async function () {
  const D = window.MH;
  if (!window.sb) return D;
  try {
    const q = t => sb.from(t).select('*').eq('published', true).order('sort', { ascending: true });
    const [p, pa, cu, te, ins, ar] = await Promise.all([
      q('products'), q('partners'), q('customers'), q('testimonials'), q('installations'),
      sb.from('articles').select('slug,title,summary,cover,published_at').eq('published', true).order('published_at', { ascending: false })
    ]);
    if (p.error) throw p.error;
    D.products = p.data.map(x => ({ id: x.id, s: x.speciality, c: x.category, brand: x.brand, name: x.name, brief: x.brief, details: x.details, image: x.image, representative: x.representative, brochure: x.brochure, source: x.source }));
    D.partners = pa.data || [];
    D.customers = cu.data || [];
    D.testimonials = te.data || [];
    D.installations = (ins.data || []).map(i => ({ ...i, date: i.date || '' }));
    D.posts = (ar.data || []).map(a => ({ title: a.title, summary: a.summary, date: a.published_at, cover: a.cover, url: 'article.html?slug=' + encodeURIComponent(a.slug) }));
    D.live = true;
  } catch (e) { console.warn('Using offline content', e); }
  return D;
};
