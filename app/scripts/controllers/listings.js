import { displayMessage, isBearerTokenValid, isLoggedIn, formatDate } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api/";
    const user = JSON.parse(localStorage.getItem("userData"));
    const addButton = document.getElementById("add-listing");
    const refresh = document.getElementById("refresh");
    const refreshProducerListings = document.getElementById("refreshProducerListings");
    const addListing = document.getElementById("add-listing");
    const producerListings = document.getElementById("producer-listings");

    if (!isLoggedIn()) {
        window.location.href = "../login/";
    }

    // If he's not a producer
    if (user.role !== 2) {
        // Remove the add listing button
        // Hide Producers Listings
        addButton.remove();
        producerListings.remove();
    }

    let listings = await fetchListings();
    let producers = await fetchProducers();
    let energies = await fetchEnergies();
    renderListings(listings, producers, energies);

    // Only load this area if he's a producer
    if (user.role === 2) {
        renderProducerListings(listings, energies, user);
    }

    refresh.addEventListener("click", async () => {
        let listings = await fetchListings();
        let producers = await fetchProducers();
        let energies = await fetchEnergies();
        renderListings(listings, producers, energies);
        console.log("Updated Listings successfully");
    });

    refreshProducerListings.addEventListener("click", async () => {
        let listings = await fetchListings();
        let energies = await fetchEnergies();
        renderProducerListings(listings, energies, user);
        console.log("Updated Producer's Listings successfully");
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

    async function enabledListing(id, enabled, refreshButton) {
        try {
            const endpoint = enabled ? "disable" : "enable";
            await fetch(`${apiUrl}listing/${endpoint}/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                }
            });

            // update ui
            refreshButton.click();
        } catch (error) {
            displayMessage(error.message, "error", "listings-wrapper");
            throw new Error(error.message);
        }
    }

    function renderListings(listings, producers, energies) {
        const wrapper = document.getElementById("listings-wrapper");
        wrapper.innerHTML = "";

        // Only show active listings for non-admin users
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
                listingAmount.innerHTML = `Amount: `;

                const listingPrice = document.createElement("span");
                listingPrice.innerHTML = `${listing.pricePerUnit}€ p/ Unit (${listing.amount} stock)`;

                const listingCreatedAt = document.createElement("span");
                listingCreatedAt.innerHTML = `Creation Date: ${formatDate(new Date(listing.createdAt))}`;

                listingCenter.appendChild(listingEnergy);
                listingCenter.appendChild(listingAmount);
                listingCenter.appendChild(listingPrice);
                listingCenter.appendChild(listingCreatedAt);

                const listingRight = document.createElement("div");
                listingRight.classList.add("flex", "flex-wrap", "align-items-center", "justify-content-center", "gap-1");

                // View Listing Button
                const listingViewBtn = document.createElement("button");
                listingViewBtn.setAttribute("type", "button");
                listingViewBtn.classList.add("button-icon");
                listingViewBtn.addEventListener("click", () => {
                    window.location.href = `viewListing.html?id=${listing.id}`;
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
                    listingEnabledBtn.addEventListener("click", async () => enabledListing(listing.id, listing.enabled, refresh));

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

    function renderProducerListings(listings, energies, user) {
        if (user.role === 2) {
            listings = listings.filter(listing => listing.producerID === user.id);
        }

        const wrapper = document.getElementById("producer-listings-wrapper");
        wrapper.innerHTML = "";

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
                listingProducer.innerHTML = user.username;

                listingLeft.appendChild(listingProducer);

                const listingEnabled = document.createElement("div");
                listingEnabled.setAttribute("data-enabled", listing.enabled);
                listingEnabled.classList.add("user-status");

                listingLeft.appendChild(listingEnabled);

                const listingCenter = document.createElement("div");
                listingCenter.classList.add("flex", "flex-wrap", "gap-05", "flex-direction-column", "flex-grow");

                const listingEnergy = document.createElement("h3");
                for (const energy of energies) {
                    if (energy.id === listing.energyID) {
                        listingEnergy.innerHTML = `${energy.name} (${energy.unit})`;
                    }
                }

                const listingPrice = document.createElement("span");
                listingPrice.innerHTML = `${listing.pricePerUnit}€ p/ Unit (${listing.amount} stock)`;

                const listingCreatedAt = document.createElement("span");
                listingCreatedAt.innerHTML = `Creation Date: ${formatDate(new Date(listing.createdAt))}`;

                listingCenter.appendChild(listingEnergy);
                listingCenter.appendChild(listingPrice);
                listingCenter.appendChild(listingCreatedAt);

                const listingRight = document.createElement("div");
                listingRight.classList.add("flex", "flex-wrap", "align-items-center", "justify-content-center", "gap-1");

                // View Listing Button
                const listingViewBtn = document.createElement("button");
                listingViewBtn.setAttribute("type", "button");
                listingViewBtn.classList.add("button-icon");
                listingViewBtn.addEventListener("click", () => {
                    window.location.href = `viewListing.html?id=${listing.id}`;
                })

                // View Listing Button Icon
                const listingViewBtnIcon = document.createElement("i");
                listingViewBtnIcon.classList.add("fa-regular", "fa-eye");

                // View Listing Button Text
                const listingViewBtnText = document.createElement("span");
                listingViewBtnText.innerHTML = "View";

                listingViewBtn.appendChild(listingViewBtnIcon);
                listingViewBtn.appendChild(listingViewBtnText);

                // If the amount is 0 then the listing is sold
                if (listing.amount != 0) {
                    // Enable/Disable Listing Button
                    const listingEnabledBtn = document.createElement("button");
                    listingEnabledBtn.setAttribute("type", "button");
                    listingEnabledBtn.classList.add("button-icon");
                    listingEnabledBtn.addEventListener("click", async () => enabledListing(listing.id, listing.enabled, refreshProducerListings));

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