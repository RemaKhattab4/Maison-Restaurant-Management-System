
let adminCsrfToken = "";

// ========================================
// 1. Admin Security
// ========================================

async function loadAdminCsrf() {
    const response = await fetch("/api/auth/csrf", {
        credentials: "same-origin"
    });

    if (!response.ok) {
        throw new Error("Could not load security token");
    }

    const data = await response.json();
    adminCsrfToken = data.token;
}

async function adminFetch(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = { ...(options.headers || {}) };

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        if (!adminCsrfToken) {
            await loadAdminCsrf();
        }

        headers["X-XSRF-TOKEN"] = adminCsrfToken;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "same-origin"
    });
}

async function verifyMaisonAdmin() {
    const response = await adminFetch("/api/auth/me");

    if (!response.ok) {
        location.replace("/admin-login.html");
        return false;
    }

    const account = await response.json();

    if (account.role !== "ADMIN") {
        await adminFetch("/api/auth/logout", {
            method: "POST"
        });

        location.replace("/admin-login.html");
        return false;
    }

    return true;
}

async function logoutMaisonAdmin() {
    try {
        await adminFetch("/api/auth/logout", {
            method: "POST"
        });
    } catch (error) {
        console.error("Logout error:", error);
    }

    location.replace("/admin-login.html");
}


// ========================================
// 2. API URL
// ========================================

const API_URL = "/api/products";


// ========================================
// 3. HTML Elements
// ========================================

// Products
const productsTable = document.getElementById("products-table");
const totalProducts = document.getElementById("total-products");
const totalStock = document.getElementById("total-stock");
const totalCategories = document.getElementById("total-categories");

const productFormSection = document.getElementById("product-form-section");
const productForm = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const productId = document.getElementById("product-id");
const message = document.getElementById("message");

const addProductBtn = document.getElementById("add-product-btn");
const cancelBtn = document.getElementById("cancel-btn");

const productImageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("image-preview");


// Orders
const ordersTable = document.getElementById("orders-table");
const ordersSection = document.getElementById("orders-section");
const ordersLink = document.getElementById("orders-link");
const orderStatusFilter = document.getElementById("order-status-filter");
const ordersMessage = document.getElementById("orders-message");

const orderDetailsModal = document.getElementById("order-details-modal");
const orderDetailsContent = document.getElementById("order-details-content");
const closeOrderModal = document.getElementById("close-order-modal");


// Customer Orders Modal
const customerOrdersModal = document.getElementById("customer-orders-modal");
const customerOrdersContent = document.getElementById("customer-orders-content");
const closeCustomerOrdersModal =
    document.getElementById("close-customer-orders-modal");


// Customers
const customersTable = document.getElementById("customers-table");
const customersSection = document.getElementById("customers-section");
const customersLink = document.getElementById("customers-link");
const customersMessage = document.getElementById("customers-message");


// Inventory
const inventorySection = document.getElementById("inventory-section");
const inventoryLink = document.getElementById("inventory-link");
const inventoryTable = document.getElementById("inventory-table");
const inventoryFilter = document.getElementById("inventory-filter");

const inventoryTotal = document.getElementById("inventory-total");
const inventoryLow = document.getElementById("inventory-low");
const inventoryOut = document.getElementById("inventory-out");


// Sales Reports
const salesSection = document.getElementById("sales-section");
const salesLink = document.getElementById("sales-link");

const salesTotal = document.getElementById("sales-total");
const salesOrders = document.getElementById("sales-orders");
const salesAverage = document.getElementById("sales-average");

const bestSellingTable = document.getElementById("best-selling-table");


// Employees
const employeesSection = document.getElementById("employees-section");
const employeesLink = document.getElementById("employees-link");
const employeesTable = document.getElementById("employees-table");
const employeesMessage = document.getElementById("employees-message");

const addEmployeeBtn = document.getElementById("add-employee-btn");
const employeeFormSection = document.getElementById("employee-form-section");
const employeeForm = document.getElementById("employee-form");
const employeeFormTitle = document.getElementById("employee-form-title");
const cancelEmployeeBtn = document.getElementById("cancel-employee-btn");

const employeeId = document.getElementById("employee-id");
const employeeName = document.getElementById("employee-name");
const employeePhone = document.getElementById("employee-phone");
const employeePosition = document.getElementById("employee-position");
const employeeSalary = document.getElementById("employee-salary");
const employeeHireDate = document.getElementById("employee-hire-date");

// Delivery Areas
const deliveryAreasSection = document.getElementById("delivery-areas-section");
const deliveryAreasLink = document.getElementById("delivery-areas-link");
const deliveryAreasTable = document.getElementById("delivery-areas-table");
const deliveryAreasMessage = document.getElementById("delivery-areas-message");

const addDeliveryAreaBtn = document.getElementById("add-delivery-area-btn");
const deliveryAreaFormSection = document.getElementById("delivery-area-form-section");
const deliveryAreaForm = document.getElementById("delivery-area-form");
const deliveryAreaFormTitle = document.getElementById("delivery-area-form-title");
const cancelDeliveryAreaBtn = document.getElementById("cancel-delivery-area-btn");

