import { formatDate } from '../../scripts/utils/formatDate.js';

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:4242/api";

    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.id = "error-message";
    document.querySelector("#energy-data").insertAdjacentElement("beforebegin", errorMessageDiv);

    async function fetchData() {
        try {
            const response = await fetch(`${apiUrl}/energy/getAll`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.error("Error fetching data:", error);

            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error", "energy-data");
        }
    }

    async function deleteItem(item) {
        const confirmed = confirm(`Do you want to proceed to delete ${item.name}?`);
    
        if (confirmed) {
            try {
                const apiUrl = "http://localhost:4242/api";
                const response = await fetch(`${apiUrl}/energy/delete/${item.id}`, {
                    method: 'DELETE'
                });
    
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
    
                displayMessage(`<b>${item.name}</b> successfully deleted.`, "success", "energy-data");

                await fetchData();
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        } else {
            console.log("Deletion cancelled");
        }
    }

    function updateUI(data) {
        // Update your UI elements here based on the data received
        const appElement = document.querySelector("#energy-data tbody");
        appElement.innerHTML = "";

        if(data.length > 0) {
            data.forEach((item) => {
                let formattedCreatedAtDt = formatDate(new Date(item.createdAt));
                let formattedUpdatedAtDt = formatDate(new Date(item.updatedAt));
    
                const itemElement = document.createElement("tr");
                itemElement.innerHTML += `<td>${item.name} (${item.unit})</td>`;
                itemElement.innerHTML += `<td>${formattedCreatedAtDt}</td>`;
                itemElement.innerHTML += `<td>${formattedUpdatedAtDt}</td>`;
    
                const updateButton = createButton(`updateEnergy.html?id=${item.id}`, "Update", "pen");
                const deleteButton = createButton("", "Delete", "trash", () => deleteItem(item));
    
                const buttonCell = document.createElement("td");
                buttonCell.className = "table-options";
                buttonCell.appendChild(updateButton);
                buttonCell.appendChild(deleteButton);
    
                itemElement.appendChild(buttonCell);
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

    // Function to display error message
    function displayMessage(message, type, beforeElementId) {
        const errorMessage = document.createElement("div");
        errorMessage.id = "error-message";
        errorMessage.innerHTML = `
        <div class="alert-message" data-style="${type}">
            <span>${message}</span>
            <i class="fa-solid fa-xmark"></i>
        </div>
        `;
        const energyDataElement = document.querySelector(`#${beforeElementId}`);
        energyDataElement.parentNode.insertBefore(errorMessage, energyDataElement);

        const closeIcon = errorMessage.querySelector(".fa-xmark");
        closeIcon.addEventListener("click", () => {
            errorMessage.remove();
        });
    }

    const form = document.getElementById("add-energy-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        const name = document.getElementById("energyName").value;
        const unit = document.getElementById("energyUnit").value;

        try {
            const response = await fetch(`${apiUrl}/energy/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, unit }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
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