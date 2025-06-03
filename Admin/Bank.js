 function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
}

 window.onload = function () {
    loadBanks();
};

function showAddBankForm() {
    document.getElementById("add-bank-form").style.display = "block";
}

const token = localStorage.getItem('token')

async function addBank() {
    const name = document.getElementById("bank-name").value.trim();
    const location = document.getElementById("bank-location").value.trim();
    const logoFile = document.getElementById("bank-logo").files[0];

    if (!name || !location || !logoFile) {
        alert("All fields are required.");
        return;
    }

    const formData = new FormData();
    formData.append("Name", name);
    formData.append("Location", location);
    formData.append("LogoUrl", logoFile);

    const res = await fetch(`https://localhost:7246/api/Bank`, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (res.ok) {
        document.getElementById("bank-name").value = "";
        document.getElementById("bank-location").value = "";
        document.getElementById("bank-logo").value = "";
        loadBanks();
    } else {
        alert("Failed to add bank.");
    }
}


async function loadBanks() {
    const res = await fetch("https://localhost:7246/api/Bank",{
        method: "GET"
    }
    );
    const banks = await res.json();

    const container = document.getElementById("banks-container");
    container.innerHTML = "";
    document.getElementById("total-banks").textContent = banks.data.length;

    banks.data.forEach((bank) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <img src="https://localhost:7246${bank.logoUrl}" alt="${bank.name} Logo" width="60" height="60" style="border-radius:5px;">
            <span style="margin-left:10px; cursor:pointer; display">${bank.name}</span>
            <span style="margin-left:10px; cursor:pointer; display">${bank.location}</span></div
        `;
        container.appendChild(li);
    });
}
loadBanks();

 