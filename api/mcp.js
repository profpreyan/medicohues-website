import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.SUPABASE_URL || "https://oyehwvvpsdpkhpbtoylb.supabase.co";
const SUPA_ANON = process.env.SUPABASE_ANON_KEY || "sb_publishable_HEY-CuAb3JqyaXmWlzrakg_3CfjZAqD";

const TYPES = ["products", "articles", "partners", "customers", "testimonials", "installations", "enquiries"];

function getSb(token) {
  return createClient(SUPA_URL, SUPA_ANON, {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    db: { schema: "medicohues" },
  });
}

async function requireAdmin(token) {
  if (!token) throw new Error("Missing authorization token");
  const sb = createClient(SUPA_URL, SUPA_ANON);
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) throw new Error("Invalid token");
  const { data: isAdmin } = await sb.rpc("claim_admin", {}, { headers: { Authorization: `Bearer ${token}` } });
  if (!isAdmin) throw new Error("Not an admin");
  return getSb(token);
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "list_items",
      "List items of a content type (products, articles, partners, customers, testimonials, installations, enquiries)",
      {
        type: z.enum(TYPES),
        published: z.boolean().optional(),
        limit: z.number().int().min(1).max(200).optional().default(50),
        search: z.string().optional(),
      },
      async ({ type, published, limit, search }, extra) => {
        const token = extra?.authInfo?.token;
        const sb = await requireAdmin(token);
        let q = sb.from(type).select("*").limit(limit || 50);
        if (published !== undefined) q = q.eq("published", published);
        if (search) q = q.or(`name.ilike.%${search}%,title.ilike.%${search}%`);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.tool(
      "get_item",
      "Get one item by type and id",
      { type: z.enum(TYPES), id: z.string() },
      async ({ type, id }, extra) => {
        const sb = await requireAdmin(extra?.authInfo?.token);
        const { data, error } = await sb.from(type).select("*").eq("id", id).single();
        if (error) throw new Error(error.message);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.tool(
      "create_item",
      "Create a new item. Pass the fields for that content type.",
      { type: z.enum(TYPES), data: z.record(z.any()) },
      async ({ type, data }, extra) => {
        const sb = await requireAdmin(extra?.authInfo?.token);
        const { data: created, error } = await sb.from(type).insert(data).select().single();
        if (error) throw new Error(error.message);
        return { content: [{ type: "text", text: JSON.stringify(created, null, 2) }] };
      }
    );

    server.tool(
      "update_item",
      "Update an existing item",
      { type: z.enum(TYPES), id: z.string(), data: z.record(z.any()) },
      async ({ type, id, data }, extra) => {
        const sb = await requireAdmin(extra?.authInfo?.token);
        const { data: updated, error } = await sb.from(type).update(data).eq("id", id).select().single();
        if (error) throw new Error(error.message);
        return { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] };
      }
    );

    server.tool(
      "delete_item",
      "Delete an item by type and id",
      { type: z.enum(TYPES), id: z.string() },
      async ({ type, id }, extra) => {
        const sb = await requireAdmin(extra?.authInfo?.token);
        const { error } = await sb.from(type).delete().eq("id", id);
        if (error) throw new Error(error.message);
        return { content: [{ type: "text", text: "Deleted successfully" }] };
      }
    );

    server.tool(
      "whoami",
      "Show the currently authenticated admin",
      {},
      async (_args, extra) => {
        const token = extra?.authInfo?.token;
        if (!token) return { content: [{ type: "text", text: "Not authenticated" }] };
        const sb = createClient(SUPA_URL, SUPA_ANON);
        const { data: { user } } = await sb.auth.getUser(token);
        return { content: [{ type: "text", text: JSON.stringify({ email: user?.email, id: user?.id }) }] };
      }
    );
  },
  {},
  { basePath: "/api", maxDuration: 60 }
);

export { handler as GET, handler as POST };
