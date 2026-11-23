
const message = document.getElementById("message");

const loginPanel = document.getElementById("login-panel");
const registerPanel = document.getElementById("register-panel");

const showRegisterButton = document.getElementById("show-register");
const showLoginButton = document.getElementById("show-login");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

let csrfToken = "";

// ================= CSRF SECURITY =================

async function loadCsrf() {
    const response = await fetch("/api/auth/csrf", {
        credentials: "same-origin",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Could not initialize security token.");
    }

    // Read the original token from the XSRF-TOKEN cookie
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="));

    if (!cookie) {
        throw new Error("CSRF cookie was not found.");
    }

    csrfToken = decodeURIComponent(
        cookie.substring("XSRF-TOKEN=".length)
    );

    if (!csrfToken) {
        throw new Error("CSRF token is empty.");
    }
}

async function authFetch(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();

    const headers = {
        ...(options.headers || {})
    };

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        if (!csrfToken) {
            await loadCsrf();
        }

        headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "same-origin"
    });
}

// ================= MESSAGE =================

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#267a42";
}

function clearMessage() {
    message.textContent = "";
}

// ================= SWITCH PANELS =================

showRegisterButton.addEventListener("click", function () {
    loginPanel.hidden = true;
    registerPanel.hidden = false;
    clearMessage();
});

showLoginButton.addEventListener("click", function () {
    registerPanel.hidden = true;
    loginPanel.hidden = false;
    clearMessage();
});

// ================= REGISTER =================

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessage();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const password = document.getElementById("register-password").value;

    if (!name || !email || !phone || !password) {
        showMessage("Please fill in all fields.", true);
        return;
    }

    if (password.length < 8) {
        showMessage("Password must be at least 8 characters.", true);
        return;
    }

    const submitButton = registerForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Creating Account...";

    try {
        const response = await authFetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                password
            })
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                result?.detail ||
                result?.message ||
                result?.error ||
                "Could not create your account. Please try again."
            );
        }

        await loadCsrf();

        registerForm.reset();

        document.getElementById("login-email").value = email;

        registerPanel.hidden = true;
        loginPanel.hidden = false;

        showMessage(
            "Your account has been created successfully. Please log in."
        );

    } catch (error) {
        console.error("Registration error:", error);
        showMessage(error.message, true);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "CREATE ACCOUNT";
    }
});

// ================= LOGIN =================

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessage();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        showMessage("Please enter your email and password.", true);
        return;
    }

    const submitButton = loginForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    try {
        const response = await authFetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                result?.detail ||
                result?.message ||
                result?.error ||
                "Incorrect email or password."
            );
        }

        if (result?.role !== "CUSTOMER") {
            await authFetch("/api/auth/logout", {
                method: "POST"
            });

            await loadCsrf();

            throw new Error(
                "This page is for customer accounts only."
            );
        }

        await loadCsrf();

        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");

        if (next === "checkout") {
            window.location.href = "/user.html?checkout=1";

        } else if (next === "orders") {
            window.location.href = "/user.html?orders=1";

        } else {
            window.location.href = "/user.html";
        }

    } catch (error) {
        console.error("Login error:", error);
        showMessage(error.message, true);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "LOGIN";
    }
});

// ================= INITIALIZE =================

loadCsrf().catch(error => {
    console.error("CSRF initialization error:", error);
    showMessage(
        "Could not connect securely. Please refresh the page.",
        true
    );
});
