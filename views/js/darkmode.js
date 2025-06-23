document.addEventListener("DOMContentLoaded", () => {
    const currentTheme = localStorage.getItem("theme") || "light";

    document.documentElement.setAttribute("data-bs-theme", currentTheme);

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.checked = currentTheme === "dark";

        themeToggle.addEventListener("change", function () {
            const newTheme = this.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-bs-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }
});
