const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPA_URL = process.env.SUPABASE_URL || 'https://znzensjmhxytvgbxcrpc.supabase.co';
const SUPA_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_cgGMmpsbvgjW4wt9ksXLmw_hQ3DYOU0';

const client = token => createClient(SUPA_URL, SUPA_KEY, {
  auth: { persistSession: false },
  global: token ? { headers: { Authorization: `Bearer ${token}` } } : {}
});

const mailer = () => {
  const user = process.env.GMAIL_USER, pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return { from: `MedicoHues <${user}>`, user, t: nodemailer.createTransport({ service: 'gmail', auth: { user, pass } }) };
};

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

module.exports = { client, mailer, esc };
