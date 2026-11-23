
const USER_API_URL = "/api/products/menu";

// ================= ELEMENTS =================

const menuProducts = document.getElementById("menu-products");
const categoryButtons = document.getElementById("category-buttons");
const menuMessage = document.getElementById("menu-message");

const openCartBtn = document.getElementById("open-cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

const checkoutOverlay = document.getElementById("checkout-overlay");
const closeCheckoutBtn = document.getElementById("close-checkout-btn");
const checkoutForm = document.getElementById("checkout-form");
const orderTypeSelect = document.getElementById("order-type");
const deliveryAddressGroup = document.getElementById("delivery-address-group");
const deliveryAddressInput = document.getElementById("delivery-address");
const deliveryGovernorateGroup = document.getElementById("delivery-governorate-group");
const deliveryGovernorateSelect = document.getElementById("delivery-governorate");
const checkoutDeliveryFee = document.getElementById("checkout-delivery-fee");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutMessage = document.getElementById("checkout-message");
const placeOrderBtn = document.getElementById("place-order-btn");

const myOrdersButton = document.getElementById("my-orders-btn");
const myOrdersSection = document.getElementById("my-orders-section");
const myOrdersList = document.getElementById("my-orders-list");
const closeMyOrdersButton = document.getElementById("close-my-orders-btn");
// ================= CSRF SECURITY =================


let deliveryAreas = [];

async function loadDeliveryAreas() {
    try {
        const response = await fetch("/api/delivery-areas");

        if (!response.ok) {
            throw new Error("Could not load delivery areas.");
        }

        deliveryAreas = await response.json();

        const selectedGovernorate = deliveryGovernorateSelect.value;

        // Keep the existing placeholder
        deliveryGovernorateSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Select your governorate";
        deliveryGovernorateSelect.appendChild(placeholder);

        // Add active governorates and their current fees
        deliveryAreas.forEach(area => {
            const option = document.createElement("option");

            option.value = area.governorate;
            option.textContent =
                `${area.governorate} - ${Number(area.deliveryFee).toFixed(2)} JOD`;

            deliveryGovernorateSelect.appendChild(option);
        });

        // Keep the previous selection if it is still available
        if (deliveryAreas.some(
            area => area.governorate === selectedGovernorate
        )) {
            deliveryGovernorateSelect.value = selectedGovernorate;
        }

        updateCheckoutTotal();

        return true;

    } catch (error) {
        console.error("Delivery areas error:", error);
        return false;
    }
}

let maisonCsrfToken = "";

async function loadMaisonCsrf() {
    const response = await fetch("/api/auth/csrf", {
        credentials: "same-origin",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Security token could not be loaded");
    }

    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="));

    if (!cookie) {
        throw new Error("CSRF cookie was not found.");
    }

    maisonCsrfToken = decodeURIComponent(
        cookie.substring("XSRF-TOKEN=".length)
    );

    if (!maisonCsrfToken) {
        throw new Error("CSRF token is empty.");
    }
}



async function maisonFetch(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = { ...(options.headers || {}) };

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        if (!maisonCsrfToken) {
            await loadMaisonCsrf();
        }

        headers["X-XSRF-TOKEN"] = maisonCsrfToken;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "same-origin"
    });
}

// ================= CUSTOMER ACCOUNT =================

