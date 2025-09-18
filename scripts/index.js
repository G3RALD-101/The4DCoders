document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("submitButton");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    button.addEventListener("click", (e) => {
        e.preventDefault(); // prevents form from refreshing the page

        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();

        if (emailValue === "The4DCoders@gamedev.com.ph" && passwordValue === "The4DCoders_dev123") {
            window.location.href = "../interface1.html";
        } else {
            alert("Invalid email or password!");
        }
    });
});

