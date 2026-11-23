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
      brief: "Nitinol self-expanding metal stent for esophageal strictures.", details: "Part of Taewoong's Niti-S portfolio — known worldwide for the quality of its nitinol SEMS and the first preference of gastroenterologists.", image: "", brochure: "" },
    { id: "niti-s-biliary", s: "gastro", c: "implants", brand: "Taewoong Medical", name: "Niti-S Biliary Stent",
      brief: "Nitinol SEMS for biliary drainage.", details: "Self-expanding metal stent from the Niti-S range for biliary applications.", image: "", brochure: "" },
    { id: "niti-s-enteral", s: "gastro", c: "implants", brand: "Taewoong Medical", name: "Niti-S Enteral Stent",
      brief: "Nitinol SEMS for duodenal and colonic applications.", details: "Self-expanding metal stent from the Niti-S range for enteral strictures.", image: "", brochure: "" },
    { id: "gflex-accessories", s: "gastro", c: "consumables", brand: "G-Flex", name: "G-Flex Endoscopic Accessories",
      brief: "High-quality accessories for the endoscopy suite.", details: "G-Flex products are made with community involvement and focus on the best solution for the patient.", image: "", brochure: "" },
    { id: "xemex-accessories", s: "gastro", c: "consumables", brand: "Xemex · Zeon Medical", name: "Xemex Endoscopic Accessories",
      brief: "Unique range of endoscopic accessories made in Japan.", details: "Endoscopic accessories manufactured in Japan by Zeon Medical Inc.", image: "", brochure: "" },
    { id: "steris-accessories", s: "gastro", c: "consumables", brand: "STERIS Healthcare", name: "STERIS Endoscopy Accessories",
      brief: "Best-in-class endoscopic accessories and peripheral devices.", details: "From the US manufacturer formerly known as U.S. Endoscopy. MedicoHues is sub-distributor for Gujarat.", image: "", brochure: "" },
    { id: "hisky-liver", s: "gastro", c: "capital", brand: "Hisky Med", name: "Hisky Liver Diagnostic System",
      brief: "Affordable liver diagnostic system.", details: "Hisky offers a wide range of specialised products, including affordable liver diagnostic systems.", image: "", brochure: "" },

    // ---------- Pulmonology ----------
    { id: "dumon-stent", s: "pulmo", c: "implants", brand: "Novatech", name: "DUMON Silicone Stent",
      brief: "Silicone airway stents from Novatech, France.", details: "Novatech is the manufacturer of DUMON silicone stents and many other patented products.", image: "", brochure: "" },
    { id: "datau-rigid", s: "pulmo", c: "capital", brand: "Novatech", name: "DATAU Rigid Bronchoscopy System",
      brief: "Rigid bronchoscopy system for interventional pulmonology.", details: "Rigid bronchoscopy platform from Novatech, France.", image: "", brochure: "" },
    { id: "steritalc", s: "pulmo", c: "consumables", brand: "Novatech", name: "SteriTalc",
      brief: "Sterile talc for pleural procedures.", details: "Patented pleural product from Novatech, France.", image: "", brochure: "" },
    { id: "viziscope-broncho-reusable", s: "pulmo", c: "capital", brand: "Viziscope", name: "Reusable Bronchoscope",
      brief: "High-standard reusable bronchoscope at an affordable price.", details: "Viziscope — making endoscopes affordable.", image: "", brochure: "" },
    { id: "viziscope-broncho-su", s: "pulmo", c: "consumables", brand: "Viziscope", name: "Single-Use Bronchoscope",
      brief: "Sterile single-use bronchoscope.", details: "Viziscope — making endoscopes affordable.", image: "", brochure: "" },
    { id: "viziscope-rhino", s: "pulmo", c: "capital", brand: "Viziscope", name: "Rhino-Laryngoscope",
      brief: "Flexible rhino-laryngoscope, reusable and single-use options.", details: "Viziscope — making endoscopes affordable.", image: "", brochure: "" },

    // ---------- Urology ----------
    { id: "viziscope-uretero-reusable", s: "uro", c: "capital", brand: "Viziscope", name: "Reusable Ureteroscope",
      brief: "High-standard reusable ureteroscope at an affordable price.", details: "Viziscope — making endoscopes affordable.", image: "", brochure: "" },
    { id: "viziscope-uretero-su", s: "uro", c: "consumables", brand: "Viziscope", name: "Single-Use Ureteroscope",
      brief: "Sterile single-use ureteroscope.", details: "Viziscope — making endoscopes affordable.", image: "", brochure: "" }
  ],

  // Customer feedback — add real quotes: { quote: "...", name: "Dr. ...", place: "... Hospital" }
  testimonials: [],

  // Installation updates — { title: "...", place: "...", date: "2026-11-01", image: "" }
  installations: [],

  // Knowledge sharing / blog — { title: "...", date: "2026-11-01", summary: "...", url: "" }
  posts: []
};