async function getCurrentMaisonAccount() {
    try {
        const response = await maisonFetch("/api/auth/me");

        if (!response.ok) {
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error("Account verification failed:", error);
        return null;
    }
}

function redirectToCustomerLogin(nextPage) {
    location.href =
        "/customer-login.html?next=" + encodeURIComponent(nextPage);
}

// ================= MY ORDERS =================
// ================= MY ORDERS =================

function formatOrderDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getOrderStatusLabel(status) {
    const labels = {
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        PREPARING: "Preparing",
        READY: "Ready for pickup",
        OUT_FOR_DELIVERY: "On the way",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled"
    };

    return labels[status] || status || "Unknown";
}

function createOrderElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function displayOrderItems(order) {
    const itemsContainer = createOrderElement(
        "div",
        "order-products"
    );

    const items = Array.isArray(order.items) ? order.items : [];

    if (items.length === 0) {
        itemsContainer.appendChild(
            createOrderElement(
                "p",
                "order-no-items",
                "Product details are not available for this order."
            )
        );

        return itemsContainer;
    }

    items.forEach(item => {
        const product = item.product || {};
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const itemTotal = unitPrice * quantity;

        const productRow = createOrderElement(
            "div",
            "order-product"
        );

        const image = document.createElement("img");
        image.className = "order-product-image";
        image.src = product.imageUrl || "";
        image.alt = product.name || "MAISON product";
        image.loading = "lazy";

        image.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/200x200?text=MAISON";
        };

        const info = createOrderElement(
            "div",
            "order-product-info"
        );

        const name = createOrderElement(
            "h4",
            "",
            product.name || "Product"
        );

        const quantityText = createOrderElement(
            "p",
            "",
            `Quantity: ${quantity}`
        );

        const unitText = createOrderElement(
            "p",
            "order-unit-price",
            `${unitPrice.toFixed(2)} JOD each`
        );

        info.append(name, quantityText, unitText);

        const total = createOrderElement(
            "strong",
            "order-product-total",
            `${itemTotal.toFixed(2)} JOD`
        );

        productRow.append(image, info, total);
        itemsContainer.appendChild(productRow);
    });

    return itemsContainer;
}

function createOrderCard(order) {
    const card = createOrderElement(
        "article",
        "my-order-card"
    );

    const header = createOrderElement(
        "div",
        "my-order-card-header"
    );

    const orderInfo = createOrderElement(
        "div",
        "my-order-number"
    );

    orderInfo.append(
        createOrderElement("span", "order-label", "ORDER"),
        createOrderElement("h3", "", `#${order.id}`),
        createOrderElement(
            "p",
            "order-date",
            formatOrderDate(order.createdAt)
        )
    );

    const status = createOrderElement(
        "span",
        `order-status status-${String(order.status || "unknown").toLowerCase()}`,
        getOrderStatusLabel(order.status)
    );

    header.append(orderInfo, status);

    const type = createOrderElement(
        "div",
        "order-type",
        order.orderType === "DELIVERY"
            ? "Delivery Order"
            : "Pickup Order"
    );

    const productsHeading = createOrderElement(
        "h4",
        "order-section-title",
        "Your Items"
    );

    const products = displayOrderItems(order);

    const summary = createOrderElement(
        "div",
        "order-summary"
    );

    const subtotal = Number(order.subtotal);
    const deliveryFee = Number(order.deliveryFee);
    const totalPrice = Number(order.totalPrice);

    if (Number.isFinite(subtotal)) {
        const row = createOrderElement("div", "order-summary-row");
        row.append(
            createOrderElement("span", "", "Subtotal"),
            createOrderElement(
                "strong",
                "",
                `${subtotal.toFixed(2)} JOD`
            )
        );
        summary.appendChild(row);
    }

    if (Number.isFinite(deliveryFee)) {
        const row = createOrderElement("div", "order-summary-row");
        row.append(
            createOrderElement("span", "", "Delivery Fee"),
            createOrderElement(
                "strong",
                "",
                `${deliveryFee.toFixed(2)} JOD`
            )
        );
        summary.appendChild(row);
    }

    const totalRow = createOrderElement(
        "div",
        "order-summary-row order-grand-total"
    );

    totalRow.append(
        createOrderElement("span", "", "Total"),
        createOrderElement(
            "strong",
            "",
            `${(Number.isFinite(totalPrice) ? totalPrice : 0).toFixed(2)} JOD`
        )
    );

    summary.appendChild(totalRow);

    card.append(header, type, productsHeading, products);

    if (order.orderType === "DELIVERY") {
        const addressParts = [
            order.deliveryAddress,
            order.deliveryGovernorate
        ].filter(Boolean);

        if (addressParts.length > 0) {
            card.appendChild(
                createOrderElement(
                    "p",
                    "order-delivery-address",
                    `Delivery address: ${addressParts.join(", ")}`
                )
            );
        }
    }

    card.appendChild(summary);

    if (
        order.status === "READY" ||
        order.status === "OUT_FOR_DELIVERY"
    ) {
        const receivedButton = createOrderElement(
            "button",
            "confirm-receipt-btn",
            "Confirm Receipt"
        );

        receivedButton.type = "button";

        receivedButton.addEventListener("click", async () => {
            const confirmed = confirm(
                "Have you actually received your order?"
            );

            if (!confirmed) return;

            receivedButton.disabled = true;
            receivedButton.textContent = "Confirming...";

            try {
                const result = await maisonFetch(
                    `/api/orders/${order.id}/received`,
                    { method: "PUT" }
                );

                if (result.ok) {
                    alert("Thank you for choosing MAISON!");
                    await loadMyOrders();
                } else {
                    alert("Could not confirm receipt.");
                    receivedButton.disabled = false;
                    receivedButton.textContent = "Confirm Receipt";
                }

            } catch (error) {
                console.error(error);
                alert("Could not confirm receipt.");
                receivedButton.disabled = false;
                receivedButton.textContent = "Confirm Receipt";
            }
        });

        card.appendChild(receivedButton);
    }

    return card;
}