const deliveryAreaGovernorate = document.getElementById("delivery-area-governorate");
const deliveryAreaFee = document.getElementById("delivery-area-fee");
// Main Sections
const productsSection = document.getElementById("products-section");
const productsLink = document.getElementById("products-link");


// ========================================
// 4. Global Arrays
// ========================================

let products = [];
let orders = [];
let customers = [];
let inventoryProducts = [];
let employees = [];
let deliveryAreas = [];

// ========================================
// 5. Products - Image Preview
// ========================================

function previewProductImage() {
    const file = productImageInput.files[0];

    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";
    } else {
        imagePreview.src = "";
        imagePreview.style.display = "none";
    }
}

productImageInput.addEventListener("change", previewProductImage);

function resetImagePreview() {
    imagePreview.src = "";
    imagePreview.style.display = "none";
    productImageInput.value = "";
}


// ========================================
// 6. Products - Load Products
// ========================================

async function loadProducts() {
    productsTable.innerHTML =
        '<tr><td colspan="7">Loading products...</td></tr>';

    try {
        const response = await adminFetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load products.");
        }

        products = await response.json();

        displayProducts();
        updateStatistics();

    } catch (error) {
        productsTable.innerHTML =
            '<tr><td colspan="7">Could not load products. Make sure Spring Boot is running.</td></tr>';

        showMessage(
            "Unable to connect to the API. Check that the backend is running.",
            true
        );

        console.error(error);
    }
}


// ========================================
// 7. Products - Display Products
// ========================================

function displayProducts() {
    productsTable.innerHTML = "";

    if (products.length === 0) {
        productsTable.innerHTML =
            '<tr><td colspan="7">No products found.</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = product.id;
        row.appendChild(idCell);

        const imageCell = document.createElement("td");

        if (
            product.imageUrl &&
            product.imageUrl !== "https://example.com/chicken-burger.jpg" &&
            product.imageUrl !== "https://example.com/margherita-pizza.jpg"
        ) {
            const image = document.createElement("img");

            image.src = product.imageUrl;
            image.alt = product.name;
            image.style.width = "55px";
            image.style.height = "55px";
            image.style.objectFit = "cover";
            image.style.borderRadius = "8px";

            imageCell.appendChild(image);
        } else {
            imageCell.textContent = "No image";
        }

        row.appendChild(imageCell);

        const values = [
            product.name,
            product.category,
            Number(product.price).toFixed(2),
            product.stockQuantity
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.style.marginRight = "6px";

        editButton.addEventListener("click", () => {
            editProduct(product.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.background = "#a33d36";

        deleteButton.addEventListener("click", () => {
            deleteProduct(product.id);
        });

        actionsCell.append(editButton, deleteButton);
        row.appendChild(actionsCell);

        productsTable.appendChild(row);
    });
}


// ========================================
// 8. Products - Statistics
// ========================================

function updateStatistics() {
    totalProducts.textContent = products.length;

    const stock = products.reduce(
        (sum, product) => sum + Number(product.stockQuantity || 0),
        0
    );

    totalStock.textContent = stock;

    const categories = new Set(
        products.map(product => product.category).filter(Boolean)
    );

    totalCategories.textContent = categories.size;
}


// ========================================
// 9. General Messages
// ========================================

function showMessage(text, isError = false) {
    message.textContent = text;

    message.style.color = isError
        ? "#a33d36"
        : "#247345";
}

async function getErrorMessage(response) {
    const text = await response.text();

    if (!text) {
        return "The request failed. Please try again.";
    }

    try {
        const data = JSON.parse(text);

        if (typeof data === "string") {
            return data;
        }

        return Object.values(data).join("، ") || text;

    } catch {
        return text;
    }
}


// ========================================
// 10. Products - Upload Image
// ========================================

async function uploadProductImage(file) {
    const formData = new FormData();

    formData.append("image", file);

    const response = await adminFetch("/api/images/upload", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
    }

    const data = await response.json();

    return data.imageUrl;
}


// ========================================
// 11. Products - Add Form
// ========================================

function openAddForm() {
    productForm.reset();
    productId.value = "";

    resetImagePreview();

    formTitle.textContent = "Add New Product";
    productFormSection.hidden = false;

    productFormSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// 12. Products - Edit Product
// ========================================

function editProduct(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    productForm.reset();
    resetImagePreview();

    productId.value = product.id;

    document.getElementById("name").value = product.name;
    document.getElementById("category").value = product.category || "";
    document.getElementById("description").value = product.description || "";
    document.getElementById("price").value = product.price;
    document.getElementById("stockQuantity").value = product.stockQuantity;

    if (
        product.imageUrl &&
        product.imageUrl !== "https://example.com/chicken-burger.jpg" &&
        product.imageUrl !== "https://example.com/margherita-pizza.jpg"
    ) {
        imagePreview.src = product.imageUrl;
        imagePreview.style.display = "block";
    }

    formTitle.textContent = "Edit Product";
    productFormSection.hidden = false;

    productFormSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// 13. Products - Save Product
// ========================================

async function saveProduct(event) {
    event.preventDefault();

    const id = productId.value;

    const existingProduct = id
        ? products.find(item => item.id === Number(id))
        : null;

    const product = {
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        price: Number(document.getElementById("price").value),
        imageUrl: existingProduct?.imageUrl || "",
        stockQuantity: Number(
            document.getElementById("stockQuantity").value
        )
    };

    if (!product.name) {
        showMessage("Product name is required.", true);
        return;
    }

    if (!product.category.trim()) {
        showMessage("Please select a product category.", true);
        return;
    }

    if (!Number.isFinite(product.price) || product.price < 0.01) {
        showMessage("Price must be at least 0.01.", true);
        return;
    }

    if (
        !Number.isInteger(product.stockQuantity) ||
        product.stockQuantity < 0
    ) {
        showMessage(
            "Stock quantity must be a whole number greater than or equal to zero.",
            true
        );
        return;
    }

    try {
        const selectedImage = productImageInput.files[0];

        if (selectedImage) {
            if (!selectedImage.type.startsWith("image/")) {
                showMessage("Please select a valid image.", true);
                return;
            }

            if (selectedImage.size > 5 * 1024 * 1024) {
                showMessage("Image size must not exceed 5 MB.", true);
                return;
            }

            showMessage("Uploading image...");

            product.imageUrl = await uploadProductImage(selectedImage);
        }

        // Use adminFetch so the CSRF token is sent
        const response = await adminFetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? "PUT" : "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(product)
            }
        );

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response);
            throw new Error(errorMessage);
        }

        productForm.reset();
        productId.value = "";

        resetImagePreview();
        productFormSection.hidden = true;

        showMessage(
            id
                ? "Product updated successfully."
                : "Product added successfully."
        );

        await loadProducts();

    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
}


// ========================================
// 14. Products - Delete Product
// ========================================

async function deleteProduct(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
        const response = await adminFetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Could not delete product.");
        }

        showMessage("Product deleted successfully.");

        await loadProducts();

    } catch (error) {
        showMessage("Could not delete the product.", true);
        console.error(error);
    }
}


