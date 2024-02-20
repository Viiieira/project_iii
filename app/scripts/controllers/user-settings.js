import {
    // formatDate,
    displayMessage,
    isLoggedIn,
    isBearerTokenValid,
    // createButton
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
    if (user.role === 1) {
        energyPreferencesDiv.remove();
    } else {
        // Load all the Energy Preferences for Producer/Consumers
        let energies = await fetchEnergies();
        let userEnergyPrefs = await fetchUserEnergyPreferences();
        updateUI(energies, userEnergyPrefs);

        const refresh = document.getElementById("refresh");
        const save = document.getElementById("save");

        // Remove the save button if there are no energies to be checked
        if (energies.length == 0) {
            console.log("Remove Save button");
            save.remove()
        }

        refresh.addEventListener("click", async () => {
            let energies = await fetchEnergies();
            let userEnergyPrefs = await fetchUserEnergyPreferences();
            updateUI(energies, userEnergyPrefs);
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
                console.log("Removed items: ", removedItems);
                if (removedItems.length > 0) {
                    removedItems.forEach(async (energyID) => {
                        await deleteUserEnergyPref(energyID);
                    });
                }

                // See what items need to be added
                const addedItems = checkedEnergies.filter(item => !userEnergyPrefsID.includes(item));
                console.log("Added items: ", addedItems);
                if (addedItems.length > 0) {
                    addedItems.forEach(async (energyID) => {
                        await insertUserEnergyPref(energyID);
                    });
                }

                refresh.click();
                displayMessage("<b>Energy Preferences were updated.</b>", "success", "energy-preferences");
            }
        });
    }

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

    async function deleteUserEnergyPref(energyID) {
        try {
            const response = await fetch(`${apiUrl}/user_energy/delete/${user.id}/${energyID}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }
        } catch (error) {
            console.error(`Error : ${error.message}`);
        }
    }

    async function insertUserEnergyPref(energyID) {
        try {
            const response = await fetch(`${apiUrl}/user_energy/create/${user.id}/${energyID}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (!isBearerTokenValid(response)) {
                const logoutButton = document.getElementById("logout");
                logoutButton.click();
                return;
            }
        } catch (error) {
            console.error(`Error : ${error.message}`);
        }
    }

    function updateUI(energies, userEnergyPrefs) {
        const tbody = document.querySelector("#user-settings-data tbody");
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
});