async function loadMyOrders() {
    const account = await getCurrentMaisonAccount();

    if (!account || account.role !== "CUSTOMER") {
        redirectToCustomerLogin("orders");
        return false;
    }

    try {
        const response = await maisonFetch("/api/orders/my");

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                redirectToCustomerLogin("orders");
                return false;
            }

            throw new Error("Could not load your orders.");
        }

        const orders = await response.json();

        myOrdersList.replaceChildren();

        if (!Array.isArray(orders) || orders.length === 0) {
            const empty = createOrderElement(
                "div",
                "empty-orders"
            );

            empty.append(
                createOrderElement("span", "empty-orders-icon", "♡"),
                createOrderElement("h3", "", "No orders yet"),
                createOrderElement(
                    "p",
                    "",
                    "Your next favourite meal is waiting for you."
                )
            );

            myOrdersList.appendChild(empty);
            return true;
        }

        orders.forEach(order => {
            myOrdersList.appendChild(createOrderCard(order));
        });

        return true;

    } catch (error) {
        console.error("My orders error:", error);

        myOrdersList.replaceChildren();
        myOrdersList.appendChild(
            createOrderElement(
                "p",
                "orders-error",
                "Could not load your orders. Please try again."
            )
        );

        return false;
    }
}

function openMyOrders() {
    myOrdersSection.hidden = false;
    myOrdersList.replaceChildren();

    myOrdersList.appendChild(
        createOrderElement(
            "p",
            "orders-loading",
            "Loading your orders..."
        )
    );

    loadMyOrders();
}

function closeMyOrders() {
    myOrdersSection.hidden = true;
}

myOrdersButton?.addEventListener("click", openMyOrders);

closeMyOrdersButton?.addEventListener("click", closeMyOrders);

myOrdersSection?.addEventListener("click", function (event) {
    if (event.target === myOrdersSection) {
        closeMyOrders();
    }
});
// ================= PRODUCTS =================

let allProducts = [];

async function loadUserMenu() {
    menuProducts.innerHTML =
        '<p class="loading-message">Loading our menu...</p>';

    menuMessage.textContent = "";

    try {
        const response = await fetch(USER_API_URL);

        if (!response.ok) {
            throw new Error("Could not load products.");
        }

        const data = await response.json();

        allProducts = data.filter(product =>
            Number(product.stockQuantity) > 0
        );

        displayCategories();
        displayMenuProducts(allProducts);
        displayCart();

    } catch (error) {
        console.error(error);

        menuProducts.innerHTML = "";

        menuMessage.textContent =
            "Sorry, we could not load the menu. Please try again later.";
    }
}

