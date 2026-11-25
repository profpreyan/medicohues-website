// Server-rendered, crawlable pages for SEO / GEO / AEO.
// Routes (see vercel.json rewrites):
//   /products, /products/:id, /articles, /articles/:slug,
//   /ahmedabad, /surat, /vadodara, /india, /sitemap.xml, /robots.txt, /llms.txt
// Content is read live (published rows only) from Supabase with the public
// publishable key — the same access the browser already has. No writes.
import { Marked } from "marked";

const SUPA_URL = "https://oyehwvvpsdpkhpbtoylb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_HEY-CuAb3JqyaXmWlzrakg_3CfjZAqD";
// Canonical host. Set SITE_URL=https://www.medicohues.com in Vercel once the
// custom domain's DNS points at Vercel; until then the vercel.app host is the only live one.
const SITE = (process.env.SITE_URL || "https://medicohues-website.vercel.app").replace(/\/+$/, "");
const CACHE = "public, max-age=0, s-maxage=300, stale-while-revalidate=86400";

const ORG = {
  name: "MedicoHues LLP",
  short: "MedicoHues",
  phone: "+91-99240-99600",
  phoneDisplay: "+91 99240 99600",
  tel: "+919924099600",
  email: "medicohues@gmail.com",
  street: "407/B, Satya Two Complex, B/H Rannapark Bus Stand, Ghatlodia",
  city: "Ahmedabad",
  postal: "380013",
  region: "Gujarat",
  country: "IN",
  founder: "Nirav Shah",
};

const SPECS = {
  gastro: { name: "Gastroenterology", blurb: "Stents, endoscopic accessories and liver diagnostics for GI suites." },
  pulmo: { name: "Pulmonology", blurb: "Airway stents, rigid & flexible bronchoscopy and pleural solutions." },
  uro: { name: "Urology", blurb: "Affordable, high-standard ureteroscopes for endourology." },
};
const CATS = { capital: "Capital Equipment", consumables: "Consumables & Accessories", implants: "Implants" };

const AREAS = [
  { "@type": "City", name: "Ahmedabad" },
  { "@type": "City", name: "Surat" },
  { "@type": "City", name: "Vadodara" },
  { "@type": "State", name: "Gujarat" },
  { "@type": "Country", name: "India" },
];

const METROS = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur"];

const CITIES = {
  ahmedabad: { slug: "ahmedabad", name: "Ahmedabad", label: "Ahmedabad", home: true },
  surat: { slug: "surat", name: "Surat", label: "Surat" },
  vadodara: { slug: "vadodara", name: "Vadodara", label: "Vadodara (Baroda)" },
  india: { slug: "india", name: "India", label: "across India", national: true },
};

/* ---------------- helpers ---------------- */
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const abs = (p) => (/^https?:\/\//i.test(p || "") ? p : SITE + (p || "/"));
const clip = (s, n = 158) => {
  s = String(s || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s;
};
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }); }
  catch { return ""; }
};
const isoDate = (d) => { try { return new Date(d).toISOString(); } catch { return undefined; } };
const productUrl = (p) => `/products/${encodeURIComponent(p.id)}`;
const articleUrl = (a) => `/articles/${encodeURIComponent(a.slug)}`;
const md = new Marked({ gfm: true, renderer: { html: () => "" } }); // raw HTML in markdown is dropped

