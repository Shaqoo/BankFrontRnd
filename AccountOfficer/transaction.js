function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
}

const token = localStorage.getItem('token')
function decodeJWT(token) {
    const parts = token.split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }

    const payload = parts[1];

    const decodedPayload = JSON.parse(atob(payload));
    console.log(decodedPayload)

    return decodedPayload;
}

const decodedToken = decodeJWT(token);
console.log(decodedToken);
const email = decodedToken['Email'];



let getOfficer = async () => {
    if (token) {
        return await fetch(`https://localhost:7246/api/AccountOfficer/get-By-Email?email=${encodeURIComponent(email)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                return response.json()
            })
            .then(data => {
                console.log("Fetched data:", data)
                return data.data;
            }).catch(error => {
                console.error("Error occurred:", error);
            });;
    }
    else {
        console.error("Token Not Found");

    }
}



async function fetchAccountData(id) {
    return await fetch(`https://localhost:7246/api/Account/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data);
            return data.data
        })
        .catch(error => {
            console.error("Error occurred:", error);
        })
};



let currentPage = 1;

async function loadPage(page) {
    let officer = await getOfficer();
    try {
        const response = await fetch(`https://localhost:7246/api/Transaction/All-Bank-Transactions?bankId=${officer.bankId}&PageSize=10&Page=${page}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            method: "GET"
        })
        const data = await response.json();
        if (!response.ok) {
            throw new Error("Error Occurred");
        }
        currentPage = data.data.page;
        console.log(data.data.items);
        await displayTransactions(data.data.items);
        document.getElementById('pageInfo').textContent = ` Page ${data.data.page} of ${data.data.totalPages}`;

        document.getElementById('prevBtn').disabled = (data.data.page === 1);
        document.getElementById('nextBtn').disabled = !data.data.hasNextPage;
        return;
    }
    catch (error) {
        throw new Error("Error Occurred");
    }
}
loadPage(currentPage);

async function displayTransactions(transactions) {
    const container = document.getElementById("transaction-list");

    for (const transaction of transactions) {
        transaction.transactionDate = new Date(transaction.transactionDate).toLocaleString()
        transaction.status = transaction.status > 0 ? "Failed" : "Success";
        transaction.transactionType = transaction.transactionType > 0 ? "Credit" : "Debit"
        transaction.amount = transaction.amount.toLocaleString()
     
        const div = document.createElement("div");
        let account = await fetchAccountData(transaction.accountId);
        div.className = "transaction";
        div.innerHTML = `
        <p><strong>Sender's Account:</strong> ${account.accountNumber}</p>
        <p><strong>Reference No:</strong> ${transaction.referenceNumber}</p>
        <p><strong>Amount:</strong> $${transaction.amount}</p>
        <p><strong>Type:</strong> ${transaction.transactionType}</p>
        <p><strong>Date:</strong> ${transaction.transactionDate}</p>
        <p><strong>Status:</strong> ${transaction.status}</p>
        <p><strong>RecipientAccount:</strong> ${transaction.recipientAccount}</p>
        <div class="transaction-buttons">
          <button onclick='exportToCSV(${JSON.stringify(transaction)})'>
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
          <button onclick='exportToPDF(${JSON.stringify(transaction)})'>
            <i class="fas fa-file-pdf"></i> Export PDF
          </button>
        </div>
      `;

        container.appendChild(div);
    };
}

function exportToCSV(transaction) {
    const headers = Object.keys(transaction).join(",");
    const row = Object.values(transaction).map(v => `${v}`).join(",");
    const csvContent = `${headers}\n${row}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${transaction.referenceNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

async function exportToPDF(transaction) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    
    const imgData = 'http://127.0.0.1:5500/WhatsApp Image 2025-05-01 at 20.43.35_c3be9d8a.jpg';
    doc.addImage(imgData, 'PNG', 90, 10, 30, 30);

    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Transaction Record", 14, 45);

    // Content Formatting
    let y = 60;
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const boxX = 14;
    const boxWidth = 180;

    for (const [key, value] of Object.entries(transaction)) {
        const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());

        doc.setDrawColor(200, 200, 200); // Light gray border
        doc.rect(boxX - 2, y - 5, boxWidth - 20, 10); // Draw rectangle

        doc.text(`${formattedKey}: ${value}`, boxX, y);
        y += 12;
    }

    // Footer
    const footerY = 280;
    doc.setDrawColor(100, 100, 100);
    doc.line(10, footerY, 200, footerY); // Horizontal line

    // Footer text
    doc.setFontSize(15);
    const now = new Date().toLocaleString();
    doc.text(`Generated on: ${now}`, 14, footerY + 7);
    doc.text("BankNest Inc. | www.BankNest.com | ShakirullahOhio@gmail.com", 14, footerY + 14);

    // Save as PDF
    doc.save(`${transaction.referenceNumber || 'Transaction'}.pdf`);
}
