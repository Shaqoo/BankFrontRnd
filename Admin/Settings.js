function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
}


let token = localStorage.getItem('token')

let decodeToken = (token) => {
  if (token.split(".").length !== 3)
    throw new Error("Invalid Token")
  const payload = token.split(".")[1];

  const decodedPayload = JSON.parse(atob(payload));
  return decodedPayload;
}
let decoded = decodeToken(token);
const email = decoded['Email'];


async function toggle2FA() {
  try {
    const response = await fetch(`https://localhost:7246/api/User/Toggle-2FA?email=${email}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      return
    }
    throw new Error(data.data);
  }
  catch (error) {
    console.error(error);
  }
}



let getUser = async () =>
{
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
  else
  {
    console.error("Token Not Found");  
       
  }
}

async function createNotification() {
  const header = document.getElementById('notification-header').value;
  const message = document.getElementById('notification-message').value;

  if (!header || !message) {
    alert("Both header and message are required.");
    return;
  }

  try {
    const response = await fetch('https://localhost:7246/api/Notification', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json' ,
         "Authorization": `Bearer ${token}`
        },
      body: JSON.stringify({ 
           "header": header, 
           "message" : message
         })
    });

    const result = await response.json();

    if (response.ok) {
      alert("Notification created.");
      document.getElementById('notification-header').value = '';
      document.getElementById('notification-message').value = '';
      getAllNotifications();
    } else {
      alert(result.error || "Failed to create.");
    }
  } catch (err) {
    console.error(err);
    alert("Error creating notification.");
  }
}

async function getAllNotifications() {
  let user = await getUser();
  try {
    const response = await fetch(`https://localhost:7246/api/NotificationRecipient?userId=${user.id}`,{
       method: 'GET',
       headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const notifications = await response.json();
    const list = document.getElementById('notifications-list');
    list.innerHTML = '';

    notifications.data.forEach(notif => {
      const li = document.createElement('li');
      if (notif.isRead) li.classList.add('read');

      li.innerHTML = `
        <strong>${notif.header}</strong>: ${notif.message}
        ${notif.isRead ? '<span>(Read)</span>' : ''}
        ${!notif.isRead ? `<button style="margin-left:10px;" onclick="markAsRead('${notif.id}')">Mark as Read</button>` : ''}
    `;

      list.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to fetch notifications.");
  }
}

async function markAsRead(id) {
  let user = await getUser();
  try {
    const response = await fetch(`https://localhost:7246/api/NotificationRecipient/notificationId/userId?notificationId=${id}&userId=${user.id}`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      getAllNotifications();
    } else {
      alert("Failed to mark as read.");
    }
  } catch (err) {
    console.error(err);
    alert("Error marking as read.");
  }
}

async function markAllAsRead() {
  let user = await getUser();
  try {
    const response = await fetch(`https://localhost:7246/api/NotificationRecipient/Mark-All-As-Read?userId=${user.id}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      getAllNotifications();
    } else {
      alert("Failed to mark all as read.");
    }
  } catch (err) {
    console.error(err);
    alert("Error marking all as read.");
  }
}