async function sb(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Accept-Profile": "medicohues", Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}
const getProducts = () => sb("products?select=*&published=eq.true&order=sort.asc");
const getPartners = () => sb("partners?select=*&published=eq.true&order=sort.asc");
const getArticles = () => sb("articles?select=slug,title,summary,cover,published_at,created_at&published=eq.true&order=published_at.desc");

function partnerFor(brand, partners) {
  const b = String(brand || "").trim().toLowerCase();
  return partners.find((p) => String(p.name || "").trim().toLowerCase() === b) || null;
}
function relationship(partner) {
  if (!partner) return null;
  return partner.sub_distributor ? "sub-distributor for Gujarat" : "authorised distributor";
}

// Turn the plain-text product "details" field into semantic HTML
// (headings for "Heading:" lines, tables for "Key: value" runs, lists for "- " runs).
function detailsHtml(text) {
  const blocks = String(text || "").replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks
    .map((block) => {
      let lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      let out = "";
      if (lines.length > 1 && /:$/.test(lines[0]) && lines[0].length < 80) {
        out += `<h3>${esc(lines[0].replace(/:$/, ""))}</h3>`;
        lines = lines.slice(1);
      }
      if (lines.every((l) => /^[-•*]\s+/.test(l))) {
        return out + `<ul>${lines.map((l) => `<li>${esc(l.replace(/^[-•*]\s+/, ""))}</li>`).join("")}</ul>`;
      }
      if (lines.length > 1 && lines.every((l) => /^[^:]{1,70}:\s+\S/.test(l))) {
        return (
          out +
          `<table class="mh-specs"><tbody>${lines
            .map((l) => { const i = l.indexOf(":"); return `<tr><th scope="row">${esc(l.slice(0, i))}</th><td>${esc(l.slice(i + 1).trim())}</td></tr>`; })
            .join("")}</tbody></table>`
        );
      }
      return out + `<p>${lines.map(esc).join("<br>")}</p>`;
    })
    .join("\n");
}

/* ---------------- shared layout ---------------- */
function specMenu(products) {
  return Object.entries(SPECS)
    .map(([k, s]) => {
      const cats = Object.keys(CATS).filter((c) => products.some((p) => p.speciality === k && p.category === c));
      return `<div class="dd-col"><a class="dd-title" href="/products?s=${k}">${s.name}</a>${cats
        .map((c) => `<a href="/products?s=${k}&amp;c=${c}">${esc(CATS[c])}</a>`)
        .join("")}</div>`;
    })
    .join("");
}

const footer = () => `
<footer class="footer">
  <div class="wrap foot-inner">
    <img src="/assets/logo-horizontal.png" alt="MedicoHues">
    <nav class="foot-links" aria-label="Locations and resources">
      <a href="/products">Products</a><a href="/articles">Knowledge</a>
      <span>Serving:</span><a href="/ahmedabad">Ahmedabad</a><a href="/surat">Surat</a><a href="/vadodara">Vadodara</a><a href="/india">Pan-India</a>
    </nav>
    <p>© <span id="yr"></span> MedicoHues LLP. All rights reserved.</p>
  </div>
</footer>`;

function layout({ title, description, path, image, type = "website", jsonld = [], body, products = [], status = 200, noindex = false, extraHead = "", drawer = false, extraScripts = "" }) {
  const url = abs(path);
  const img = abs(image || "/assets/logo-horizontal.png");
  const html = `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${esc(url)}">`}
<meta property="og:site_name" content="MedicoHues">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/seo.css">
${extraHead}
${jsonld.map(ld).join("\n")}
</head>
<body class="page">

<header class="nav solid" id="nav">
  <div class="wrap nav-inner">
    <a href="/" class="brand" aria-label="MedicoHues home"><img src="/assets/logo-horizontal.png" alt="MedicoHues — Guide Your Hue in World"></a>
    <nav class="links" id="links">
      <a href="/#top">Home</a>
      <div class="dd"><button class="dd-btn">About us</button>
        <div class="dd-menu">
          <a href="/#about">Company</a>
          <a href="/#team">Our team</a>
          <a href="/#customers">Customers</a>
          <a href="/#feedback">Feedback &amp; installations</a>
        </div></div>
      <div class="dd"><button class="dd-btn">Specialities</button>
        <div class="dd-menu wide" id="spec-menu">${specMenu(products)}</div></div>
      <div class="dd"><button class="dd-btn">Locations</button>
        <div class="dd-menu">
          <a href="/ahmedabad">Ahmedabad</a>
          <a href="/surat">Surat</a>
          <a href="/vadodara">Vadodara</a>
          <a href="/india">Pan-India</a>
        </div></div>
      <a href="/#partners">Partners</a>
      <a href="/articles">Knowledge</a>
      <a href="#" class="btn btn-sm" data-enquire>Enquire</a>
    </nav>
    <button class="burger" id="burger" aria-label="Open menu"><span></span><span></span></button>
  </div>
</header>

<main>
${body}
</main>
${drawer ? `
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-panel" role="dialog" aria-modal="true">
    <button class="close" data-close aria-label="Close">×</button>
    <div id="drawer-body"></div>
  </div>
</div>` : ""}
${footer()}

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/data.js"></script>
<script src="/supa.js"></script>
<script src="/script.js"></script>
${extraScripts}
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": status === 200 ? CACHE : "public, s-maxage=60" },
  });
}

const breadcrumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
});

