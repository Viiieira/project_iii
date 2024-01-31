const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = new URLSearchParams(formData);

  fetch("http://localhost:4242/api/user/login", {
    method: "POST",
    body: data,
  })
    .then((res) => {
      console.log("Response status:", res.status);
      return res.json();
    })
    .then((data) => console.log("Response data:", data))
    .catch((error) => console.error("Fetch error:", error));
});
