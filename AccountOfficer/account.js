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

async function searchUser() {
    const input = document.getElementById("searchInput").value.trim();
    const loader = document.getElementById("loader");
    const resultDiv = document.getElementById("userResult");

    if (!input) {
        alert("Please enter an email or username");
        return;
    }

    loader.style.display = "block";
    resultDiv.innerHTML = "";
    setTimeout(async () => {
      loader.style.display = "none";
      resultDiv.style.opacity = "1";
    try {
        const response = await fetch(`https://localhost:7246/api/User/email?email=${encodeURIComponent(input)}`,{
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("User not found");

        const user = await response.json();
        resultDiv.innerHTML = `
            <div class="user-card">
                <p><strong>Email:</strong> ${user.data.email}</p>
                <p><strong>Username:</strong> ${user.data.userName}</p>
                <p><strong>Last-Logged-In:</strong> ${new Date(user.data.lastLoggedIn).toLocaleString()}</p>
                <p><strong>Role:</strong> ${user.data.roleName}</p>
                <button style:"color:red" onclick="deactivateAccount('${user.data.id}')">Deactivate</button>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p style:"color:red">User not found or error occurred.</p>`;
    } finally {
        loader.style.display = "none";
    }},2000)
}

async function deactivateAccount(id) {
    if (!confirm(`Are you sure you want to deactivate account ${id}?`)) return;

    try {
        const res = await fetch(`https://localhost:7246/api/User/id?id=${id}`,{
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
    }});

        if (!res.ok) throw new Error("Failed");

        alert("Account deactivated");
        searchUser(); 
    } catch (err) {
        alert("Deactivation failed");
 }
}

async function fetchCustomerData(fullName) {
       return await fetch(`https://localhost:7246/api/Customer/Get-By-Name?fullName=${fullName}`, {
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



async function fetchAndDisplayAccounts() {
    let officer = await getOfficer();
  try {
    const response = await fetch(`https://localhost:7246/api/AccountOfficer/id?id=${officer.id}`,{
         method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
    }});
    const accounts = await response.json();
    const list = document.getElementById('accountList');

    for (const account of accounts.data) {
      let customer = await fetchCustomerData(account.accountName)
      const listItem = document.createElement('li');
      listItem.innerHTML = `Name: ${account.accountName}<br> Email: ${customer.email}<br> Gender: ${customer.gender > 0 ? "Female" : "Male"}<br> Address: ${customer.address}<br> Phone: ${customer.phone}<br> Age: ${customer.age}`;
      list.appendChild(listItem);
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
}

fetchAndDisplayAccounts();
