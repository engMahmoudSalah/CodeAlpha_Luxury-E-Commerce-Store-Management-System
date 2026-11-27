// Fakhama storefront API on Cloudflare Workers + KV. Same JSON contract as the Express server in /server.
// Products are a read-only catalog (bundled); users, orders, addresses and stock live in KV.
import { DurableObject } from "cloudflare:workers";
const PRODUCTS = [{"id":1,"name":"AeroPulse Wireless Noise-Canceling Headphones","description":"Premium over-ear wireless headphones featuring active hybrid noise cancellation, 40-hour battery life, and crystal-clear high-fidelity sound.","price":199.99,"image_url":"/art/p1.svg","stock":25,"category":"Audio","created_at":"2026-01-01T00:00:00.000Z"},{"id":2,"name":"Apex Pro Mechanical Gaming Keyboard","description":"Ultra-responsive RGB mechanical keyboard with custom linear switches, aircraft-grade aluminum frame, and magnetic wrist rest.","price":129.99,"image_url":"/art/p2.svg","stock":18,"category":"Gaming","created_at":"2026-01-01T01:00:00.000Z"},{"id":3,"name":"Quantum Precision Wireless Gaming Mouse","description":"Ergonomic 26,000 DPI optical sensor mouse with ultra-low latency 2.4GHz wireless connection and 8 programmable buttons.","price":79.99,"image_url":"/art/p3.svg","stock":30,"category":"Gaming","created_at":"2026-01-01T02:00:00.000Z"},{"id":4,"name":"Vanguard 4K Ultra-HD Monitor 27-inch","description":"IPS professional creative and productivity display with 99% sRGB color gamut, HDR400, USB-C 90W power delivery, and ultra-thin bezels.","price":349.99,"image_url":"/art/p4.svg","stock":12,"category":"Electronics","created_at":"2026-01-01T03:00:00.000Z"},{"id":5,"name":"Lumina Smart Ambient Desk Lamp","description":"Minimalist aluminum LED desk lamp with touch dimming, adjustable color temperature (2700K-6500K), and integrated Qi wireless charging pad.","price":59.99,"image_url":"/art/p5.svg","stock":40,"category":"Home & Office","created_at":"2026-01-01T04:00:00.000Z"},{"id":6,"name":"Horizon Fit Smartwatch Series 5","description":"All-day health & fitness companion with AMOLED always-on display, heart rate & SpO2 tracking, GPS, and 7-day battery life.","price":149.99,"image_url":"/art/p6.svg","stock":22,"category":"Wearables","created_at":"2026-01-01T05:00:00.000Z"},{"id":7,"name":"Nomad Rugged 20,000mAh Power Bank","description":"Heavy-duty portable fast charger with 65W USB-C Power Delivery, dual outputs, and aircraft-grade shock-resistant casing.","price":49.99,"image_url":"/art/p7.svg","stock":50,"category":"Accessories","created_at":"2026-01-01T06:00:00.000Z"},{"id":8,"name":"StudioWave Hi-Res USB-C Microphone","description":"Studio-grade cardioid condenser microphone with built-in pop filter, zero-latency headphone monitoring, and plug-and-play simplicity.","price":89.99,"image_url":"/art/p8.svg","stock":15,"category":"Audio","created_at":"2026-01-01T07:00:00.000Z"},{"id":9,"name":"ErgoComfort Memory Foam Seat Cushion","description":"Orthopedic memory foam seat cushion designed for ergonomic lumbar support, posture alignment, and pressure relief during long work sessions.","price":34.99,"image_url":"/art/p9.svg","stock":35,"category":"Home & Office","created_at":"2026-01-01T08:00:00.000Z"},{"id":10,"name":"SoundSphere Portable Bluetooth Speaker","description":"360-degree immersive audio with deep bass, IPX7 waterproof rating, 24-hour playtime, and true wireless stereo pairing.","price":69.99,"image_url":"/art/p10.svg","stock":28,"category":"Audio","created_at":"2026-01-01T09:00:00.000Z"},{"id":11,"name":"Executive Vegan Leather Laptop Sleeve 14-16\"","description":"Slim water-resistant carrying case with magnetic closure, soft microfiber interior lining, and dedicated accessory pocket.","price":39.99,"image_url":"/art/p11.svg","stock":45,"category":"Accessories","created_at":"2026-01-01T10:00:00.000Z"},{"id":12,"name":"AeroStream High-Speed WiFi 6 Router","description":"Dual-band AX3000 wireless gigabit router with beamforming technology, WPA3 security, and seamless coverage up to 2,500 sq ft.","price":119.99,"image_url":"/art/p12.svg","stock":14,"category":"Electronics","created_at":"2026-01-01T11:00:00.000Z"},{"id":13,"name":"Titan Curved Ultrawide OLED Gaming Monitor 49-inch","description":"Quantum Dot OLED 240Hz 0.03ms gaming display with 5120x1440 resolution, dual QHD immersion, and HDR True Black 400.","price":899.99,"image_url":"/art/p13.svg","stock":8,"category":"Electronics","created_at":"2026-01-01T12:00:00.000Z"},{"id":14,"name":"SonicPro Studio Monitor Headphones","description":"Flat-response studio reference headphones engineered for professional mixing, mastering, and critical acoustic listening.","price":249.99,"image_url":"/art/p14.svg","stock":16,"category":"Audio","created_at":"2026-01-01T13:00:00.000Z"},{"id":15,"name":"PulseFit GPS Fitness Tracker Band","description":"Ultra-lightweight activity tracker with built-in GPS, multi-sport analytics, continuous SpO2 monitoring, and 10-day battery capacity.","price":89.99,"image_url":"/art/p15.svg","stock":32,"category":"Wearables","created_at":"2026-01-01T14:00:00.000Z"},{"id":16,"name":"PrismRGB Desktop Cable Management Station","description":"Weighted magnetic cable routing organizer with subtle ambient ARGB underglow and silicone cable channels.","price":29.99,"image_url":"/art/p16.svg","stock":60,"category":"Accessories","created_at":"2026-01-01T15:00:00.000Z"},{"id":17,"name":"NovaLite Portable LED Video Light","description":"Full-spectrum Bi-Color LED video panel with 2500K-8500K adjustable CRI 97+ output and integrated OLED control panel.","price":44.99,"image_url":"/art/p17.svg","stock":25,"category":"Photography","created_at":"2026-01-01T16:00:00.000Z"},{"id":18,"name":"ZenDesk Bamboo Ergonomic Riser","description":"Sustainably sourced solid bamboo desk riser with dual storage drawers and cable pass-through channels.","price":54.99,"image_url":"/art/p18.svg","stock":20,"category":"Home & Office","created_at":"2026-01-01T17:00:00.000Z"},{"id":19,"name":"CyberDeck Modular Mechanical Numpad","description":"Hot-swappable wireless numeric keypad with programmable rotary knob and anodized aluminum chassis.","price":49.99,"image_url":"/art/p19.svg","stock":28,"category":"Gaming","created_at":"2026-01-01T18:00:00.000Z"},{"id":20,"name":"ApexStream 4K Ultra Webcam with Dual Mics","description":"Pro streaming webcam with Sony STARVIS sensor, auto-framing AI focus, HDR video encoding, and dual stereo mics.","price":109.99,"image_url":"/art/p20.svg","stock":19,"category":"Electronics","created_at":"2026-01-01T19:00:00.000Z"},{"id":21,"name":"AuraGlow Smart LED Light Strip 10m","description":"Addressable RGBIC LED light strip with Music Sync, Apple HomeKit & Google Assistant integration, and fluid transitions.","price":39.99,"image_url":"/art/p21.svg","stock":45,"category":"Smart Home","created_at":"2026-01-01T20:00:00.000Z"},{"id":22,"name":"Velocity Fast Magnetic Wireless Charger","description":"15W MagSafe compatible wireless charging pad with braided nylon cable and slim aircraft-grade aluminum casing.","price":34.99,"image_url":"/art/p22.svg","stock":55,"category":"Accessories","created_at":"2026-01-01T21:00:00.000Z"},{"id":23,"name":"HyperCool Dual-Fan Laptop Cooling Pad","description":"Quiet dual 140mm fan cooling stand with adjustable tilt angles and dual USB pass-through ports.","price":39.99,"image_url":"/art/p23.svg","stock":30,"category":"Accessories","created_at":"2026-01-01T22:00:00.000Z"},{"id":24,"name":"AcousticBass Active Subwoofer System","description":"Compact 8-inch powered studio subwoofer delivering punchy 100W RMS low-frequency extension down to 30Hz.","price":179.99,"image_url":"/art/p24.svg","stock":12,"category":"Audio","created_at":"2026-01-01T23:00:00.000Z"},{"id":25,"name":"ProFrame Digital Canvas Photo Frame 15-inch","description":"1080p IPS Wi-Fi digital picture frame with matte anti-glare glass and instant smartphone photo synchronization.","price":199.99,"image_url":"/art/p25.svg","stock":14,"category":"Smart Home","created_at":"2026-01-02T00:00:00.000Z"},{"id":26,"name":"OmniGrip Custom Gaming Controller Wireless","description":"Pro controller with hall-effect anti-drift joysticks, remappable rear paddles, and adjustable trigger locks.","price":69.99,"image_url":"/art/p26.svg","stock":26,"category":"Gaming","created_at":"2026-01-02T01:00:00.000Z"},{"id":27,"name":"CleanAir Desktop HEPA Air Purifier","description":"True HEPA H13 filtration air purifier removing 99.97% of airborne dust, pollen, and odor with whisper-quiet sleep mode.","price":89.99,"image_url":"/art/p27.svg","stock":22,"category":"Home & Office","created_at":"2026-01-02T02:00:00.000Z"},{"id":28,"name":"Vantage Mirrorless Camera Shoulder Bag","description":"Weatherproof canvas camera bag with customizable padded dividers and rapid side access zipper.","price":74.99,"image_url":"/art/p28.svg","stock":18,"category":"Photography","created_at":"2026-01-02T03:00:00.000Z"},{"id":29,"name":"FocusBar Ultra Monitor Screenbar Lamp","description":"Asymmetric optical desktop light bar designed to eliminate screen glare and reduce eye strain.","price":64.99,"image_url":"/art/p29.svg","stock":35,"category":"Home & Office","created_at":"2026-01-02T04:00:00.000Z"},{"id":30,"name":"ElectroPod TWS Earbuds with Wireless Charging","description":"True wireless ANC earbuds with spatial audio, environmental noise reduction, and IPX5 splash resistance.","price":119.99,"image_url":"/art/p30.svg","stock":40,"category":"Audio","created_at":"2026-01-02T05:00:00.000Z"},{"id":31,"name":"PowerGrid 100W GaN 4-Port Fast Desktop Charger","description":"Ultra-compact Gallium Nitride charger supporting 100W USB-C Power Delivery for laptops, tablets, and phones simultaneously.","price":59.99,"image_url":"/art/p31.svg","stock":50,"category":"Accessories","created_at":"2026-01-02T06:00:00.000Z"},{"id":32,"name":"Matrix3D Precision Gaming Mousepad XL","description":"Micro-woven cloth desk pad with anti-fray stitched edges and high-grip rubber backing.","price":24.99,"image_url":"/art/p32.svg","stock":75,"category":"Gaming","created_at":"2026-01-02T07:00:00.000Z"},{"id":33,"name":"SmartSync Wi-Fi Smart Plug Trio Pack","description":"Set of 3 smart plugs with energy monitoring, scheduling timer, and voice control via Alexa & Google Home.","price":29.99,"image_url":"/art/p33.svg","stock":40,"category":"Smart Home","created_at":"2026-01-02T08:00:00.000Z"},{"id":34,"name":"Horizon Glass Smart Scales with Body Mass Telemetry","description":"Bluetooth bio-impedance smart weight scale tracking body fat %, muscle mass, hydration, and BMI trends.","price":49.99,"image_url":"/art/p34.svg","stock":28,"category":"Wearables","created_at":"2026-01-02T09:00:00.000Z"},{"id":35,"name":"TerraTouch Felt Desk Mat & Mouse Pad","description":"Natural merino wool blend felt desk surface providing thermal warmth and smooth mouse tracking.","price":29.99,"image_url":"/art/p35.svg","stock":35,"category":"Home & Office","created_at":"2026-01-02T10:00:00.000Z"},{"id":36,"name":"CinemaSound 5.1 Wireless Soundbar System","description":"Dolby Atmos spatial soundbar with wireless rear speakers and 10-inch down-firing wireless subwoofer.","price":329.99,"image_url":"/art/p36.svg","stock":10,"category":"Audio","created_at":"2026-01-02T11:00:00.000Z"},{"id":37,"name":"VisionCam 360 Indoor Security Camera","description":"Pan-and-tilt 2K smart indoor security camera with AI motion tracking, night vision, and two-way audio.","price":59.99,"image_url":"/art/p37.svg","stock":30,"category":"Smart Home","created_at":"2026-01-02T12:00:00.000Z"},{"id":38,"name":"CarbonShield Waterproof Hard-Shell Backpack","description":"Impact-resistant hardshell travel backpack with TSA combination lock and anti-theft hidden pockets.","price":89.99,"image_url":"/art/p38.svg","stock":20,"category":"Accessories","created_at":"2026-01-02T13:00:00.000Z"},{"id":39,"name":"PrecisionPro Aluminum Camera Tripod","description":"Lightweight travel tripod with 360-degree panoramic ball head, quick-release plate, and inverted macro setup.","price":129.99,"image_url":"/art/p39.svg","stock":15,"category":"Photography","created_at":"2026-01-02T14:00:00.000Z"},{"id":40,"name":"FlightDeck HOTAS Flight Simulator Joystick","description":"Dual-throttle and flight stick combo with 30 programmable buttons for space and aerial combat simulation.","price":159.99,"image_url":"/art/p40.svg","stock":12,"category":"Gaming","created_at":"2026-01-02T15:00:00.000Z"},{"id":41,"name":"SolarPulse Emergency Solar Battery Bank 30,000mAh","description":"Rugged outdoor power station with built-in solar panels, 400 lumen LED flashlight, and IP66 water resistance.","price":69.99,"image_url":"/art/p41.svg","stock":25,"category":"Accessories","created_at":"2026-01-02T16:00:00.000Z"},{"id":42,"name":"LuxePro Carbon Fiber Studio Headphones","description":"Ultra-lightweight open-back reference studio headphones featuring custom 50mm beryllium drivers, real carbon fiber earcups, and detachable oxygen-free copper cabling.","price":299.99,"image_url":"/art/p42.svg","stock":18,"category":"Audio","created_at":"2026-01-02T17:00:00.000Z"},{"id":43,"name":"CyberKey Hardware Security Token Duo","description":"FIDO2 / U2F certified hardware authentication keys for encrypted multi-factor account protection.","price":49.99,"image_url":"/art/p43.svg","stock":50,"category":"Electronics","created_at":"2026-01-02T18:00:00.000Z"},{"id":44,"name":"StreamDock Programmable Control Pad 15-Key","description":"15 customizable LCD keys for triggering live scenes, launching media, and controlling studio gear instantly.","price":139.99,"image_url":"/art/p44.svg","stock":22,"category":"Gaming","created_at":"2026-01-02T19:00:00.000Z"},{"id":45,"name":"ThermoSip Smart Temperature Control Travel Mug","description":"App-controlled heated travel mug keeping drinks at your preferred temperature (120\u00b0F - 145\u00b0F) for up to 3 hours.","price":99.99,"image_url":"/art/p45.svg","stock":20,"category":"Home & Office","created_at":"2026-01-02T20:00:00.000Z"},{"id":46,"name":"NanoBeams Modular Smart Wall Light Panels 9-Pack","description":"Interlocking geometric RGBIC light bars creating customized dynamic wall lighting layouts.","price":179.99,"image_url":"/art/p46.svg","stock":15,"category":"Smart Home","created_at":"2026-01-02T21:00:00.000Z"},{"id":47,"name":"AeroRing Minimalist Titanium Health Tracker Ring","description":"Sleek grade-5 titanium smart ring tracking sleep stages, body temperature variations, heart rate, and recovery score.","price":199.99,"image_url":"/art/p47.svg","stock":14,"category":"Wearables","created_at":"2026-01-02T22:00:00.000Z"},{"id":48,"name":"UltraDrive 2TB Rugged External NVMe SSD","description":"Ultra-fast 2050MB/s USB 3.2 Gen 2x2 portable solid-state drive with IP65 dust/water protection.","price":189.99,"image_url":"/art/p48.svg","stock":30,"category":"Electronics","created_at":"2026-01-02T23:00:00.000Z"},{"id":49,"name":"SoundBar Pro Cinematic Surround Speaker","description":"High-power 2.1 acoustic channel soundbar with HDMI eARC connection and optical digital input.","price":149.99,"image_url":"/art/p49.svg","stock":25,"category":"Audio","created_at":"2026-01-03T00:00:00.000Z"},{"id":50,"name":"Apex Desk Mat Precision Stitch Edition","description":"Water-repellent micro-weave desk pad with reinforced edge stitching and non-slip natural rubber base.","price":34.99,"image_url":"/art/p50.svg","stock":40,"category":"Home & Office","created_at":"2026-01-03T01:00:00.000Z"}];
const enc = new TextEncoder();
// ---- Transactional store: one SQLite-backed Durable Object. It is single-threaded and the order/cancel
// paths run inside transactionSync, so stock, orders and idempotency records change together or not at all.
export class Shop extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.sql = ctx.storage.sql;
    if (ctx.storage.kv.get("schema_v") !== "2") {
      this.sql.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS stock(product_id INTEGER PRIMARY KEY, qty INTEGER NOT NULL CHECK(qty >= 0));
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, idem TEXT, status TEXT NOT NULL, data TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS orders_idem ON orders(user_id, idem) WHERE idem IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id);`);
      ctx.storage.kv.put("schema_v", "2");
    }
  }
  one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  async getStock() { if (!this._stock) { const m = {}; for (const r of this.sql.exec("SELECT product_id, qty FROM stock")) m[r.product_id] = r.qty; this._stock = m; } return { ...this._stock }; }
  async createUser(u) {
    if (this.one("SELECT 1 AS x FROM users WHERE email = ?", u.email)) return false;
    this.sql.exec("INSERT INTO users(id, email, data) VALUES(?, ?, ?)", u.id, u.email, JSON.stringify(u)); return true;
  }
  async getUserByEmail(email) { const r = this.one("SELECT data FROM users WHERE email = ?", email); return r ? JSON.parse(r.data) : null; }
  async getUserById(id) { const r = this.one("SELECT data FROM users WHERE id = ?", id); return r ? JSON.parse(r.data) : null; }
  async saveUser(u) { this.sql.exec("UPDATE users SET data = ? WHERE id = ?", JSON.stringify(u), u.id); }
  async createOrder(uid, cust, items, idem) {
    return this.ctx.storage.transactionSync(() => {
      if (idem) { const e = this.one("SELECT data FROM orders WHERE user_id = ? AND idem = ?", uid, idem); if (e) return { order: JSON.parse(e.data), replay: true }; }
      const lines = []; let total = 0; const cur = {};
      for (const it of items) {
        const pr = PRODUCTS.find((x) => x.id === it.productId);
        if (!pr) return { error: "PRODUCT_NOT_FOUND", message: `Product with ID ${it.productId} not found.` };
        const row = this.one("SELECT qty FROM stock WHERE product_id = ?", pr.id), have = row ? row.qty : pr.stock;
        if (have < it.quantity) return { error: "INSUFFICIENT_STOCK", message: `Insufficient stock for ${pr.name}. Only ${have} left.` };
        cur[pr.id] = have; lines.push({ productId: pr.id, name: pr.name, imageUrl: pr.image_url, quantity: it.quantity, price: pr.price }); total += pr.price * it.quantity;
      }
      for (const l of lines) this.sql.exec("INSERT INTO stock(product_id, qty) VALUES(?, ?) ON CONFLICT(product_id) DO UPDATE SET qty = excluded.qty", l.productId, cur[l.productId] - l.quantity); this._stock = null;
      const mx = this.one("SELECT MAX(id) AS m FROM orders"), id = Math.max(1000, mx && mx.m ? mx.m : 0) + 1;
      const o = { id, userId: uid, total: +total.toFixed(2), status: "pending", customer: cust, items: lines, createdAt: new Date().toISOString() };
      this.sql.exec("INSERT INTO orders(id, user_id, idem, status, data) VALUES(?, ?, ?, ?, ?)", id, uid, idem || null, o.status, JSON.stringify(o));
      return { order: o };
    });
  }
  async listOrders(uid) { return [...this.sql.exec("SELECT data FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 100", uid)].map((r) => JSON.parse(r.data)); }
  async getOrder(uid, id) { const r = this.one("SELECT data FROM orders WHERE user_id = ? AND id = ?", uid, id); return r ? JSON.parse(r.data) : null; }
  async cancelOrder(uid, id) {
    return this.ctx.storage.transactionSync(() => {
      const r = this.one("SELECT data, status FROM orders WHERE user_id = ? AND id = ?", uid, id);
      if (!r) return { error: "ORDER_NOT_FOUND" };
      const o = JSON.parse(r.data);
      if (r.status === "cancelled") return { order: o, already: true }; // idempotent: stock is restored exactly once
      if (r.status !== "completed" && r.status !== "pending") return { error: "FORBIDDEN" };
      for (const i of o.items) {
        const pr = PRODUCTS.find((x) => x.id === i.productId); if (!pr) continue;
        const row = this.one("SELECT qty FROM stock WHERE product_id = ?", pr.id), have = row ? row.qty : pr.stock;
        this.sql.exec("INSERT INTO stock(product_id, qty) VALUES(?, ?) ON CONFLICT(product_id) DO UPDATE SET qty = excluded.qty", pr.id, have + i.quantity); this._stock = null;
      }
      o.status = "cancelled";
      this.sql.exec("UPDATE orders SET status = 'cancelled', data = ? WHERE id = ?", JSON.stringify(o), id);
      return { order: o };
    });
  }
}
const shop = (env) => env.SHOP.get(env.SHOP.idFromName("main"));

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
const getUser = (env, id) => shop(env).getUserById(id);
const putUser = (env, u) => shop(env).saveUser(u);

async function stockMap(env) { return shop(env).getStock(); }
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
    if (await limited(req, "reg", 6, 6e5)) return fail(429, "RATE_LIMITED", "Too many attempts. Please wait a few minutes.");
    const b = await readJson(req), name = str(b.name), email = str(b.email).toLowerCase(), pw = typeof b.password === "string" ? b.password : "";
    if (!name) return fail(400, "INVALID_INPUT", "Name is required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return fail(400, "INVALID_INPUT", "Valid email is required");
    if (pw.length < 6 || pw.length > 200) return fail(400, "INVALID_INPUT", "Password must be at least 6 characters");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const u = { id: Date.now() * 1000 + Math.floor(Math.random() * 1000), name: name.slice(0, 100), email, phone: null, salt: b64(salt), hash: await pbkdf2(pw, salt), created_at: new Date().toISOString(), addresses: [] };
    if (!(await shop(env).createUser(u))) return fail(409, "EMAIL_EXISTS", "An account with this email already exists.");
    const t = await makeToken(env, u.id);
    return ok({ user: pub(u), token: t }, "Registration successful.", 201, { "set-cookie": cookie(t, 604800) });
  }
  if (p === "/api/auth/login" && m === "POST") {
    if (await limited(req, "login", 12, 6e5)) return fail(429, "RATE_LIMITED", "Too many attempts. Please wait a few minutes.");
    const b = await readJson(req), email = str(b.email).toLowerCase(), pw = typeof b.password === "string" ? b.password : "";
    const bad = fail(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    if (!email || !pw) return bad;
    const u = await shop(env).getUserByEmail(email);
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
    if (p === "/api/account/export" && m === "GET") {
      if (await limited(req, "exp", 5, 36e5)) return fail(429, "RATE_LIMITED", "Too many exports. Please try again later.");
      const orders = (await shop(env).listOrders(u.id)).map(formatOrder);
      return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), user: pub(u), addresses: sortA(), orders }, null, 2), { headers: { ...H, "content-disposition": 'attachment; filename="fakhama-my-data.json"' } });
    }
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
      const b = await readJson(req);
      if (b.status !== "cancelled") return fail(403, "FORBIDDEN", "Only cancelling your own open order is allowed.");
      const r = await shop(env).cancelOrder(u.id, +mid[1]);
      if (r.error === "ORDER_NOT_FOUND") return fail(404, "ORDER_NOT_FOUND", "Order not found.");
      if (r.error) return fail(403, "FORBIDDEN", "Only cancelling your own open order is allowed.");
      return ok({ order: formatOrder(r.order) }, "Order updated.");
    }
    const u = await need(); if (!u) return fail(401, "UNAUTHORIZED", "Authentication required. Please log in to continue.");
    if (p === "/api/orders" && m === "GET") { const orders = (await shop(env).listOrders(u.id)).map(formatOrder); return ok({ orders, total: orders.length }, "Orders retrieved successfully."); }
    if (mid && !mid[2] && m === "GET") { const o = await shop(env).getOrder(u.id, +mid[1]); return o ? ok({ order: formatOrder(o) }) : fail(404, "ORDER_NOT_FOUND", "Order not found."); }
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
      const seen = new Set(), clean = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i] || {};
        if (!Number.isInteger(it.productId) || it.productId <= 0) return fail(400, "VALIDATION_ERROR", `Item at index ${i} has an invalid productId. Must be a positive integer.`);
        if (!Number.isInteger(it.quantity) || it.quantity <= 0 || it.quantity > 99) return fail(400, "VALIDATION_ERROR", `Item at index ${i} has an invalid quantity.`);
        if (seen.has(it.productId)) return fail(400, "VALIDATION_ERROR", `Duplicate productId ${it.productId} in order.`);
        seen.add(it.productId); clean.push({ productId: it.productId, quantity: it.quantity });
      }
      const idem = str(req.headers.get("idempotency-key")).slice(0, 100) || null;
      const r = await shop(env).createOrder(u.id, cust, clean, idem);
      if (r.error) return fail(r.error === "PRODUCT_NOT_FOUND" ? 404 : 409, r.error, r.message);
      const o = r.order;
      if (r.replay) return ok({ order: formatOrder(o) }, "Order already created.", 200);
      return ok({ order: formatOrder(o) }, "Order created successfully.", 201);
    }
    return fail(404, "NOT_FOUND", "Route not found.");
  }
  return fail(404, "NOT_FOUND", "Route not found.");
}

async function limited(req, kind, max, winMs) {
  const ip = req.headers.get("cf-connecting-ip") || "x", win = Math.floor(Date.now() / winMs);
  const key = new Request("https://rl.invalid/" + kind + "/" + encodeURIComponent(ip) + "/" + win);
  try {
    const hit = await caches.default.match(key);
    const n = (hit ? parseInt(await hit.text(), 10) || 0 : 0) + 1;
    await caches.default.put(key, new Response(String(n), { headers: { "cache-control": "max-age=" + Math.ceil(winMs / 1000 + 60) } }));
    return n > max;
  } catch { return false; }
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    try { return await handle(req, env, url); } catch (e) { return fail(500, "INTERNAL_ERROR", "Something went wrong."); }
  },
};
