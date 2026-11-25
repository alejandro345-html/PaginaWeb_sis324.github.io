/* TechStore - prototipo educativo. Los datos se guardan en localStorage. */
"use strict";

const STORAGE = {
  products: "techstore_products_v2",
  users: "techstore_users_v2",
  orders: "techstore_orders_v2",
  movements: "techstore_movements_v2",
  currentUser: "techstore_current_user_v2",
  cart: "techstore_cart_v2",
};
const money = (value) => `Bs ${Number(value || 0).toFixed(2)}`;
const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

const defaultProducts = [
  {
    id: "p1",
    name: "Procesador AMD Ryzen 5 5600",
    category: "Procesadores",
    description: "6 núcleos y 12 hilos para gaming y productividad.",
    price: 1150,
    stock: 12,
    emoji: "🧠",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "p2",
    name: "Tarjeta gráfica RTX 4060",
    category: "Tarjetas gráficas",
    description: "Rendimiento gráfico para tus juegos favoritos.",
    price: 2850,
    stock: 7,
    emoji: "🎮",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "p3",
    name: "Memoria RAM DDR4 16GB",
    category: "Memorias RAM",
    description: "Memoria de alta velocidad para tu equipo.",
    price: 320,
    stock: 25,
    emoji: "▤",
    image:
      "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "p4",
    name: "SSD NVMe 1TB",
    category: "Almacenamiento",
    description: "Arranques rápidos y amplio espacio.",
    price: 590,
    stock: 18,
    emoji: "💾",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "p5",
    name: "Placa madre B550M",
    category: "Placas madre",
    description: "Conectividad y estabilidad para Ryzen.",
    price: 890,
    stock: 9,
    emoji: "▦",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "p6",
    name: "Fuente de poder 650W",
    category: "Fuentes",
    description: "Energía confiable para tu computadora.",
    price: 480,
    stock: 14,
    emoji: "🔌",
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "p7",
    name: "Monitor IPS 24 pulgadas",
    category: "Monitores",
    description: "Colores vivos y resolución Full HD.",
    price: 1250,
    stock: 6,
    emoji: "🖥️",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "p8",
    name: "Teclado mecánico RGB",
    category: "Periféricos",
    description: "Respuesta precisa y retroiluminación RGB.",
    price: 410,
    stock: 20,
    emoji: "⌨️",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
  },
];
let products = read(STORAGE.products, defaultProducts);
let users = read(STORAGE.users, []);
let orders = read(STORAGE.orders, []);
let movements = read(STORAGE.movements, []);
let currentUser = read(STORAGE.currentUser, null);
let cart = read(STORAGE.cart, []);
let confirmCallback = null;

