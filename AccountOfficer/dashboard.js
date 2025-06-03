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
 



let pendingLoans = async () => {
    let officer = await getOfficer()
    try {
        const result = await fetch(`https://localhost:7246/api/Loan/View-Pending-Loans?officerId=${officer.id}`, {
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
        console.log(data.data)
        return data.data;
    }
    catch (error) {
        console.error(error);
        return;
    }

}
 

let totalTransactions = async () => {
    let officer = await getOfficer();
    try {
        const result = await fetch(`https://localhost:7246/api/Transaction/Total-Bank-Amount?bankId=${officer.bankId}`, {
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
async function fetchPendingLoans() {
    const response = await fetch(`https://localhost:7246/api/Loan/PendingLoans`, {
        headers: { "Authorization": `Bearer ${token} `}
    });
    const result = await response.json();
    return result.data;
}


let display = async () => {
  
  const totalUsersValue = await totalUsers();
  const totalBanksValue = await totalBanks();
  const pendingLoansValue = await fetchPendingLoans();
  const totalTransactionsValue = await totalTransactions();
  console.log(totalBanksValue)
  console.log(pendingLoansValue)
  console.log(totalTransactionsValue)
  console.log(totalUsersValue)


   
  document.getElementById('total-users').textContent = `${totalUsersValue} Active Users`;
  document.getElementById('total-transactions').textContent = `$${totalTransactionsValue.toLocaleString()} Transactions`;
  document.getElementById('total-complaints').textContent = `5 Pending Complaints`;
  document.getElementById('total-revenue').textContent = `$${totalBanksValue.toLocaleString() * 1000} Revenue`;
  document.getElementById('total-banks').innerHTML = `${totalBanksValue} Banks`;
  document.getElementById('pending-loans').innerHTML = `${pendingLoansValue.length} Pending Loans`;
};
display();
