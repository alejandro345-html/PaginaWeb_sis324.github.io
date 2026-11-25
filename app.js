// ==========================================
// TECHSTORE - SISTEMA PRINCIPAL
// HTML + CSS + JAVASCRIPT + LOCALSTORAGE
// ==========================================

// ==========================================
// 1. DATOS Y CONFIGURACIÓN
// ==========================================

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin123";

let products = JSON.parse(localStorage.getItem("tech_products")) || [
  {
    id: 1,
    name: "AMD Ryzen 5 5600X",
    category: "Procesadores",
    price: 1250,
    stock: 10,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500",
    description: "Procesador AMD Ryzen 5 de alto rendimiento.",
  },
  {
    id: 2,
    name: "NVIDIA RTX 4060",
    category: "Tarjetas gráficas",
    price: 3200,
    stock: 5,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500",
    description: "Tarjeta gráfica para gaming y diseño.",
  },
  {
    id: 3,
    name: "Kingston Fury 16GB DDR4",
    category: "Memorias RAM",
    price: 450,
    stock: 15,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500",
    description: "Memoria RAM DDR4 de 16GB.",
  },
  {
    id: 4,
    name: "SSD Kingston 1TB",
    category: "Almacenamiento",
    price: 650,
    stock: 12,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500",
    description: "Unidad de almacenamiento SSD de 1TB.",
  },
  {
    id: 5,
    name: "ASUS PRIME B550M",
    category: "Placas madre",
    price: 1100,
    stock: 8,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
    description: "Placa madre compatible con AMD Ryzen.",
  },
  {
    id: 6,
    name: "Fuente Corsair 650W",
    category: "Fuentes",
    price: 780,
    stock: 7,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500",
    description: "Fuente de poder de 650W.",
  },
];

let users = JSON.parse(localStorage.getItem("tech_users")) || [];

let orders = JSON.parse(localStorage.getItem("tech_orders")) || [];

let stockMovements =
  JSON.parse(localStorage.getItem("tech_stock_movements")) || [];

let sales = JSON.parse(localStorage.getItem("tech_sales")) || [];

let cart = JSON.parse(localStorage.getItem("tech_cart")) || [];

let currentUser = JSON.parse(localStorage.getItem("tech_current_user")) || null;

// ==========================================
// 2. GUARDAR DATOS
// ==========================================

function saveData() {
  localStorage.setItem("tech_products", JSON.stringify(products));
  localStorage.setItem("tech_users", JSON.stringify(users));
  localStorage.setItem("tech_orders", JSON.stringify(orders));
  localStorage.setItem("tech_stock_movements", JSON.stringify(stockMovements));
  localStorage.setItem("tech_sales", JSON.stringify(sales));
  localStorage.setItem("tech_cart", JSON.stringify(cart));
  localStorage.setItem("tech_current_user", JSON.stringify(currentUser));
}

// ==========================================
// 3. FUNCIONES GENERALES
// ==========================================

function formatMoney(amount) {
  return (
    "Bs " +
    Number(amount).toLocaleString("es-BO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function isAdmin() {
  return currentUser && currentUser.role === "admin";
}

function isClient() {
  return currentUser && currentUser.role === "client";
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ==========================================
// NOTIFICACIONES VISUALES
// ==========================================

function showToast(message, type = "success", title = null) {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const settings = {
    success: {
      icon: "✓",
      title: "Operación exitosa",
    },
    error: {
      icon: "✕",
      title: "Ha ocurrido un error",
    },
    warning: {
      icon: "!",
      title: "Advertencia",
    },
    info: {
      icon: "i",
      title: "Información",
    },
  };

  const config = settings[type] || settings.info;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.textContent = config.icon;

  const content = document.createElement("div");
  content.className = "toast-content";

  const heading = document.createElement("div");
  heading.className = "toast-title";
  heading.textContent = title || config.title;

  const description = document.createElement("div");
  description.className = "toast-message";
  description.textContent = message;

  const close = document.createElement("button");
  close.className = "toast-close";
  close.textContent = "×";
  close.setAttribute("aria-label", "Cerrar notificación");

  content.append(heading, description);
  toast.append(icon, content, close);
  container.appendChild(toast);

  let timeout;

  function removeToast() {
    clearTimeout(timeout);

    if (!toast.isConnected) return;

    toast.classList.add("removing");

    setTimeout(() => toast.remove(), 300);
  }

  close.addEventListener("click", removeToast);

  timeout = setTimeout(removeToast, 4000);
}

// ==========================================
// 4. INICIAR APLICACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  updateUserInterface();
  renderProducts();
  renderCart();
  renderMyOrders();
  renderAccount();

  configureSearch();
  configureAuthentication();

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.querySelector(".navbar")?.classList.toggle("show");
  });

  if (isAdmin()) {
    renderDashboard();
  }
});

