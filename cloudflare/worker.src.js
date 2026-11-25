// Fakhama storefront API on Cloudflare Workers + KV. Same JSON contract as the Express server in /server.
// Products are a read-only catalog (bundled); users, orders, addresses and stock live in KV.
const PRODUCTS = /*PRODUCTS*/[];
const enc = new TextEncoder();
const H = { "content-type": "application/json; charset=utf-8" };
const ok = (data, message, status = 200, extra) => new Response(JSON.stringify({ success: true, data, message }), { status, headers: { ...H, ...(extra || {}) } });
const fail = (status, code, message) => new Response(JSON.stringify({ success: false, error: { code, message } }), { status, headers: H });
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function hmac(secret, text) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", k, enc.encode(text)));
}
async function pbkdf2(password, salt) {
  const k = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, k, 256));
}
async function makeToken(env, uid) {
  const body = b64(enc.encode(JSON.stringify({ u: uid, e: Date.now() + 7 * 864e5 })));
  return body + "." + (await hmac(env.TOKEN_SECRET, body));
}
async function readToken(env, req) {
  const h = req.headers.get("authorization") || "", c = (req.headers.get("cookie") || "").match(/(?:^|;\s*)ecommerce\.sid=([^;]+)/);
  const t = h.startsWith("Bearer ") ? h.slice(7) : c ? decodeURIComponent(c[1]) : "";
  const [body, sig] = t.split(".");
  if (!body || !sig || (await hmac(env.TOKEN_SECRET, body)) !== sig) return null;
  try { const p = JSON.parse(new TextDecoder().decode(unb64(body))); return p.e > Date.now() ? p.u : null; } catch { return null; }
}
const cookie = (t, age) => `ecommerce.sid=${encodeURIComponent(t)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const pub = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || null, created_at: u.created_at });
const getUser = async (env, id) => { const email = await env.STORE.get("uid:" + id); return email ? env.STORE.get("u:" + email, "json") : null; };
const putUser = (env, u) => env.STORE.put("u:" + u.email, JSON.stringify(u));

async function stockMap(env) { return (await env.STORE.get("stock", "json")) || {}; }
const stockOf = (p, m) => (m[p.id] !== undefined ? m[p.id] : p.stock);
const withStock = (p, m) => ({ ...p, stock: stockOf(p, m) });

function listProducts(url, m) {
  const q = url.searchParams, get = (k) => q.get(k);
  let rows = PRODUCTS.map((p) => withStock(p, m));
  const s = (get("search") || "").trim().toLowerCase();
  if (s) rows = rows.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  const cat = (get("category") || "").trim();
  if (cat && cat.toLowerCase() !== "all") rows = rows.filter((p) => p.category === cat);
  const lo = get("minPrice"), hi = get("maxPrice");
  if (lo !== null && lo !== "" && !isNaN(+lo)) rows = rows.filter((p) => p.price >= +lo);
  if (hi !== null && hi !== "" && !isNaN(+hi)) rows = rows.filter((p) => p.price <= +hi);
  if (get("instock") === "true") rows = rows.filter((p) => p.stock > 0);
  const sorts = { price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price, name_asc: (a, b) => a.name.localeCompare(b.name), name_desc: (a, b) => b.name.localeCompare(a.name), newest: (a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id };
  rows.sort(sorts[get("sort")] || ((a, b) => a.id - b.id));
  const total = rows.length; let page = 1, limit = total || 12, totalPages = 1;
  if (get("page") !== null || get("limit") !== null) {
    limit = Math.max(1, Math.min(100, parseInt(get("limit"), 10) || 12)); page = Math.max(1, parseInt(get("page"), 10) || 1);
    totalPages = Math.ceil(total / limit) || 1; if (page > totalPages) page = totalPages;
    rows = rows.slice((page - 1) * limit, page * limit);
  }
  return { products: rows, total, totalPages, page, limit, pagination: { total, totalPages, page, limit } };
}

function formatOrder(o) {
  return { id: o.id, userId: o.userId, user_id: o.userId, total: o.total, totalAmount: o.total, status: o.status, customer: o.customer,
    shipping_address: [o.customer.address, o.customer.city].filter(Boolean).join(", "), recipient_name: o.customer.name, phone: o.customer.phone,
    itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
    items: o.items.map((i, n) => ({ id: n + 1, productId: i.productId, product_id: i.productId, name: i.name, product_name: i.name, imageUrl: i.imageUrl, image_url: i.imageUrl, quantity: i.quantity, price: i.price, subtotal: +(i.quantity * i.price).toFixed(2) })),
    createdAt: o.createdAt, created_at: o.createdAt };
}

async function readJson(req) { try { return await req.json(); } catch { return {}; } }
const str = (v) => (typeof v === "string" ? v.trim() : "");

async function handle(req, env, url) {
  const p = url.pathname.replace(/\/+$/, ""), m = req.method;
  if (p === "/api/health") return ok({ status: "healthy", runtime: "cloudflare-workers", products: PRODUCTS.length, ai: !!env.GEMINI_API_KEY }, "ok");

  // ---- products
  if (p === "/api/products" && m === "GET") return ok(listProducts(url, await stockMap(env)), "Products retrieved successfully.");
  if (p === "/api/products/categories") {
    const counts = { all: PRODUCTS.length }; PRODUCTS.forEach((x) => (counts[x.category] = (counts[x.category] || 0) + 1));
    return ok({ categories: Object.keys(counts).filter((k) => k !== "all").sort(), counts }, "Categories retrieved successfully.");
  }
  if (p === "/api/products/price-range") { const pr = PRODUCTS.map((x) => x.price); return ok({ min: Math.floor(Math.min(...pr)), max: Math.ceil(Math.max(...pr)) }, "Price range retrieved successfully."); }
  if (p === "/api/products/suggestions") {
    const q = str(url.searchParams.get("q")).toLowerCase(), sm = await stockMap(env);
    if (!q) return ok({ products: [], categories: [] }, "Search suggestions retrieved successfully.");
    const prods = PRODUCTS.filter((x) => x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q)).slice(0, 5).map((x) => ({ id: x.id, name: x.name, price: x.price, image_url: x.image_url, category: x.category, stock: stockOf(x, sm) }));
    return ok({ products: prods, categories: [...new Set(PRODUCTS.map((x) => x.category))].filter((c) => c.toLowerCase().includes(q)).slice(0, 3) }, "Search suggestions retrieved successfully.");
  }
  let mt = p.match(/^\/api\/products\/(\d+)$/);
  if (mt && m === "GET") {
    const x = PRODUCTS.find((q) => q.id === +mt[1]);
    return x ? ok({ product: withStock(x, await stockMap(env)) }, "Product details retrieved successfully.") : fail(404, "PRODUCT_NOT_FOUND", `Product with ID ${mt[1]} was not found.`);
  }
  if (p.startsWith("/api/products") && m !== "GET") return fail(403, "FORBIDDEN", "The product catalog is read-only on this deployment.");

  // ---- auth
  if (p === "/api/auth/register" && m === "POST") {
    const b = await readJson(req), name = str(b.name), email = str(b.email).toLowerCase(), pw = typeof b.password === "string" ? b.password : "";
    if (!name) return fail(400, "INVALID_INPUT", "Name is required");
    if (!email.includes("@") || email.length > 200) return fail(400, "INVALID_INPUT", "Valid email is required");
    if (pw.length < 6 || pw.length > 200) return fail(400, "INVALID_INPUT", "Password must be at least 6 characters");
    if (await env.STORE.get("u:" + email)) return fail(409, "EMAIL_EXISTS", "An account with this email already exists.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const u = { id: Date.now() * 1000 + Math.floor(Math.random() * 1000), name: name.slice(0, 100), email, phone: null, salt: b64(salt), hash: await pbkdf2(pw, salt), created_at: new Date().toISOString(), addresses: [] };
    await putUser(env, u); await env.STORE.put("uid:" + u.id, email);
    const t = await makeToken(env, u.id);
    return ok({ user: pub(u), token: t }, "Registration successful.", 201, { "set-cookie": cookie(t, 604800) });
  }
  if (p === "/api/auth/login" && m === "POST") {
    const b = await readJson(req), email = str(b.email).toLowerCase(), pw = typeof b.password === "string" ? b.password : "";
    const bad = fail(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    if (!email || !pw) return bad;
    const u = await env.STORE.get("u:" + email, "json");
    if (!u || (await pbkdf2(pw, unb64(u.salt))) !== u.hash) return bad;
    const t = await makeToken(env, u.id);
    return ok({ user: pub(u), token: t }, "Login successful.", 200, { "set-cookie": cookie(t, 604800) });
  }
  if (p === "/api/auth/logout" && m === "POST") return ok(undefined, "Logged out successfully.", 200, { "set-cookie": cookie("", 0) });

  // ---- gemini concierge (needs no auth)
  if (p === "/api/gemini/concierge" && m === "POST") {
    const b = await readJson(req);
    if (!Array.isArray(b.messages)) return fail(400, "INVALID_INPUT", "messages parameter is required and must be an array.");
    if (!env.GEMINI_API_KEY) return fail(503, "GEMINI_NOT_CONFIGURED", "مساعد فخامة الذكي غير متاح حالياً لأن مفتاح الربط للـ API غير مهيأ في الإعدادات.");
    const ip = req.headers.get("CF-Connecting-IP") || "?", rk = "rl:" + ip + ":" + Math.floor(Date.now() / 3600000);
    const used = (globalThis.__rl = globalThis.__rl || new Map()); const n = (used.get(rk) || 0) + 1; used.set(rk, n);
    if (n > 30) return fail(429, "RATE_LIMITED", "تم الوصول للحد المسموح من الرسائل حالياً. حاول مرة أخرى لاحقاً.");
    const stock = await stockMap(env);
    const ctx = PRODUCTS.map((x) => `- الاسم: ${x.name}\n  القسم: ${x.category}\n  الوصف: ${x.description}\n  السعر: ${x.price}\n  الرابط: /products/${x.id}\n  المخزون: ${stockOf(x, stock)} قطع`).join("\n\n");
    const sys = `أنت "مساعد فخامة الملكي الذكي" مستشار التسوق في متجر "فخامة". تتحدث بالعربية الفصحى الراقية واللبقة.
