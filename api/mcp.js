// MedicoHues MCP Server
// Remote MCP endpoint for Claude / ChatGPT / Grok
// Uses Supabase Auth (same credentials as admin) via OAuth 2.1

import { createClient } from '@supabase/supabase-js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const SUPA_URL = process.env.SUPABASE_URL || 'https://oyehwvvpsdpkhpbtoylb.supabase.co';
const SUPA_ANON = process.env.SUPABASE_ANON_KEY || 'sb_publishable_HEY-CuAb3JqyaXmWlzrakg_3CfjZAqD';

const TABLES = {
  products: { key: 'id', fields: ['name', 'brand', 'speciality', 'category', 'brief', 'details', 'image', 'representative', 'brochure', 'source', 'sort', 'published'] },
  articles: { key: 'id', fields: ['title', 'summary', 'cover', 'body', 'published_at', 'published', 'slug'] },
  partners: { key: 'id', fields: ['name', 'chip', 'description', 'origin', 'sub_distributor', 'sort', 'published'] },
  customers: { key: 'id', fields: ['name', 'sort', 'published'] },
  testimonials: { key: 'id', fields: ['quote', 'name', 'place', 'sort', 'published'] },
  installations: { key: 'id', fields: ['title', 'place', 'date', 'image', 'published'] },
  enquiries: { key: 'id', fields: ['name', 'organisation', 'phone', 'email', 'speciality', 'product', 'message', 'status', 'page'] },
};

function getSb(token) {
  return createClient(SUPA_URL, SUPA_ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    db: { schema: 'medicohues' },
  });
}

async function verifyToken(token) {
  if (!token) return null;
  const sb = createClient(SUPA_URL, SUPA_ANON);
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: isAdmin } = await sb.rpc('claim_admin', {}, { headers: { Authorization: `Bearer ${token}` } });
  if (!isAdmin) return null;
  return user;
}

const server = new Server(
  { name: 'medicohues-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_items',
      description: 'List items of a given type (products, articles, partners, customers, testimonials, installations, enquiries). Supports filters and published status.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.keys(TABLES) },
          published: { type: 'boolean' },
          limit: { type: 'number', default: 50 },
          search: { type: 'string' },
        },
        required: ['type'],
      },
    },
    {
      name: 'get_item',
      description: 'Get a single item by type and id.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.keys(TABLES) },
          id: { type: 'string' },
        },
        required: ['type', 'id'],
      },
    },
    {
      name: 'create_item',
      description: 'Create a new item of the given type.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.keys(TABLES) },
          data: { type: 'object' },
        },
        required: ['type', 'data'],
      },
    },
    {
      name: 'update_item',
      description: 'Update an existing item.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.keys(TABLES) },
          id: { type: 'string' },
          data: { type: 'object' },
        },
        required: ['type', 'id', 'data'],
      },
    },
    {
      name: 'delete_item',
      description: 'Delete an item by type and id.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.keys(TABLES) },
          id: { type: 'string' },
        },
        required: ['type', 'id'],
      },
    },
    {
      name: 'whoami',
      description: 'Return the currently authenticated admin user.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const token = extra?.authInfo?.token || request.params?.arguments?._token;
  const user = await verifyToken(token);
  if (!user) {
    return { content: [{ type: 'text', text: 'Unauthorized. Please sign in with your MedicoHues admin credentials.' }], isError: true };
  }
  const sb = getSb(token);
  const { name, arguments: args } = request.params;

  try {
    if (name === 'whoami') {
      return { content: [{ type: 'text', text: JSON.stringify({ email: user.email, id: user.id }) }] };
    }
    const type = args.type;
    const table = TABLES[type];
    if (!table) throw new Error('Unknown type');

    if (name === 'list_items') {
      let q = sb.from(type).select('*').order(table.key === 'id' ? 'created_at' : 'sort', { ascending: false }).limit(args.limit || 50);
      if (args.published !== undefined) q = q.eq('published', args.published);
      if (args.search) q = q.or(`name.ilike.%${args.search}%,title.ilike.%${args.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
    if (name === 'get_item') {
      const { data, error } = await sb.from(type).select('*').eq(table.key, args.id).single();
      if (error) throw error;
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
    if (name === 'create_item') {
      const { data, error } = await sb.from(type).insert(args.data).select().single();
      if (error) throw error;
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
    if (name === 'update_item') {
      const { data, error } = await sb.from(type).update(args.data).eq(table.key, args.id).select().single();
      if (error) throw error;
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
    if (name === 'delete_item') {
      const { error } = await sb.from(type).delete().eq(table.key, args.id);
      if (error) throw error;
      return { content: [{ type: 'text', text: 'Deleted successfully' }] };
    }
    throw new Error('Unknown tool');
  } catch (e) {
    return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
  }
});

export default async function handler(req, res) {
  if (req.url?.includes('.well-known/oauth-protected-resource')) {
    return res.status(200).json({
      resource: 'https://medicohues-website.vercel.app/api/mcp',
      authorization_servers: ['https://oyehwvvpsdpkhpbtoylb.supabase.co/auth/v1'],
      scopes_supported: ['openid', 'email', 'profile'],
      bearer_methods_supported: ['header'],
    });
  }

  const transport = new StreamableHTTPServerTransport('/api/mcp', res);
  await server.connect(transport);
  await transport.handleRequest(req, res);
}
