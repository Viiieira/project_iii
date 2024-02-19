import { isLoggedIn, isBearerTokenValid, createButton, formatDate, displayMessage } from '../utils/utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api";
    const user = JSON.parse(localStorage.getItem("userData"));

    // Assure that only logged users can access this page
    if (!isLoggedIn()) {
        window.location.href = "../login/";
    }

    // Assure that only admins have access to this page
    if (user.role !== 1) {
        window.location.href = "../welcome/";
    }

    const users = await fetchUsersData();
    const userRoles = await fetchUserRolesData();
    updateUI(users, userRoles);

    const refreshButton = document.querySelector("#refresh");
    refreshButton.addEventListener("click", async () => {
        const users = await fetchUsersData();
        users.forEach((user) => {
            console.log(user);
        })
        const userRoles = await fetchUserRolesData();
        updateUI(users, userRoles);
        console.log("Succesfully updated table's data!");
    });

    async function fetchUsersData() {
        try {
            const response = await fetch(`${apiUrl}/user/getAll`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (!isBearerTokenValid(response)) {
                logoutButton.click();
                return;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "users-data");
        }
    }

    async function fetchUserRolesData() {
        try {
            const response = await fetch(`${apiUrl}/user_role/getAll`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "users-data");
        }
    }

    function updateUI(users, userRoles) {
        // Update your UI elements here based on the data received
        const appElement = document.querySelector("#users-data tbody");
        appElement.innerHTML = "";

        if (users.length > 0) {
            users.forEach((item) => {
                let formattedCreatedAtDt = formatDate(new Date(item.createdAt));
                let formattedUpdatedAtDt = formatDate(new Date(item.updatedAt));

                const itemElement = document.createElement("tr");

                // Add user status div
                const statusDiv = document.createElement("div");
                statusDiv.className = "user-status";
                statusDiv.setAttribute("data-enabled", item.enabled);

                itemElement.innerHTML += `<td class="flex align-items-center flex-wrap gap-05">${statusDiv.outerHTML}${item.username}</td>`;
                itemElement.innerHTML += `<td>${item.email}</td>`;
                userRoles.forEach((role) => {
                    if (item.roleID == role.id) {
                        itemElement.innerHTML += `<td>${role.name}</td>`;
                    }
                })
                itemElement.innerHTML += `<td>${item.address}</td>`;
                itemElement.innerHTML += `<td>${item.phone}</td>`;
                itemElement.innerHTML += `<td>${formattedCreatedAtDt}</td>`;
                itemElement.innerHTML += `<td>${formattedUpdatedAtDt}</td>`;

                // If the user is an admin
                if (user.role === 1) {
                    const userStatusButton = createButton(
                        null,
                        item.enabled ? "Disable" : "Enable",
                        item.enabled ? "eye-slash" : "eye",
                        () => {
                            updateUserStatus(item)
                            if (refreshButton) {
                                refreshButton.click();

                            } else {
                                throw new Error("Refresh button doesnt exist.");
                            }
                        }
                    );

                    const buttonCell = document.createElement("td");
                    buttonCell.className = "table-options";
                    buttonCell.appendChild(userStatusButton);
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

    async function updateUserStatus(item) {
        let confirmStr = item.enabled ? `Do you want to disable ${item.username}?` : `Do you want to enable ${item.username}?`;
        const confirmed = confirm(confirmStr);

        if (confirmed) {
            try {
                const endpoint = item.enabled ? "deactivate" : "activate";
                await fetch(`${apiUrl}/user/${endpoint}/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Authorization": `Bearer ${user.token}`
                    }
                });
                displayMessage(`<b>${item.username}</b> was updated.`, "success", "users-data");
            } catch (error) {
                throw new Error(`Error updating user status: ${error.message}`);
            }

        }
    }
});