// ==========================================
// 5. NAVEGACIÓN
// ==========================================

function showSection(sectionId) {
  const adminSections = [
    "dashboard",
    "productos-admin",
    "inventario",
    "reponer-stock",
    "pedidos-admin",
    "ventas",
    "reportes",
    "clientes",
  ];

  const clientSections = ["carrito", "mis-pedidos", "mi-cuenta"];

  if (adminSections.includes(sectionId) && !isAdmin()) {
    showToast("No tienes permisos para acceder a esta sección.");
    return;
  }

  if (clientSections.includes(sectionId) && !currentUser) {
    showToast("Debes iniciar sesión para continuar.");
    openLogin();
    return;
  }

  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  const selectedSection = document.getElementById(sectionId);

  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  document.querySelector(".navbar")?.classList.remove("show");

  switch (sectionId) {
    case "productos":
      renderProducts();
      break;

    case "carrito":
      renderCart();
      break;

    case "mis-pedidos":
      renderMyOrders();
      break;

    case "mi-cuenta":
      renderAccount();
      break;

    case "dashboard":
      renderDashboard();
      break;

    case "productos-admin":
      renderAdminProducts();
      break;

    case "inventario":
      renderInventory();
      break;

    case "reponer-stock":
      renderStock();
      break;

    case "pedidos-admin":
      renderAdminOrders();
      break;

    case "ventas":
      renderSales();
      break;

    case "reportes":
      renderReports();
      break;

    case "clientes":
      renderCustomers();
      break;
  }
}

// ==========================================
// 6. INTERFAZ SEGÚN ROL
// ==========================================

function updateUserInterface() {
  const adminMenu = document.getElementById("adminMenu");
  const clientMenu = document.getElementById("clientMenu");

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userName = document.getElementById("userName");

  adminMenu?.classList.add("hidden");
  clientMenu?.classList.add("hidden");

  if (currentUser) {
    loginBtn?.classList.add("hidden");
    logoutBtn?.classList.remove("hidden");

    if (userName) {
      userName.textContent =
        currentUser.name + (isAdmin() ? " (Administrador)" : "");
    }

    if (isAdmin()) {
      adminMenu?.classList.remove("hidden");
    } else {
      clientMenu?.classList.remove("hidden");
    }
  } else {
    loginBtn?.classList.remove("hidden");
    logoutBtn?.classList.add("hidden");

    if (userName) {
      userName.textContent = "";
    }
  }
}

// ==========================================
// 7. INICIO Y CIERRE DE SESIÓN
// ==========================================

function openLogin() {
  document.getElementById("authModal")?.classList.remove("hidden");
  showLoginForm();
}

function closeLogin() {
  document.getElementById("authModal")?.classList.add("hidden");
}

function logout() {
  currentUser = null;
  cart = [];

  saveData();
  updateUserInterface();

  showSection("inicio");

  showToast("Sesión cerrada correctamente.");
}

