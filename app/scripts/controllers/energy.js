import { formatDate, displayMessage, isLoggedIn } from '../utils/utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api";
    const user = JSON.parse(localStorage.getItem("userData"));
    const logoutButton = document.getElementById("logout");

    if (!isLoggedIn()) {
        window.location.href = "../login/";
    }

    // Check if he's an admin
    // Add the cell Options to the table
    if (user.role === 1) {
        const table = document.querySelector("#energy-data thead tr");
        let th = document.createElement("th");
        th.textContent = "Options";
        table.appendChild(th);

        const form = document.getElementById("add-energy-form");
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("energyName").value;
            const unit = document.getElementById("energyUnit").value;

            try {
                const response = await fetch(`${apiUrl}/energy/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ name, unit }),
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        if (logoutButton) {
                            logoutButton.click();
                            return;
                        }
                        throw new Error(`Error: ${response.status}`);
                    }
                }

                const data = await response.json();
                console.log("New energy created:", data);
                displayMessage(`${name} was added`, "success", "add-energy-form");
                await fetchData();
            } catch (error) {
                console.error("Error creating new energy:", error);
                displayMessage(`<b>${name}</b> already exists.`, "error", "add-energy-form");
            }
        });
    } else {
        const addEnergyTable = document.getElementById("add-energy-container");
        addEnergyTable.remove();
    }

    async function fetchData() {
        try {
            const response = await fetch(`${apiUrl}/energy/getAll`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                // Bearer token has expired
                if (response.status === 403) {
                    const logoutButton = document.getElementById("logout");
                    if (logoutButton) {
                        logoutButton.click();
                        return;
                    } else {
                        throw new Error("Logout button not found.");
                    }
                } else {
                    throw new Error(`Error: ${response.status}`);
                }
            }

            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "energy-data");
        }
    }


    async function updateEnergyStatus(item) {
        let confirmStr = item.enabled ? `Do you want to disable ${item.name}?` : `Do you want to enable ${item.name}?`;
        const confirmed = confirm(confirmStr);

        if (confirmed) {
            try {
                const apiUrl = "http://localhost:4242/api";
                const endpoint = item.enabled ? "disable" : "enable";
                const response = await fetch(`${apiUrl}/energy/${endpoint}/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Authorization": `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        if (logoutButton) {
                            logoutButton.click();
                            return;
                        } else {
                            throw new Error("Logout button not found.");
                        }
                    } else {
                        throw new Error(`Error: ${response.status}`);
                    }
                }
                displayMessage(`<b>${item.name}</b> was updated.`, "success", "energy-data");

                await fetchData();
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        } else {
            console.log("Update was cancelled");
        }
    }

    // ! Add option to delete the energy if it has been used anywhere
    function updateUI(data) {
        // Update your UI elements here based on the data received
        const appElement = document.querySelector("#energy-data tbody");
        appElement.innerHTML = "";

        if (data.length > 0) {
            data.forEach((item) => {
                let formattedCreatedAtDt = formatDate(new Date(item.createdAt));
                let formattedUpdatedAtDt = formatDate(new Date(item.updatedAt));

                const itemElement = document.createElement("tr");

                // Add user status div
                const userStatusDiv = document.createElement("div");
                userStatusDiv.className = "user-status";
                userStatusDiv.setAttribute("data-enabled", item.enabled);

                itemElement.innerHTML += `<td class="flex align-items-center flex-wrap gap-05">${userStatusDiv.outerHTML}${item.name} (${item.unit})</td>`;
                itemElement.innerHTML += `<td>${formattedCreatedAtDt}</td>`;
                itemElement.innerHTML += `<td>${formattedUpdatedAtDt}</td>`;

                // If the user is an admin
                if (user.role === 1) {
                    const updateButton = createButton(`updateEnergy.html?id=${item.id}`, "Update", "pen");
                    const deleteButton = createButton(null, item.enabled ? "Disable" : "Enable", item.enabled ? "eye-slash" : "eye", () => updateEnergyStatus(item));

                    const buttonCell = document.createElement("td");
                    buttonCell.className = "table-options";
                    buttonCell.appendChild(updateButton);
                    buttonCell.appendChild(deleteButton);
                    itemElement.appendChild(buttonCell);
                }

                appElement.appendChild(itemElement);
            });
        } else {
            const itemElement = document.createElement("tr");
            itemElement.innerHTML = `<td colspan="4">No energies were found.</td>`;
            appElement.appendChild(itemElement);
        }
    }

    // Fetch data initially and set up periodic updates if needed
    await fetchData();

    const refreshButton = document.querySelector("#refresh");
    refreshButton.addEventListener("click", async () => {
        await fetchData();
        console.log("Succesfully updated table's data!");
    });
});

function createButton(href, label, iconClass, onClick) {
    const button = document.createElement("button");
    button.className = "button-icon";
    button.innerHTML = `
        <i class="fa-regular fa-${iconClass}"></i>
        <span>${label}</span>`;
    button.onclick = onClick ? onClick : () => window.location.href = href;
    return button;
}