import { formatDate } from '../../scripts/utils/formatDate.js';

document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:4242/api";

    // Create error message div
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
            updateUI(data); // Update the UI with the retrieved data
        } catch (error) {
            console.error("Error fetching data:", error);

            // Display an error message to the user
            displayMessage("<b>Failed to fetch data.</b> Please try again later.", "error")
        }
    }

    async function deleteItem(id) {
        const confirmed = confirm("Do you want to proceed?");
    
        if (confirmed) {
            try {
                const apiUrl = "http://localhost:4242/api"; // Replace with your API URL
                const response = await fetch(`${apiUrl}/energy/delete/${id}`, {
                    method: 'DELETE'
                });
    
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
    
                // console.log("Item deleted successfully");
                displayMessage("<b>Energy successfully deleted.</b>", "success");

                fetchData();
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

        data.forEach((item) => {
            let formattedCreatedAtDt = formatDate(new Date(item.createdAt));
            let formattedUpdatedAtDt = formatDate(new Date(item.updatedAt));

            const itemElement = document.createElement("tr");
            itemElement.innerHTML += `<td>${item.name} (${item.unit})</td>`;
            itemElement.innerHTML += `<td>${formattedCreatedAtDt}</td>`;
            itemElement.innerHTML += `<td>${formattedUpdatedAtDt}</td>`;

            const updateButton = createButton(`updateEnergy.html?id=${item.id}`, "Update", "pen");
            const deleteButton = createButton("", "Delete", "trash", () => deleteItem(item.id));

            const buttonCell = document.createElement("td");
            buttonCell.className = "table-options";
            buttonCell.appendChild(updateButton);
            buttonCell.appendChild(deleteButton);

            itemElement.appendChild(buttonCell);
            appElement.appendChild(itemElement);
        });
    }

    // Fetch data initially and set up periodic updates if needed
    fetchData();

    const refreshButton = document.querySelector("#refresh");
    refreshButton.addEventListener("click", () => {
        fetchData();
        console.log("Succesfully updated table's data!");
    });

    // Function to display error message
    function displayMessage(message, type) {
        const errorMessage = document.createElement("div");
        errorMessage.id = "error-message";
        errorMessage.innerHTML = `
        <div class="alert-message" data-style="${type}">
            <span>${message}</span>
            <i class="fa-solid fa-xmark"></i>
        </div>
        `;
        const energyDataElement = document.querySelector("#energy-data");
        energyDataElement.parentNode.insertBefore(errorMessage, energyDataElement);

        const closeIcon = errorMessage.querySelector(".fa-xmark");
        closeIcon.addEventListener("click", () => {
            errorMessage.remove();
        });
    }
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