// Product Form Events
addProductBtn.addEventListener("click", openAddForm);

cancelBtn.addEventListener("click", () => {
    productFormSection.hidden = true;

    productForm.reset();
    productId.value = "";

    resetImagePreview();
});

productForm.addEventListener("submit", saveProduct);


// ========================================
// 15. Orders - Load Orders
// ========================================

async function loadOrders() {
    ordersTable.innerHTML =
        '<tr><td colspan="8">Loading orders...</td></tr>';

    try {
        const response = await adminFetch("/api/orders");

        if (!response.ok) {
            throw new Error("Could not load orders.");
        }

        orders = await response.json();

        displayOrders();

    } catch (error) {
        ordersTable.innerHTML =
            '<tr><td colspan="8">Could not load orders.</td></tr>';

        ordersMessage.textContent =
            "Unable to load orders. Check that the backend is running.";

        ordersMessage.style.color = "#a33d36";

        console.error(error);
    }
}


// ========================================
// 16. Orders - Display Orders
// ========================================

function displayOrders() {
    const selectedStatus = orderStatusFilter.value;

    const filteredOrders = selectedStatus === "ALL"
        ? orders
        : orders.filter(order => order.status === selectedStatus);

    ordersTable.innerHTML = "";

    if (filteredOrders.length === 0) {
        ordersTable.innerHTML =
            '<tr><td colspan="8">No orders found.</td></tr>';
        return;
    }

    filteredOrders.forEach(order => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = order.id;
        row.appendChild(idCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = order.customerName;
        row.appendChild(nameCell);

        const phoneCell = document.createElement("td");
        phoneCell.textContent = order.customerPhone;
        row.appendChild(phoneCell);

        const typeCell = document.createElement("td");
        typeCell.textContent = order.orderType;
        row.appendChild(typeCell);

        const priceCell = document.createElement("td");
        priceCell.textContent =
            Number(order.totalPrice).toFixed(2) + " JOD";
        row.appendChild(priceCell);

        const dateCell = document.createElement("td");
        dateCell.textContent =
            new Date(order.createdAt).toLocaleString();
        row.appendChild(dateCell);

        const statusCell = document.createElement("td");
        statusCell.textContent = order.status;
        row.appendChild(statusCell);

        const actionsCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.textContent = "View";

        viewButton.addEventListener("click", () => {
            viewOrderDetails(order.id);
        });

        actionsCell.appendChild(viewButton);
        row.appendChild(actionsCell);

        ordersTable.appendChild(row);
    });
}


// ========================================
// 17. Orders - View Order Details
// ========================================

