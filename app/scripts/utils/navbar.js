document.addEventListener("DOMContentLoaded", async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    // Create elements
    const nav = document.createElement("nav");
    const heading = document.createElement("h1");
    const logoutButton = document.createElement("button");
    const settingsButton = document.createElement("button");
    const userNav = document.createElement("div");

    const navigationData = {
        "Home": "../welcome/",
    };
    // Admin
    if (userData.role === 1) {
        navigationData["Users"] = "../users/";
        navigationData["Energy"] = "../energy/";
    } else {
        navigationData["Listings"] = "../listings/";
    }
    const ul = document.createElement("ul");

    // Loop through the navigation data object
    Object.entries(navigationData).forEach(([tabName, url]) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = tabName;
        link.href = url;
        li.appendChild(link);
        ul.appendChild(li);
    });

    // Set text content and attributes
    heading.textContent = `Welcome back, ${userData.username}`;

    // Add Logout button
    logoutButton.className = "button-icon";
    logoutButton.setAttribute("type", "button");
    logoutButton.setAttribute("id", "logout");
    logoutButton.innerHTML = `
    <i class="fa-solid fa-right-from-bracket"></i>
    <span>Logout</span>
    `;

    // Add User Settings Button
    settingsButton.className = "button-icon";
    settingsButton.setAttribute("type", "button");
    settingsButton.setAttribute("id", "user-settings");
    settingsButton.innerHTML = `
    <i class="fa-solid fa-gear"></i>
    `

    // Add both buttons to the right side user nav
    userNav.classList.add("flex", "flex-wrap", "align-items-center", "gap-05");
    userNav.appendChild(logoutButton);
    userNav.appendChild(settingsButton);

    // Append elements to the nav
    nav.appendChild(heading);
    nav.appendChild(ul);
    nav.appendChild(userNav);

    // Select the element with the class "container"
    // Append nav after the container element
    const container = document.querySelector(".container");
    container.insertBefore(nav, container.firstChild);

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("userData");
        window.location.href = "../login/";
    });

    settingsButton.addEventListener("click", () => {
        window.location.href = "../user-settings/";
    })
});