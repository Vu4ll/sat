async function fetchExpenses() {
    try {
        const [expensesResponse, categoriesResponse, defaultColorResponse] = await Promise.all([
            fetch("/api/expenses"),
            fetch("/api/categories"),
            fetch("/api/default-category-color")
        ]);

        const expenses = await expensesResponse.json();
        const categories = await categoriesResponse.json();
        const { defaultColor } = await defaultColorResponse.json();

        const categoryColors = categories.reduce((acc, category) => {
            acc[category.name] = category.color;
            return acc;
        }, {});

        const categoryData = {};
        expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const backgroundColors = labels.map(label => categoryColors[label] || defaultColor);

        const ctx = document.getElementById("expenseChart").getContext("2d");
        new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "Toplam Tutar",
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "bottom" } }
            }
        });
    } catch (error) {
        console.error("Veri çekerken hata oluştu:", error);
    }
}

fetchExpenses();