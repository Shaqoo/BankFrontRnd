function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
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
let displayUser = async () => {
  let customer = await fetchCustomerData();
  const container = document.querySelector('.user-info');
  container.innerHTML += `<img class="avatar" src="${customer.imageUrl == null ? 'http://127.0.0.1:5500/prof2.jpeg' : 'https://localhost:7246' / customer.imageUrl}" alt="">
                <span class="sidebar-text">${customer.email}</span>`
}
displayUser();

async function fetchCustomerData() {
  return await fetch(`https://localhost:7246/api/Customer?email=${encodeURIComponent(email)}`, {
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


async function fetchAccountData() {
  let customer = await fetchCustomerData();
  return await fetch(`https://localhost:7246/api/Account/customerId?customerId=${customer.id}`, {
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
      })}; 



         

    async function fetchTransactions(type) {
      let account = await fetchAccountData();
      let url;
      if (type === 'all') url = `https://localhost:7246/api/Transaction/accountId/request/paging?accountId=${account.id}`;
      else if (type === 'failed') url =  `https://localhost:7246/api/Transaction/accountId?accountId=${account.id}`;
      else if (type === 'success') url =  `https://localhost:7246/api/Transaction/accountId/usePaging?accountId=${account.id}`

      try {
        const res = await fetch(url,{
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
        });
        const data = await res.json();
        renderTransactions(data.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }

    function renderTransactions(data) {
      const container = document.getElementById("transactionList");
      container.innerHTML = '';

      if (data.count === 0) {
        container.innerHTML = "<p>No transactions found.</p>";
        return;
      }

      data.forEach(tx => {
        tx.status = changeStatus(tx.status);
        tx.transactionDate = new Date(tx.transactionDate).toLocaleString();
        tx.transactionType = changeTransactionType(tx.transactionType)
        tx.amount = tx.amount.toLocaleString()

        console.log(tx)
        const div = document.createElement("div");
        div.className = `transaction-card ${tx.status === "Success" ? "success" : "failed"}`;
        div.innerHTML = `       
          <strong>Account:</strong>RecipientAccount No.: ${tx.recipientAccount}<br>
          <strong>Amount:</strong>Amount: $${tx.amount}<br>
          <strong>Status:</strong>Status: ${tx.status}<br>
          <strong>Status:</strong>Type: ${tx.transactionType}<br>
          <strong>Status:</strong>Reference No.: ${tx.referenceNumber}<br>
          <small>Date Of Transaction: ${tx.transactionDate}</small><br>
          <em>Narration: ${tx.narration}</em>
          <div class="transaction-buttons">
          <button class = "csv-btn">
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
          <button class="pdf-btn">
            <i class="fas fa-file-pdf"></i> Export PDF
          </button>
        </div>
        `;

         div.querySelector(".csv-btn").addEventListener("click", () => exportToCSV(tx));
         div.querySelector(".pdf-btn").addEventListener("click", () => exportToPDF(tx));
        container.appendChild(div);
      });
    }

     
    fetchTransactions('all');

let changeStatus = (status) => {
  switch(status)
  {
     case 0 : return "Success";
     case 1 : return "Failed";
     case 2 : return "Pending";
  }
}

let changeTransactionType = (type) =>{
  switch(type)
  {
     case 0 : return "Debit";
     case 1 : return "Credit";
  }
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

    // Logo Image (adjust path or convert to base64 if needed)
    const imgData = 'http://127.0.0.1:5500/WhatsApp Image 2025-05-01 at 20.43.35_c3be9d8a.jpg';
    doc.addImage(imgData, 'PNG', 90, 10, 30, 30);

    // Title
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