// ==========================================
// 8. FORMULARIOS DE AUTENTICACIÓN
// ==========================================

function showLoginForm() {
  document.getElementById("loginForm")?.classList.remove("hidden");
  document.getElementById("registerForm")?.classList.add("hidden");
}

function showRegisterForm() {
  document.getElementById("loginForm")?.classList.add("hidden");
  document.getElementById("registerForm")?.classList.remove("hidden");
}

function configureAuthentication() {
  document.getElementById("loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // ACCESO ADMINISTRADOR
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      currentUser = {
        id: 0,
        name: "Administrador",
        email: ADMIN_EMAIL,
        role: "admin",
      };

      saveData();
      updateUserInterface();
      closeLogin();

      renderDashboard();
      showSection("dashboard");

      showToast("Bienvenido al panel de administración.");
      return;
    }

    // ACCESO CLIENTE
    const user = users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    );

    if (!user) {
      showToast("Correo electrónico o contraseña incorrectos.");
      return;
    }

    currentUser = user;

    saveData();
    updateUserInterface();
    closeLogin();

    showSection("inicio");

    showToast("Bienvenido a TechStore, " + user.name);
  });

  document
    .getElementById("registerForm")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        showToast("Este correo está reservado para el administrador.");
        return;
      }

      if (
        users.some((user) => user.email.toLowerCase() === email.toLowerCase())
      ) {
        showToast("Este correo ya está registrado.");
        return;
      }

      if (password.length < 6) {
        showToast("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      const newUser = {
        id: generateId(),
        name,
        email,
        password,
        role: "client",
      };

      users.push(newUser);

      currentUser = newUser;

      saveData();
      updateUserInterface();
      closeLogin();

      showSection("inicio");

      showToast("Cuenta creada correctamente.");
    });
}

// ==========================================
// 9. CATÁLOGO DE PRODUCTOS
// ==========================================

function renderProducts() {
  const container = document.getElementById("productGrid");

  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  container.innerHTML = products
    .map(
      (product) => `

        <article class="product-card">

            <img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
                onerror="this.src='https://placehold.co/500x350?text=TechStore'"
            >

            <div class="product-info">

                <span class="product-category">
                    ${escapeHTML(product.category)}
                </span>

                <h3>${escapeHTML(product.name)}</h3>

                <p>${escapeHTML(product.description)}</p>

                <strong>${formatMoney(product.price)}</strong>

                <p>
                    ${
                      product.stock > 0
                        ? "Stock disponible: " + product.stock
                        : "Producto agotado"
                    }
                </p>

                <button
                    onclick="addToCart(${product.id})"
                    ${product.stock <= 0 ? "disabled" : ""}
                >
                    Agregar al carrito
                </button>

            </div>

        </article>

    `,
    )
    .join("");
}

// ==========================================
// 10. BUSCADOR Y FILTROS
// ==========================================

function configureSearch() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  function filterProducts() {
    const search = searchInput?.value.toLowerCase() || "";
    const category = categoryFilter?.value || "all";

    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    const container = document.getElementById("productGrid");

    if (!container) return;

    container.innerHTML =
      filtered
        .map(
          (product) => `

            <article class="product-card">

                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.src='https://placehold.co/500x350?text=TechStore'"
                >

                <div class="product-info">

                    <span>${escapeHTML(product.category)}</span>

                    <h3>${escapeHTML(product.name)}</h3>

                    <strong>${formatMoney(product.price)}</strong>

                    <p>Stock: ${product.stock}</p>

                    <button
                        onclick="addToCart(${product.id})"
                        ${product.stock <= 0 ? "disabled" : ""}
                    >
                        Agregar al carrito
                    </button>

                </div>

            </article>

        `,
        )
        .join("") || "<p>No se encontraron productos.</p>";
  }

  searchInput?.addEventListener("input", filterProducts);
  categoryFilter?.addEventListener("change", filterProducts);
}

