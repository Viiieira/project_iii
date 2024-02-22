import { isBearerTokenValid, isLoggedIn, formatDate, displayMessage } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api/";
    const user = JSON.parse(localStorage.getItem("userData"));
    const goBackBtn = document.getElementById("go-back");
    const logoutButton = document.getElementById('logout');
    const buyEnergiesForm = document.getElementById("buy-energies-form");
    const buyEnergiesBtn = document.getElementById("buy-energies-btn");

    if (!isLoggedIn()) {
        window.location.href = "../login/";
        return;
    }

    goBackBtn.addEventListener("click", () => {
        window.location.href = "./";
        return;
    })

    // All users that are not consumers
    if (user.role !== 3) {
        buyEnergiesForm.remove();
    }

    const id = getListingID();
    const listing = await fetchListingById(id);
    const producer = await fetchProducerById(listing.producerID);
    const energy = await fetchEnergyById(listing.energyID);
    renderListing();
    renderListingBuy();

    buyEnergiesBtn.addEventListener("click", async () => {
        await buyEnergies();
    })

    function getListingID() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id === null || id === undefined) {
            window.location.href = "./";
            id = 0;
        }

        return id;
    }

    async function fetchListingById(id) {
        try {
            const response = await fetch(`${apiUrl}listing/getById/${id}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            });

            if (!isBearerTokenValid(response)) {
                logoutButton.click();
                return;
            }

            if (!response.ok) {
                const form = document.getElementById("add-listing-form");
                form.innerHTML = "There is no listing with this ID";
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function fetchProducerById(producerID) {
        try {
            const response = await fetch(`${apiUrl}user/getByID/${producerID}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            });

            if (!response.ok) {
                const form = document.getElementById("add-listing-form");
                form.innerHTML = "There is no producer with this ID";
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function fetchEnergyById(energyID) {
        try {
            const response = await fetch(`${apiUrl}energy/getById/${energyID}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            });

            if (!isBearerTokenValid(response)) {
                logoutButton.click();
                return;
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    function renderListing() {
        // Fields
        const producerField = document.getElementById("producerField");
        const energyField = document.getElementById("energyField");
        const amountField = document.getElementById("amountField");
        const pricePerUnitField = document.getElementById("pricePerUnitField");
        const creationDateField = document.getElementById("creationDateField");
        const updateDateField = document.getElementById("updateDateField");

        // Update values
        producerField.value = producer.username;
        energyField.value = `${energy.name} (${energy.unit})`;
        amountField.value = `${listing.amount} unit(s)`;
        pricePerUnitField.value = `${listing.pricePerUnit}€`;
        creationDateField.value = `${formatDate(new Date(listing.createdAt))}`;
        updateDateField.value = `${formatDate(new Date(listing.updatedAt))}`;
    }

    function renderListingBuy() {
        const amountFieldBuy = document.getElementById("amountFieldBuy");
        const totalField = document.getElementById("totalField");
        amountFieldBuy.setAttribute("max", listing.amount);

        amountFieldBuy.addEventListener("change", () => {
            const totalValue = listing.pricePerUnit * amountFieldBuy.value;
            totalField.value = `${totalValue.toFixed(2)}`; // Ensure two decimal places
        });
    }

    async function buyEnergies() {
        // Get Amount and Total Price to pay
        const amountFieldBuy = document.getElementById("amountFieldBuy");
        const totalField = document.getElementById("totalField");

        if (amountFieldBuy.value == 0 || amountFieldBuy.value > listing.amount) {
            displayMessage("<b>Input a valid amount.</b>", "error", "buy-energies-form");
            return;
        }

        // Make a transaction to buy the energies
        let transaction = await createTransaction(amountFieldBuy.value);
        // Make a payment for the transaction
        let payment = await createPayment(transaction.id, totalField.value, "mbway")
        console.log(transaction);
    }

    async function createTransaction(amountFieldBuy) {
        try {
            const response = await fetch(`${apiUrl}transaction/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`,
                },
                body: JSON.stringify({ listingID: id, consumerID: user.id, amount: amountFieldBuy })
            });

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function createPayment(transactionID, total, method) {
        try {
            const response = await fetch(`${apiUrl}transaction/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`,
                },
                body: JSON.stringify({ listingID: id, consumerID: user.id, amount: amountFieldBuy })
            });

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

});