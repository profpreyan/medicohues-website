/* ============================================================
   MedicoHues site content — edit this file to update the site.
   - image:    path to a product photo, e.g. "assets/products/niti-s-esophageal.png" (leave "" for placeholder)
   - brochure: path/URL to a PDF brochure (leave "" to show "Request brochure")
   ============================================================ */

window.MH = {
  // Paste your Google Apps Script web-app URL here (see README) to send enquiries to Google Sheets.
  SHEET_ENDPOINT: "",

  specialities: {
    gastro: { name: "Gastroenterology", blurb: "Stents, endoscopic accessories and liver diagnostics for GI suites." },
    pulmo:  { name: "Pulmonology",      blurb: "Airway stents, rigid & flexible bronchoscopy and pleural solutions." },
    uro:    { name: "Urology",          blurb: "Affordable, high-standard ureteroscopes for endourology." }
  },

  categories: {
    capital:     "Capital Equipment",
    consumables: "Consumables & Accessories",
    implants:    "Implants"
  },

  products: [
    // ---------- Gastroenterology ----------
    { id: "niti-s-esophageal", s: "gastro", c: "implants", brand: "Taewoong Medical", name: "Niti-S Esophageal Stent",
      brief: "Nitinol self-expanding metal stent for esophageal strictures.", details: "Part of Taewoong's Niti-S portfolio — known worldwide for the quality of its nitinol SEMS and the first preference of gastroenterologists.", image: "https://www.taewoongmedical.com/data/goodsImages/GOODS2_1706252504.jpg", representative: false, brochure: "", source: "https://www.taewoongmedical.com/in/product/product_view.php?part1_idx=1&part2_idx=2&part_idx=14&idx=75" },
    { id: "niti-s-biliary", s: "gastro", c: "implants", brand: "Taewoong Medical", name: "Niti-S Biliary Stent",
      brief: "Nitinol SEMS for biliary drainage.", details: "Self-expanding metal stent from the Niti-S range for biliary applications.", image: "https://www.taewoongmedical.com/data/goodsImages/GOODS2_156013659020190920134744.jpg", representative: false, brochure: "", source: "https://www.taewoongmedical.com/in/product/product_view.php?part1_idx=1&part2_idx=2&part_idx=12&idx=9" },
    { id: "niti-s-enteral", s: "gastro", c: "implants", brand: "Taewoong Medical", name: "Niti-S Enteral Stent",
      brief: "Nitinol SEMS for duodenal and colonic applications.", details: "Self-expanding metal stent from the Niti-S range for enteral strictures.", image: "https://www.taewoongmedical.com/data/goodsImages/GOODS2_165234204420220516113400.png", representative: false, brochure: "", source: "https://www.taewoongmedical.com/in/product/product_view.php?part1_idx=1&part2_idx=2&part_idx=15&idx=59" },
    { id: "gflex-accessories", s: "gastro", c: "consumables", brand: "G-Flex", name: "G-Flex Endoscopic Accessories",
      brief: "High-quality accessories for the endoscopy suite.", details: "G-Flex products are made with community involvement and focus on the best solution for the patient.", image: "https://cdn.pixabay.com/photo/2020/12/03/13/21/scalpel-5800533_640.jpg", representative: true, brochure: "https://pdf.medicalexpo.com/pdf/g-flex-europe/complete-catalog/90953-285567.html", source: "" },
    { id: "xemex-accessories", s: "gastro", c: "consumables", brand: "Xemex · Zeon Medical", name: "Xemex Endoscopic Accessories",
      brief: "Unique range of endoscopic accessories made in Japan.", details: "Endoscopic accessories manufactured in Japan by Zeon Medical Inc.", image: "https://cdn.pixabay.com/photo/2020/12/03/13/21/scalpel-5800533_640.jpg", representative: true, brochure: "", source: "" },
    { id: "steris-accessories", s: "gastro", c: "consumables", brand: "STERIS Healthcare", name: "STERIS Endoscopy Accessories",
      brief: "Best-in-class endoscopic accessories and peripheral devices.", details: "From the US manufacturer formerly known as U.S. Endoscopy. MedicoHues is sub-distributor for Gujarat.", image: "https://healthcare.steris.com/-/media/project/international/sg/products/endoscopy-devices/gi-procedure-products/bioshield-biopsy-valve_product-image.jpg?h=306&iar=0&w=538&hash=6D6F4DF56F4F20F0F07D69C3F19EFA9F", representative: false, brochure: "", source: "https://healthcare.steris.com/en-sg/sg/products/endoscopy-devices/gi-procedure-products" },
    { id: "hisky-liver", s: "gastro", c: "capital", brand: "Hisky Med", name: "Hisky Liver Diagnostic System",
      brief: "Affordable liver diagnostic system.", details: "Hisky offers a wide range of specialised products, including affordable liver diagnostic systems.", image: "https://cdn.pixabay.com/photo/2016/01/28/12/49/medical-1166206_640.jpg", representative: true, brochure: "https://romedic.ro/upload/23588.pdf", source: "" },

    // ---------- Pulmonology ----------
    { id: "dumon-stent", s: "pulmo", c: "implants", brand: "Novatech", name: "DUMON Silicone Stent",
      brief: "Silicone airway stents from Novatech, France.", details: "Novatech is the manufacturer of DUMON silicone stents and many other patented products.", image: "https://novatech.fr/fileadmin/user_upload/Bilder/Novatech/Stents_Tracheo-bronchiques/GSS_TD_Icon_2021.jpg", representative: false, brochure: "", source: "https://novatech.fr/fr/stents-tracheo-bronchiques/dumon/dumon-loriginal" },
    { id: "datau-rigid", s: "pulmo", c: "capital", brand: "Novatech", name: "DUTAU Rigid Bronchoscopy System",
      brief: "Rigid bronchoscopy system for interventional pulmonology.", details: "DUTAU NOVATECH modular rigid bronchoscope from Novatech, France.", image: "https://novatech.fr/fileadmin/_processed_/c/f/csm_DUTAU_NOVATECH_Bronchoscope_modulaire_3a630ee8bc.jpg", representative: false, brochure: "", source: "https://novatech.fr/fr/instruments/bronchoscopie/dutau-novatech-bronchoscope-rigide/dutau-novatech" },
    { id: "steritalc", s: "pulmo", c: "consumables", brand: "Novatech", name: "SteriTalc",
      brief: "Sterile talc for pleural procedures.", details: "Patented pleural product from Novatech, France.", image: "https://novatech.fr/fileadmin/user_upload/Bilder/Novatech/Pneumologie/STERITALC_2023/Steritalc_F2-F4-PF3.png", representative: false, brochure: "", source: "https://novatech.fr/fr/steritalc/steritalc" },
    { id: "viziscope-broncho-reusable", s: "pulmo", c: "capital", brand: "Viziscope", name: "Reusable Bronchoscope",
      brief: "High-standard reusable bronchoscope at an affordable price.", details: "Viziscope — making endoscopes affordable.", image: "https://cdn.pixabay.com/photo/2015/03/30/14/19/hospital-699461_640.jpg", representative: true, brochure: "", source: "" },
    { id: "viziscope-broncho-su", s: "pulmo", c: "consumables", brand: "Viziscope", name: "Single-Use Bronchoscope",
      brief: "Sterile single-use bronchoscope.", details: "Viziscope — making endoscopes affordable.", image: "https://cdn.pixabay.com/photo/2015/03/30/14/19/hospital-699461_640.jpg", representative: true, brochure: "", source: "" },
    { id: "viziscope-rhino", s: "pulmo", c: "capital", brand: "Viziscope", name: "Rhino-Laryngoscope",
      brief: "Flexible rhino-laryngoscope, reusable and single-use options.", details: "Viziscope — making endoscopes affordable.", image: "https://cdn.pixabay.com/photo/2015/03/30/14/19/hospital-699461_640.jpg", representative: true, brochure: "", source: "" },

    // ---------- Urology ----------
    { id: "viziscope-uretero-reusable", s: "uro", c: "capital", brand: "Viziscope", name: "Reusable Ureteroscope",
      brief: "High-standard reusable ureteroscope at an affordable price.", details: "Viziscope — making endoscopes affordable.", image: "https://cdn.pixabay.com/photo/2015/03/30/14/19/hospital-699461_640.jpg", representative: true, brochure: "", source: "" },
    { id: "viziscope-uretero-su", s: "uro", c: "consumables", brand: "Viziscope", name: "Single-Use Ureteroscope",
      brief: "Sterile single-use ureteroscope.", details: "Viziscope — making endoscopes affordable.", image: "https://cdn.pixabay.com/photo/2015/03/30/14/19/hospital-699461_640.jpg", representative: true, brochure: "", source: "" }
  ],

  // Customer feedback — add real quotes: { quote: "...", name: "Dr. ...", place: "... Hospital" }
  testimonials: [],

  // Installation updates — { title: "...", place: "...", date: "2026-11-01", image: "" }
  installations: [],

  // Knowledge sharing / blog — { title: "...", date: "2026-11-01", summary: "...", url: "" }
  posts: []
};