function viewOrderDetails(orderId) {
    const order = orders.find(item => item.id === orderId);

    if (!order) return;

    let itemsHTML = "";

    order.items.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>${Number(item.unitPrice).toFixed(2)} JOD</td>
                <td>${(item.quantity * item.unitPrice).toFixed(2)} JOD</td>
            </tr>
        `;
    });

    orderDetailsContent.innerHTML = `
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        <p><strong>Order Type:</strong> ${order.orderType}</p>

        ${
            order.orderType === "DELIVERY"
                ? `<p><strong>Address:</strong> ${order.deliveryAddress || "Not provided"}</p>`
                : ""
        }

        <div class="order-status-section">
            <p>
                <strong>Current Status:</strong>
                <span class="order-status status-${order.status.toLowerCase().replaceAll("_", "-")}">
                    ${order.status}
                </span>
            </p>

            <label for="new-order-status">Update Order Status</label>

            <select id="new-order-status"
                ${order.status === "CANCELLED" ? "disabled" : ""}>

                <option value="PENDING" ${order.status === "PENDING" ? "selected" : ""}>Pending</option>
                <option value="CONFIRMED" ${order.status === "CONFIRMED" ? "selected" : ""}>Confirmed</option>
                <option value="PREPARING" ${order.status === "PREPARING" ? "selected" : ""}>Preparing</option>
                <option value="READY" ${order.status === "READY" ? "selected" : ""}>Ready</option>
                <option value="OUT_FOR_DELIVERY" ${order.status === "OUT_FOR_DELIVERY" ? "selected" : ""}>Out for Delivery</option>
                <option value="COMPLETED" ${order.status === "COMPLETED" ? "selected" : ""}>Completed</option>
                <option value="CANCELLED">Cancelled</option>
            </select>

            <button
                type="button"
                id="update-order-status-btn"
                ${order.status === "CANCELLED" ? "disabled" : ""}>
                Update Status
            </button>
        </div>

        <h3>Ordered Products</h3>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>

                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>

        <h3>Total: ${Number(order.totalPrice).toFixed(2)} JOD</h3>
    `;

    document.getElementById("update-order-status-btn")
        .addEventListener("click", () => {
            updateOrderStatus(order.id);
        });

    orderDetailsModal.hidden = false;
}


// ========================================
// 18. Orders - Update Status
// ========================================

async function updateOrderStatus(orderId) {
    const statusSelect = document.getElementById("new-order-status");
    const newStatus = statusSelect.value;

    try {
        const response = await adminFetch(
            `/api/orders/${orderId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response);
            throw new Error(errorMessage);
        }

        ordersMessage.textContent =
            "Order status updated successfully.";

        ordersMessage.style.color = "#247345";

        await loadOrders();

        viewOrderDetails(orderId);

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}


// Orders Events
orderStatusFilter.addEventListener("change", displayOrders);

closeOrderModal.addEventListener("click", () => {
    orderDetailsModal.hidden = true;
});

closeCustomerOrdersModal.addEventListener("click", () => {
    customerOrdersModal.hidden = true;
});


// ========================================
// 19. Customers - Load Customers
// ========================================

async function loadCustomers() {
    customersTable.innerHTML =
        '<tr><td colspan="5">Loading customers...</td></tr>';

    try {
        const response = await adminFetch("/api/customers");

        if (!response.ok) {
            throw new Error("Could not load customers.");
        }

        customers = await response.json();

        displayCustomers();

    } catch (error) {
        customersTable.innerHTML =
            '<tr><td colspan="5">Could not load customers.</td></tr>';

        customersMessage.textContent =
            "Unable to load customers. Check that the backend is running.";

        customersMessage.style.color = "#a33d36";

        console.error(error);
    }
}


// ========================================
// 20. Customers - Display Customers
// ========================================

function displayCustomers() {
    customersTable.innerHTML = "";

    if (customers.length === 0) {
        customersTable.innerHTML =
            '<tr><td colspan="5">No customers found.</td></tr>';
        return;
    }

    customers.forEach(customer => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = customer.customerName;
        row.appendChild(nameCell);

        const phoneCell = document.createElement("td");
        phoneCell.textContent = customer.customerPhone;
        row.appendChild(phoneCell);

        const ordersCell = document.createElement("td");
        ordersCell.textContent = customer.totalOrders;
        row.appendChild(ordersCell);

        const spentCell = document.createElement("td");
        spentCell.textContent =
            Number(customer.totalSpent).toFixed(2) + " JOD";
        row.appendChild(spentCell);

        const actionsCell = document.createElement("td");

        const viewOrdersButton = document.createElement("button");
        viewOrdersButton.textContent = "View Orders";

        viewOrdersButton.addEventListener("click", () => {
            viewCustomerOrders(customer.customerPhone);
        });

        actionsCell.appendChild(viewOrdersButton);
        row.appendChild(actionsCell);

        customersTable.appendChild(row);
    });
}


// ========================================
// 21. Customers - View Customer Orders
// ========================================