الشحن مجاني للطلبات فوق 500، ضمان سنتين، استرجاع خلال 14 يوماً، تغليف هدايا مجاني.
اسم العميل: ${str(b.userName) || "ضيفنا الكريم"}
استخدم قائمة المنتجات التالية حصراً ولا تخترع منتجات. اذكر المنتج بصيغة [اسم المنتج](/products/رقم).
${ctx}`;
    const contents = b.messages.slice(-12).map((x) => ({ role: x.role === "assistant" ? "model" : "user", parts: [{ text: String(x.content || "").slice(0, 2000) }] }));
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + (env.GEMINI_MODEL || "gemini-2.5-flash") + ":generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: { temperature: 0.7 } }) });
    if (!r.ok) return fail(502, "AI_ERROR", "تعذر الحصول على رد من المساعد حالياً.");
    const d = await r.json(), reply = (d.candidates && d.candidates[0] && d.candidates[0].content.parts.map((x) => x.text || "").join("")) || "";
    return ok({ reply });
  }

  // ---- authenticated routes
  const uid = await readToken(env, req);
  const need = async () => (uid ? await getUser(env, uid) : null);

  if (p === "/api/auth/me" && m === "GET") { const u = await need(); return u ? ok({ user: pub(u) }) : fail(401, "UNAUTHORIZED", "Not authenticated."); }

  if (p.startsWith("/api/account")) {
    const u = await need(); if (!u) return fail(401, "UNAUTHORIZED", "Authentication required. Please log in to continue.");
    if (p === "/api/account" && m === "GET") return ok({ user: pub(u) });
    if (p === "/api/account" && m === "PATCH") {
      const b = await readJson(req), name = str(b.name); if (!name) return fail(400, "INVALID_INPUT", "Name is required");
      u.name = name.slice(0, 100); u.phone = str(b.phone).slice(0, 30) || null; await putUser(env, u); return ok({ user: pub(u) }, "Profile updated successfully");
    }
    if (p === "/api/account/password" && m === "PATCH") {
      const b = await readJson(req); if (typeof b.newPassword !== "string" || b.newPassword.length < 6) return fail(400, "INVALID_INPUT", "New password must be at least 6 characters");
      if ((await pbkdf2(String(b.currentPassword || ""), unb64(u.salt))) !== u.hash) return fail(401, "INVALID_CREDENTIALS", "Incorrect current password");
      const salt = crypto.getRandomValues(new Uint8Array(16)); u.salt = b64(salt); u.hash = await pbkdf2(b.newPassword, salt); await putUser(env, u);
      return ok(undefined, "Password updated successfully. Please log in again.", 200, { "set-cookie": cookie("", 0) });
    }
    u.addresses = u.addresses || [];
    const sortA = () => u.addresses.slice().sort((a, b) => b.is_default - a.is_default || b.id - a.id).map((a) => ({ ...a, user_id: u.id }));
    if (p === "/api/account/addresses" && m === "GET") return ok({ addresses: sortA() });
    if (p === "/api/account/addresses" && m === "POST") {
      const b = await readJson(req);
      if (!b.recipient_name || !b.phone || !b.address_line1 || !b.city || !b.postal_code || !b.country) return fail(400, "INVALID_INPUT", "Required fields missing");
      if (u.addresses.length >= 20) return fail(400, "LIMIT", "Address limit reached");
      if (b.is_default) u.addresses.forEach((a) => (a.is_default = 0));
      u.addresses.push({ id: Date.now(), label: str(b.label) || "Home", recipient_name: str(b.recipient_name), phone: str(b.phone), address_line1: str(b.address_line1), address_line2: str(b.address_line2) || null, city: str(b.city), state: str(b.state) || null, postal_code: str(b.postal_code), country: str(b.country), is_default: b.is_default ? 1 : 0 });
      await putUser(env, u); return ok(undefined, "Address added successfully", 201);
    }
    const am = p.match(/^\/api\/account\/addresses\/(\d+)(\/default)?$/);
    if (am) {
      const a = u.addresses.find((x) => x.id === +am[1]); if (!a) return fail(404, "NOT_FOUND", "Address not found");
      if (am[2] && m === "POST") { u.addresses.forEach((x) => (x.is_default = 0)); a.is_default = 1; await putUser(env, u); return ok(undefined, "Default address updated"); }
      if (m === "PATCH") {
        const b = await readJson(req); if (b.is_default) u.addresses.forEach((x) => (x.is_default = 0));
        for (const k of ["label", "recipient_name", "phone", "address_line1", "address_line2", "city", "state", "postal_code", "country"]) if (b[k] !== undefined) a[k] = str(b[k]) || null;
        if (b.is_default) a.is_default = 1; await putUser(env, u); return ok(undefined, "Address updated successfully");
      }
      if (m === "DELETE") { u.addresses = u.addresses.filter((x) => x.id !== a.id); await putUser(env, u); return ok(undefined, "Address deleted successfully"); }
    }
    return fail(404, "NOT_FOUND", "Route not found.");
  }

  if (p.startsWith("/api/orders")) {
    if (p === "/api/orders/all") return fail(403, "FORBIDDEN", "Admin access required.");
    const mid = p.match(/^\/api\/orders\/(\d+)(\/status)?$/);
    if (mid && mid[2] && m === "PUT") {
      // Owner may cancel their own order; everything else is admin-only.
      const u = await need(); if (!u) return fail(401, "UNAUTHORIZED", "Authentication required.");
      const b = await readJson(req), list = (await env.STORE.get("o:" + u.id, "json")) || [], o = list.find((x) => x.id === +mid[1]);
      if (!o) return fail(404, "ORDER_NOT_FOUND", "Order not found.");
      if (b.status !== "cancelled" || o.status !== "completed" && o.status !== "pending") return fail(403, "FORBIDDEN", "Only cancelling your own open order is allowed.");
      o.status = "cancelled";
      const sm = await stockMap(env); o.items.forEach((i) => { const pr = PRODUCTS.find((x) => x.id === i.productId); if (pr) sm[pr.id] = stockOf(pr, sm) + i.quantity; });
      await env.STORE.put("stock", JSON.stringify(sm)); await env.STORE.put("o:" + u.id, JSON.stringify(list));
      return ok({ order: formatOrder(o) }, "Order updated.");
    }
    const u = await need(); if (!u) return fail(401, "UNAUTHORIZED", "Authentication required. Please log in to continue.");
    const list = (await env.STORE.get("o:" + u.id, "json")) || [];
    if (p === "/api/orders" && m === "GET") { const orders = list.slice().reverse().map(formatOrder); return ok({ orders, total: orders.length }, "Orders retrieved successfully."); }
    if (mid && !mid[2] && m === "GET") { const o = list.find((x) => x.id === +mid[1]); return o ? ok({ order: formatOrder(o) }) : fail(404, "ORDER_NOT_FOUND", "Order not found."); }
    if (p === "/api/orders" && m === "POST") {
      const b = await readJson(req), items = b.items;
      if (!Array.isArray(items) || !items.length) return fail(400, "EMPTY_CART", "Order must contain at least one item.");
      if (items.length > 50) return fail(400, "VALIDATION_ERROR", "Order cannot contain more than 50 distinct items.");
      const raw = b.customer || b.shippingAddress || {}, sa = b.shippingAddress || {};
      const cust = { name: str(raw.name || raw.recipient_name || sa.recipient_name || sa.name || u.name), email: str(raw.email || sa.email || u.email).toLowerCase(),
        address: str(raw.address || [raw.address_line1, raw.address_line2].filter(Boolean).join(", ") || [sa.address_line1, sa.address_line2].filter(Boolean).join(", ") || sa.address),
        city: str(raw.city || sa.city), postalCode: str(raw.postalCode || raw.postal_code || sa.postal_code || sa.postalCode), phone: str(raw.phone || sa.phone || u.phone) };
      const need2 = { name: "Customer name", address: "Shipping address", city: "City", postalCode: "Postal code", phone: "Phone number" };
      for (const k in need2) if (!cust[k]) return fail(400, "VALIDATION_ERROR", need2[k] + " is required.");
      if (!cust.email.includes("@")) return fail(400, "VALIDATION_ERROR", "A valid customer email is required.");
      const sm = await stockMap(env), seen = new Set(), lines = []; let total = 0;
      for (let i = 0; i < items.length; i++) {
        const it = items[i] || {};
        if (!Number.isInteger(it.productId) || it.productId <= 0) return fail(400, "VALIDATION_ERROR", `Item at index ${i} has an invalid productId. Must be a positive integer.`);
        if (!Number.isInteger(it.quantity) || it.quantity <= 0 || it.quantity > 99) return fail(400, "VALIDATION_ERROR", `Item at index ${i} has an invalid quantity.`);
        if (seen.has(it.productId)) return fail(400, "VALIDATION_ERROR", `Duplicate productId ${it.productId} in order.`);
        seen.add(it.productId);
        const pr = PRODUCTS.find((x) => x.id === it.productId);
        if (!pr) return fail(404, "PRODUCT_NOT_FOUND", `Product with ID ${it.productId} not found.`);
        if (stockOf(pr, sm) < it.quantity) return fail(409, "INSUFFICIENT_STOCK", `Insufficient stock for ${pr.name}. Only ${stockOf(pr, sm)} left.`);
        lines.push({ productId: pr.id, name: pr.name, imageUrl: pr.image_url, quantity: it.quantity, price: pr.price }); total += pr.price * it.quantity;
      }
      lines.forEach((l) => (sm[l.productId] = stockOf(PRODUCTS.find((x) => x.id === l.productId), sm) - l.quantity));
      const meta = (await env.STORE.get("meta", "json")) || { order: 1000 }; meta.order += 1;
      const o = { id: meta.order, userId: u.id, total: +total.toFixed(2), status: "completed", customer: cust, items: lines, createdAt: new Date().toISOString() };
      list.push(o);
      await Promise.all([env.STORE.put("stock", JSON.stringify(sm)), env.STORE.put("meta", JSON.stringify(meta)), env.STORE.put("o:" + u.id, JSON.stringify(list.slice(-100)))]);
      return ok({ order: formatOrder(o) }, "Order created successfully.", 201);
    }
    return fail(404, "NOT_FOUND", "Route not found.");
  }
  return fail(404, "NOT_FOUND", "Route not found.");
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    try { return await handle(req, env, url); } catch (e) { return fail(500, "INTERNAL_ERROR", "Something went wrong."); }
  },
};
