const { client, mailer, esc } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const { enquiry_id, body, subject } = req.body || {};
  if (!token || !enquiry_id || !body) return res.status(400).json({ error: 'missing fields' });

  const sb = client(token);
  const { data: isAdmin } = await sb.rpc('is_admin');
  if (!isAdmin) return res.status(403).json({ error: 'forbidden' });

  const { data: e, error } = await sb.from('enquiries').select('*').eq('id', enquiry_id).single();
  if (error || !e) return res.status(404).json({ error: 'not found' });
  if (!e.email) return res.status(400).json({ error: 'no_email' });

  const m = mailer();
  if (!m) return res.status(501).json({ error: 'email_not_configured' });

  try {
    await m.t.sendMail({
      from: m.from, to: e.email, replyTo: m.user,
      subject: subject || `Re: Your enquiry with MedicoHues${e.product ? ' — ' + e.product : ''}`,
      text: body,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">${esc(body).replace(/\n/g, '<br>')}
        <hr style="border:0;border-top:1px solid #e3e9f1;margin:24px 0"><div style="color:#5b6b82;font-size:13px">MedicoHues LLP · Ahmedabad · +91 99240 99600</div></div>`
    });
  } catch (err) { return res.status(500).json({ error: 'mail_failed' }); }

  await sb.from('enquiry_replies').insert({ enquiry_id, body, channel: 'email' });
  await sb.from('enquiries').update({ status: 'replied' }).eq('id', enquiry_id);
  res.status(200).json({ ok: true });
};
