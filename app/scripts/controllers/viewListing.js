import { isBearerTokenValid, isLoggedIn, formatDate } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api/";
    const user = JSON.parse(localStorage.getItem("userData"));
    const goBackBtn = document.getElementById("go-back");
    const logoutButton = document.getElementById('logout');

    goBackBtn.addEventListener("click", () => {
        window.location.href = "./";
        return;
    })

    if (!isLoggedIn()) {
        window.location.href = "../login/";
        return;
    }

    const id = getListingID();
    const listing = await fetchListingById(id);
    const producer = await fetchProducerById(listing.producerID);
    const energy = await fetchEnergyById(listing.energyID);
    renderListing();

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
            console.log(`${apiUrl}user/getByID/${producerID}`);
            const response = await fetch(`${apiUrl}user/getByID/${producerID}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            });

            if (!response.ok) {
                const form = document.getElementById("add-listing-form");
                console.log(form);
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
        console.log(listing);
    }
});