async function viewCustomerOrders(customerPhone) {
    customerOrdersContent.innerHTML = "Loading customer orders...";
    customerOrdersModal.hidden = false;

    try {
        const response = await adminFetch("/api/orders");

        if (!response.ok) {
            throw new Error("Could not load orders.");
        }

        const allOrders = await response.json();

        const customerOrders = allOrders.filter(order =>
            order.customerPhone === customerPhone
        );

        if (customerOrders.length === 0) {
            customerOrdersContent.innerHTML =
                "<p>No orders found for this customer.</p>";
            return;
        }

        const customer = customers.find(
            item => item.customerPhone === customerPhone
        );

        let ordersHTML = "";

        customerOrders.forEach(order => {
            ordersHTML += `
                <div class="customer-order-card">
                    <h3>Order #${order.id}</h3>

                    <p><strong>Order Type:</strong> ${order.orderType}</p>

                    <p>
                        <strong>Date:</strong>
                        ${new Date(order.createdAt).toLocaleString()}
                    </p>

                    <p><strong>Status:</strong> ${order.status}</p>

                    <p>
                        <strong>Total:</strong>
                        ${Number(order.totalPrice).toFixed(2)} JOD
                    </p>

                    <h4>Products</h4>

                    <ul>
                        ${order.items.map(item => `
                            <li>
                                ${item.product.name} -
                                Quantity: ${item.quantity}
                            </li>
                        `).join("")}
                    </ul>
                </div>
            `;
        });

        customerOrdersContent.innerHTML = `
            <h3>${customer?.customerName || "Customer"}</h3>

            <p>
                <strong>Phone:</strong>
                ${customer?.customerPhone || customerPhone}
            </p>

            <hr>

            ${ordersHTML}
        `;

    } catch (error) {
        customerOrdersContent.textContent = error.message;
        console.error(error);
    }
}


// ========================================
// 22. Inventory - Load Inventory
// ========================================

async function loadInventory() {
    inventoryTable.innerHTML =
        '<tr><td colspan="5">Loading inventory...</td></tr>';

    try {
        const response = await adminFetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load inventory.");
        }

        inventoryProducts = await response.json();

        updateInventoryStatistics();
        displayInventory();

    } catch (error) {
        inventoryTable.innerHTML =
            '<tr><td colspan="5">Could not load inventory.</td></tr>';

        console.error(error);
    }
}


// ========================================
// 23. Inventory - Statistics
// ========================================

function updateInventoryStatistics() {
    inventoryTotal.textContent = inventoryProducts.length;

    inventoryLow.textContent = inventoryProducts.filter(
        product =>
            product.stockQuantity > 0 &&
            product.stockQuantity <= 5
    ).length;

    inventoryOut.textContent = inventoryProducts.filter(
        product => product.stockQuantity === 0
    ).length;
}


// ========================================
// 24. Inventory - Display Inventory
// ========================================

function displayInventory() {
    inventoryTable.innerHTML = "";

    const selectedFilter = inventoryFilter.value;

    const filteredProducts = inventoryProducts.filter(product => {
        if (selectedFilter === "AVAILABLE") {
            return product.stockQuantity > 5;
        }

        if (selectedFilter === "LOW") {
            return product.stockQuantity > 0 &&
                product.stockQuantity <= 5;
        }

        if (selectedFilter === "OUT") {
            return product.stockQuantity === 0;
        }

        return true;
    });

    if (filteredProducts.length === 0) {
        inventoryTable.innerHTML =
            '<tr><td colspan="5">No products found.</td></tr>';
        return;
    }

    filteredProducts.forEach(product => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = product.category;

        const priceCell = document.createElement("td");
        priceCell.textContent =
            Number(product.price).toFixed(2) + " JOD";

        const quantityCell = document.createElement("td");
        quantityCell.textContent = product.stockQuantity;

        const statusCell = document.createElement("td");

        let status;

        if (product.stockQuantity === 0) {
            status = "Out of Stock";
        } else if (product.stockQuantity <= 5) {
            status = "Low Stock";
        } else {
            status = "Available";
        }

        const statusBadge = document.createElement("span");

        statusBadge.textContent = status;

        statusBadge.className =
            "inventory-status " +
            status.toLowerCase().replaceAll(" ", "-");

        statusCell.appendChild(statusBadge);

        row.append(
            nameCell,
            categoryCell,
            priceCell,
            quantityCell,
            statusCell
        );

        inventoryTable.appendChild(row);
    });
}


// Inventory Filter Event
inventoryFilter.addEventListener("change", displayInventory);


// ========================================
// 25. Sales Reports - Load Reports
// ========================================

async function loadSalesReports() {
    bestSellingTable.innerHTML =
        '<tr><td colspan="3">Loading reports...</td></tr>';

    try {
        const response = await adminFetch("/api/orders");

        if (!response.ok) {
            throw new Error("Could not load sales reports.");
        }

        const allOrders = await response.json();

        const completedOrders = allOrders.filter(
            order => order.status === "COMPLETED"
        );

        const total = completedOrders.reduce(
            (sum, order) => sum + Number(order.totalPrice),
            0
        );

        const count = completedOrders.length;

        const average = count > 0
            ? total / count
            : 0;

        salesTotal.textContent = total.toFixed(2) + " JOD";
        salesOrders.textContent = count;
        salesAverage.textContent = average.toFixed(2) + " JOD";

        displayBestSellingProducts(completedOrders);

    } catch (error) {
        bestSellingTable.innerHTML =
            '<tr><td colspan="3">Could not load reports.</td></tr>';

        console.error(error);
    }
}


