# MedicoHues website

Static site (no build step) deployed on Vercel.

- `index.html` — home: hero, about, vision/mission, specialities, partners, team, customers, feedback & installations, knowledge, contact
- `products.html` — speciality → category → product cards with detail drawer, brochure download and enquiry
- `data.js` — **all editable content**: products, categories, testimonials, installations, blog posts, Google Sheet endpoint
- `assets/` — transparent logos (`logo-mark.png`, `logo-horizontal.png`, `logo-stacked.png`); put product photos in `assets/products/` and brochures in `assets/brochures/`

## Enquiries → Google Sheets
1. Create a Google Sheet → Extensions → Apps Script, paste:
```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const cols = ['submittedAt','name','organisation','phone','email','speciality','product','message','page'];
  if (sh.getLastRow() === 0) sh.appendRow(cols);
  sh.appendRow(cols.map(c => d[c] || ''));
  return ContentService.createTextOutput('ok');
}
```
2. Deploy → New deployment → Web app → Execute as *Me*, access *Anyone* → copy the URL.
3. Paste it into `SHEET_ENDPOINT` in `data.js`. Until then, the form falls back to opening an email to medicohues@gmail.com.