if (!users.some((user) => user.email === "admin@techstore.com")) {
  users.push({
    id: "admin",
    name: "Administrador",
    email: "admin@techstore.com",
    password: "Admin123!",
    role: "admin",
  });
  write(STORAGE.users, users);
}
function persist() {
  write(STORAGE.products, products);
  write(STORAGE.users, users);
  write(STORAGE.orders, orders);
  write(STORAGE.movements, movements);
  write(STORAGE.cart, cart);
  write(STORAGE.currentUser, currentUser);
}
function showToast(message, type = "success", title = null) {
  const container = document.getElementById("toastContainer");
  const config = {
    success: ["✓", "Operación exitosa"],
    error: ["×", "Ha ocurrido un error"],
    warning: ["!", "Advertencia"],
    info: ["i", "Información"],
  }[type] || ["i", "Información"];
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${config[0]}</span><div class="toast-content"><div class="toast-title">${escapeHTML(title || config[1])}</div><div class="toast-message">${escapeHTML(message)}</div></div><button class="toast-close" aria-label="Cerrar">×</button>`;
  container.appendChild(toast);
  let timer = setTimeout(() => toast.remove(), 4200);
  toast.querySelector(".toast-close").addEventListener("click", () => {
    clearTimeout(timer);
    toast.remove();
  });
}
function showSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (
    [
      "dashboard",
      "productos-admin",
      "inventario",
      "pedidos-admin",
      "ventas",
      "clientes",
      "reportes",
    ].includes(id) &&
    currentUser?.role !== "admin"
  ) {
    showToast(
      "Esta sección está disponible solo para administradores.",
      "error",
    );
    return;
  }
  document
    .querySelectorAll(".section")
    .forEach((section) =>
      section.classList.toggle("active", section.id === id),
    );
  document
    .querySelectorAll("[data-section].nav-link")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.section === id),
    );
  document.getElementById("mainNav").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
}
function updateUserInterface() {
  const admin = currentUser?.role === "admin";
  document.getElementById("adminMenu").classList.toggle("hidden", !admin);
  document.getElementById("clientMenu").classList.toggle("hidden", admin);
  document.getElementById("loginBtn").classList.toggle("hidden", !!currentUser);
  document.getElementById("logoutBtn").classList.toggle("hidden", !currentUser);
  document.getElementById("userName").classList.toggle("hidden", !currentUser);
  document.getElementById("userName").textContent = currentUser
    ? `Hola, ${currentUser.name.split(" ")[0]}`
    : "";
  document.getElementById("cartCount").textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
}
function openAuth(mode = "login") {
  const register = mode === "register";
  document.getElementById("authTitle").textContent = register
    ? "Crear cuenta"
    : "Inicia sesión";
  document.getElementById("authDescription").textContent = register
    ? "Regístrate para comprar en TechStore."
    : "Ingresa a tu cuenta para continuar.";
  document.getElementById("loginForm").classList.toggle("hidden", register);
  document.getElementById("registerForm").classList.toggle("hidden", !register);
  document.getElementById("authSwitch").innerHTML = register
    ? '¿Ya tienes cuenta? <button type="button" id="showLogin">Inicia sesión</button>'
    : '¿No tienes cuenta? <button type="button" id="showRegister">Regístrate</button>';
  document.getElementById("authModal").classList.remove("hidden");
  document.getElementById(register ? "registerName" : "loginEmail").focus();
}
function closeModal(id) {
  document.getElementById(id)?.classList.add("hidden");
}
function requireLogin() {
  if (!currentUser) {
    openAuth();
    return false;
  }
  return true;
}
function formatDate(date) {
  return new Date(date).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
function productCard(product) {
  const unavailable = product.stock <= 0;
  return `<article class="product-card"><div class="product-visual">${product.image ? `<img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.remove()">` : ""}<span class="product-tag">${escapeHTML(product.category)}</span><span class="product-emoji ${product.image ? "image-fallback" : ""}">${escapeHTML(product.emoji || "📦")}</span></div><div class="product-info"><div class="product-category">${escapeHTML(product.category)}</div><h3>${escapeHTML(product.name)}</h3><p class="product-description">${escapeHTML(product.description)}</p><div class="product-bottom"><div><div class="product-price">${money(product.price)}</div><div class="product-stock">${unavailable ? "Agotado" : `${product.stock} disponibles`}</div></div><button class="add-cart" data-add-cart="${product.id}" ${unavailable ? "disabled" : ""}>＋ Agregar</button></div></div></article>`;
}
function renderProducts() {
  const search = (
    document.getElementById("searchInput")?.value || ""
  ).toLowerCase();
  const category = document.getElementById("categoryFilter")?.value || "";
  const sort = document.getElementById("sortFilter")?.value || "default";
  let filtered = products.filter(
    (p) =>
      `${p.name} ${p.description} ${p.category}`
        .toLowerCase()
        .includes(search) &&
      (!category || p.category === category),
  );
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  document.getElementById("productGrid").innerHTML = filtered
    .map(productCard)
    .join("");
  document
    .getElementById("productsEmpty")
    .classList.toggle("hidden", filtered.length > 0);
  document.getElementById("featuredGrid").innerHTML = products
    .slice(0, 4)
    .map(productCard)
    .join("");
  const select = document.getElementById("categoryFilter"),
    current = select.value;
  const categories = [...new Set(products.map((p) => p.category))].sort();
  select.innerHTML =
    '<option value="">Todas las categorías</option>' +
    categories
      .map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`)
      .join("");
  select.value = categories.includes(current) ? current : "";
}
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product || product.stock < 1)
    return showToast("Este producto no tiene stock disponible.", "warning");
  if (!currentUser) return openAuth();
  const item = cart.find((i) => i.productId === id);
  if (item && item.quantity >= product.stock)
    return showToast("No hay suficiente stock disponible.", "warning");
  if (item) item.quantity++;
  else cart.push({ productId: id, quantity: 1 });
  persist();
  updateUserInterface();
  renderCart();
  showToast(`${product.name} se agregó al carrito.`);
}
function renderCart() {
  const container = document.getElementById("cartContainer");
  if (!cart.length) {
    container.innerHTML =
      '<div class="empty-card">🛒<h3>Tu carrito está vacío</h3><p>Explora el catálogo y agrega tus productos favoritos.</p><button class="button button-primary" data-section="productos">Ver productos</button></div>';
    return;
  }
  const valid = cart
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((i) => i.product);
  const total = valid.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  container.innerHTML = `<div class="cart-layout"><div class="cart-list">${valid.map((i) => `<div class="cart-item"><div><h3>${escapeHTML(i.product.name)}</h3><p>${money(i.product.price)} por unidad</p></div><div class="quantity-control"><button data-qty="${i.productId}" data-delta="-1">−</button><strong>${i.quantity}</strong><button data-qty="${i.productId}" data-delta="1" ${i.quantity >= i.product.stock ? "disabled" : ""}>＋</button></div><div><strong>${money(i.product.price * i.quantity)}</strong><br><button class="text-button" data-remove-cart="${i.productId}">Quitar</button></div></div>`).join("")}</div><aside class="summary-card"><h3>Resumen de compra</h3><div class="summary-line"><span>Productos</span><span>${valid.reduce((s, i) => s + i.quantity, 0)}</span></div><div class="summary-line"><span>Envío</span><span>A coordinar</span></div><div class="summary-line summary-total"><span>Total</span><strong>${money(total)}</strong></div><button class="button button-primary button-full" id="checkoutBtn">Confirmar pedido →</button></aside></div>`;
}
function changeQuantity(id, delta) {
  const item = cart.find((i) => i.productId === id),
    product = products.find((p) => p.id === id);
  if (!item || !product) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter((i) => i.productId !== id);
  else if (item.quantity > product.stock) {
    item.quantity = product.stock;
    showToast("Se ajustó la cantidad al stock disponible.", "warning");
  }
  persist();
  updateUserInterface();
  renderCart();
}
function checkout() {
  if (!requireLogin()) return;
  if (!cart.length) return showToast("Tu carrito está vacío.", "warning");
  for (const item of cart) {
    const p = products.find((x) => x.id === item.productId);
    if (!p || p.stock < item.quantity)
      return showToast(
        `Stock insuficiente para ${p?.name || "un producto"}.`,
        "error",
      );
  }
  const total = cart.reduce(
    (sum, item) =>
      sum + products.find((p) => p.id === item.productId).price * item.quantity,
    0,
  );
  const order = {
    id: makeId("PED"),
    userId: currentUser.id,
    customer: currentUser.name,
    email: currentUser.email,
    items: cart.map((i) => ({ ...i })),
    total,
    status: "Pendiente",
    createdAt: new Date().toISOString(),
  };
  cart.forEach((item) => {
    const p = products.find((x) => x.id === item.productId);
    p.stock -= item.quantity;
    movements.unshift({
      id: makeId("MOV"),
      productId: p.id,
      productName: p.name,
      type: "Salida por pedido",
      quantity: item.quantity,
      date: new Date().toISOString(),
      note: order.id,
    });
  });
  orders.unshift(order);
  cart = [];
  persist();
  updateUserInterface();
  renderAll();
  showToast(
    `Pedido ${order.id} registrado por ${money(total)}.`,
    "success",
    "Pedido realizado",
  );
  showSection("mis-pedidos");
}
function renderMyOrders() {
  const mine = orders.filter((o) => o.userId === currentUser?.id);
  document.getElementById("myOrdersContainer").innerHTML = !currentUser
    ? '<div class="empty-card">Inicia sesión para consultar tus pedidos.</div>'
    : !mine.length
      ? '<div class="empty-card">Todavía no tienes pedidos registrados.</div>'
      : tableHTML(
          ["Pedido", "Fecha", "Total", "Estado"],
          mine.map((o) => [
            escapeHTML(o.id),
            formatDate(o.createdAt),
            money(o.total),
            statusHTML(o.status),
          ]),
        );
}
function renderAccount() {
  const c = document.getElementById("accountContainer");
  c.innerHTML = !currentUser
    ? '<div class="empty-card">Inicia sesión para ver tu cuenta.</div>'
    : `<div class="panel-card" style="max-width:600px"><h3>Información personal</h3><p><strong>Nombre:</strong> ${escapeHTML(currentUser.name)}</p><p><strong>Correo:</strong> ${escapeHTML(currentUser.email)}</p><p><strong>Tipo de cuenta:</strong> ${currentUser.role === "admin" ? "Administrador" : "Cliente"}</p><button class="button button-primary" id="editAccountBtn">Editar mis datos</button></div>`;
}
function tableHTML(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">No hay registros.</td></tr>`}</tbody></table></div>`;
}
function statusHTML(status) {
  const cls =
    status === "Entregado"
      ? "completed"
      : status === "Cancelado"
        ? "cancelled"
        : "pending";
  return `<span class="status ${cls}">${escapeHTML(status)}</span>`;
}
function renderAdminProducts() {
  const rows = products.map((p) => [
    escapeHTML(p.name),
    escapeHTML(p.category),
    money(p.price),
    p.stock,
    `<div class="table-actions"><button class="small-button" data-edit-product="${p.id}">Editar</button><button class="small-button danger" data-delete-product="${p.id}">Eliminar</button></div>`,
  ]);
  document.getElementById("adminProductContainer").innerHTML = tableHTML(
    ["Producto", "Categoría", "Precio", "Stock", "Acciones"],
    rows,
  );
}
function renderInventory() {
  const rows = products.map((p) => [
    escapeHTML(p.name),
    escapeHTML(p.category),
    p.stock,
    p.stock <= 5
      ? '<span class="status cancelled">Stock bajo</span>'
      : '<span class="status completed">Disponible</span>',
    `<button class="small-button" data-restock="${p.id}">＋ Reponer</button>`,
  ]);
  const movementRows = movements
    .slice(0, 12)
    .map((m) => [
      escapeHTML(m.productName),
      escapeHTML(m.type),
      m.quantity,
      formatDate(m.date),
      escapeHTML(m.note || "—"),
    ]);
  document.getElementById("inventoryContainer").innerHTML =
    `<div class="panel-card"><h3>Existencias actuales</h3>${tableHTML(["Producto", "Categoría", "Unidades", "Estado", "Acción"], rows)}</div><div class="panel-card"><h3>Movimientos recientes</h3>${tableHTML(["Producto", "Movimiento", "Cantidad", "Fecha", "Referencia"], movementRows)}</div>`;
}
function renderAdminOrders() {
  const rows = orders.map((o) => [
    escapeHTML(o.id),
    escapeHTML(o.customer),
    formatDate(o.createdAt),
    money(o.total),
    statusHTML(o.status),
    `<button class="small-button" data-edit-order="${o.id}">Gestionar</button>`,
  ]);
  document.getElementById("ordersContainer").innerHTML = tableHTML(
    ["Pedido", "Cliente", "Fecha", "Total", "Estado", "Acción"],
    rows,
  );
}
function renderSales() {
  const completed = orders.filter((o) => o.status === "Entregado");
  document.getElementById("salesContainer").innerHTML =
    `<div class="stats-grid"><div class="stat-card"><span>Ventas completadas</span><strong>${completed.length}</strong></div><div class="stat-card"><span>Ingresos registrados</span><strong>${money(completed.reduce((s, o) => s + o.total, 0))}</strong></div></div>${tableHTML(
      ["Pedido", "Cliente", "Fecha", "Total"],
      completed.map((o) => [
        escapeHTML(o.id),
        escapeHTML(o.customer),
        formatDate(o.createdAt),
        money(o.total),
      ]),
    )}`;
}
function renderCustomers() {
  const customers = users.filter((u) => u.role !== "admin");
  document.getElementById("customersContainer").innerHTML = tableHTML(
    ["Nombre", "Correo", "Pedidos", "Total comprado"],
    customers.map((u) => {
      const os = orders.filter(
        (o) => o.userId === u.id && o.status === "Entregado",
      );
      return [
        escapeHTML(u.name),
        escapeHTML(u.email),
        orders.filter((o) => o.userId === u.id).length,
        money(os.reduce((s, o) => s + o.total, 0)),
      ];
    }),
  );
}
function renderReports() {
  const sold = orders.filter((o) => o.status === "Entregado"),
    revenue = sold.reduce((s, o) => s + o.total, 0);
  const low = products.filter((p) => p.stock <= 5);
  document.getElementById("reportsContainer").innerHTML =
    `<div class="stats-grid"><div class="stat-card"><span>Ingresos realizados</span><strong>${money(revenue)}</strong></div><div class="stat-card"><span>Pedidos entregados</span><strong>${sold.length}</strong></div><div class="stat-card"><span>Productos registrados</span><strong>${products.length}</strong></div><div class="stat-card"><span>Stock bajo</span><strong>${low.length}</strong></div></div><div class="panel-card"><h3>Productos que requieren reposición</h3>${tableHTML(
      ["Producto", "Stock actual", "Acción"],
      low.map((p) => [
        escapeHTML(p.name),
        p.stock,
        `<button class="small-button" data-restock="${p.id}">Reponer stock</button>`,
      ]),
    )}</div>`;
}
function renderDashboard() {
  const revenue = orders
    .filter((o) => o.status === "Entregado")
    .reduce((s, o) => s + o.total, 0);
  const low = products.filter((p) => p.stock <= 5);
  document.getElementById("dashboardContainer").innerHTML =
    `<div class="stats-grid"><div class="stat-card"><span>Productos</span><strong>${products.length}</strong><small>En catálogo</small></div><div class="stat-card"><span>Pedidos</span><strong>${orders.length}</strong><small>Registrados</small></div><div class="stat-card"><span>Ingresos</span><strong>${money(revenue)}</strong><small>Pedidos entregados</small></div><div class="stat-card"><span>Stock bajo</span><strong>${low.length}</strong><small>Requieren atención</small></div></div><div class="panel-grid"><div class="panel-card"><h3>Últimos pedidos</h3>${tableHTML(
      ["Pedido", "Cliente", "Total", "Estado"],
      orders
        .slice(0, 5)
        .map((o) => [
          escapeHTML(o.id),
          escapeHTML(o.customer),
          money(o.total),
          statusHTML(o.status),
        ]),
    )}</div><div class="panel-card"><h3>Alertas de inventario</h3>${low.length ? low.map((p) => `<div class="bar-row"><span>${escapeHTML(p.name.slice(0, 17))}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(5, (p.stock / 5) * 100)}%"></div></div><strong>${p.stock}</strong></div>`).join("") : '<p class="product-description">No hay productos con stock bajo.</p>'}</div></div>`;
}
function renderAll() {
  renderProducts();
  renderCart();
  renderMyOrders();
  renderAccount();
  if (currentUser?.role === "admin") {
    renderDashboard();
    renderAdminProducts();
    renderInventory();
    renderAdminOrders();
    renderSales();
    renderCustomers();
    renderReports();
  }
  updateUserInterface();
}
function openForm({
  title,
  description = "",
  fields,
  submitText = "Guardar",
  onSubmit,
  kicker = "TECHSTORE · FORMULARIO",
}) {
  const modal = document.getElementById("formModal"),
    form = document.getElementById("dynamicForm");
  document.getElementById("formModalTitle").textContent = title;
  document.getElementById("formModalDescription").textContent = description;
  document.getElementById("formModalKicker").textContent = kicker;
  form.innerHTML =
    fields
      .map((field) => {
        const value = field.value ?? "";
        const common = `class="field-control" id="form_${field.name}" name="${field.name}" ${field.required === false ? "" : "required"} ${field.min !== undefined ? `min="${field.min}"` : ""} ${field.max !== undefined ? `max="${field.max}"` : ""} ${field.step ? `step="${field.step}"` : ""} ${field.maxlength ? `maxlength="${field.maxlength}"` : ""} placeholder="${escapeHTML(field.placeholder || "")}"`;
        let control = "";
        if (field.type === "textarea")
          control = `<textarea ${common} rows="${field.rows || 3}">${escapeHTML(value)}</textarea>`;
        else if (field.type === "select")
          control = `<select ${common}>${field.options.map((opt) => `<option value="${escapeHTML(opt.value)}" ${String(opt.value) === String(value) ? "selected" : ""}>${escapeHTML(opt.label)}</option>`).join("")}</select>`;
        else
          control = `<input ${common} type="${field.type || "text"}" value="${escapeHTML(value)}">`;
        return `<label>${escapeHTML(field.label)}${control}</label>`;
      })
      .join("") +
    `<div class="modal-actions"><button type="button" class="button button-ghost" data-close-modal>Cancelar</button><button type="submit" class="button button-primary">${escapeHTML(submitText)}</button></div>`;
  form.onsubmit = (event) => {
    event.preventDefault();
    const data = {};
    fields.forEach((f) => {
      const el = form.elements[f.name];
      data[f.name] = f.type === "number" ? Number(el.value) : el.value.trim();
    });
    if (onSubmit(data) !== false) closeModal("formModal");
  };
  modal.classList.remove("hidden");
  setTimeout(() => form.querySelector("input,select,textarea")?.focus(), 50);
}
function confirmAction(message, callback, title = "Confirmar acción") {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;
  confirmCallback = callback;
  document.getElementById("confirmModal").classList.remove("hidden");
}
function productForm(product = null) {
  const editing = !!product;
  openForm({
    title: editing ? "Editar producto" : "Agregar producto",
    description: editing
      ? "Modifica los datos del producto. Los campos ya contienen la información actual."
      : "Completa los datos para registrar un nuevo producto.",
    submitText: editing ? "Guardar cambios" : "Agregar producto",
    fields: [
      {
        name: "name",
        label: "Nombre del producto",
        value: product?.name || "",
        maxlength: 90,
        placeholder: "Ej. Procesador AMD Ryzen 7",
      },
      {
        name: "category",
        label: "Categoría",
        value: product?.category || "",
        maxlength: 45,
        placeholder: "Ej. Procesadores",
      },
      {
        name: "description",
        label: "Descripción",
        type: "textarea",
        value: product?.description || "",
        required: false,
        placeholder: "Describe brevemente el producto",
      },
      {
        name: "price",
        label: "Precio (Bs)",
        type: "number",
        value: product?.price ?? "",
        min: 0.01,
        step: "0.01",
      },
      {
        name: "stock",
        label: "Stock inicial",
        type: "number",
        value: product?.stock ?? 0,
        min: 0,
        step: "1",
      },
      {
        name: "image",
        label: "URL de imagen del producto",
        value: product?.image || "",
        maxlength: 500,
        required: false,
        placeholder: "https://...",
      },
      {
        name: "emoji",
        label: "Emoji alternativo",
        value: product?.emoji || "📦",
        maxlength: 8,
        required: false,
      },
    ],
    onSubmit: (data) => {
      if (!data.name || !data.category || data.price <= 0 || data.stock < 0)
        return (
          showToast("Verifica los datos del formulario.", "warning"),
          false
        );
      if (editing) {
        Object.assign(product, data);
        showToast("Los cambios del producto se guardaron correctamente.");
      } else {
        products.unshift({ id: makeId("PROD"), ...data });
        showToast("El producto se agregó al catálogo.");
      }
      persist();
      renderAll();
      return true;
    },
  });
}
function restockForm(product) {
  openForm({
    title: "Reponer inventario",
    description: `Producto: ${product.name}. Stock actual: ${product.stock} unidades.`,
    submitText: "Registrar reposición",
    fields: [
      {
        name: "quantity",
        label: "Cantidad que se agregará",
        type: "number",
        min: 1,
        step: "1",
        value: 1,
      },
      {
        name: "note",
        label: "Observación / referencia",
        value: "Reposición de inventario",
        maxlength: 100,
        required: false,
      },
    ],
    onSubmit: (data) => {
      if (data.quantity < 1)
        return (
          showToast("La cantidad debe ser mayor a cero.", "warning"),
          false
        );
      product.stock += data.quantity;
      movements.unshift({
        id: makeId("MOV"),
        productId: product.id,
        productName: product.name,
        type: "Entrada de stock",
        quantity: data.quantity,
        date: new Date().toISOString(),
        note: data.note,
      });
      persist();
      renderAll();
      showToast(
        `Se agregaron ${data.quantity} unidades a ${product.name}.`,
        "success",
        "Stock actualizado",
      );
      return true;
    },
  });
}
function editOrderForm(order) {
  openForm({
    title: "Gestionar pedido",
    description: `Pedido ${order.id} · Cliente: ${order.customer} · Total: ${money(order.total)}`,
    submitText: "Actualizar pedido",
    fields: [
      {
        name: "status",
        label: "Estado del pedido",
        type: "select",
        value: order.status,
        options: [
          "Pendiente",
          "En preparación",
          "Enviado",
          "Entregado",
          "Cancelado",
        ].map((s) => ({ value: s, label: s })),
      },
      {
        name: "note",
        label: "Nota interna (opcional)",
        value: order.note || "",
        maxlength: 140,
        required: false,
        placeholder: "Observaciones del pedido",
      },
    ],
    onSubmit: (data) => {
      const previous = order.status;
      if (
        data.status === "Cancelado" &&
        previous !== "Cancelado" &&
        previous !== "Entregado"
      ) {
        order.items.forEach((item) => {
          const p = products.find((x) => x.id === item.productId);
          if (p) {
            p.stock += item.quantity;
            movements.unshift({
              id: makeId("MOV"),
              productId: p.id,
              productName: p.name,
              type: "Devolución por cancelación",
              quantity: item.quantity,
              date: new Date().toISOString(),
              note: order.id,
            });
          }
        });
      }
      if (previous === "Cancelado" && data.status !== "Cancelado")
        return (
          showToast(
            "Un pedido cancelado no se puede reactivar desde este formulario.",
            "warning",
          ),
          false
        );
      order.status = data.status;
      order.note = data.note;
      persist();
      renderAll();
      showToast(`El pedido ahora está: ${data.status}.`);
      return true;
    },
  });
}
function editAccountForm() {
  openForm({
    title: "Editar mis datos",
    description: "Actualiza la información de tu cuenta.",
    fields: [
      {
        name: "name",
        label: "Nombre completo",
        value: currentUser.name,
        maxlength: 70,
      },
      {
        name: "email",
        label: "Correo electrónico",
        type: "email",
        value: currentUser.email,
      },
    ],
    onSubmit: (data) => {
      const exists = users.some(
        (u) =>
          u.email.toLowerCase() === data.email.toLowerCase() &&
          u.id !== currentUser.id,
      );
      if (exists)
        return (showToast("Ese correo ya está registrado.", "error"), false);
      const user = users.find((u) => u.id === currentUser.id);
      Object.assign(user, data);
      currentUser = { ...user };
      persist();
      renderAll();
      showToast("Tus datos se actualizaron correctamente.");
      return true;
    },
  });
}
function handleLogin(event) {
  event.preventDefault();
  const email = document
      .getElementById("loginEmail")
      .value.trim()
      .toLowerCase(),
    password = document.getElementById("loginPassword").value;
  const user = users.find(
    (u) => u.email.toLowerCase() === email && u.password === password,
  );
  if (!user)
    return (showToast("Correo o contraseña incorrectos.", "error"), false);
  currentUser = { ...user };
  persist();
  closeModal("authModal");
  updateUserInterface();
  renderAll();
  showToast(`Bienvenido, ${user.name}.`, "success");
  showSection(user.role === "admin" ? "dashboard" : "inicio");
}
function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("registerName").value.trim(),
    email = document.getElementById("registerEmail").value.trim().toLowerCase(),
    password = document.getElementById("registerPassword").value;
  if (users.some((u) => u.email.toLowerCase() === email))
    return showToast("Este correo ya tiene una cuenta.", "error");
  const user = { id: makeId("USR"), name, email, password, role: "client" };
  users.push(user);
  currentUser = { ...user };
  persist();
  closeModal("authModal");
  renderAll();
  showToast("Tu cuenta se creó correctamente.");
  showSection("inicio");
}
function logout() {
  currentUser = null;
  cart = [];
  persist();
  updateUserInterface();
  renderAll();
  showToast("Has cerrado sesión.", "info");
  showSection("inicio");
}

