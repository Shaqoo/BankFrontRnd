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
    container.innerHTML += `<i class="fas fa-user fa-2x"></i>
                <div>Total Users: <span>${users}</span></div>`
}
displayTotalUsers();

let totalDeactivatedUsers = async () => {
    try {
        const result = await fetch('https://localhost:7246/api/User/total-DeActivated-Users', {
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
async function displayDeactivatedUsers() {
    let users = await totalDeactivatedUsers();
    let container = document.querySelector('#deactivatedUsers');
    container.innerHTML += `<i class="fas fa-user-slash fa-2x"></i>
                <div>Deactivated Users: <span >${users}</span></div>`
}
displayDeactivatedUsers();

let totalCustomers = async () => {
    try {
        const result = await fetch('https://localhost:7246/api/Customer/customers-count', {
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
async function displayTotalCustomers() {
    let users = await totalCustomers();
    let container = document.querySelector('#totalCustomers');
    container.innerHTML += `<i class="fas fa-user-friends fa-2x"></i>
                <div>Total Customers: <span>${users}</span></div>`
}
displayTotalCustomers();






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
        const response = await fetch(`https://localhost:7246/api/User/userName?userName=${encodeURIComponent(input)}`,{
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
