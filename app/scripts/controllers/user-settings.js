import {
    displayMessage,
    isLoggedIn,
    isBearerTokenValid,
} from '../utils/utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api";
    const user = JSON.parse(localStorage.getItem("userData"));
    const logoutButton = document.getElementById("logout");
    const energyPreferencesDiv = document.getElementById("energy-preferences");

    if (!isLoggedIn()) {
        window.location.href = "../login/";
    }

    // Hide Energy Preferences if its an admin
    // Since Admins are only there to admin
    // and not to be a producer/consumer
    if (user.role !== 1) {
        energyPreferencesDiv.classList.remove("hidden");

        // Load all the Energy Preferences for Producer/Consumers
        let energies = await fetchEnergies();
        let userEnergyPrefs = await fetchUserEnergyPreferences();
        updateEnergyPrefUI(energies, userEnergyPrefs);

        const refresh = document.getElementById("refresh");
        const save = document.getElementById("save");

        // Remove the save button if there are no energies to be checked
        if (energies.length == 0) {
            save.remove()
        }

        refresh.addEventListener("click", async () => {
            let energies = await fetchEnergies();
            let userEnergyPrefs = await fetchUserEnergyPreferences();
            updateEnergyPrefUI(energies, userEnergyPrefs);
            console.log("Refreshed energy preferences data.");
        })

        save.addEventListener("click", async () => {
            // Get all checked energies
            const tbody = document.querySelector("#user-settings-data tbody");
            const checkedEnergies = Array.from(tbody.querySelectorAll("input[type='checkbox']:checked")).map(checkbox => parseInt(checkbox.name));

            // Get all the User's Energy Preferences (Only the IDs)
            const userEnergyPrefsID = [];
            userEnergyPrefs.forEach((userEnergyPref) => {
                userEnergyPrefsID.push(userEnergyPref.energyID);
            });

            // There were changes made
            if (
                userEnergyPrefsID.length !== checkedEnergies.length
                ||
                userEnergyPrefsID.every((value, index) => value !== checkedEnergies[index])
            ) {
                // See what items need to be removed
                const removedItems = userEnergyPrefsID.filter(item => !checkedEnergies.includes(item));
                if (removedItems.length > 0) {
                    removedItems.forEach(async (energyID) => {
                        await deleteUserEnergyPref(user.id, energyID);
                    });
                }

                // See what items need to be added
                const addedItems = checkedEnergies.filter(item => !userEnergyPrefsID.includes(item));
                if (addedItems.length > 0) {
                    addedItems.forEach(async (energyID) => {
                        await insertUserEnergyPref(user.id, energyID);
                    });
                }

                refresh.click();
                displayMessage("<b>Energy Preferences were updated.</b>", "success", "energy-preferences");
            }
        });
    }

    // My Settings
    let userInfo = await fetchUserInfo();

    const myInfoFormBtn = document.querySelector("#my-settings-form button[type='submit']");

    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let address = document.getElementById("address");
    let phone = document.getElementById("phone");

    // Load user's data
    username.value = userInfo.username;
    email.value = userInfo.email;
    address.value = userInfo.address;
    phone.value = userInfo.phone;

    // Save new user info
    myInfoFormBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        let users = await fetchUsers();

        // Check if this username is already in-use
        if (!isUsernameUnique(users, username.value, user.id)) {
            displayMessage("<b>This Username already exists. Pick another one.</b>", "error", "my-settings-form");
            return;
        }

        // Check if this email is already in-use
        if (!isEmailUnique(users, email.value, user.id)) {
            displayMessage("<b>This E-mail already exists. Pick another one.</b>", "error", "my-settings-form");
            return;

        }
        // Check if this phone is already in-use
        if (!isPhoneUnique(users, phone.value, user.id)) {
            displayMessage("<b>This Phone already exists. Pick another one.</b>", "error", "my-settings-form");
            return;
        }

        await updateUserInfo(username.value, email.value, address.value, phone.value, user);
    });

    async function fetchEnergies() {
        try {
            const response = await fetch(`${apiUrl}/energy/getAll/`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            })

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }

            // Get only enabled energies
            const energies = await response.json();
            const enabledEnergies = energies.filter((energy) => energy.enabled);

            return enabledEnergies;
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "energy-preferences");
        }
    }

    async function fetchUserEnergyPreferences() {
        try {
            const response = await fetch(`${apiUrl}/user_energy/getByUserId/${user.id}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "energy-preferences");
        }
    }

    async function deleteUserEnergyPref(userID, energyID) {
        console.log(`User ID: ${user.id}, Energy ID: ${energyID}`);
        try {
            const response = await fetch(`${apiUrl}/user_energy/delete/${userID}/${energyID}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            // Item doesnt exist, therefore cant be deleted
            // Just refresh the page
            if (!response.ok && response.status === 404) {
                return;
            }

            if (!isBearerTokenValid(response)) {
                logoutButton.click();
                return;
            }
        } catch (error) {
            console.error(`Error : ${error.message}`);
        }
    }

    async function insertUserEnergyPref(userID, energyID) {
        const logoutButton = document.getElementById("logout");
        try {
            console.log(`User ID: ${user.id}, Energy ID: ${energyID}`);
            const response = await fetch(`${apiUrl}/user_energy/create/${userID}/${energyID}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            // Item already exists, therefore cant be created again
            // Just refresh the page
            if (!response.ok && response.status === 400) {
                return;
            }

            if (!isBearerTokenValid(response)) {
                logoutButton.click();
                return;
            }
        } catch (error) {
            console.error(`Error : ${error.message}`);
        }
    }

    function updateEnergyPrefUI(energies, userEnergyPrefs) {
        const tbody = document.querySelector("#user-energy-preferences-data tbody");
        tbody.innerHTML = "";

        if (energies.length > 0) {
            // Load the table with all the energies
            energies.forEach((energy) => {
                const tr = document.createElement("tr");
                const td = document.createElement("td");

                const checkbox = document.createElement("input");
                checkbox.setAttribute("type", "checkbox");
                checkbox.setAttribute("name", `${energy.id}`);

                // Check the checkbox if this user has this energy's preference
                if (userEnergyPrefs.length > 0) {
                    userEnergyPrefs.forEach((userEnergyPref) => {
                        if (energy.id == userEnergyPref.energyID) {
                            checkbox.checked = true;
                        }
                    })
                }

                const span = document.createElement("span");
                span.textContent = `${energy.name} (${energy.unit})`;
                span.style = "margin-left: 1rem";

                td.appendChild(checkbox);
                td.appendChild(span);
                tr.appendChild(td);

                tbody.append(tr);
            });
        } else {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.textContent = "No energies were found.";
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
    }

    async function fetchUserInfo() {
        try {
            const response = await fetch(`${apiUrl}/user/getByID/${user.id}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "my-settings");
        }
    }

    async function fetchUsers() {
        try {
            const response = await fetch(`${apiUrl}/user/getAll`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "my-settings");
        }
    }

    function isUsernameUnique(users, username, userID) {
        for (const user of users) {
            if (username === user.username && userID !== user.id) {
                return false;
            }
        }
        return true;
    }

    function isEmailUnique(users, email, userID) {
        for (const user of users) {
            if (email === user.email && userID !== user.id) {
                return false;
            }
        }
        return true;
    }

    function isPhoneUnique(users, phone, userID) {
        for (const user of users) {
            if (phone === user.phone && userID !== user.id) {
                return false;
            }
        }
        return true;
    }

    async function updateUserInfo(username, email, phone, address, user) {
        try {
            await fetch(`${apiUrl}/user/update/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, phone, address }),
            });

            // Update localStorage
            user.username = username;
            localStorage.setItem("userData", JSON.stringify(user));

            // Update navbar title user
            const navUser = document.querySelector("nav h1");
            navUser.textContent = `Welcome back, ${user.username}`;

            displayMessage(`<b>Your user's information was succesfully updated.</b>`, "success", "my-settings-form");
        } catch (error) {
            displayMessage(`<b>${error.message}</b>`, "error", "my-settings-form");
            throw new Error(error.message);
        }
    }
});