function displayCategories() {
    const categories = [
        ...new Set(
            allProducts
                .map(product => product.category)
                .filter(category =>
                    category && category.trim() !== ""
                )
        )
    ];

    categoryButtons.innerHTML = `
        <button class="category-btn active" data-category="All">
            All
        </button>
    `;

    categories.forEach(category => {
        const button = document.createElement("button");

        button.className = "category-btn";
        button.dataset.category = category;
        button.textContent = category;

        categoryButtons.appendChild(button);
    });
}

function displayMenuProducts(products) {
    menuProducts.innerHTML = "";

    if (products.length === 0) {
        menuProducts.innerHTML =
            '<p class="loading-message">No products available at the moment.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.imageUrl || "";
        image.alt = product.name || "Restaurant product";
        image.loading = "lazy";

        image.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/600x400?text=MAISON";
        };

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name || "Unnamed Product";

        const description = document.createElement("p");
        description.textContent =
            product.description ||
            "Delicious food made with fresh ingredients.";

        const bottom = document.createElement("div");
        bottom.className = "product-bottom";

        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent =
            `${Number(product.price).toFixed(2)} JOD`;

        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.category || "";

        const addButton = document.createElement("button");
        addButton.className = "add-to-cart-btn";
        addButton.textContent = "Add to Cart";
        addButton.type = "button";

        addButton.addEventListener("click", () => {
            addToCart(product.id);
        });

        bottom.append(price, category);
        info.append(name, description, bottom, addButton);
        card.append(image, info);

        menuProducts.appendChild(card);
    });
}

categoryButtons.addEventListener("click", function (event) {
    const button = event.target.closest(".category-btn");

    if (!button) return;

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    const selectedCategory = button.dataset.category;

    if (selectedCategory === "All") {
        displayMenuProducts(allProducts);
    } else {
        const filteredProducts = allProducts.filter(product =>
            product.category === selectedCategory
        );

        displayMenuProducts(filteredProducts);
    }
});

// ================= SHOPPING CART =================

let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem("maisonCart") || "[]"
    );

    cart = Array.isArray(savedCart) ? savedCart : [];

} catch {
    cart = [];
}

function saveCart() {
    localStorage.setItem("maisonCart", JSON.stringify(cart));
}

function openCart() {
    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
}

function closeCart() {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeCart();
        checkoutOverlay.classList.remove("active");
        closeMyOrders();
    }
});