document.addEventListener("click", (event) => {
  const sectionButton = event.target.closest("[data-section]");
  if (sectionButton) {
    event.preventDefault();
    showSection(sectionButton.dataset.section);
    return;
  }
  const add = event.target.closest("[data-add-cart]");
  if (add) {
    addToCart(add.dataset.addCart);
    return;
  }
  const qty = event.target.closest("[data-qty]");
  if (qty) {
    changeQuantity(qty.dataset.qty, Number(qty.dataset.delta));
    return;
  }
  const remove = event.target.closest("[data-remove-cart]");
  if (remove) {
    cart = cart.filter((i) => i.productId !== remove.dataset.removeCart);
    persist();
    updateUserInterface();
    renderCart();
    showToast("Producto retirado del carrito.", "info");
    return;
  }
  const edit = event.target.closest("[data-edit-product]");
  if (edit) {
    productForm(products.find((p) => p.id === edit.dataset.editProduct));
    return;
  }
  const del = event.target.closest("[data-delete-product]");
  if (del) {
    const p = products.find((x) => x.id === del.dataset.deleteProduct);
    confirmAction(
      `Se eliminará "${p.name}" del catálogo. Esta acción no se puede deshacer.`,
      () => {
        products = products.filter((x) => x.id !== p.id);
        cart = cart.filter((i) => i.productId !== p.id);
        persist();
        renderAll();
        showToast("Producto eliminado del catálogo.", "success");
      },
      "Eliminar producto",
    );
    return;
  }
  const restock = event.target.closest("[data-restock]");
  if (restock) {
    const p = products.find((x) => x.id === restock.dataset.restock);
    if (p) restockForm(p);
    return;
  }
  const order = event.target.closest("[data-edit-order]");
  if (order) {
    const o = orders.find((x) => x.id === order.dataset.editOrder);
    if (o) editOrderForm(o);
    return;
  }
  if (event.target.closest("#checkoutBtn")) {
    checkout();
    return;
  }
  if (event.target.closest("#addProductBtn")) {
    productForm();
    return;
  }
  if (event.target.closest("#editAccountBtn")) {
    editAccountForm();
    return;
  }
  if (event.target.closest("#loginBtn")) {
    openAuth();
    return;
  }
  if (event.target.closest("#logoutBtn")) {
    confirmAction(
      "¿Estás seguro de que deseas cerrar tu sesión?",
      logout,
      "Cerrar sesión",
    );
    return;
  }
  if (event.target.closest("#showRegister")) {
    openAuth("register");
    return;
  }
  if (event.target.closest("#showLogin")) {
    openAuth("login");
    return;
  }
  if (event.target.closest("[data-close-modal]")) {
    event.target.closest(".modal-backdrop").classList.add("hidden");
    return;
  }
});
document.getElementById("loginForm").addEventListener("submit", handleLogin);
document
  .getElementById("registerForm")
  .addEventListener("submit", handleRegister);
document
  .getElementById("searchInput")
  .addEventListener("input", renderProducts);
document
  .getElementById("categoryFilter")
  .addEventListener("change", renderProducts);
document
  .getElementById("sortFilter")
  .addEventListener("change", renderProducts);
document
  .getElementById("menuToggle")
  .addEventListener("click", () =>
    document.getElementById("mainNav").classList.toggle("open"),
  );
document
  .getElementById("cancelConfirm")
  .addEventListener("click", () => closeModal("confirmModal"));
document.getElementById("acceptConfirm").addEventListener("click", () => {
  closeModal("confirmModal");
  const callback = confirmCallback;
  confirmCallback = null;
  if (callback) callback();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape")
    document
      .querySelectorAll(".modal-backdrop")
      .forEach((m) => m.classList.add("hidden"));
});
updateUserInterface();
renderAll();