function localBusiness(areaServed = AREAS, extra = {}) {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    "@id": `${SITE}/#business`,
    name: ORG.name,
    alternateName: ORG.short,
    url: `${SITE}/`,
    logo: `${SITE}/assets/logo-horizontal.png`,
    image: `${SITE}/assets/logo-horizontal.png`,
    telephone: ORG.phone,
    email: ORG.email,
    address: { "@type": "PostalAddress", streetAddress: ORG.street, addressLocality: ORG.city, postalCode: ORG.postal, addressRegion: ORG.region, addressCountry: ORG.country },
    areaServed,
    founder: { "@type": "Person", name: ORG.founder },
    ...extra,
  };
}

const enquiryCta = (subject, heading = "Need pricing, a demo or a brochure?") => `
<section class="section mh-cta-band">
  <div class="wrap">
    <h2>${esc(heading)}</h2>
    <p class="sub">Talk to MedicoHues for product information, demos and quotations. We respond to hospitals, clinics and procurement teams.</p>
    <div class="cta">
      <a class="btn" href="#" data-enquire="${esc(subject || "")}">Send an enquiry</a>
      <a class="btn btn-ghost" href="tel:${ORG.tel}">Call ${esc(ORG.phoneDisplay)}</a>
      <a class="btn btn-ghost" href="https://wa.me/${ORG.tel.replace("+", "")}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div>
</section>`;

function productCard(p) {
  const img = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.className='ph';this.src='/assets/logo-mark.png'">`
    : `<img class="ph" src="/assets/logo-mark.png" alt="">`;
  return `<article class="product" data-id="${esc(p.id)}" tabindex="0">
        <div class="thumb">${img}${p.representative ? '<span class="rep">Representative Photo</span>' : ""}</div>
        <div class="p-body">
          <span class="chip">${esc(CATS[p.category] || "")}</span>
          <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
          <p class="brandname">${esc(p.brand)}</p>
          <p>${esc(p.brief)}</p>
          <a class="more-link" href="${productUrl(p)}">View product →</a>
        </div>
      </article>`;
}

function notFound(products, what = "Page") {
  return layout({
    title: `${what} not found | MedicoHues`,
    description: "The page you were looking for could not be found.",
    path: "/",
    noindex: true,
    status: 404,
    products,
    body: `<section class="page-hero"><div class="wrap"><p class="eyebrow">404</p><h1>${esc(what)} not found</h1><p class="lead">It may have been moved or unpublished. Browse our <a href="/products">products</a> or <a href="/articles">articles</a>.</p></div></section>`,
  });
}

/* ---------------- pages ---------------- */
async function pageProducts(url) {
  const [products, partners] = await Promise.all([getProducts(), getPartners()]);
  const s = SPECS[url.searchParams.get("s")] ? url.searchParams.get("s") : null;
  const c = s && CATS[url.searchParams.get("c")] ? url.searchParams.get("c") : null;
  const list = products.filter((p) => (!s || p.speciality === s) && (!c || p.category === c));
  const specName = s ? SPECS[s].name : null;
  const title = s
    ? `${c ? CATS[c] + " – " : ""}${specName} Devices | MedicoHues, Ahmedabad`
    : "Medical Devices for Gastroenterology, Pulmonology & Urology | MedicoHues";
  const description = s
    ? clip(`${specName}${c ? " " + CATS[c].toLowerCase() : ""} from MedicoHues LLP, Ahmedabad: ${list.slice(0, 4).map((p) => p.name).join(", ")}. Supplying hospitals in Ahmedabad, Surat, Vadodara and across Gujarat.`)
    : clip(`Browse ${products.length} endoscopy and interventional products — stents, endoscopes, bronchoscopy and urology devices — from MedicoHues LLP, Ahmedabad, supplying hospitals across Gujarat.`);
  const path = `/products${s ? `?s=${s}${c ? `&c=${c}` : ""}` : ""}`;
  const groups = s ? [[s, list]] : Object.keys(SPECS).map((k) => [k, list.filter((p) => p.speciality === k)]);
  const gridHtml = groups
    .filter(([, l]) => l.length)
    .map(([k, l]) => (s ? "" : `<h2 class="mh-grid-head">${esc(SPECS[k].name)}</h2>`) + l.map(productCard).join("\n"))
    .join("\n");
  const brands = [...new Set(list.map((p) => p.brand).filter(Boolean))];
  return layout({
    title, description, path, products, drawer: true,
    jsonld: [
      breadcrumbs([["Home", "/"], ["Products", "/products"], ...(s ? [[specName, `/products?s=${s}`]] : [])]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: s ? `${specName} products` : "MedicoHues products",
        itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(productUrl(p)), name: p.name })),
      },
    ],
    body: `
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow" id="crumb">${s ? `Specialities / ${esc(specName)}${c ? " / " + esc(CATS[c]) : ""}` : "Products"}</p>
      <h1 id="p-title">${s ? esc(specName) : "Our products"}</h1>
      <p class="lead" id="p-blurb">${s ? esc(SPECS[s].blurb) : "Endoscopy and interventional devices for Gastroenterology, Pulmonology and Urology, supplied by MedicoHues LLP from Ahmedabad to hospitals across Gujarat."}</p>
      <div class="tabs" id="spec-tabs"></div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="filters" id="cat-tabs"></div>
      <div class="products" id="product-grid">
${gridHtml}
      </div>
      <p class="mh-note">Brands: ${brands.map((b) => { const r = relationship(partnerFor(b, partners)); return esc(b) + (r ? ` (${r})` : ""); }).join(", ")}.</p>
    </div>
  </section>`,
  });
}