function addToCart(productId) {
    const product = allProducts.find(
        item => String(item.id) === String(productId)
    );

    if (!product) {
        alert("This product is currently unavailable.");
        return;
    }

    const existingItem = cart.find(
        item => String(item.productId) === String(productId)
    );

    if (existingItem) {
        if (existingItem.quantity >= Number(product.stockQuantity)) {
            alert("Sorry, there is not enough stock available.");
            return;
        }

        existingItem.quantity++;

    } else {
        cart.push({
            productId: product.id,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
    openCart();
}

function displayCart() {
    cartItemsContainer.innerHTML = "";

    let total = 0;
    let totalQuantity = 0;

    cart = cart.filter(item => {
        const product = allProducts.find(
            p => String(p.id) === String(item.productId)
        );

        return product && Number(product.stockQuantity) > 0;
    });

    cart.forEach(item => {
        const product = allProducts.find(
            p => String(p.id) === String(item.productId)
        );

        if (!product) return;

        const quantity = Math.max(
            1,
            Math.min(
                Number(item.quantity) || 1,
                Number(product.stockQuantity)
            )
        );

        item.quantity = quantity;

        const itemTotal = Number(product.price) * quantity;

        total += itemTotal;
        totalQuantity += quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        const image = document.createElement("img");
        image.src = product.imageUrl || "";
        image.alt = product.name;

        image.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/200x200?text=MAISON";
        };

        const info = document.createElement("div");
        info.className = "cart-item-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "cart-item-price";
        price.textContent = `${itemTotal.toFixed(2)} JOD`;

        const controls = document.createElement("div");
        controls.className = "cart-item-controls";

        const decreaseBtn = document.createElement("button");
        decreaseBtn.type = "button";
        decreaseBtn.className = "quantity-btn";
        decreaseBtn.textContent = "−";
        decreaseBtn.dataset.action = "decrease";
        decreaseBtn.dataset.id = product.id;

        const quantityText = document.createElement("span");
        quantityText.textContent = quantity;

        const increaseBtn = document.createElement("button");
        increaseBtn.type = "button";
        increaseBtn.className = "quantity-btn";
        increaseBtn.textContent = "+";
        increaseBtn.dataset.action = "increase";
        increaseBtn.dataset.id = product.id;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-cart-item";
        removeBtn.textContent = "Remove";
        removeBtn.dataset.action = "remove";
        removeBtn.dataset.id = product.id;

        controls.append(
            decreaseBtn,
            quantityText,
            increaseBtn,
            removeBtn
        );

        info.append(name, price, controls);
        cartItem.append(image, info);

        cartItemsContainer.appendChild(cartItem);
    });

    if (cart.length === 0) {
        cartItemsContainer.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';
    }

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = `${total.toFixed(2)} JOD`;

    checkoutBtn.disabled = cart.length === 0;

    saveCart();
}

cartItemsContainer.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const productId = button.dataset.id;
    const action = button.dataset.action;

    const item = cart.find(
        cartItem => String(cartItem.productId) === String(productId)
    );

    if (!item) return;

    const product = allProducts.find(
        p => String(p.id) === String(productId)
    );

    if (action === "increase" && product) {
        if (item.quantity >= Number(product.stockQuantity)) {
            alert("Sorry, there is not enough stock available.");
            return;
        }

        item.quantity++;
    }

    if (action === "decrease") {
        item.quantity--;

        if (item.quantity <= 0) {
            cart = cart.filter(
                cartItem =>
                    String(cartItem.productId) !== String(productId)
            );
        }
    }

    if (action === "remove") {
        cart = cart.filter(
            cartItem =>
                String(cartItem.productId) !== String(productId)
        );
    }

    saveCart();
    displayCart();
});

// ================= CHECKOUT =================


function getDeliveryFee() {
    if (orderTypeSelect.value !== "DELIVERY") {
        return 0;
    }

    const governorate = deliveryGovernorateSelect.value;

    const area = deliveryAreas.find(
        area => area.governorate === governorate
    );

    if (!area || !area.active) {
        return 0;
    }

    return Number(area.deliveryFee);
}


// Proceed to Checkout: login first

checkoutBtn.addEventListener("click", async function () {
    if (cart.length === 0) return;

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Checking account...";

    try {
        const account = await getCurrentMaisonAccount();

        if (!account || account.role !== "CUSTOMER") {
            redirectToCustomerLogin("checkout");
            return;
        }

        const areasLoaded = await loadDeliveryAreas();

        if (!areasLoaded) {
            alert("Could not load delivery areas. Please try again.");
            return;
        }
        closeCart();

        checkoutMessage.textContent = "";
        checkoutMessage.className = "checkout-message";

        updateDeliveryFields();

        checkoutOverlay.classList.add("active");

    } catch (error) {
        console.error(error);
        alert("Could not verify your account. Please try again.");

    } finally {
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.textContent = "Proceed to Checkout";
    }
});

// Close Checkout

closeCheckoutBtn.addEventListener("click", function () {
    checkoutOverlay.classList.remove("active");
});

checkoutOverlay.addEventListener("click", function (event) {
    if (event.target === checkoutOverlay) {
        checkoutOverlay.classList.remove("active");
    }
});

// Show delivery fields depending on order type

