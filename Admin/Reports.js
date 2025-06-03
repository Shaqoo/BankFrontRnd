function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
}


let token = localStorage.getItem('token')



let transactions = [];

async function loadTransactions() {
    try {
        const response = await fetch("https://localhost:7246/api/Transaction/All-Transactions", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();


        transactions = data.data.map(({ transactionType, amount, transactionDate }) => ({
            type: transactionType > 0 ? "deposit" : "transfer",
            amount: amount,
            date: new Date(transactionDate).toISOString().split("T")[0]
        }));
        renderChart(transactions);
        
        console.log("Filtered Transactions:", transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

loadTransactions();






function groupTransactions(transactions) {
    const grouped = {};

    transactions.forEach(txn => {
        const date = txn.date;
        if (!grouped[date]) {
            grouped[date] = { deposit: 0, transfer: 0 };
        }
        if (txn.type === "deposit") grouped[date].deposit += txn.amount;
        if (txn.type === "transfer") grouped[date].transfer += txn.amount;
    });

    const labels = Object.keys(grouped).sort();
    const depositData = labels.map(date => grouped[date].deposit);
    const transferData = labels.map(date => grouped[date].transfer);

    return { labels, depositData, transferData };
}


let chart;


function renderChart(transactionsToUse) {
    const { labels, depositData, transferData } = groupTransactions(transactionsToUse);

    const ctx = document.getElementById('transactionChart').getContext('2d');

    if (chart) chart.destroy();  

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Deposits',
                    data: depositData,
                    backgroundColor: 'rgba(0, 123, 255, 0.7)',
                    borderRadius: 5,
                    barThickness: 30
                },
                {
                    label: 'Transfers',
                    data: transferData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderRadius: 5,
                    barThickness: 30
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Segoe UI', sans-serif"
                        },
                        color: '#333'
                    }
                },
                tooltip: {
                    backgroundColor: '#f8f9fa',
                    titleColor: '#333',
                    bodyColor: '#555',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    padding: 10
                }
            },
            layout: {
                padding: 20
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        borderDash: [5, 5],
                        color: '#ddd'
                    },
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1000,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        }
    });
}



function applyDateFilter() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    const filtered = transactions.filter(txn =>
        (!startDate || txn.date >= startDate) &&
        (!endDate || txn.date <= endDate)
    );

    renderChart(filtered);
}








let allAttempts = [];
let filteredAttempts = [];
let currentPage = 1;
const rowsPerPage = 10;

async function loadLoginAttempts() {
    try {
        const response = await fetch('https://localhost:7246/api/User/Get-Logs', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error('Failed to fetch login attempts');
        allAttempts = await response.json();
        filteredAttempts = allAttempts.data;
        currentPage = 1;
        renderTable();
    } catch (error) {
        console.error('Error loading login attempts:', error);
    }
}

function renderTable() {
    const tbody = document.querySelector('#loginAttemptsTable tbody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredAttempts.slice(start, end);

    pageData.forEach(attempt => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${attempt.timestamp}</td>
                    <td>${attempt.username}</td>
                    <td>${attempt.email}</td>
                    <td>${attempt.ipAddress}</td>
                    <td>${attempt.result}</td>
                    <td>${attempt.reason}</td>
                `;
        tbody.appendChild(row);
    });

    const totalPages = Math.ceil(filteredAttempts.length / rowsPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
}

function applyLoginDateFilter() {
    const startDate = document.getElementById('login-start-date').value;
    const endDate = document.getElementById('login-end-date').value;

    filteredAttempts = allAttempts.data.filter(attempt => {
        const date = new Date(attempt.timestamp);
        return (!startDate || date >= new Date(startDate)) &&
            (!endDate || date <= new Date(endDate + 'T23:59:59'));
    });

    currentPage = 1;
    renderTable();
}

function nextPage() {
    const totalPages = Math.ceil(filteredAttempts.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

window.onload = loadLoginAttempts;