async function pageProduct(id) {
  const [products, partners] = await Promise.all([getProducts(), getPartners()]);
  const p = products.find((x) => x.id === id);
  if (!p) return notFound(products, "Product");
  const spec = SPECS[p.speciality] || { name: "" };
  const cat = CATS[p.category] || "";
  const partner = partnerFor(p.brand, partners);
  const rel = relationship(partner);
  const title = `${p.name} – ${p.brand} | ${spec.name} ${cat ? cat.split(" ")[0] : ""} | MedicoHues`.replace(/\s+\|/g, " |").replace(/\s+/g, " ");
  const description = clip(`${p.name} by ${p.brand}: ${p.brief} Available in Ahmedabad, Surat, Vadodara and across Gujarat from MedicoHues LLP.`);
  const related = products.filter((x) => x.speciality === p.speciality && x.id !== p.id).slice(0, 6);
  const supply = rel
    ? `MedicoHues LLP is ${rel === "authorised distributor" ? "an authorised distributor" : "the " + rel} for ${esc(p.brand)}${partner?.origin ? ` (${esc(partner.origin)})` : ""}.`
    : `${esc(p.brand)} products are available through MedicoHues LLP.`;
  const img = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)} – ${esc(p.brand)}" referrerpolicy="no-referrer" onerror="this.className='ph';this.src='/assets/logo-mark.png'">${p.representative ? '<span class="rep">Representative Photo</span>' : ""}`
    : `<img class="ph" src="/assets/logo-mark.png" alt="">`;
  const productLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "MedicalDevice"],
    "@id": abs(productUrl(p)) + "#product",
    name: p.name,
    description: [p.brief, p.details].filter(Boolean).join(" ").slice(0, 5000),
    brand: { "@type": "Brand", name: p.brand },
    category: `${spec.name} > ${cat}`,
    url: abs(productUrl(p)),
    ...(p.image ? { image: [p.image] } : {}),
    ...(p.source ? { sameAs: p.source } : {}),
    seller: { "@id": `${SITE}/#business` },
  };
  return layout({
    title,
    description,
    path: productUrl(p),
    image: p.image || undefined,
    type: "product",
    products,
    jsonld: [
      breadcrumbs([["Home", "/"], ["Products", "/products"], [spec.name, `/products?s=${p.speciality}`], [p.name, productUrl(p)]]),
      productLd,
      localBusiness(),
    ],
    body: `
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow"><a href="/products">Products</a> / <a href="/products?s=${esc(p.speciality)}">${esc(spec.name)}</a>${cat ? ` / <a href="/products?s=${esc(p.speciality)}&amp;c=${esc(p.category)}">${esc(cat)}</a>` : ""}</p>
      <h1>${esc(p.name)}</h1>
      <p class="lead">${esc(p.brief)}</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap mh-product">
      <div class="mh-product-media"><div class="d-img">${img}</div></div>
      <div class="mh-product-info article">
        <span class="chip">${esc(spec.name)} · ${esc(cat)}</span>
        <p class="brandname">${esc(p.brand)}</p>
        ${detailsHtml(p.details)}
        <p class="mh-supply">${supply} Based in Ahmedabad, we supply hospitals and clinics in <a href="/ahmedabad">Ahmedabad</a>, <a href="/surat">Surat</a>, <a href="/vadodara">Vadodara</a> and across Gujarat, and welcome enquiries from <a href="/india">other Indian cities</a>.</p>
        <div class="cta">
          ${p.brochure ? `<a class="btn" href="${esc(p.brochure)}" target="_blank" rel="noopener">Download brochure</a>` : ""}
          <a class="btn ${p.brochure ? "btn-ghost" : ""}" href="#" data-enquire="${esc(p.name)}">${p.brochure ? "Enquire" : "Request brochure / enquire"}</a>
          ${p.source ? `<a class="btn btn-ghost" href="${esc(p.source)}" target="_blank" rel="noopener nofollow">Manufacturer page ↗</a>` : ""}
        </div>
      </div>
    </div>
  </section>
  ${related.length ? `
  <section class="section alt">
    <div class="wrap">
      <h2 class="mh-grid-head">More ${esc(spec.name)} products</h2>
      <div class="products">${related.map(productCard).join("\n")}</div>
    </div>
  </section>` : ""}`,
  });
}