// ==========================================
// 11. CARRITO DE COMPRAS
// ==========================================

function addToCart(productId) {
  if (!currentUser || !isClient()) {
    showToast("Debes iniciar sesión como cliente para comprar.");
    openLogin();
    return;
  }

  const product = products.find((p) => p.id === productId);

  if (!product || product.stock <= 0) {
    showToast("Producto sin stock disponible.");
    return;
  }

  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast("No hay suficiente stock disponible.");
      return;
    }

    existing.quantity++;
  } else {
    cart.push({
      productId,
      quantity: 1,
    });
  }

  saveData();
  renderCart();

  showToast("Producto agregado al carrito.");
}

function renderCart() {
  const container = document.getElementById("cartContainer");

  if (!container) return;

  if (!currentUser || !isClient()) {
    container.innerHTML =
      "<p>Inicia sesión como cliente para consultar tu carrito.</p>";
    return;
  }

  if (cart.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  let total = 0;

  container.innerHTML =
    cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) return "";

        const subtotal = product.price * item.quantity;
        total += subtotal;

        return `

            <div class="cart-item">

                <h3>${escapeHTML(product.name)}</h3>

                <p>Precio: ${formatMoney(product.price)}</p>

                <p>
                    Cantidad:
                    <button onclick="changeQuantity(${product.id}, -1)">-</button>

                    ${item.quantity}

                    <button onclick="changeQuantity(${product.id}, 1)">+</button>
                </p>

                <p>Subtotal: ${formatMoney(subtotal)}</p>

                <button onclick="removeFromCart(${product.id})">
                    Eliminar
                </button>

            </div>

        `;
      })
      .join("") +
    `

        <h3>Total: ${formatMoney(total)}</h3>

        <button onclick="checkout()">
            Realizar pedido
        </button>

    `;
}

function changeQuantity(productId, amount) {
  const item = cart.find((item) => item.productId === productId);
  const product = products.find((p) => p.id === productId);

  if (!item || !product) return;

  const newQuantity = item.quantity + amount;

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQuantity > product.stock) {
    showToast("Stock insuficiente.");
    return;
  }

  item.quantity = newQuantity;

  saveData();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.productId !== productId);

  saveData();
  renderCart();
}

// ==========================================
// 12. REALIZAR PEDIDO
// ==========================================

function checkout() {
  if (!isClient()) {
    showToast("Debes iniciar sesión como cliente.");
    return;
  }

  if (cart.length === 0) {
    showToast("El carrito está vacío.");
    return;
  }

  // Verificar stock
  for (const item of cart) {
    const product = products.find((p) => p.id === item.productId);

    if (!product || product.stock < item.quantity) {
      showToast("Stock insuficiente para uno de los productos.");
      return;
    }
  }

  let total = 0;

  const orderProducts = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);

    total += product.price * item.quantity;

    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
    };
  });

  const newOrder = {
    id: generateId(),
    userId: currentUser.id,
    customerName: currentUser.name,
    customerEmail: currentUser.email,
    products: orderProducts,
    total,
    status: "Pendiente",
    date: new Date().toISOString(),
  };

  orders.push(newOrder);

  // Descontar existencias al confirmar el pedido
  orderProducts.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);

    product.stock -= item.quantity;
  });

  cart = [];

  saveData();

  renderCart();
  renderProducts();
  renderMyOrders();

  showToast("Pedido realizado correctamente. Número: " + newOrder.id);

  showSection("mis-pedidos");
}

// ==========================================
// 13. PEDIDOS DEL CLIENTE
// ==========================================

