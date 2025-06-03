const API_BASE_URL = "https://localhost:7246/api/Complaint";
const token = localStorage.getItem("token");
const decodedToken = decodeJWT(token);

let selectedComplaintId = null;
let chatMessagesData = [];
let hubConnection = null;

document.addEventListener("DOMContentLoaded", () => {
    fetchComplaints();
    setupChatForm();
});

function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = atob(parts[1]);
    return JSON.parse(payload);
}

const email =  decodedToken["Email"]
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



const SendMessage = new Audio(`notification-smooth-modern-stereo-332449 (1).mp3`);

async function fetchComplaints() {
    let officer = await getOfficer();
    try {
        const res = await fetch(`${API_BASE_URL}/all?accountOfficerId=${officer.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await res.json();
        renderComplaintList(result.data || []);
        console.log(result.data)
    } catch (err) {
        console.error("Failed to fetch complaints", err);
    }
}

function renderComplaintList(complaints) {
    const container = document.getElementById("complaintsList");
    container.innerHTML = "";
    if(complaints.length === 0)
    {
        container.innerHTML += `<h2 style:"color:red">No Complaints Found</h2>`
        return;
    }
    complaints.forEach(c => {
        const div = document.createElement("div");
        div.className = "complaint-item";
        div.innerHTML = `Name: ${c.createdBy}<br>Title: ${c.complaintTitle} <br>Date: ${new Date(c.dateCreated).toLocaleDateString()}<br> <br>`;
        div.onclick = () => showChatForComplaint(c.id);
        container.appendChild(div);
    });
}

async function showChatForComplaint(complaintId) {
    selectedComplaintId = complaintId;
    const res = await fetch(`https://localhost:7246/api/ComplaintChat?complaintId=${complaintId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const result = await res.json();
    chatMessagesData = result.data || [];
    renderMessages(chatMessagesData);

    setupSignalR(complaintId);
}

function renderMessages(messages) {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    messages.forEach(msg => {
        const isSender = msg.senderUserId === decodedToken[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`];
        const div = document.createElement("div");
        div.className = `message ${isSender ? 'right' : 'left'}`;
        div.setAttribute("data-id", msg.id);
        div.innerHTML = `
            ${msg.message}
            <span class="time">${new Date(msg.sentAt).toLocaleTimeString()}</span><br>
            <span class="status">${msg.isRead ? `<span style="color:green;">✓✓</span>` : "✓"}</span>
        `;
        div.onclick = () => markAsRead(msg.id);
        chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setupChatForm() {
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message || !selectedComplaintId) return;

        try {
            await hubConnection.invoke("SendMessage", selectedComplaintId, message);
            SendMessage.play();
            chatInput.value = "";
        } catch (err) {
            console.error("Error sending message:", err);
        }
    });
}

function setupSignalR(complaintId) {
    if (hubConnection) hubConnection.stop();

    hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7246/hubs/ComplaintChat?complaintId=${complaintId}`, {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

const receiveSound = new Audio("message-notification-103496.mp3");

    hubConnection.on("ReceiveMessage", message => {
        receiveSound.play();
        chatMessagesData.push(message);
        renderMessages(chatMessagesData);
    });

    hubConnection.on("MessageRead", (msgId) => {
        const msgEl = document.querySelector(`[data-id="${msgId}"] .status`);
        if (msgEl) msgEl.innerHTML = "✓✓";
    });

    hubConnection.start().catch(console.error);
}

async function markAsRead(messageId) {
    try {
        await hubConnection.invoke("MarkAsRead", messageId);
    } catch (err) {
        console.error("Error marking message as read:", err);
    }
}