// ========================================
// 26. Sales Reports - Best Selling Products
// ========================================

function displayBestSellingProducts(completedOrders) {
    bestSellingTable.innerHTML = "";

    const productSales = {};

    completedOrders.forEach(order => {
        order.items.forEach(item => {
            const productId = item.product.id;

            if (!productSales[productId]) {
                productSales[productId] = {
                    name: item.product.name,
                    quantity: 0,
                    revenue: 0
                };
            }

            productSales[productId].quantity += item.quantity;

            productSales[productId].revenue +=
                item.quantity * Number(item.unitPrice);
        });
    });

    const bestSelling = Object.values(productSales).sort(
        (a, b) => b.quantity - a.quantity
    );

    if (bestSelling.length === 0) {
        bestSellingTable.innerHTML =
            '<tr><td colspan="3">No completed sales yet.</td></tr>';
        return;
    }

    bestSelling.forEach(product => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = product.quantity;

        const revenueCell = document.createElement("td");
        revenueCell.textContent =
            product.revenue.toFixed(2) + " JOD";

        row.append(
            nameCell,
            quantityCell,
            revenueCell
        );

        bestSellingTable.appendChild(row);
    });
}


// ========================================
// 27. Employees - Load Employees
// ========================================

async function loadEmployees() {
    employeesTable.innerHTML =
        '<tr><td colspan="7">Loading employees...</td></tr>';

    try {
        const response = await adminFetch("/api/employees");

        if (!response.ok) {
            throw new Error("Failed to load employees.");
        }

        employees = await response.json();

        displayEmployees();

    } catch (error) {
        employeesTable.innerHTML =
            '<tr><td colspan="7">Could not load employees.</td></tr>';

        employeesMessage.textContent =
            "Error loading employees. Check that the backend is running.";

        console.error(error);
    }
}


// ========================================
// 28. Employees - Display Employees
// ========================================

function displayEmployees() {
    employeesTable.innerHTML = "";

    if (employees.length === 0) {
        employeesTable.innerHTML = `
            <tr>
                <td colspan="7">No employees found.</td>
            </tr>
        `;
        return;
    }

    employees.forEach(employee => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.fullName}</td>
            <td>${employee.phone}</td>
            <td>${employee.position}</td>
            <td>${Number(employee.salary).toFixed(2)}</td>
            <td>${employee.hireDate}</td>
            <td>
                <button class="edit-employee-btn">Edit</button>
                <button class="delete-employee-btn">Delete</button>
            </td>
        `;

        row.querySelector(".edit-employee-btn")
            .addEventListener("click", () => {
                editEmployee(employee.id);
            });

        row.querySelector(".delete-employee-btn")
            .addEventListener("click", () => {
                deleteEmployee(employee.id);
            });

        employeesTable.appendChild(row);
    });
}


// ========================================
// 29. Employees - Add Employee Form
// ========================================

addEmployeeBtn.addEventListener("click", () => {
    employeeForm.reset();

    employeeId.value = "";
    employeeFormTitle.textContent = "Add New Employee";
    employeeFormSection.hidden = false;

    employeesMessage.textContent = "";
});


// ========================================
// 30. Employees - Cancel Form
// ========================================

cancelEmployeeBtn.addEventListener("click", () => {
    employeeForm.reset();

    employeeId.value = "";
    employeeFormSection.hidden = true;
});


// ========================================
// 31. Employees - Save Employee
// ========================================

employeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = employeeId.value;

    const employeeData = {
        fullName: employeeName.value.trim(),
        phone: employeePhone.value.trim(),
        position: employeePosition.value.trim(),
        salary: Number(employeeSalary.value),
        hireDate: employeeHireDate.value
    };

    if (
        !employeeData.fullName ||
        !employeeData.phone ||
        !employeeData.position ||
        employeeSalary.value === "" ||
        !employeeData.hireDate ||
        !Number.isFinite(employeeData.salary) ||
        employeeData.salary < 0
    ) {
        employeesMessage.textContent =
            "Please enter valid employee information.";
        return;
    }

    try {
        const response = await adminFetch(
            id
                ? `/api/employees/${id}`
                : "/api/employees",
            {
                method: id ? "PUT" : "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(employeeData)
            }
        );

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response);
            throw new Error(errorMessage);
        }

        employeeForm.reset();
        employeeId.value = "";
        employeeFormSection.hidden = true;

        employeesMessage.textContent = id
            ? "Employee updated successfully."
            : "Employee added successfully.";

        await loadEmployees();

    } catch (error) {
        employeesMessage.textContent = error.message;
        console.error(error);
    }
});


// ========================================
// 32. Employees - Edit Employee
// ========================================

function editEmployee(id) {
    const employee = employees.find(item => item.id === id);

    if (!employee) return;

    employeeId.value = employee.id;
    employeeName.value = employee.fullName;
    employeePhone.value = employee.phone;
    employeePosition.value = employee.position;
    employeeSalary.value = employee.salary;
    employeeHireDate.value = employee.hireDate;

    employeeFormTitle.textContent = "Edit Employee";
    employeeFormSection.hidden = false;

    employeesMessage.textContent = "";
}


// ========================================
// 33. Employees - Delete Employee
// ========================================

async function deleteEmployee(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
        const response = await adminFetch(`/api/employees/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Could not delete employee.");
        }

        employeesMessage.textContent =
            "Employee deleted successfully.";

        await loadEmployees();

    } catch (error) {
        employeesMessage.textContent =
            "Error deleting employee.";

        console.error(error);
    }
}

