document.addEventListener("DOMContentLoaded", async() => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    // Create elements
    const nav = document.createElement("nav");
    const heading = document.createElement("h1");
    const button = document.createElement("button");

    const navigationData = {
        "Home": "../welcome/",
        "Energy": "../energy/"
    };
    const ul = document.createElement("ul");

    // Loop through the navigation data object
    Object.entries(navigationData).forEach(([tabName, url]) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = url;
        link.textContent = tabName;
        li.appendChild(link);
        ul.appendChild(li);
    });

    // Set text content and attributes
    heading.textContent = `Welcome back, ${userData.username}`;
    button.className = "button-icon";
    button.setAttribute("type", "button");
    button.setAttribute("id", "logout");
    button.innerHTML = `
    <i class="fa-solid fa-right-from-bracket"></i>
    <span>Logout</span>
    `;


    // Append elements to the nav
    nav.appendChild(heading);
    nav.appendChild(ul);
    nav.appendChild(button);

    // Select the element with the class "container"
    const container = document.querySelector(".container");

    // Append nav after the container element
    container.insertBefore(nav, container.firstChild);

    // Add event listener to the logout button
    button.addEventListener("click", () => {
        // Remove userData from localStorage
        localStorage.removeItem("userData");
        // Redirect user to the login page
        window.location.href = "../login/";
    });
});