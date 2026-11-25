import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPA_URL = process.env.SUPABASE_URL || "https://oyehwvvpsdpkhpbtoylb.supabase.co";
const SUPA_ANON = process.env.SUPABASE_ANON_KEY || "sb_publishable_HEY-CuAb3JqyaXmWlzrakg_3CfjZAqD";
const BUCKET = "medicohues-media";

const TYPES = ["products", "articles", "partners", "customers", "testimonials", "installations", "enquiries"];

function getSb(token) {
  return createClient(SUPA_URL, SUPA_ANON, {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    db: { schema: "medicohues" },
  });
}

async function verifyToken(req, bearerToken) {
  if (!bearerToken) return undefined;
  try {
    const sb = createClient(SUPA_URL, SUPA_ANON, {
      db: { schema: "medicohues" },
    });
    const { data: { user }, error } = await sb.auth.getUser(bearerToken);
    if (error || !user) {
      console.error("MCP auth getUser failed:", error?.message || "no user");
      return undefined;
    }
    const { data: isAdmin, error: rpcError } = await sb.rpc("claim_admin", {}, { headers: { Authorization: `Bearer ${bearerToken}` } });
    if (rpcError) {
      console.error("MCP auth claim_admin rpc failed:", rpcError.message);
      return undefined;
    }
    if (!isAdmin) {
      console.error("MCP auth claim_admin denied for", user.email);
      return undefined;
    }
    return {
      token: bearerToken,
      scopes: ["openid", "email", "profile"],
      clientId: user.id,
      extra: { email: user.email, userId: user.id },
    };
  } catch {
    return undefined;
  }
}

function mimeFromName(name, fallback = "application/octet-stream") {
  const ext = (name.split(".").pop() || "").toLowerCase();
  const map = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    gif: "image/gif", svg: "image/svg+xml", pdf: "application/pdf",
  };
  return map[ext] || fallback;
}

async function uploadToStorage(token, buffer, filename, contentType) {
  const ext = (filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const sb = getSb(token);
  const { error } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: contentType || mimeFromName(filename),
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
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
        const sb = getSb(token);
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
        const sb = getSb(extra?.authInfo?.token);
        const { data, error } = await sb.from(type).select("*").eq("id", id).single();
        if (error) throw new Error(error.message);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.tool(
      "create_item",
      "Create a new item. Pass the fields for that content type. For image/brochure/cover fields, first call upload_image and put the returned URL in the field.",
      { type: z.enum(TYPES), data: z.record(z.any()) },
      async ({ type, data }, extra) => {
        const sb = getSb(extra?.authInfo?.token);
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
        const sb = getSb(extra?.authInfo?.token);
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
        const sb = getSb(extra?.authInfo?.token);
        const { error } = await sb.from(type).delete().eq("id", id);
        if (error) throw new Error(error.message);
        return { content: [{ type: "text", text: "Deleted successfully" }] };
      }
    );

    server.tool(
      "upload_image",
      "Upload an image or PDF to MedicoHues storage and return its public URL. Use for product photos, article covers, installation photos, or brochure PDFs extracted from a document. Prefer source_url when the file is already online; otherwise pass content_base64. Then use the returned URL in create_item or update_item (fields: image, cover, brochure).",
      {
        filename: z.string().describe("Filename with extension, e.g. product.jpg or brochure.pdf"),
        content_base64: z.string().optional().describe("Base64 file content without data: prefix"),
        source_url: z.string().url().optional().describe("Public URL to fetch and store instead of base64"),
        content_type: z.string().optional().describe("MIME type; inferred from filename if omitted"),
      },
      async ({ filename, content_base64, source_url, content_type }, extra) => {
        const token = extra?.authInfo?.token;
        if (!token) throw new Error("Not authenticated");
        if (!content_base64 && !source_url) throw new Error("Provide content_base64 or source_url");

        let buffer;
        let type = content_type || mimeFromName(filename);

        if (source_url) {
          const res = await fetch(source_url);
          if (!res.ok) throw new Error(`Failed to fetch ${source_url}: ${res.status}`);
          const arr = await res.arrayBuffer();
          buffer = Buffer.from(arr);
          const ct = res.headers.get("content-type");
          if (ct && !content_type) type = ct.split(";")[0].trim();
        } else {
          const clean = content_base64.replace(/^data:[^;]+;base64,/, "");
          buffer = Buffer.from(clean, "base64");
        }

        if (buffer.length > 8 * 1024 * 1024) throw new Error("File too large (max 8 MB)");

        const result = await uploadToStorage(token, buffer, filename, type);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              url: result.url,
              path: result.path,
              filename,
              content_type: type,
              size: buffer.length,
            }, null, 2),
          }],
        };
      }
    );

    server.tool(
      "list_media",
      "List recent files in the media storage bucket",
      {
        limit: z.number().int().min(1).max(100).optional().default(30),
        folder: z.string().optional().describe("Optional folder prefix, e.g. 2026"),
      },
      async ({ limit, folder }, extra) => {
        const sb = getSb(extra?.authInfo?.token);
        const { data, error } = await sb.storage.from(BUCKET).list(folder || "", {
          limit: limit || 30,
          sortBy: { column: "created_at", order: "desc" },
        });
        if (error) throw new Error(error.message);
        const items = (data || []).map(f => ({
          name: f.name,
          id: f.id,
          created_at: f.created_at,
          size: f.metadata?.size,
          mimetype: f.metadata?.mimetype,
          url: sb.storage.from(BUCKET).getPublicUrl((folder ? folder + "/" : "") + f.name).data.publicUrl,
        }));
        return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
      }
    );

    server.tool(
      "whoami",
      "Show the currently authenticated admin",
      {},
      async (_args, extra) => {
        const email = extra?.authInfo?.extra?.email;
        return { content: [{ type: "text", text: JSON.stringify({ email, id: extra?.authInfo?.clientId }) }] };
      }
    );
  },
  {},
  { basePath: "/api", maxDuration: 60 }
);

const authHandler = withMcpAuth(handler, verifyToken, {
  required: true,
  requiredScopes: ["openid", "email"],
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authHandler as GET, authHandler as POST };
