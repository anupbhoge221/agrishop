const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
 
/* ---------- languages ---------- */
const T = {
  en: { nav_home: "Home", nav_shop: "Shop", nav_orders: "Orders", nav_manage: "Manage", hello: "Namaste, welcome back",
    p_products: "Products", p_farmers: "Farmers", p_orders: "Orders", low: "Running low", low_hint: "Fewer than 50 left",
    revenue: "Sales by category", search: "Search seeds, fertilizer…", all: "All", add: "Add", cart: "Your cart",
    cart_btn: "View cart", farmer: "Farmer", pay: "How will you pay?", pay_Cash: "Cash", pay_Card: "Card",
    "pay_Net Banking": "Net Banking", total: "Total", place: "Place order", empty: "Your cart is empty. Add something from the shop.",
    ordered: "Order placed", in: "In stock", lowb: "Low stock", out: "Out of stock", left: "left", no_orders: "No orders yet",
    no_items: "No products found", no_sales: "No sales yet", all_good: "Everything is well stocked",
    add_product: "Add a product", new_farmer: "Register a farmer", save: "Save", saved: "Saved", updated: "Status updated",
    st_Pending: "Pending", st_Processing: "Processing", st_Shipped: "Shipped", st_Delivered: "Delivered", st_Cancelled: "Cancelled" },
  mr: { nav_home: "मुख्य पान", nav_shop: "दुकान", nav_orders: "ऑर्डर", nav_manage: "व्यवस्थापन", hello: "नमस्कार, स्वागत आहे",
    p_products: "उत्पादने", p_farmers: "शेतकरी", p_orders: "ऑर्डर", low: "साठा कमी आहे", low_hint: "५० पेक्षा कमी शिल्लक",
    revenue: "विभागानुसार विक्री", search: "बियाणे, खत शोधा…", all: "सर्व", add: "जोडा", cart: "तुमची कार्ट",
    cart_btn: "कार्ट पहा", farmer: "शेतकरी", pay: "पैसे कसे द्याल?", pay_Cash: "रोख", pay_Card: "कार्ड",
    "pay_Net Banking": "नेट बँकिंग", total: "एकूण", place: "ऑर्डर द्या", empty: "कार्ट रिकामी आहे. दुकानातून काहीतरी जोडा.",
    ordered: "ऑर्डर नोंदवली", in: "उपलब्ध", lowb: "साठा कमी", out: "संपले", left: "शिल्लक", no_orders: "अजून ऑर्डर नाहीत",
    no_items: "उत्पादन सापडले नाही", no_sales: "अजून विक्री नाही", all_good: "सर्व साठा पुरेसा आहे",
    add_product: "नवीन उत्पादन जोडा", new_farmer: "नवीन शेतकरी नोंदवा", save: "जतन करा", saved: "जतन केले", updated: "स्थिती बदलली",
    st_Pending: "प्रलंबित", st_Processing: "प्रक्रियेत", st_Shipped: "पाठवले", st_Delivered: "पोहोचले", st_Cancelled: "रद्द" },
  hi: { nav_home: "होम", nav_shop: "दुकान", nav_orders: "ऑर्डर", nav_manage: "प्रबंधन", hello: "नमस्ते, स्वागत है",
    p_products: "उत्पाद", p_farmers: "किसान", p_orders: "ऑर्डर", low: "स्टॉक कम है", low_hint: "50 से कम बचा",
    revenue: "श्रेणी के अनुसार बिक्री", search: "बीज, खाद खोजें…", all: "सभी", add: "जोड़ें", cart: "आपकी कार्ट",
    cart_btn: "कार्ट देखें", farmer: "किसान", pay: "भुगतान कैसे करेंगे?", pay_Cash: "नकद", pay_Card: "कार्ड",
    "pay_Net Banking": "नेट बैंकिंग", total: "कुल", place: "ऑर्डर दें", empty: "कार्ट खाली है। दुकान से कुछ जोड़ें।",
    ordered: "ऑर्डर हो गया", in: "उपलब्ध", lowb: "स्टॉक कम", out: "खत्म", left: "बचा", no_orders: "अभी कोई ऑर्डर नहीं",
    no_items: "कोई उत्पाद नहीं मिला", no_sales: "अभी कोई बिक्री नहीं", all_good: "सारा स्टॉक पर्याप्त है",
    add_product: "नया उत्पाद जोड़ें", new_farmer: "नया किसान पंजीकृत करें", save: "सहेजें", saved: "सहेजा गया", updated: "स्थिति बदली",
    st_Pending: "लंबित", st_Processing: "प्रक्रिया में", st_Shipped: "भेजा गया", st_Delivered: "पहुँच गया", st_Cancelled: "रद्द" },
};
let lang = "en";
try { lang = localStorage.getItem("lang") || "en"; } catch (e) {}
const t = (k) => (T[lang] && T[lang][k]) || T.en[k] || k;
 
