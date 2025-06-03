function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
}

const token = localStorage.getItem('token')


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
async function displayTotalOfficers()
{
   document.getElementById('officer-count').textContent = await totalOfficers();
}
displayTotalOfficers();


function showAddOfficerForm() {
    document.getElementById("add-officer-form").style.display = "block";
}

function toggleOptions() {
    const optionsList = document.getElementById("optionsList");
    optionsList.style.display = optionsList.style.display === "block" ? "none" : "block";
}

async function addOfficer() {
    const name = document.getElementById("officer-name").value.trim();
    const email = document.getElementById("officer-email").value.trim();
    const userName = document.querySelector('#officer-u').value.trim();
    const password = document.getElementById('officer-p').value.trim();
    const confirm = document.getElementById('officer-cp').value.trim();
    const gender = document.getElementById('gender').value.trim();
    let bank = document.querySelector("#selectedProfile");
    
    console.log(bank.value)
    const bankData = await getBank(bank.value);
    console.log(bankData);
    if (!bankData) {
        alert('Invalid Bank Selected');
        return;
    }
        console.log({
                "userName": userName,
                "password": password,
                "confirmPassword": confirm,
                "email": email,
                "fullName": name,
                "bankId": bankData.id,
                "gender": parseInt(gender)
            })
        await fetch('https://localhost:7246/api/AccountOfficer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                "userName": userName,
                "password": password,
                "confirmPassword": confirm,
                "email": email,
                "fullName": name,
                "bankId": bankData.id,
                "gender": parseInt(gender)
            })
        })
            .then(response => {
                if (!response.ok){alert(response.message); throw new Error('Failed to add officer.');}
                return response.json();
            })
            .then(addedOfficer => {
                document.getElementById("officer-name").value = "";
                document.getElementById("officer-email").value = "";
                document.getElementById("officer-bank").value = "";
            })
            .catch(error => console.error('Error adding officer:', error));
    }
   



async function searchOfficer() {
    const email = document.getElementById("search-officer").value.trim();
    const resultDiv = document.getElementById("search-result");

    if (!email) {
        resultDiv.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`https://localhost:7246/api/AccountOfficer/get-By-Email?email=${encodeURIComponent(email)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Officer not found.");

        const officer = await response.json();
        const bank = await getBankById(officer.data.bankId);

        resultDiv.innerHTML = `
            <strong>Name:</strong> ${officer.data.fullName}<br>
            <strong>Email:</strong> ${officer.data.email}<br>
            <strong>Bank:</strong> ${bank.name}<br>
            <strong>Gender:</strong> ${officer.data.gender > 0 ? "Female" : "Male"}<br>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<em>No officer found with that email.</em>`;
    }
}


const getBanks = async () => {
    let banks = await fetch('https://localhost:7246/api/Bank');
    return banks.json();
}
let bankDropdown = document.querySelector('#optionsList');
console.log(bankDropdown);
let displayBanks = async () => {
    let banks = await getBanks();
    console.log(banks);
    banks.data.forEach(bank => {
        bankDropdown.innerHTML += `<div class="option" data-name="${bank.name}" data-img="https://localhost:7246${bank.logoUrl}">
                    <img src="https://localhost:7246${bank.logoUrl}" alt="Officer" />
                    <span>${bank.name}</span>
                  </div>`
    });

    document.querySelectorAll(".option").forEach(option => {
        option.addEventListener("click", function () {
            const name = this.getAttribute("data-name");
            const img = this.getAttribute("data-img");

            document.querySelector(".selected-option span").innerText = name;
            document.querySelector(".selected-option img").src = img;
            document.getElementById("selectedProfile").value = name;

            document.getElementById("optionsList").style.display = "none";
        });
    });
}
displayBanks();

async function getBank(name) {
    const response = await fetch(`https://localhost:7246/api/Bank/${name}`);
    if (response.ok) {
        const result = await response.json();
        return result.data;
    }
    return null;
}

async function getBankById(id) {
    const response = await fetch(`https://localhost:7246/api/Bank/${id}`,{
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }
    );
    if (response.ok) {
        const result = await response.json();
        return result.data;
    }
    return null;
}





async function loadOfficers() {
    const res = await fetch("https://localhost:7246/api/AccountOfficer/Get-All",{
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }
    );
    const officers = await res.json();

    const container = document.getElementById("Officers");
    container.innerHTML = "";
    officers.data.forEach((officer) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="display: flex;flex-direction: column; cursor: pointer;">
            <span style="cursor:pointer; display">${officer.email}</span><br>
            <span style="cursor:pointer; display">${officer.fullName}</span><br>
            <span style="cursor:pointer; display">${officer.gender > 0 ? "Female" : "Male"}</span></div><br><br><br>
        `;
        container.appendChild(li);
    });
}
loadOfficers();