async function pageArticles() {
  const [products, articles] = await Promise.all([getProducts(), getArticles()]);
  return layout({
    title: "Knowledge: Clinical Insights & Updates | MedicoHues",
    description: clip("Articles, clinical insights and product updates on gastroenterology, pulmonology and urology from MedicoHues LLP, Ahmedabad."),
    path: "/articles",
    products,
    jsonld: [
      breadcrumbs([["Home", "/"], ["Knowledge", "/articles"]]),
      { "@context": "https://schema.org", "@type": "ItemList", itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: abs(articleUrl(a)), name: a.title })) },
    ],
    body: `
  <section class="page-hero"><div class="wrap"><p class="eyebrow">Knowledge sharing</p><h1>Insights, updates and clinical resources</h1><p class="lead">Educational articles and product updates from the MedicoHues team.</p></div></section>
  <section class="section"><div class="wrap"><div class="grid3">
  ${articles.length ? articles.map((a) => `<a class="post" href="${articleUrl(a)}">${a.cover ? `<img class="cover" src="${esc(a.cover)}" alt="" loading="lazy">` : ""}<span class="date">${esc(fmtDate(a.published_at))}</span><h2 class="mh-post-title">${esc(a.title)}</h2><p>${esc(a.summary)}</p><span class="more-link">Read more →</span></a>`).join("\n") : `<div class="empty"><h3>Articles coming soon</h3><p>Clinical insights, product updates and educational resources will be published here.</p></div>`}
  </div></div></section>`,
  });
}

