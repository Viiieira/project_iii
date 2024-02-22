import { displayMessage, isBearerTokenValid, isLoggedIn, formatDate } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api/";
    const user = JSON.parse(localStorage.getItem("userData"));
    const goBackBtn = document.getElementById("go-back");
    const energyDropdown = document.getElementById("energyDropdown");
    const submitButton = document.querySelector('button[type="submit"]');

    let energies = await fetchEnergies();
    let preferredEnergies = await fetchPreferredEnergies();

    goBackBtn.addEventListener("click", () => {
        window.location.href = "./";
        return;
    })

    if (!isLoggedIn()) {
        window.location.href = "../login/";
        return;
    }

    // If the user is not a producer
    if (user.role !== 2) {
        window.location.href = "../welcome/";
        return;
    }

    loadEnergyDropdown();

    submitButton.addEventListener("click", async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get the form element
        const form = document.querySelector('form');

        // Create a FormData object from the form
        const formData = new FormData(form);

        // Convert FormData to JSON object
        const formDataJson = {};
        formData.forEach((value, key) => {
            formDataJson[key] = value;
        });

        // Validate form fields
        const energyID = formDataJson['energyID'];
        const amount = formDataJson['amount'];
        const pricePerUnit = formDataJson['pricePerUnit'];

        if (!energyID || !amount || !pricePerUnit) {
            displayMessage("Please fill in all fields.", "error", "add-listing-form");
            return;
        }

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            displayMessage("Please enter a valid amount.", "error", "add-listing-form");
            return;
        }

        if (!/^\d+(\.\d{2})?$/.test(pricePerUnit)) {
            displayMessage("Please enter a valid price (e.g., 12.34).", "error", "add-listing-form");
            return;
        }

        // Log the form data
        console.log(formDataJson);

        // Now you can use formDataJson to submit the form data via AJAX, fetch, etc.
        await createListing(formDataJson);
    });

    async function fetchEnergies() {
        try {
            const response = await fetch(`${apiUrl}energy/getAll`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            })

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }

            return await response.json()
        } catch (error) {
            displayMessage(`${error.message}`, "error", "add-listing-form");
            throw new Error(error.message);
        }
    }

    async function fetchPreferredEnergies() {
        try {
            const response = await fetch(`${apiUrl}user_energy/getByUserId/${user.id}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            })

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }

            return await response.json();
        } catch (error) {
            displayMessage(`${error.message}`, "error", "add-listing-form");
            throw new Error(error.message);
        }
    }

    function loadEnergyDropdown() {
        const disabledOption = document.createElement("option");
        disabledOption.disabled = true;
        disabledOption.selected = true;
        disabledOption.textContent = "---- Preferred Energies ----";
        energyDropdown.appendChild(disabledOption);

        for (const preferredEnergy of preferredEnergies) {
            for (const energy of energies) {
                if (preferredEnergy.userID === user.id && preferredEnergy.energyID === energy.id) {
                    const option = document.createElement("option");
                    option.value = energy.id;
                    option.text = energy.name;
                    energyDropdown.appendChild(option);
                }
            }
        }

        const disabledOption2 = document.createElement("option");
        disabledOption2.disabled = true;
        disabledOption2.textContent = "---- All Energies ----";
        energyDropdown.appendChild(disabledOption2);

        for (const energy of energies) {
            const option = document.createElement("option");
            option.value = energy.id;
            option.text = energy.name;
            energyDropdown.appendChild(option);
        }
    }

    async function createListing(formDataJson) {
        try {
            await fetch(`${apiUrl}listing/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ producerID: user.id, energyID: formDataJson.energyID, amount: formDataJson.amount, pricePerUnit: formDataJson.pricePerUnit }),
            });

            displayMessage("This listing has been successfully created!", "success", "add-listing-form")
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
});