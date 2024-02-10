import { displayMessage, isLoggedIn } from "../../scripts/utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api";
    const form = document.getElementById("register-form");

    if (isLoggedIn()) {
        window.location.href = "../welcome/";
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        const roleID = document.getElementById("roleField").value;
        const username = document.getElementById("usernameField").value;
        const email = document.getElementById("emailField").value;
        const password = document.getElementById("passwordField").value;
        const address = document.getElementById("addressField").value;
        const phone = document.getElementById("phoneField").value;

        try {
            const response = await fetch(`${apiUrl}/user/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ roleID, username, email, password, address, phone }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message;
                displayMessage(`<b>Error:</b> ${errorMessage}`, "error", "register-form");
                throw new Error(`Error: ${errorMessage}`);
            }

            const data = await response.json();

            // Store user data in localStorage
            window.location.href = "../login/?accountCreated=true";
        } catch (error) {
            console.error("Error:", error);
            displayMessage(`<b>Wrong credentials</b>. Try again.`, "error", "login-form");
        }
    });
});