// ========================================
// Delivery Areas - Load Delivery Areas
// ========================================

async function loadDeliveryAreas() {
    deliveryAreasTable.innerHTML =
        '<tr><td colspan="5">Loading delivery areas...</td></tr>';

    try {
        const response = await adminFetch("/api/admin/delivery-areas");

        if (!response.ok) {
            throw new Error("Could not load delivery areas.");
        }

        deliveryAreas = await response.json();

        displayDeliveryAreas();

    } catch (error) {
        deliveryAreasTable.innerHTML =
            '<tr><td colspan="5">Could not load delivery areas.</td></tr>';

        deliveryAreasMessage.textContent = error.message;
        deliveryAreasMessage.style.color = "#a33d36";

        console.error(error);
    }
}


// ========================================
// Delivery Areas - Add Form
// ========================================

addDeliveryAreaBtn.addEventListener("click", () => {
    deliveryAreaForm.reset();

    deliveryAreaFormTitle.textContent = "Add Governorate";
    deliveryAreaFormSection.hidden = false;

    deliveryAreasMessage.textContent = "";

    deliveryAreaFormSection.scrollIntoView({
        behavior: "smooth"
    });
});


// Cancel Delivery Area Form
cancelDeliveryAreaBtn.addEventListener("click", () => {
    deliveryAreaForm.reset();
    deliveryAreaFormSection.hidden = true;
});


deliveryAreaForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const governorate = deliveryAreaGovernorate.value.trim();
    const deliveryFee = Number(deliveryAreaFee.value);

    if (!governorate) {
        deliveryAreasMessage.textContent =
            "Governorate name is required.";
        deliveryAreasMessage.style.color = "#a33d36";
        return;
    }

    if (
        deliveryAreaFee.value === "" ||
        !Number.isFinite(deliveryFee) ||
        deliveryFee < 0
    ) {
        deliveryAreasMessage.textContent =
            "Please enter a valid delivery fee.";
        deliveryAreasMessage.style.color = "#a33d36";
        return;
    }

    try {
        const response = await adminFetch(
            "/api/admin/delivery-areas",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    governorate: governorate,
                    deliveryFee: deliveryFee
                })
            }
        );

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response);
            throw new Error(errorMessage);
        }

        deliveryAreaForm.reset();
        deliveryAreaFormSection.hidden = true;

        deliveryAreasMessage.textContent =
            "Governorate added successfully.";
        deliveryAreasMessage.style.color = "#247345";

        await loadDeliveryAreas();

    } catch (error) {
        deliveryAreasMessage.textContent = error.message;
        deliveryAreasMessage.style.color = "#a33d36";
        console.error(error);
    }
});

// ========================================
// Delivery Areas - Display Delivery Areas
// ========================================


function displayDeliveryAreas() {
    deliveryAreasTable.innerHTML = "";

    if (deliveryAreas.length === 0) {
        deliveryAreasTable.innerHTML =
            '<tr><td colspan="5">No delivery areas found.</td></tr>';
        return;
    }

    deliveryAreas.forEach(area => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = area.id;

        const governorateCell = document.createElement("td");
        governorateCell.textContent = area.governorate;

        const feeCell = document.createElement("td");
        feeCell.textContent =
            Number(area.deliveryFee).toFixed(2) + " JOD";

        const statusCell = document.createElement("td");
        statusCell.textContent = area.active ? "Active" : "Inactive";

        const actionsCell = document.createElement("td");

        // Edit Fee Button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit Fee";

        editButton.addEventListener("click", () => {
            editDeliveryFee(area.id);
        });

        // Activate / Deactivate Button
        const statusButton = document.createElement("button");
        statusButton.textContent =
            area.active ? "Deactivate" : "Activate";

        statusButton.style.margin = "0 5px";

        statusButton.addEventListener("click", () => {
            toggleDeliveryAreaStatus(area.id);
        });

        // Delete Button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.background = "#a33d36";

        deleteButton.addEventListener("click", () => {
            deleteDeliveryArea(area.id);
        });

        actionsCell.append(
            editButton,
            statusButton,
            deleteButton
        );

        row.append(
            idCell,
            governorateCell,
            feeCell,
            statusCell,
            actionsCell
        );

        deliveryAreasTable.appendChild(row);
    });
}

 // ========================================
 // Delivery Areas - Edit Fee
 // ========================================