const ICON = { "Seeds": "🌱", "Fertilizers": "🧪", "Pesticides": "🐛", "Farm Tools": "🔧", "Irrigation Equipment": "💧",
  "Animal Feed": "🐄", "Organic Manure": "🍂", "Herbicides": "🌿", "Fungicides": "🍄", "Growth Regulators": "⚗️",
  "Tractor Parts": "🚜", "Sprayers": "💦", "Protective Gear": "🧤", "Greenhouse Supplies": "🏡", "Soil Testing Kits": "🔬",
  "Bio-fertilizers": "🦠", "Poultry Supplies": "🐔", "Dairy Supplies": "🥛", "Horticulture Plants": "🌳", "Storage & Packaging": "📦" };
 
/* ---------- state ---------- */
let products = [], orders = [], report = null;
let cart = {};            // product_id -> quantity
let cat = "all", pay = "UPI", view = "home", toastTimer;
 
async function api(url, method = "GET", body) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
function toast(msg, bad = false) {
  const el = $("#toast");
  el.textContent = msg; el.className = "show" + (bad ? " error" : "");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.className = ""), 3200);
}
const fillSelect = (sel, rows, id, label) => (sel.innerHTML = rows.map((r) => `<option value="${r[id]}">${esc(label(r))}</option>`).join(""));
 
/* ---------- language + text size ---------- */
function applyLang() {
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  $$("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
  renderShop(); renderCart(); renderOrders(); renderHome();
}
$$("[data-lang]").forEach((b) => b.addEventListener("click", () => {
  lang = b.dataset.lang;
  try { localStorage.setItem("lang", lang); } catch (e) {}
  applyLang();
}));
$("#font-btn").addEventListener("click", () => {
  const big = document.documentElement.classList.toggle("big");
  $("#font-btn").textContent = big ? "A−" : "A+";
});
 
/* ---------- navigation ---------- */
function show(name) {
  view = name;
  $$(".tab").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === name));
  ({ home: loadHome, shop: loadProducts, orders: loadOrders, manage: () => {} })[name]();
  updateFab();
}
$$(".tab").forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));
 
/* ---------- home ---------- */
async function loadHome() {
  try { report = await api("/api/reports"); renderHome(); } catch (e) { toast(e.message, true); }
}
function renderHome() {
  if (!report) return;
  $("#st-products").textContent = report.totals.products;
  $("#st-customers").textContent = report.totals.customers;
  $("#st-orders").textContent = report.totals.orders;
  $("#low-stock").innerHTML = report.low_stock.length
    ? report.low_stock.map((p) => `<li><span>${esc(p.product_name)}</span><span class="tag ${p.stock_qty < 20 ? "out" : "low"}">${p.stock_qty} ${esc(p.unit)}</span></li>`).join("")
    : `<li class="empty">${t("all_good")}</li>`;
  const max = Math.max(...report.revenue.map((x) => Number(x.revenue)), 1);
  $("#revenue").innerHTML = report.revenue.length
    ? report.revenue.map((x) => `<div class="bar"><div class="label"><span>${ICON[x.category_name] || "🌾"} ${esc(x.category_name)}</span><b>${money(x.revenue)}</b></div>
        <div class="track"><div class="fill" style="width:${(Number(x.revenue) / max) * 100}%"></div></div></div>`).join("")
    : `<p class="empty">${t("no_sales")}</p>`;
}
 
/* ---------- shop ---------- */
async function loadProducts() {
  try { products = await api("/api/products"); renderShop(); renderCart(); } catch (e) { toast(e.message, true); }
}
function renderShop() {
  const cats = [...new Set(products.map((p) => p.category_name))].sort();
  $("#chips").innerHTML = [["all", t("all")], ...cats.map((c) => [c, `${ICON[c] || "🌾"} ${c}`])]
    .map(([v, label]) => `<button class="chip ${cat === v ? "on" : ""}" data-cat="${esc(v)}">${esc(label)}</button>`).join("");
  const q = $("#search").value.trim().toLowerCase();
  const list = products.filter((p) => (cat === "all" || p.category_name === cat) &&
    (!q || (p.product_name + " " + p.category_name).toLowerCase().includes(q)));
  $("#grid").innerHTML = list.length ? list.map((p) => {
    const s = p.stock_qty, cls = s === 0 ? "out" : s < 50 ? "low" : "ok";
    const label = s === 0 ? t("out") : s < 50 ? `${t("lowb")} · ${s} ${t("left")}` : t("in");
    return `<article class="card"><div class="pic">${ICON[p.category_name] || "🌾"}</div>
      <h3>${esc(p.product_name)}</h3><p class="meta">${esc(p.category_name)}</p>
      <div class="price">${money(p.unit_price)}<small> / ${esc(p.unit)}</small></div>
      <span class="tag ${cls}">${label}</span>
      <button class="primary add" data-id="${p.product_id}" ${s === 0 ? "disabled" : ""}>＋ ${t("add")}</button></article>`;
  }).join("") : `<p class="empty">${t("no_items")}</p>`;
}
$("#chips").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) { cat = b.dataset.cat; renderShop(); } });
$("#search").addEventListener("input", renderShop);
$("#grid").addEventListener("click", (e) => { const b = e.target.closest(".add"); if (b) changeQty(Number(b.dataset.id), 1); });
 
