import { isLoggedIn } from '../utils/utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    if(!isLoggedIn()) {
        window.location.href = "../login/";
    }
});