async function pageArticle(slug) {
  const [products, rows] = await Promise.all([getProducts(), sb(`articles?select=*&published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`)]);
  const a = rows[0];
  if (!a) return notFound(products, "Article");
  const description = clip(a.summary || String(a.body || "").replace(/[#*_>\[\]()`-]/g, " "));
  const published = isoDate(a.published_at || a.created_at);
  const modified = isoDate(a.updated_at || a.published_at || a.created_at);
  return layout({
    title: `${a.title} | MedicoHues`,
    description,
    path: articleUrl(a),
    image: a.cover || undefined,
    type: "article",
    products,
    extraHead: published ? `<meta property="article:published_time" content="${published}">` : "",
    jsonld: [
      breadcrumbs([["Home", "/"], ["Knowledge", "/articles"], [a.title, articleUrl(a)]]),
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: String(a.title).slice(0, 110),
        description,
        ...(a.cover ? { image: [a.cover] } : { image: [`${SITE}/assets/logo-horizontal.png`] }),
        datePublished: published,
        dateModified: modified,
        author: { "@type": "Organization", name: ORG.name, url: `${SITE}/` },
        publisher: { "@type": "Organization", name: ORG.name, logo: { "@type": "ImageObject", url: `${SITE}/assets/logo-horizontal.png` } },
        mainEntityOfPage: abs(articleUrl(a)),
      },
    ],
    body: `
  <section class="page-hero"><div class="wrap"><p class="eyebrow"><a href="/articles">Knowledge</a>${a.published_at ? " · " + esc(fmtDate(a.published_at)) : ""}</p><h1>${esc(a.title)}</h1>${a.summary ? `<p class="lead">${esc(a.summary)}</p>` : ""}</div></section>
  <section class="section"><div class="wrap">
    <article class="article">
      ${a.cover ? `<img class="a-cover" src="${esc(a.cover)}" alt="">` : ""}
      ${md.parse(String(a.body || ""))}
    </article>
    <div class="article-cta"><a class="btn" href="#" data-enquire>Talk to MedicoHues</a> <a class="btn btn-ghost" href="/articles">More articles</a></div>
  </div></section>`,
  });
}

async function pageCity(key) {
  const city = CITIES[key];
  const [products, partners] = await Promise.all([getProducts(), getPartners()]);
  const where = city.national ? "across India" : `in ${city.name}`;
  const bySpec = Object.keys(SPECS).map((k) => [k, products.filter((p) => p.speciality === k)]).filter(([, l]) => l.length);
  const brandsOf = (l) => [...new Set(l.map((p) => p.brand).filter(Boolean))];
  const distributed = partners.filter((p) => !p.sub_distributor).map((p) => p.name);
  const sub = partners.filter((p) => p.sub_distributor).map((p) => p.name);

  let title, description, h1, lead, intro;
  if (key === "ahmedabad") {
    title = "Endoscopy & Medical Device Distributor in Ahmedabad | MedicoHues";
    h1 = "Medical device distributor in Ahmedabad";
    lead = "MedicoHues LLP is headquartered in Ghatlodia, Ahmedabad, and supplies Gastroenterology, Pulmonology and Urology devices to hospitals and clinics across the city.";
    intro = `Our office is at ${esc(ORG.street)}, Ahmedabad – ${ORG.postal}. Being local means we can meet your team, arrange product demonstrations and support procurement from enquiry to delivery.`;
  } else if (key === "india") {
    title = "Endoscopy, Pulmonology & Urology Devices Across India | MedicoHues";
    h1 = "Medical devices for hospitals across India";
    lead = `MedicoHues LLP is based in Ahmedabad and primarily serves hospitals across Gujarat. Hospitals and clinics in ${METROS.slice(0, -1).join(", ")} and ${METROS.at(-1)} are welcome to enquire about the products below.`;
    intro = "Availability, supply terms and support outside Gujarat depend on the product and the manufacturer's distribution arrangements in your region, so please contact us with your requirement and city — we will tell you honestly what we can supply and how.";
  } else {
    title = `Endoscopy & Medical Devices in ${city.name} | MedicoHues`;
    h1 = `Endoscopy and interventional devices in ${city.label}`;
    lead = `MedicoHues LLP, an Ahmedabad-based distributor, supplies Gastroenterology, Pulmonology and Urology devices to hospitals across Gujarat — including ${city.label}.`;
    intro = `Hospitals, clinics and procurement teams in ${esc(city.name)} can enquire directly for product information, demonstrations and quotations. Our team works from Ahmedabad (${esc(ORG.street.split(",").slice(-1)[0].trim())}) and serves facilities throughout Gujarat.`;
  }
  description = clip(`${lead} Stents, endoscopes, bronchoscopy and ureteroscopy products from ${brandsOf(products).slice(0, 4).join(", ")}.`);

  const faqs = [];
  const gastro = products.filter((p) => p.speciality === "gastro");
  const pulmo = products.filter((p) => p.speciality === "pulmo");
  const uro = products.filter((p) => p.speciality === "uro");
  const sems = gastro.filter((p) => /stent/i.test(p.name));
  const scopes = gastro.filter((p) => /scope|processor|video|sonoscape/i.test(p.name + " " + p.brand));
  if (sems.length) faqs.push([`Who supplies gastrointestinal stents ${where}?`, `MedicoHues LLP supplies ${[...new Set(sems.map((p) => p.brand))].join(", ")} stents, including ${sems.slice(0, 4).map((p) => p.name).join(", ")}${city.national ? ", from Ahmedabad; hospitals outside Gujarat can enquire about availability" : `, to hospitals ${where} and across Gujarat`}.`]);
  if (scopes.length) faqs.push([`Where can hospitals ${where} source video endoscopy systems?`, `MedicoHues offers ${[...new Set(scopes.map((p) => p.brand))].join(", ")} endoscopy equipment such as ${scopes.slice(0, 4).map((p) => p.name).join(", ")}. Contact us for specifications, demonstrations and quotations.`]);
  if (pulmo.length) faqs.push([`Who provides bronchoscopy and interventional pulmonology products ${where}?`, `MedicoHues supplies pulmonology products from ${brandsOf(pulmo).join(", ")}, including ${pulmo.slice(0, 4).map((p) => p.name).join(", ")}.`]);
  if (uro.length) faqs.push([`Where can urologists ${where} get ureteroscopes?`, `MedicoHues offers ${uro.slice(0, 3).map((p) => p.name).join(", ")} from ${brandsOf(uro).join(", ")}.`]);
  faqs.push([`How do I request a quotation or demo ${where}?`, `Call or WhatsApp ${ORG.phoneDisplay}, email ${ORG.email}, or use the enquiry form on this page with your hospital name, city and the products you need.`]);

  const others = Object.values(CITIES).filter((c) => c.slug !== key);
  const area = city.national
    ? [{ "@type": "Country", name: "India" }, ...METROS.map((m) => ({ "@type": "City", name: m })), { "@type": "State", name: "Gujarat" }]
    : key === "ahmedabad" ? AREAS : [{ "@type": "City", name: city.name, containedInPlace: { "@type": "State", name: "Gujarat" } }, ...AREAS.filter((a) => a.name !== city.name)];

  return layout({
    title, description, path: `/${key}`, products,
    jsonld: [
      breadcrumbs([["Home", "/"], [city.national ? "Pan-India" : city.name, `/${key}`]]),
      localBusiness(area),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
    body: `
  <section class="page-hero"><div class="wrap">
    <p class="eyebrow">Locations · ${city.national ? "Pan-India" : esc(city.name) + ", Gujarat"}</p>
    <h1>${esc(h1)}</h1>
    <p class="lead">${esc(lead)}</p>
    <div class="cta mh-hero-cta"><a class="btn" href="#" data-enquire>Enquire ${city.national ? "from your city" : "from " + esc(city.name)}</a><a class="btn btn-ghost" href="tel:${ORG.tel}">Call ${esc(ORG.phoneDisplay)}</a></div>
  </div></section>

  <section class="section"><div class="wrap article mh-wide">
    <p>${intro}</p>
    ${city.national ? `<h2>Major cities we take enquiries from</h2><ul class="mh-city-list">${METROS.map((m) => `<li>${esc(m)}</li>`).join("")}</ul><p>Within Gujarat, see our pages for <a href="/ahmedabad">Ahmedabad</a>, <a href="/surat">Surat</a> and <a href="/vadodara">Vadodara</a>.</p>` : ""}
    <h2>Brands we represent</h2>
    <ul>
      ${partners.map((p) => `<li><strong>${esc(p.name)}</strong>${p.origin ? ` (${esc(p.origin)})` : ""} — ${p.sub_distributor ? "sub-distributor for Gujarat" : "authorised distributor"}${p.chip && !p.sub_distributor ? `; ${esc(p.chip)}` : ""}. ${esc(p.description || "")}</li>`).join("\n      ")}
    </ul>
  </div></section>

  ${bySpec.map(([k, l]) => `
  <section class="section ${k === "pulmo" ? "alt" : ""}"><div class="wrap">
    <h2 class="mh-grid-head">${esc(SPECS[k].name)} ${city.national ? "devices" : "devices for hospitals in " + esc(city.name)}</h2>
    <p class="mh-note">${esc(SPECS[k].blurb)} Brands: ${brandsOf(l).map(esc).join(", ")}. <a href="/products?s=${k}">View all ${esc(SPECS[k].name)} products →</a></p>
    <div class="products">${l.slice(0, 6).map(productCard).join("\n")}</div>
  </div></section>`).join("")}

  <section class="section"><div class="wrap article mh-wide">
    <h2>Frequently asked questions</h2>
    <div class="mh-faq">
      ${faqs.map(([q, a]) => `<details open><summary><h3>${esc(q)}</h3></summary><p>${esc(a)}</p></details>`).join("\n      ")}
    </div>
    <h2>Other locations</h2>
    <p>${others.map((c) => `<a href="/${c.slug}">${c.national ? "Pan-India" : esc(c.name)}</a>`).join(" · ")}</p>
  </div></section>
  ${enquiryCta(city.national ? "" : "Enquiry from " + city.name, city.national ? "Tell us your city and requirement" : `Enquire from ${city.name}`)}`,
  });
}

async function sitemap() {
  const [products, articles] = await Promise.all([getProducts(), getArticles()]);
  const urls = [
    ["/", "weekly", "1.0"],
    ["/products", "weekly", "0.9"],
    ...Object.keys(SPECS).map((k) => [`/products?s=${k}`, "weekly", "0.8"]),
    ["/ahmedabad", "monthly", "0.8"],
    ["/surat", "monthly", "0.7"],
    ["/vadodara", "monthly", "0.7"],
    ["/india", "monthly", "0.7"],
    ["/articles", "weekly", "0.6"],
    ...products.map((p) => [productUrl(p), "monthly", "0.7", p.updated_at || p.created_at]),
    ...articles.map((a) => [articleUrl(a), "monthly", "0.6", a.updated_at || a.published_at]),
  ];
  const xmlEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, f, pr, lm]) => `  <url><loc>${xmlEsc(abs(p))}</loc>${lm && isoDate(lm) ? `<lastmod>${isoDate(lm).slice(0, 10)}</lastmod>` : ""}<changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": CACHE } });
}

function robots() {
  const bots = ["Googlebot", "Bingbot", "OAI-SearchBot", "GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "*"];
  const body = `# MedicoHues — all search and AI crawlers welcome
${bots.map((b) => `User-agent: ${b}`).join("\n")}
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": CACHE } });
}

async function llms() {
  const [products, partners, articles] = await Promise.all([getProducts(), getPartners(), getArticles()]);
  const body = `# MedicoHues LLP

> MedicoHues LLP is an Ahmedabad (Gujarat, India) based medical device distributor for Gastroenterology, Pulmonology and Urology — nitinol stents, video endoscopy systems, bronchoscopy, pleural and ureteroscopy products — supplying hospitals in Ahmedabad, Surat, Vadodara and across Gujarat, with enquiries welcome from other Indian cities.

## Company facts
- Legal name: MedicoHues LLP (brand: MedicoHues)
- Address: ${ORG.street}, Ahmedabad – ${ORG.postal}, Gujarat, India
- Phone / WhatsApp: ${ORG.phoneDisplay}
- Email: ${ORG.email}
- Contact person: ${ORG.founder}
- Regions served, in priority order: Ahmedabad, Surat, Vadodara (Baroda), rest of Gujarat, then enquiries from major Indian cities (${METROS.join(", ")})

## Brands represented
${partners.map((p) => `- ${p.name}${p.origin ? ` (${p.origin})` : ""} — ${p.sub_distributor ? "sub-distributor for Gujarat" : "authorised distributor"}${p.description ? `: ${p.description}` : ""}`).join("\n")}

## Products
${Object.entries(SPECS).map(([k, s]) => {
  const l = products.filter((p) => p.speciality === k);
  return l.length ? `### ${s.name}\n${l.map((p) => `- [${p.name}](${abs(productUrl(p))}) — ${p.brand}, ${CATS[p.category] || ""}: ${p.brief || ""}`).join("\n")}` : "";
}).filter(Boolean).join("\n\n")}