function renderMyOrders() {
  const container = document.getElementById("myOrdersContainer");

  if (!container) return;

  if (!isClient()) {
    container.innerHTML = "<p>Inicia sesión como cliente.</p>";
    return;
  }

  const myOrders = orders.filter((order) => order.userId === currentUser.id);

  if (myOrders.length === 0) {
    container.innerHTML = "<p>Aún no tienes pedidos.</p>";
    return;
  }

  container.innerHTML = myOrders
    .map(
      (order) => `

        <div class="order-card">

            <h3>Pedido #${order.id}</h3>

            <p>Fecha: ${new Date(order.date).toLocaleString("es-BO")}</p>

            <p>Estado: <strong>${escapeHTML(order.status)}</strong></p>

            <p>Total: ${formatMoney(order.total)}</p>

            <ul>
                ${order.products
                  .map(
                    (item) => `
                    <li>
                        ${escapeHTML(item.name)} -
                        ${item.quantity} unidades
                    </li>
                `,
                  )
                  .join("")}
            </ul>

        </div>

    `,
    )
    .join("");
}

// ==========================================
// 14. CUENTA DEL CLIENTE
// ==========================================

function renderAccount() {
  const container = document.getElementById("accountContainer");

  if (!container) return;

  if (!isClient()) {
    container.innerHTML = "<p>Inicia sesión para ver tu cuenta.</p>";
    return;
  }

  container.innerHTML = `

        <div class="account-card">

            <h3>Información personal</h3>

            <p><strong>Nombre:</strong> ${escapeHTML(currentUser.name)}</p>

            <p><strong>Correo:</strong> ${escapeHTML(currentUser.email)}</p>

            <p><strong>Tipo de cuenta:</strong> Cliente</p>

        </div>

    `;
}

// ==========================================
// 15. DASHBOARD ADMINISTRATIVO
// ==========================================

function renderDashboard() {
  if (!isAdmin()) return;

  const container = document.getElementById("dashboardContainer");

  if (!container) return;

  const totalProducts = products.length;

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pendiente",
  ).length;

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  const lowStock = products.filter((product) => product.stock <= 5).length;

  container.innerHTML = `

        <div class="dashboard-grid">

            <div class="dashboard-card">
                <h3>Productos</h3>
                <strong>${totalProducts}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Unidades en stock</h3>
                <strong>${totalStock}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Pedidos pendientes</h3>
                <strong>${pendingOrders}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Ventas registradas</h3>
                <strong>${formatMoney(totalSales)}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Productos con stock bajo</h3>
                <strong>${lowStock}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Clientes registrados</h3>
                <strong>${users.length}</strong>
            </div>

        </div>

        <h3>showToastas de inventario</h3>

        ${
          products
            .filter((p) => p.stock <= 5)
            .map(
              (p) => `
            <p>
                ⚠️ ${escapeHTML(p.name)} -
                Stock actual: ${p.stock}
            </p>
        `,
            )
            .join("") || "<p>No hay showToastas de stock.</p>"
        }

    `;
}

// ==========================================
// 16. GESTIÓN DE PRODUCTOS
// ==========================================

function renderAdminProducts() {
  if (!isAdmin()) return;

  const container = document.getElementById("adminProductContainer");

  if (!container) return;

  container.innerHTML = `

        <table class="admin-table">

            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>

                ${products
                  .map(
                    (product) => `

                    <tr>

                        <td>${escapeHTML(product.name)}</td>

                        <td>${escapeHTML(product.category)}</td>

                        <td>${formatMoney(product.price)}</td>

                        <td>${product.stock}</td>

                        <td>

                            <button onclick="editProduct(${product.id})">
                                Editar
                            </button>

                            <button onclick="deleteProduct(${product.id})">
                                Eliminar
                            </button>

                        </td>

                    </tr>

                `,
                  )
                  .join("")}

            </tbody>

        </table>

    `;
}

