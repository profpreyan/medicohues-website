const { client, mailer, esc } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const id = req.body && req.body.id;
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return res.status(400).json({ error: 'bad id' });

  const { data, error } = await client().rpc('take_enquiry_for_notify', { eid: id });
  if (error) return res.status(500).json({ error: error.message });
  const e = data && data[0];
  if (!e) return res.status(200).json({ ok: true, skipped: true });

  const m = mailer();
  if (!m) return res.status(200).json({ ok: true, email: 'not_configured' });

  const site = process.env.SITE_URL || `https://${req.headers.host}`;
  const rows = [['Name', e.name], ['Organisation', e.organisation], ['Phone', e.phone], ['Email', e.email], ['Speciality', e.speciality], ['Product', e.product], ['Message', e.message], ['Page', e.page]]
    .filter(r => r[1]).map(([k, v]) => `<tr><td style="padding:6px 12px;color:#5b6b82">${k}</td><td style="padding:6px 12px"><b>${esc(v)}</b></td></tr>`).join('');
  try {
    await m.t.sendMail({
      from: m.from, to: process.env.NOTIFY_TO || m.user, replyTo: e.email || undefined,
      subject: `New enquiry: ${e.name}${e.product ? ' — ' + e.product : ''}`,
      html: `<div style="font-family:Arial,sans-serif"><h2 style="color:#0b2347">New website enquiry</h2><table>${rows}</table>
        <p style="margin-top:20px"><a href="${site}/admin/#enquiries/${e.id}" style="background:#1565c0;color:#fff;padding:10px 18px;border-radius:20px;text-decoration:none">Open in dashboard</a></p></div>`
    });
  } catch (err) { return res.status(500).json({ error: 'mail_failed' }); }
  res.status(200).json({ ok: true });
};