## Locations
- [Ahmedabad](${SITE}/ahmedabad)
- [Surat](${SITE}/surat)
- [Vadodara](${SITE}/vadodara)
- [Pan-India](${SITE}/india)

## Articles
${articles.length ? articles.map((a) => `- [${a.title}](${abs(articleUrl(a))})${a.summary ? `: ${a.summary}` : ""}`).join("\n") : "- (none yet)"}

## Key pages
- [Home](${SITE}/)
- [All products](${SITE}/products)
- [Knowledge](${SITE}/articles)
- [Sitemap](${SITE}/sitemap.xml)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": CACHE } });
}

/* ---------------- router ---------------- */
export async function GET(request) {
  const url = new URL(request.url);
  let page = url.searchParams.get("page");
  let param = url.searchParams.get("id") || url.searchParams.get("slug") || url.searchParams.get("city");
  if (!page) {
    // Fallback if the platform hands us the original path instead of the rewrite query.
    const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    if (parts[0] === "products") { page = parts[1] ? "product" : "products"; param = parts[1] && decodeURIComponent(parts[1]); }
    else if (parts[0] === "articles") { page = parts[1] ? "article" : "articles"; param = parts[1] && decodeURIComponent(parts[1]); }
    else if (CITIES[parts[0]]) { page = "city"; param = parts[0]; }
    else if (parts[0] === "sitemap.xml") page = "sitemap";
    else if (parts[0] === "robots.txt") page = "robots";
    else if (parts[0] === "llms.txt") page = "llms";
  }
  try {
    switch (page) {
      case "products": return await pageProducts(url);
      case "product": return await pageProduct(param || "");
      case "articles": return await pageArticles();
      case "article": return await pageArticle(param || "");
      case "city": return CITIES[param] ? await pageCity(param) : notFound([], "Page");
      case "sitemap": return await sitemap();
      case "robots": return robots();
      case "llms": return await llms();
      default: return notFound([], "Page");
    }
  } catch (e) {
    console.error("seo render failed", page, param, e);
    return new Response(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>MedicoHues</title></head><body><p>Temporarily unavailable. Please try again shortly or visit <a href="/">the homepage</a>.</p></body></html>`,
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60" } }
    );
  }
}