function openProductForm(productId = null) {
  if (!isAdmin()) return;

  const product = products.find((p) => p.id === productId);

  const name = prompt("Nombre del producto:", product?.name || "");

  if (name === null || !name.trim()) return;

  const category = prompt("Categoría:", product?.category || "Procesadores");

  if (category === null || !category.trim()) return;

  const price = Number(prompt("Precio en Bs:", product?.price || ""));

  if (!Number.isFinite(price) || price <= 0) {
    showToast("Precio inválido.");
    return;
  }

  const stock = Number(prompt("Stock inicial:", product?.stock ?? 0));

  if (!Number.isInteger(stock) || stock < 0) {
    showToast("Stock inválido.");
    return;
  }

  const image = prompt(
    "URL de imagen:",
    product?.image || "https://placehold.co/500x350?text=TechStore",
  );

  if (image === null) return;

  const description = prompt("Descripción:", product?.description || "");

  if (description === null) return;

  if (product) {
    product.name = name.trim();
    product.category = category.trim();
    product.price = price;
    product.stock = stock;
    product.image = image.trim();
    product.description = description.trim();
  } else {
    products.push({
      id: generateId(),
      name: name.trim(),
      category: category.trim(),
      price,
      stock,
      image: image.trim(),
      description: description.trim(),
    });
  }

  saveData();

  renderAdminProducts();
  renderProducts();
  renderInventory();
  renderDashboard();

  showToast("Producto guardado correctamente.");
}

function editProduct(productId) {
  openProductForm(productId);
}

function deleteProduct(productId) {
  if (!isAdmin()) return;

  const product = products.find((p) => p.id === productId);

  if (!product) return;

  const confirmed = confirm(
    "¿Deseas eliminar el producto " + product.name + "?",
  );

  if (!confirmed) return;

  products = products.filter((p) => p.id !== productId);

  cart = cart.filter((item) => item.productId !== productId);

  saveData();

  renderAdminProducts();
  renderProducts();
  renderDashboard();

  showToast("Producto eliminado.");
}

// ==========================================
// 17. CONTROL DE INVENTARIO
// ==========================================

function renderInventory() {
  if (!isAdmin()) return;

  const container = document.getElementById("inventoryContainer");

  if (!container) return;

  container.innerHTML = `

        <table class="admin-table">

            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock actual</th>
                    <th>Estado</th>
                </tr>
            </thead>

            <tbody>

                ${products
                  .map(
                    (product) => `

                    <tr>

                        <td>${escapeHTML(product.name)}</td>

                        <td>${escapeHTML(product.category)}</td>

                        <td>${product.stock}</td>

                        <td>
                            ${
                              product.stock <= 0
                                ? "Agotado"
                                : product.stock <= 5
                                  ? "Stock bajo"
                                  : "Disponible"
                            }
                        </td>

                    </tr>

                `,
                  )
                  .join("")}

            </tbody>

        </table>

    `;
}

// ==========================================
// 18. REPONER STOCK
// ==========================================

function renderStock() {
  if (!isAdmin()) return;

  const container = document.getElementById("stockContainer");

  if (!container) return;

  container.innerHTML = `

        <div class="stock-form">

            <h3>Registrar entrada de mercancía</h3>

            <form id="stockForm">

                <label>Seleccionar producto</label>

                <select id="stockProduct" required>

                    <option value="">Seleccionar producto</option>

                    ${products
                      .map(
                        (product) => `
                        <option value="${product.id}">
                            ${escapeHTML(product.name)}
                        </option>
                    `,
                      )
                      .join("")}

                </select>

                <label>Cantidad a ingresar</label>

                <input
                    type="number"
                    id="stockQuantity"
                    min="1"
                    step="1"
                    required
                >

                <label>Observación</label>

                <input
                    type="text"
                    id="stockNote"
                    placeholder="Ej. Compra a proveedor"
                >

                <button type="submit">
                    Registrar reposición
                </button>

            </form>

        </div>

        <h3>Historial de reposiciones</h3>

        <table class="admin-table">

            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Observación</th>
                </tr>
            </thead>

            <tbody>

                ${
                  stockMovements
                    .map(
                      (movement) => `

                    <tr>
                        <td>${new Date(movement.date).toLocaleString("es-BO")}</td>
                        <td>${escapeHTML(movement.productName)}</td>
                        <td>+${movement.quantity}</td>
                        <td>${escapeHTML(movement.note)}</td>
                    </tr>

                `,
                    )
                    .join("") ||
                  `
                    <tr>
                        <td colspan="4">No hay reposiciones registradas.</td>
                    </tr>
                `
                }

            </tbody>

        </table>

    `;

  document.getElementById("stockForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const productId = Number(document.getElementById("stockProduct").value);

    const quantity = Number(document.getElementById("stockQuantity").value);

    const note = document.getElementById("stockNote").value.trim();

    const product = products.find((p) => p.id === productId);

    if (!product || !Number.isInteger(quantity) || quantity <= 0) {
      showToast("Selecciona un producto e ingresa una cantidad válida.");
      return;
    }

    product.stock += quantity;

    stockMovements.unshift({
      id: generateId(),
      productId,
      productName: product.name,
      quantity,
      note: note || "Reposición de stock",
      date: new Date().toISOString(),
    });

    saveData();

    renderStock();
    renderInventory();
    renderProducts();
    renderDashboard();

    showToast("Stock actualizado correctamente.");
  });
}

