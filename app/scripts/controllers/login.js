import { displayMessage, isLoggedIn } from "../../scripts/utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api";
    const form = document.getElementById("login-form");
    
    if(isLoggedIn()) {
        window.location.href = "../welcome/";
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${apiUrl}/user/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            // Create session
            const userData = {
                id: data.id,
                username: data.username,
                role: data.role,
                token: data.token
            }
            // Store user data in localStorage
            localStorage.setItem("userData", JSON.stringify(userData));
            window.location.href = "../welcome/";
        } catch (error) {
            console.error("Error:", error);
            displayMessage(`<b>Wrong credentials</b>. Try again.`, "error", "login-form");
        }
    });
});