async function editDeliveryFee(id) {
    const area = deliveryAreas.find(item => item.id === id);

    if (!area) return;

    const newFee = prompt(
        `Enter new delivery fee for ${area.governorate}:`,
        area.deliveryFee
    );

    if (newFee === null) return;

    if (
        newFee.trim() === "" ||
        !Number.isFinite(Number(newFee)) ||
        Number(newFee) < 0
    ) {
        alert("Please enter a valid delivery fee.");
        return;
    }

    try {
        const response = await adminFetch(
            `/api/admin/delivery-areas/${id}/fee`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    deliveryFee: Number(newFee)
                })
            }
        );

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        deliveryAreasMessage.textContent =
            "Delivery fee updated successfully.";
        deliveryAreasMessage.style.color = "#247345";

        await loadDeliveryAreas();

    } catch (error) {
        deliveryAreasMessage.textContent = error.message;
        deliveryAreasMessage.style.color = "#a33d36";
    }
}


// ========================================
// Delivery Areas - Activate / Deactivate
// ========================================

async function toggleDeliveryAreaStatus(id) {
    const area = deliveryAreas.find(item => item.id === id);

    if (!area) return;

    const newStatus = !area.active;

    const confirmed = confirm(
        `Are you sure you want to ${
            newStatus ? "activate" : "deactivate"
        } ${area.governorate}?`
    );

    if (!confirmed) return;

    try {
        const response = await adminFetch(
            `/api/admin/delivery-areas/${id}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    active: newStatus
                })
            }
        );

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        deliveryAreasMessage.textContent =
            "Governorate status updated successfully.";
        deliveryAreasMessage.style.color = "#247345";

        await loadDeliveryAreas();

    } catch (error) {
        deliveryAreasMessage.textContent = error.message;
        deliveryAreasMessage.style.color = "#a33d36";
    }
}


// ========================================
// Delivery Areas - Delete
// ========================================

async function deleteDeliveryArea(id) {
    const area = deliveryAreas.find(item => item.id === id);

    if (!area) return;

    const confirmed = confirm(
        `Are you sure you want to delete ${area.governorate}?`
    );

    if (!confirmed) return;

    try {
        const response = await adminFetch(
            `/api/admin/delivery-areas/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        deliveryAreasMessage.textContent =
            "Governorate deleted successfully.";
        deliveryAreasMessage.style.color = "#247345";

        await loadDeliveryAreas();

    } catch (error) {
        deliveryAreasMessage.textContent = error.message;
        deliveryAreasMessage.style.color = "#a33d36";
    }
}

// ========================================
// 34. Navigation - All Sections
// ========================================

const pageSections = {
    products: productsSection,
    orders: ordersSection,
    customers: customersSection,
    inventory: inventorySection,
    sales: salesSection,
    employees: employeesSection,
    deliveryAreas: deliveryAreasSection
};

const pageLinks = {
    products: productsLink,
    orders: ordersLink,
    customers: customersLink,
    inventory: inventoryLink,
    sales: salesLink,
    employees: employeesLink,
    deliveryAreas: deliveryAreasLink
};

function showSection(sectionName) {
    if (!pageSections[sectionName] || !pageLinks[sectionName]) {
        return;
    }

    Object.values(pageSections).forEach(section => {
        section.hidden = true;
    });

    Object.values(pageLinks).forEach(link => {
        link.classList.remove("active");
    });

    productFormSection.hidden = true;
    employeeFormSection.hidden = true;

    pageSections[sectionName].hidden = false;
    pageLinks[sectionName].classList.add("active");

    switch (sectionName) {
        case "products":
            loadProducts();
            break;

        case "orders":
            loadOrders();
            break;

        case "customers":
            loadCustomers();
            break;

        case "inventory":
            loadInventory();
            break;

        case "sales":
            loadSalesReports();
            break;

        case "employees":
            loadEmployees();
            break;
         case "deliveryAreas":
             loadDeliveryAreas();
             break;
    }
}


// ========================================
// 35. Navigation Events
// ========================================

productsLink.addEventListener("click", () => {
    showSection("products");
});

ordersLink.addEventListener("click", () => {
    showSection("orders");
});

customersLink.addEventListener("click", () => {
    showSection("customers");
});

inventoryLink.addEventListener("click", () => {
    showSection("inventory");
});

salesLink.addEventListener("click", () => {
    showSection("sales");
});

employeesLink.addEventListener("click", () => {
    showSection("employees");
});
deliveryAreasLink.addEventListener("click", () => {
    showSection("deliveryAreas");
});

// ========================================
// 36. Admin Logout
// ========================================

document.getElementById("admin-logout-btn")?.addEventListener(
    "click",
    logoutMaisonAdmin
);


// ========================================
// 37. Start Application After Admin Verification
// ========================================

async function startAdminApplication() {
    try {
        await loadAdminCsrf();

        const isAdmin = await verifyMaisonAdmin();

        if (!isAdmin) {
            return;
        }

        // Load the products section only after admin verification
        showSection("products");

    } catch (error) {
        console.error("Admin verification failed:", error);
        location.replace("/admin-login.html");
    }
}

startAdminApplication();