function updateDeliveryFields() {
    const isDelivery = orderTypeSelect.value === "DELIVERY";

    deliveryAddressGroup.style.display =
        isDelivery ? "block" : "none";

    deliveryGovernorateGroup.style.display =
        isDelivery ? "block" : "none";

    deliveryAddressInput.required = isDelivery;
    deliveryGovernorateSelect.required = isDelivery;

    if (!isDelivery) {
        deliveryAddressInput.value = "";
        deliveryGovernorateSelect.value = "";
    }

    updateCheckoutTotal();
}

orderTypeSelect.addEventListener("change", updateDeliveryFields);

deliveryGovernorateSelect.addEventListener(
    "change",
    updateCheckoutTotal
);

function updateCheckoutTotal() {
    const subtotal = cart.reduce((total, item) => {
        const product = allProducts.find(
            p => String(p.id) === String(item.productId)
        );

        if (!product) return total;

        return total +
            Number(product.price) * Number(item.quantity);
    }, 0);

    const deliveryFee = getDeliveryFee();
    const total = subtotal + deliveryFee;

    checkoutDeliveryFee.textContent =
        `${deliveryFee.toFixed(2)} JOD`;

    checkoutTotal.textContent =
        `${total.toFixed(2)} JOD`;
}

// Submit Order

checkoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (cart.length === 0) {
        checkoutMessage.textContent = "Your cart is empty.";
        checkoutMessage.className = "checkout-message error";
        return;
    }

    // Verify customer login again before placing the order
    const account = await getCurrentMaisonAccount();

    if (!account || account.role !== "CUSTOMER") {
        checkoutOverlay.classList.remove("active");
        redirectToCustomerLogin("checkout");
        return;
    }

    const orderType = orderTypeSelect.value;
    const deliveryAddress = deliveryAddressInput.value.trim();
    const deliveryGovernorate = deliveryGovernorateSelect.value;

    if (orderType === "DELIVERY" && !deliveryAddress) {
        checkoutMessage.textContent =
            "Please enter your delivery address.";
        checkoutMessage.className = "checkout-message error";
        return;
    }

    if (orderType === "DELIVERY" && !deliveryGovernorate) {
        checkoutMessage.textContent =
            "Please select your delivery governorate.";
        checkoutMessage.className = "checkout-message error";
        return;
    }

    const orderData = {
        orderType,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };

    if (orderType === "DELIVERY") {
        orderData.deliveryAddress = deliveryAddress;
        orderData.deliveryGovernorate = deliveryGovernorate;
    }

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Placing Order...";

    checkoutMessage.textContent = "";
    checkoutMessage.className = "checkout-message";

    try {
        const response = await maisonFetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
           if (response.status === 401) {
               checkoutOverlay.classList.remove("active");
               redirectToCustomerLogin("checkout");
               return;
           }

            throw new Error(
                result?.detail ||
                result?.message ||
                result?.error ||
                "Could not place your order. Please try again."
            );
        }

        // Order created successfully

        cart = [];
        saveCart();
        displayCart();

        checkoutForm.reset();
        updateDeliveryFields();

        checkoutOverlay.classList.remove("active");
        closeCart();

        alert("Thank you! Your order has been placed successfully.");

        await loadUserMenu();

    } catch (error) {
        console.error("Order error:", error);

        checkoutMessage.textContent = error.message;
        checkoutMessage.className = "checkout-message error";

    } finally {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Place Order";
    }
});

// ================= INITIALIZE USER PAGE =================

async function initializeUserPage() {
    await loadUserMenu();

    const params = new URLSearchParams(location.search);

    // Return to Checkout after customer login
    if (params.get("checkout") === "1") {
        const account = await getCurrentMaisonAccount();

        if (account && account.role === "CUSTOMER" && cart.length > 0) {
            updateDeliveryFields();
            checkoutMessage.textContent = "";
            checkoutMessage.className = "checkout-message";
            checkoutOverlay.classList.add("active");
        }
    }

    // Return to My Orders after customer login
   if (params.get("orders") === "1") {
       openMyOrders();
   }

    // Clean the URL after handling the requested destination
    if (params.has("checkout") || params.has("orders")) {
        history.replaceState({}, document.title, "/user.html");
    }
}

initializeUserPage();
