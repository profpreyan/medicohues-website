// Product Data
const products = {
    gastro: [
        { name: "TaeWoong Niti SEMS Stents", category: "Implants", description: "High-quality nitinol self-expanding metal stents. First preference of gastroenterologists worldwide.", image: "https://via.placeholder.com/400x250/0066cc/ffffff?text=TaeWoong+SEMS", brochure: "#" },
        { name: "Infinity ERCP Sampling Device", category: "Consumables", description: "Advanced ERCP sampling device for precise diagnostic procedures.", image: "https://via.placeholder.com/400x250/00aaff/ffffff?text=ERCP+Sampling", brochure: "#" },
        { name: "Roth Net Retriever 360", category: "Consumables", description: "Steris Roth Net Retriever for effective foreign body retrieval.", image: "https://via.placeholder.com/400x250/ff8c00/ffffff?text=Roth+Net", brochure: "#" },
        { name: "Carr-Locke Injection Needle", category: "Consumables", description: "Precision injection needle for endoscopic procedures.", image: "https://via.placeholder.com/400x250/0066cc/ffffff?text=Injection+Needle", brochure: "#" }
    ],
    pulmo: [
        { name: "Viziscope Wireless Video Bronchoscope", category: "Capital Equipment", description: "India's innovative wireless endoscopy system. Making flexible endoscopes affordable.", image: "https://via.placeholder.com/400x250/00aaff/ffffff?text=Viziscope+Broncho", brochure: "https://share.google/4AdUrKjoIm0sN4NJb" },
        { name: "Novatech Dumon Silicon Stents", category: "Implants", description: "Flexible yet durable Dumon silicon stents for tracheobronchial applications.", image: "https://via.placeholder.com/400x250/0066cc/ffffff?text=Dumon+Stents", brochure: "https://share.google/GGJPzLIFPrDP8kmBy" },
        { name: "Novatech Dutau Rigid Bronchoscope", category: "Capital Equipment", description: "High-quality rigid bronchoscopy system from Novatech.", image: "https://via.placeholder.com/400x250/ff8c00/ffffff?text=Rigid+Broncho", brochure: "#" },
        { name: "Viziscope Single Use Bronchoscope", category: "Capital Equipment", description: "Reusable and single-use range of bronchoscopes at affordable prices.", image: "https://via.placeholder.com/400x250/00aaff/ffffff?text=Single+Use+Scope", brochure: "#" }
    ],
    uro: [
        { name: "Viziscope Ureteroscope (7.5Fr)", category: "Capital Equipment", description: "Flexible ureteroscope from Viziscope range.", image: "https://via.placeholder.com/400x250/0066cc/ffffff?text=Ureteroscope", brochure: "#" },
        { name: "Endoscopic Accessories for Urology", category: "Consumables", description: "Specialized consumables supporting advanced urological interventions.", image: "https://via.placeholder.com/400x250/00aaff/ffffff?text=Uro+Accessories", brochure: "#" }
    ],
    ortho: [
        { name: "Stryker Orthopaedic Solutions", category: "Capital Equipment / Implants", description: "Reference partnership with Stryker for orthopaedic products.", image: "https://via.placeholder.com/400x250/ff8c00/ffffff?text=Stryker+Ortho", brochure: "https://share.google/pKXGjyxJO1SCgrHuj" },
        { name: "Orthopaedic Implants & Devices", category: "Implants", description: "Range of orthopaedic implants tailored for the Indian healthcare market.", image: "https://via.placeholder.com/400x250/0066cc/ffffff?text=Ortho+Implants", brochure: "#" }
    ]
};

function renderProducts() {
    Object.keys(products).forEach(specialty => {
        const container = document.getElementById(`${specialty}-products`);
        if (!container) return;
        products[specialty].forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `<img src="${product.image}" alt="${product.name}"><div class="product-info"><div class="category">${product.category}</div><h4>${product.name}</h4><p>${product.description.substring(0, 100)}...</p><button class="btn-small" onclick="openModal('${specialty}', '${product.name.replace(/'/g, "\\'")}')">View Details</button></div>`;
            container.appendChild(card);
        });
    });
}

function openModal(specialty, productName) {
    const product = products[specialty].find(p => p.name === productName);
    if (!product) return;
    const modal = document.getElementById('product-modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = `<h3>${product.name}</h3><p style="color: var(--orange); font-weight: 600; margin: 10px 0;">${product.category}</p><img src="${product.image}" alt="${product.name}" style="width:100%; border-radius:12px; margin:15px 0;"><p>${product.description}</p>${product.brochure !== '#' ? `<a href="${product.brochure}" target="_blank" class="btn btn-primary" style="margin-top:15px;">View Brochure</a>` : ''}<a href="#contact" class="btn btn-secondary" style="margin-top:15px;" onclick="document.getElementById('product-modal').style.display='none'">Inquire Now</a>`;
    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    const closeBtn = document.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => document.getElementById('product-modal').style.display = 'none';
    window.onclick = function(event) {
        const modal = document.getElementById('product-modal');
        if (event.target === modal) modal.style.display = 'none';
    };
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) hamburger.addEventListener('click', () => document.querySelector('.nav').classList.toggle('active'));
    document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.nav').classList.remove('active')));
    document.querySelectorAll('.specialty-card').forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-target');
            const el = document.getElementById(target);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
    });
    const form = document.getElementById('contact-form');
    if (form) form.addEventListener('submit', function(e) {
        e.preventDefault();
        const status = document.getElementById('form-status');
        status.textContent = 'Thank you! Your inquiry has been noted. We will contact you shortly.';
        status.style.color = 'green';
        this.reset();
    });
});