// ==========================================
// 19. GESTIÓN DE PEDIDOS ADMIN
// ==========================================

function renderAdminOrders() {
  if (!isAdmin()) return;

  const container = document.getElementById("ordersContainer");

  if (!container) return;

  container.innerHTML =
    orders
      .map(
        (order) => `

        <div class="order-card">

            <h3>Pedido #${order.id}</h3>

            <p>Cliente: ${escapeHTML(order.customerName)}</p>

            <p>Correo: ${escapeHTML(order.customerEmail)}</p>

            <p>Fecha: ${new Date(order.date).toLocaleString("es-BO")}</p>

            <p>Total: ${formatMoney(order.total)}</p>

            <p>Estado actual: <strong>${escapeHTML(order.status)}</strong></p>

            <select id="status-${order.id}">

                <option value="Pendiente" ${order.status === "Pendiente" ? "selected" : ""}>
                    Pendiente
                </option>

                <option value="Procesando" ${order.status === "Procesando" ? "selected" : ""}>
                    Procesando
                </option>

                <option value="Enviado" ${order.status === "Enviado" ? "selected" : ""}>
                    Enviado
                </option>

                <option value="Entregado" ${order.status === "Entregado" ? "selected" : ""}>
                    Entregado
                </option>

                <option value="Cancelado" ${order.status === "Cancelado" ? "selected" : ""}>
                    Cancelado
                </option>

            </select>

            <button onclick="updateOrderStatus(${order.id})">
                Actualizar estado
            </button>

            <h4>Productos</h4>

            <ul>
                ${order.products
                  .map(
                    (item) => `
                    <li>
                        ${escapeHTML(item.name)} -
                        ${item.quantity} unidades
                    </li>
                `,
                  )
                  .join("")}
            </ul>

        </div>

    `,
      )
      .join("") || "<p>No hay pedidos registrados.</p>";
}

function updateOrderStatus(orderId) {
  if (!isAdmin()) return;

  const order = orders.find((o) => o.id === orderId);

  if (!order) return;

  const select = document.getElementById("status-" + orderId);

  const newStatus = select.value;

  if (newStatus === "Cancelado" && order.status !== "Cancelado") {
    const confirmed = confirm(
      "¿Cancelar el pedido? Se devolverán las unidades al inventario.",
    );

    if (!confirmed) {
      select.value = order.status;
      return;
    }

    // Devolver stock
    order.products.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);

      if (product) {
        product.stock += item.quantity;
      }
    });

    // Si ya había sido registrado como venta, eliminarla
    sales = sales.filter((sale) => sale.orderId !== order.id);
  }

  if (newStatus === "Entregado" && order.status !== "Entregado") {
    sales.push({
      id: generateId(),
      orderId: order.id,
      customerName: order.customerName,
      total: order.total,
      date: new Date().toISOString(),
    });
  }

  order.status = newStatus;

  saveData();

  renderAdminOrders();
  renderMyOrders();
  renderDashboard();
  renderInventory();
  renderProducts();
  renderSales();

  showToast("Estado del pedido actualizado.");
}

