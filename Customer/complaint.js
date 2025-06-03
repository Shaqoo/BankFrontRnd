function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}


const complaintForm = document.getElementById("complaintForm");
const complaintChat = document.getElementById("complaintChat");
const title = document.getElementById("title");

const token = localStorage.getItem('token');
function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
}

const decodedToken = decodeJWT(token);
const email = decodedToken['Email'];


let displayUser = async () => {
    let customer = await fetchCustomerData();
    const container = document.querySelector('.user-info');
    container.innerHTML += `<img class="avatar" src="${customer.imageUrl == null ? 'http://127.0.0.1:5500/prof2.jpeg' : 'https://localhost:7246' + customer.imageUrl}" alt="">
                <span class="sidebar-text">${customer.email}</span>`;
};
displayUser();

async function displayComplaints() {
    let account = await fetchAccountData();
    fetchComplaints(account.id);
}
displayComplaints();

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
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => data.data)
        .catch(console.error);
}

async function fetchCustomerData() {
    return await fetch(`https://localhost:7246/api/Customer?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => data.data)
        .catch(console.error);
}

complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const accId = await fetchAccountData();
    const titleValue = title.value.trim();
    const complaintText = document.getElementById("complaintText").value.trim();

    if (!titleValue || !complaintText) {
        Swal.fire({
            title: "Missing Information",
            text: "Please fill in both title and complaint.",
            icon: "warning",
            confirmButtonText: "OK",
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
        return;
    }

    try {
        const response = await fetch('https://localhost:7246/api/Complaint', {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "accountId": accId.id,
                "complaintTitle": titleValue,
                "complaintDescription": complaintText
            })
        });

        if (!response.ok) throw new Error("Failed to send complaint.");

        document.getElementById("complaintText").value = "";
        document.getElementById("title").value = "";

        await Swal.fire({
            title: "Complaint Submitted",
            text: "Your complaint has been successfully submitted.",
            icon: "success",
            confirmButtonText: "OK",
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });

        fetchComplaints(accId.id);
    } catch (error) {
        console.error(error);
        Swal.fire({
            title: "Submission Failed",
            text: "There was an error sending your complaint. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
            showClass: {
                popup: 'animate__animated animate__shakeX'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    }
});


async function fetchComplaints(accountId) {
    try {
        const response = await fetch(`https://localhost:7246/api/Complaint?accountId=${accountId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        renderComplaintList(data.data);
    } catch (error) {
        console.error(error);
    }
}

function renderComplaints(complaints) {
    complaintChat.innerHTML = "";
    if (complaints.length === 0) {
        complaintChat.innerHTML = "<p>No complaints found for this account.</p>";
        return;
    }

    complaints.forEach((complaint) => {
        const msg = document.createElement("div");
        msg.className = "chat-message";
        msg.innerHTML = `Title:${complaint.complaintTitle}<br>Content: ${complaint.complaintDescription}<br>Date: ${new Date(complaint.dateCreated).toLocaleString()}<br>Reply: ${complaint.response}`;
        complaintChat.appendChild(msg);
    });

    complaintChat.scrollTop = complaintChat.scrollHeight;
}

// === CHAT SECTION ===

const complaintList = document.getElementById("complaintList");
const chatBox = document.getElementById("chatBox");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

let selectedComplaintId = null;
let hubConnection = null;
let chatMessagesData = [];

const sendSound = new Audio("notification-1-337826 (1).mp3");

function renderComplaintList(complaints) {
    complaintList.innerHTML = "";
    complaints.forEach(complaint => {
        const item = document.createElement("div");
        item.className = "complaint-item";
        item.textContent = complaint.complaintTitle;
        item.onclick = () => openComplaintChat(complaint.id);
        complaintList.appendChild(item);
    });
}

async function openComplaintChat(complaintId) {
    selectedComplaintId = complaintId;
    chatMessages.innerHTML = "";
    chatForm.style.display = "flex";

    await loadMessages(complaintId);
    setupSignalR(complaintId);
}

async function loadMessages(complaintId) {
    try {
        const res = await fetch(`https://localhost:7246/api/ComplaintChat?complaintId=${complaintId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const response = await res.json();
        chatMessagesData = response.data;
        renderMessages(chatMessagesData);
    } catch (err) {
        console.error(err);
    }
}

function renderMessages(messages) {
    chatMessages.innerHTML = "";
    messages.forEach(msg => {
        const isSender = msg.senderUserId === decodedToken[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`];
        const div = document.createElement("div");
        div.className = `message ${isSender ? 'right' : 'left'}`;
        div.setAttribute("data-id", msg.id);
        div.innerHTML = `
            ${msg.message}
            <span class="time">${new Date(msg.sentAt).toLocaleTimeString()}</span><br>
            <span class="status">${msg.isRead ? `<span style="color:green;">&#10003;&#10003;</span>` : "✓"}</span>
        `;
        div.onclick = () => markAsRead(msg.id);
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    try {
        await hubConnection.invoke("SendMessage", selectedComplaintId, message);
        sendSound.play();  
        chatInput.value = "";
    } catch (err) {
        console.error("Error sending message:", err);
    }
});
const receiveSound = new Audio("message-notification-103496.mp3");

function setupSignalR(complaintId) {
    if (hubConnection) hubConnection.stop();
    console.log(token)
    hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7246/hubs/ComplaintChat?complaintId=${complaintId}`, {
            accessTokenFactory: () => token
        }).withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    hubConnection.on("ReceiveMessage", message => {
        console.log("New message received:", message);
        console.log("From:", message.senderUserId);
        console.log("Message content:", message.message);
        receiveSound.play();
        chatMessagesData.push(message);
        renderMessages(chatMessagesData);
    });

    hubConnection.on("MessageRead", (msgId) => {
        const msg = chatMessages.querySelector(`[data-id="${msgId}"]`);
        if (msg) msg.querySelector('.status').textContent = "✓✓";
    });

    hubConnection.start().catch(console.error);
}

async function markAsRead(messageId) {
    await hubConnection.invoke("MarkAsRead", messageId);
}
