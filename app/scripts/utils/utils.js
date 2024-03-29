export function formatDate(date) {
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    var year = date.getFullYear();
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');

    return month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
}

// Function to display error message
export function displayMessage(message, type, beforeElementId) {
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

export function isLoggedIn() {
    // Check if the user is already logged in
    const userData = localStorage.getItem("userData");

    return userData !== null;
}

export function createButton(href, label, iconClass, onClick) {
    const button = document.createElement("button");
    button.className = "button-icon";
    button.innerHTML = `
        <i class="fa-regular fa-${iconClass}"></i>
        <span>${label}</span>`;
    button.onclick = onClick ? onClick : () => window.location.href = href;
    return button;
}

export function isBearerTokenValid(response) {
    if (!response.ok) {
        // Bearer token has expired
        if (response.status === 403) {
            return false;
        }
    }
    return true;
}