/* ---------- cart ---------- */
const byId = (id) => products.find((p) => p.product_id === id);
function changeQty(id, d) {
  const p = byId(id); if (!p) return;
  const n = Math.min((cart[id] || 0) + d, p.stock_qty);
  if (n <= 0) delete cart[id]; else cart[id] = n;
  renderCart();
}
function cartTotal() { return Object.entries(cart).reduce((s, [id, q]) => s + q * Number(byId(Number(id))?.unit_price || 0), 0); }
function renderCart() {
  const ids = Object.keys(cart).map(Number).filter(byId);
  $("#cart-items").innerHTML = ids.length ? ids.map((id) => {
    const p = byId(id);
    return `<div class="line"><div class="name">${ICON[p.category_name] || "🌾"} ${esc(p.product_name)}<small>${money(p.unit_price)} × ${cart[id]} = ${money(p.unit_price * cart[id])}</small></div>
      <div class="qty"><button data-id="${id}" data-d="-1" aria-label="Less">−</button><b>${cart[id]}</b><button data-id="${id}" data-d="1" aria-label="More">＋</button></div></div>`;
  }).join("") : `<p class="empty">${t("empty")}</p>`;
  $("#cart-total").textContent = money(cartTotal());
  $("#place").disabled = !ids.length;
  $$("#pay button").forEach((b) => b.classList.toggle("on", b.dataset.pay === pay));
  updateFab();
}
function updateFab() {
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  $("#cart-fab").hidden = !(n > 0 && view === "shop");
  $("#fab-count").textContent = n; $("#fab-total").textContent = money(cartTotal());
}
const openCart = (open) => { $("#cart").classList.toggle("open", open); $("#scrim").hidden = !open; };
$("#cart-fab").addEventListener("click", () => openCart(true));
$("#cart-close").addEventListener("click", () => openCart(false));
$("#scrim").addEventListener("click", () => openCart(false));
$("#cart-items").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) changeQty(Number(b.dataset.id), Number(b.dataset.d)); });
$("#pay").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { pay = b.dataset.pay; renderCart(); } });
 
$("#place").addEventListener("click", async () => {
  const items = Object.entries(cart).map(([id, q]) => ({ product_id: Number(id), quantity: q }));
  try {
    const r = await api("/api/orders", "POST", { customer_id: Number($("#o-customer").value), payment_method: pay, items });
    toast(`✅ ${t("ordered")} #${r.order_id}`);
    cart = {}; openCart(false); await loadProducts(); renderCart();
  } catch (err) { toast(err.message, true); }
});
 
/* ---------- orders ---------- */
async function loadOrders() {
  try { orders = await api("/api/orders"); renderOrders(); } catch (e) { toast(e.message, true); }
}
function fmtDate(d) {
  const x = new Date(d);
  return isNaN(x) ? d : x.toLocaleDateString(lang === "en" ? "en-IN" : lang + "-IN", { day: "numeric", month: "short", year: "numeric" });
}
function renderOrders() {
  $("#order-list").innerHTML = orders.length ? orders.map((o) =>
    `<div class="ord ${o.status}"><div><b>#${o.order_id}</b> ${esc(o.full_name)}<br><small>${fmtDate(o.order_date)}</small></div>
     <div class="ot">${money(o.total)}</div>
     <select data-id="${o.order_id}" aria-label="Status of order ${o.order_id}">
       ${STATUSES.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${t("st_" + s)}</option>`).join("")}
     </select></div>`).join("") : `<p class="empty">${t("no_orders")}</p>`;
}
$("#order-list").addEventListener("change", async (e) => {
  if (!e.target.matches("select")) return;
  try { await api(`/api/orders/${e.target.dataset.id}`, "PATCH", { status: e.target.value }); toast(t("updated")); loadOrders(); }
  catch (err) { toast(err.message, true); }
});
 
/* ---------- manage ---------- */
async function loadLookups() {
  const l = await api("/api/lookups");
  fillSelect($("#p-category"), l.categories, "category_id", (c) => c.category_name);
  fillSelect($("#p-supplier"), l.suppliers, "supplier_id", (s) => s.supplier_name);
  fillSelect($("#o-customer"), l.customers, "customer_id", (c) => `${c.full_name} (${c.village})`);
}
$("#product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try { await api("/api/products", "POST", Object.fromEntries(new FormData(e.target))); e.target.reset(); toast("✅ " + t("saved")); loadProducts(); }
  catch (err) { toast(err.message, true); }
});
$("#customer-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try { await api("/api/customers", "POST", Object.fromEntries(new FormData(e.target))); e.target.reset(); toast("✅ " + t("saved")); loadLookups(); }
  catch (err) { toast(err.message, true); }
});
 
/* ---------- start ---------- */
loadLookups().then(() => { applyLang(); show("home"); loadProducts(); }).catch((e) => toast(e.message, true));
 