// ==========================================
// 20. REGISTRO DE VENTAS
// ==========================================

function renderSales() {
  if (!isAdmin()) return;

  const container = document.getElementById("salesContainer");

  if (!container) return;

  const total = sales.reduce((sum, sale) => sum + sale.total, 0);

  container.innerHTML = `

        <h3>Total de ventas: ${formatMoney(total)}</h3>

        <table class="admin-table">

            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Total</th>
                </tr>
            </thead>

            <tbody>

                ${
                  sales
                    .map(
                      (sale) => `

                    <tr>
                        <td>${new Date(sale.date).toLocaleString("es-BO")}</td>
                        <td>#${sale.orderId}</td>
                        <td>${escapeHTML(sale.customerName)}</td>
                        <td>${formatMoney(sale.total)}</td>
                    </tr>

                `,
                    )
                    .join("") ||
                  `
                    <tr>
                        <td colspan="4">No hay ventas registradas.</td>
                    </tr>
                `
                }

            </tbody>

        </table>

    `;
}

// ==========================================
// 21. REPORTES
// ==========================================

function renderReports() {
  if (!isAdmin()) return;

  const container = document.getElementById("reportsContainer");

  if (!container) return;

  const totalOrders = orders.length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Entregado",
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelado",
  ).length;

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  const totalUnitsSold = sales.reduce((sum, sale) => {
    const order = orders.find((o) => o.id === sale.orderId);

    if (!order) return sum;

    return (
      sum +
      order.products.reduce(
        (productSum, product) => productSum + product.quantity,
        0,
      )
    );
  }, 0);

  container.innerHTML = `

        <div class="dashboard-grid">

            <div class="dashboard-card">
                <h3>Pedidos totales</h3>
                <strong>${totalOrders}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Pedidos entregados</h3>
                <strong>${deliveredOrders}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Pedidos cancelados</h3>
                <strong>${cancelledOrders}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Ingresos registrados</h3>
                <strong>${formatMoney(totalRevenue)}</strong>
            </div>

            <div class="dashboard-card">
                <h3>Unidades vendidas</h3>
                <strong>${totalUnitsSold}</strong>
            </div>

        </div>

    `;
}

// ==========================================
// 22. CLIENTES REGISTRADOS
// ==========================================

function renderCustomers() {
  if (!isAdmin()) return;

  const container = document.getElementById("customersContainer");

  if (!container) return;

  container.innerHTML = `

        <table class="admin-table">

            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Correo electrónico</th>
                    <th>Pedidos</th>
                </tr>
            </thead>

            <tbody>

                ${
                  users
                    .map(
                      (user) => `

                    <tr>

                        <td>${escapeHTML(user.name)}</td>

                        <td>${escapeHTML(user.email)}</td>

                        <td>
                            ${
                              orders.filter((order) => order.userId === user.id)
                                .length
                            }
                        </td>

                    </tr>

                `,
                    )
                    .join("") ||
                  `
                    <tr>
                        <td colspan="3">No hay clientes registrados.</td>
                    </tr>
                `
                }

            </tbody>

        </table>

    `;
}

// ==========================================
// 23. EXPONER FUNCIONES PARA HTML
// ==========================================

Object.assign(window, {
  showSection,
  openLogin,
  closeLogin,
  showLoginForm,
  showRegisterForm,
  logout,
  addToCart,
  changeQuantity,
  removeFromCart,
  checkout,
  openProductForm,
  editProduct,
  deleteProduct,
  updateOrderStatus,
});
