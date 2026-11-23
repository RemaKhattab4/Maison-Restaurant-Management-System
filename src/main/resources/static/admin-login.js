
let csrfToken = "";

async function loadCsrf() {
    const response = await fetch("/api/auth/csrf");

   if (!response.ok) {
       const errorText = await response.text();

       console.error("Login failed:", {
           status: response.status,
           response: errorText
       });

       throw new Error(
           `Login failed (${response.status}): ${errorText || "Unknown error"}`
       );
   }

    csrfToken = (await response.json()).token;
}

document.getElementById("admin-login-form").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const message = document.getElementById("message");

        try {
            if (!csrfToken) {
                await loadCsrf();
            }

            const response = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken
                },
                body: JSON.stringify({
                    email: document.getElementById("admin-email").value,
                    password: document.getElementById("admin-password").value
                })
            });

            if (!response.ok) {
                throw new Error("Incorrect administrator email or password");
            }

            const account = await response.json();

            if (account.role !== "ADMIN") {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "X-XSRF-TOKEN": csrfToken }
                });

                throw new Error("This account is not an administrator");
            }

            location.href = "/index.html";

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";
        }
    }
);

loadCsrf().catch(error => {
    document.getElementById("message").textContent = error.message;
});
