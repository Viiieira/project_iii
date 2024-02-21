import { displayMessage, isBearerTokenValid, isLoggedIn, formatDate } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const addButton = document.getElementById("add-listing");
    const user = JSON.parse(localStorage.getItem("userData"));
    const apiUrl = "http://localhost:4242/api/";
    const refresh = document.getElementById("refresh");
    const addListing = document.getElementById("add-listing");

    if (!isLoggedIn()) {
        window.location.href = "../login/";
    }

    // If he's an admin, remove the add listing button
    if (user.role === 1) {
        addButton.classList.add("hidden");
    }

    let listings = await fetchListings();
    let producers = await fetchProducers();
    let energies = await fetchEnergies();
    updateListingsUI(listings, producers, energies);

    refresh.addEventListener("click", async () => {
        let listings = await fetchListings();
        let producers = await fetchProducers();
        let energies = await fetchEnergies();
        updateListingsUI(listings, producers, energies);
        console.log("Updated Listings.");
    });

    addListing.addEventListener("click", async () => {
        window.location.href = "createListing.html";
    })

    async function fetchListings() {
        try {
            const response = await fetch(`${apiUrl}listing/getAll`, {
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
            displayMessage(error.message, "error", "listings-wrapper");
            throw new Error(error.message);
        }
    }

    async function fetchProducers() {
        try {
            const response = await fetch(`${apiUrl}user/getAll`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            })

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }

            const data = await response.json();
            const filteredData = data.filter(entry => entry.roleID === 2);
            return filteredData;
        } catch (error) {
            displayMessage(`${error.message}`, "error", "listings-wrapper");
            throw new Error(error.message);
        }
    }

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
            displayMessage(`${error.message}`, "error", "listings-wrapper");
            throw new Error(error.message);
        }
    }

    async function enabledListing(id, enabled) {
        try {
            const endpoint = enabled ? "disable" : "enable";
            console.log(`${apiUrl}listing/${endpoint}/${id}`);
            await fetch(`${apiUrl}listing/${endpoint}/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            });

            // update ui
            refresh.click();
        } catch (error) {
            displayMessage(error.message, "error", "listings-wrapper");
            throw new Error(error.message);
        }
    }

    function updateListingsUI(listings, producers, energies) {
        const wrapper = document.getElementById("listings-wrapper");
        wrapper.innerHTML = "";

        // Show even disabled listings if the user is an admin
        if (user.role !== 1) {
            listings = listings.filter(listing => listing.enabled);
        }


        if (listings.length > 0) {
            for (const listing of listings) {
                // Only show enabled listings
                const listingItem = document.createElement("div");
                listingItem.classList.add(
                    "listing", "flex", "flex-wrap", "gap-2", "align-items-center", "rounded"
                );

                const listingLeft = document.createElement("div");
                listingLeft.classList.add("flex", "flex-wrap", "flex-direction-column", "gap-05", "justify-content-center", "align-items-center");

                const listingProducer = document.createElement("b");
                for (const producer of producers) {
                    if (producer.id == listing.producerID) {
                        listingProducer.innerHTML = producer.username;
                    }
                }

                listingLeft.appendChild(listingProducer);

                if (user.role === 1) {
                    const listingEnabled = document.createElement("div");
                    listingEnabled.setAttribute("data-enabled", listing.enabled);
                    listingEnabled.classList.add("user-status");

                    listingLeft.appendChild(listingEnabled);
                }

                const listingCenter = document.createElement("div");
                listingCenter.classList.add("flex", "flex-wrap", "gap-05", "flex-direction-column", "flex-grow");

                const listingEnergy = document.createElement("h3");
                const listingAmount = document.createElement("span");
                for (const energy of energies) {
                    if (energy.id === listing.energyID) {
                        listingEnergy.innerHTML = `${energy.name} (${energy.unit})`;
                    }
                }
                listingAmount.innerHTML = `${listing.amount} energies`;

                const listingPrice = document.createElement("span");
                listingPrice.innerHTML = `${listing.pricePerUnit}€`;

                const listingCreatedAt = document.createElement("span");
                listingCreatedAt.innerHTML = `${formatDate(new Date(listing.createdAt))}`;

                listingCenter.appendChild(listingEnergy);
                listingCenter.appendChild(listingAmount);
                listingCenter.appendChild(listingPrice);
                listingCenter.appendChild(listingCreatedAt);

                const listingRight = document.createElement("div");
                listingRight.classList.add("flex", "flex-wrap", "align-items-center", "justify-content-center", "flex-direction-column", "gap-1");

                // View Listing Button
                const listingViewBtn = document.createElement("button");
                listingViewBtn.setAttribute("type", "button");
                listingViewBtn.classList.add("button-icon");
                listingViewBtn.addEventListener("click", () => {
                    window.location.href = `viewListing?id=${listing.id}`;
                })

                // View Listing Button Icon
                const listingViewBtnIcon = document.createElement("i");
                listingViewBtnIcon.classList.add("fa-regular", "fa-eye");

                // View Listing Button Text
                const listingViewBtnText = document.createElement("span");
                listingViewBtnText.innerHTML = "View";

                listingViewBtn.appendChild(listingViewBtnIcon);
                listingViewBtn.appendChild(listingViewBtnText);

                if (user.role === 1) {
                    // Enable/Disable Listing Button
                    const listingEnabledBtn = document.createElement("button");
                    listingEnabledBtn.setAttribute("type", "button");
                    listingEnabledBtn.classList.add("button-icon");
                    listingEnabledBtn.addEventListener("click", async () => enabledListing(listing.id, listing.enabled));

                    // Enable/Disable Listing Button Icon
                    const listingEnabledBtnIcon = document.createElement("i");
                    listingEnabledBtnIcon.classList.add("fa-regular", listing.enabled ? "fa-lock" : "fa-lock-open");

                    // Enable/Disable Listing Button Text
                    const listingEnabledBtnText = document.createElement("span");
                    listingEnabledBtnText.innerHTML = listing.enabled ? "Disable" : "Enable";

                    listingEnabledBtn.appendChild(listingEnabledBtnIcon);
                    listingEnabledBtn.appendChild(listingEnabledBtnText);

                    listingRight.appendChild(listingEnabledBtn);
                }

                listingRight.appendChild(listingViewBtn);

                listingItem.appendChild(listingLeft);
                listingItem.appendChild(listingCenter);
                listingItem.appendChild(listingRight);

                wrapper.appendChild(listingItem);
            }
        } else {
            const span = document.createElement("span");
            span.setAttribute("style", "color: var(--title-color)");
            span.innerHTML = "There are no listings available.";
            wrapper.append(span);
        }
    }
});