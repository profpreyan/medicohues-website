# MedicoHues MCP Connector

Remote MCP server so Nirav (or any authorised admin) can manage the website content from Claude, Grok, or ChatGPT without opening the admin UI.

## Features
- Full CRUD on products, articles, partners, customers, testimonials, installations, and enquiries
- Same admin login credentials as the website dashboard
- Deployed on Vercel

## Setup required on Supabase
1. Go to your Supabase project → Authentication → OAuth Server
2. Enable **OAuth 2.1 Server**
3. Enable **Dynamic Client Registration**
4. Set Site URL to your Vercel domain and authorization path to `/oauth-consent.html`

## For Nirav
Add this URL as a custom MCP connector in Claude / ChatGPT / Grok:

```
https://medicohues-website.vercel.app/api/mcp
```

He will be prompted to sign in with his existing admin email and password.
