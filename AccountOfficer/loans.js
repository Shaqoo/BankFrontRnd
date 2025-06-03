const apiBase = "https://localhost:7246/api";
const token = localStorage.getItem('token');

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
}

function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    console.log(decodedPayload);
    return decodedPayload;
}

const decodedToken = decodeJWT(token);
const email = decodedToken['Email'];

 
let getUser = async () => {
    if (token) {
        return await fetch(`${apiBase}/User/email?email=${encodeURIComponent(email)}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => data.data)
            .catch(err => console.error("User fetch error:", err));
    } else {
        console.error("Token Not Found");
    }
};

let getOfficer = async () => {
    if (token) {
        return await fetch(`${apiBase}/AccountOfficer/get-By-Email?email=${encodeURIComponent(email)}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => data.data)
            .catch(err => console.error("Officer fetch error:", err));
    } else {
        console.error("Token Not Found");
    }
};

 
async function fetchPendingLoans() {
    const response = await fetch(`${apiBase}/Loan/PendingLoans`, {
        headers: { "Authorization": `Bearer ${token} `}
    });
    const result = await response.json();
    displayPendingLoans(result.data);
}

async function approveLoanById(id, action) {
    console.log(id,action)
    const endpoint = action === "approve"
        ? `${apiBase}/Loan/approve/${id}`
        : `${apiBase}/Loan/reject/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        alert(result.message || `Loan ${action}d successfully.`);
        await fetchPendingLoans();
    } catch (error) {
        console.error(`Error trying to ${action} loan:, error`);
  }
}

function displayPendingLoans(data) {
    if (!data || data.length === 0) {
        document.getElementById("pendingLoans").innerText = "No pending loans found.";
        return;
    }

    let table = "<table><tr>";
    
    const keys = Object.keys(data[0]).filter(key => key.toLowerCase() !== "id");
    keys.forEach(key => {
        table += `<th>${key}</th>`;
    });
    table += "<th>Action</th></tr>";

    data.forEach(item => {
        table += "<tr>";
        console.log(item)
        keys.forEach(key => {
            table += `<td>${item[key]}</td>`;
        });
        table += `<td>
            <button onclick="approveLoanById('${item.id}','approve')">Approve</button>
            <button onclick="approveLoanById('${item.id}','reject')">Reject</button>
        </td></tr>`;
    });

    table += "</table>";
    document.getElementById("pendingLoans").innerHTML = table;
}

 
async function fetchRejectedLoans() {
    const response = await fetch(`${apiBase}/Loan/RejectedLoans`, {
        headers: { 
            "Authorization": `Bearer ${token}` }
    });
    const result = await response.json();
    displayTable(result.data, "rejectedLoans");
}

async function fetchApprovedLoans() {
    const response = await fetch(`${apiBase}/Loan/ApprovedLoans`, {
         headers: { 
            "Authorization": `Bearer ${token}` }
    });
    const result = await response.json();
    if (result.data && result.data.length > 0) {
        let html = "<table><tr>";
        Object.keys(result.data[0]).forEach(key => {
            html += `<th>${key}</th>`;
        });
        html += "<th>Action</th></tr>";

        result.data.forEach(loan => {
            html += "<tr>";
            Object.values(loan).forEach(val => {
                html += `<td>${val}</td>`;
            });
            html += `<td><button onclick="fetchLoanRepayments('${loan.id}')">Show Repayments</button></td>`;
            html += "</tr>";
        });

        html += "</table>";
        document.getElementById("approvedLoans").innerHTML = html;
    } else {
        document.getElementById("approvedLoans").innerText = "No approved loans found.";
    }
}

async function fetchLoanRepayments(loanId) {
    const response = await fetch(`${apiBase}/Loan/${loanId}/repayments`, {
         headers: { 
            "Authorization": `Bearer ${token}` }
    });
    const result = await response.json();
    console.log(result.data)
    displayTable(result.data, "loanRepayments");
}
 

function displayTable(data, containerId) {
    if (!data || data.length === 0) {
        document.getElementById(containerId).innerText = "No data found.";
        return;
    }

    let table = "<table><tr>";
    Object.keys(data[0]).forEach(key => {
        table += `<th>${key}</th>`;
    });
    table += "</tr>";

    data.forEach(item => {
        table += "<tr>";
        Object.values(item).forEach(val => {
            table += `<td>${val}</td>`;
        });
        table += "</tr>";
    });

    table += "</table>";
    document.getElementById(containerId).innerHTML = table;
}
