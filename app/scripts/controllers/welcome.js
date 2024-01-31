document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:4242/api"; // Replace with your API URL

    async function fetchData() {
        try {
            const response = await fetch(`${apiUrl}/energy/getAll`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            updateUI(data); // Update the UI with the retrieved data
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function updateUI(data) {
        // Update your UI elements here based on the data received
        const appElement = document.querySelector("#energy-data tbody");
        appElement.innerHTML = "";

        data.forEach((item) => {
            const itemElement = document.createElement("tr");
            itemElement.innerHTML += `<td>${item.name}</td>`;
            itemElement.innerHTML += `<td>${item.unit}</td>`;
            itemElement.innerHTML += `<td>${item.createdAt}</td>`;
            itemElement.innerHTML += `<td>${item.updatedAt}</td>`;
            appElement.appendChild(itemElement);
        });
    }

    // Fetch data initially and set up periodic updates if needed
    fetchData();
    // Uncomment the line below for periodic updates (e.g., every 5 seconds)
    // setInterval(fetchData, 5000);

    const refreshButton = document.querySelector("#refresh");
    refreshButton.addEventListener("click", fetchData);
});