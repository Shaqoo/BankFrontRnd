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

let getUser = async () => {
    if (token) {
        return await fetch(`https://localhost:7246/api/User/email?email=${encodeURIComponent(email)}`, {
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

let totalUsers = async () => {
    try {
        const result = await fetch('https://localhost:7246/api/User/total-Users', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await result.json();
        if (!result.ok) {
             
            return;
        }
         
        return data.data;
    }
    catch (error) {
        console.error(error);
        return;
    }

}
async function displayTotalUsers() {
    let users = await totalUsers();
    let container = document.querySelector('#totalUsers');
    container.innerHTML += `<i class="fas fa-users"></i>
                <p>${users} Users</p>`
}
displayTotalUsers();


let totalBanks = async () => {
    try {
        const result = await fetch('https://localhost:7246/api/Bank/get-bank-count', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await result.json();
        if (!result.ok) {
             
            return;
        }
         
        return data.data;
    }
    catch (error) {
        console.error(error);
        return;
    }

}
async function displayTotalBanks() {
    let banks = await totalBanks();
    let container = document.querySelector('#totalBanks');
    container.innerHTML += `<i class="fas fa-building"></i>
                <p>${banks} Banks</p>`
}
displayTotalBanks();



let totalOfficers = async () => {
    try {
        const result = await fetch('https://localhost:7246/api/AccountOfficer/count', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await result.json();
        if (!result.ok) {
            
            return;
        }
        
        return data.data;
    }
    catch (error) {
        console.error(error);
        return;
    }

}
async function displayTotalOfficers() {
    let officers = await totalOfficers();
    let container = document.querySelector('#officers');
    container.innerHTML += `<i class="fas fa-user-gear"></i>
                <p>${officers} Account Officers</p>`
}
displayTotalOfficers();

let pendingLoans = async () => {
    try {
        const result = await fetch('https://localhost:7246/api/Loan/PendingLoans', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await result.json();
        if (!result.ok) {
             
            return;
        }
        
        return data.data;
    }
    catch (error) {
        console.error(error);
        return;
    }

}
async function displayPendingLoans() {
    let loans = await pendingLoans();
    let container = document.querySelector('#loans');
    container.innerHTML += `<i class="fas fa-hand-holding-usd"></i>
                <p>${loans.length} Pending Loans</p>`
}
displayPendingLoans();

let totalTransactions = async () => {
    try {
        const result = await fetch('https://localhost:7246/api/Transaction/get-Total-Transactions', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await result.json();
        if (!result.ok) {
             
            return;
        }
         
        return data.data;
    }
    catch (error) {
        console.error(error);
        return;
    }

}
async function displayTransactions() {
    let transactions = await totalTransactions();
    let container = document.querySelector('#transactions');
    container.innerHTML += `<i class="fas fa-money-check-alt"></i>
                <p>$${transactions.toLocaleString()} Transactions</p>`
}
displayTransactions();


let recentTransactions = async () =>
{
    return await fetch('https://localhost:7246/api/Transaction/recent-transactions',
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).
        then(data => {
            console.log(data)
            
            return data.data;
        }).catch((error) => {
            console.error(error);
        })  
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
          })}; 

          
async function displayRecent() {
    let recent = await recentTransactions();
    console.log(recent);
    let container = document.getElementById('recent');

    for (const element of recent) {
        console.log(element);
        if (element.transactionType === 1) {
            const accountData = await fetchAccountData(element.accountId);  
            container.innerHTML += `<p>${accountData.accountName} Received $${element.amount.toLocaleString()} From ${element.recipientAccount} At ${new Date(element.transactionDate).toLocaleString()}</p><br>`;
        } else {
            const accountData = await fetchAccountData(element.accountId);  
            container.innerHTML += `<p>${accountData.accountName} Transferred $${element.amount.toLocaleString()} To ${element.recipientAccount} At ${new Date(element.transactionDate).toLocaleString()}</p><br>`;
 }}}

 displayRecent();