function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
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
let displayUser = async () => {
  let customer = await fetchCustomerData();
  const container1 = document.querySelector('.user-info');
  container1.innerHTML += `<img class="avatar" src="${customer.imageUrl === null ? 'http://127.0.0.1:5500/prof2.jpeg' : 'https://localhost:7246' + customer.imageUrl}" alt="">
                  <span class="sidebar-text">${customer.email}</span>`
}
displayUser();

async function fetchCustomerData() {
  return await fetch(`https://localhost:7246/api/Customer?email=${encodeURIComponent(email)}`, {
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
    })
};

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

const notificationListEl = document.getElementById('notification-list');
const detailBox = document.getElementById('notification-details');
const notifTitle = document.getElementById('notif-title');
const notifDate = document.getElementById('notif-date');
const notifDesc = document.getElementById('notif-desc');

let notifications = [];

async function loadNotifications() {
  try {
    let user = await getUser();
    const res = await fetch(`https://localhost:7246/api/NotificationRecipient?userId=${user.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    let response = await res.json();
    notifications = response.data;

    renderNotificationList();
  } catch (err) {
    console.error('Failed to load notifications', err);
  }
}

function renderNotificationList() {
  notificationListEl.innerHTML = '';
  console.log(notifications)
  notifications.forEach(n => {
    const item = document.createElement('div');
    item.classList.add('notification-item');
    if (!n.isRead) item.classList.add('unread');

    item.innerHTML += `
      <strong>${n.header}</strong><br>
      <small>${new Date(n.dateCreated).toLocaleString()}</small>
    `;

    item.onclick = () => showNotificationDetail(n.id);
    notificationListEl.appendChild(item);
  });
}


async function showNotificationDetail(id) {
  try {
    let user = await getUser();
    const res = await fetch(`https://localhost:7246/api/NotificationRecipient/notificationId/userId?notificationId=${id}&userId=${user.id}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    const notif = await res.json();

    notifTitle.textContent = notif.data.header;
    notifDate.textContent = new Date(notif.data.dateCreated).toLocaleString();
    notifDesc.textContent = notif.data.message;
    detailBox.classList.remove('hidden');
    await markAsRead(notif.data.id);
    loadNotifications();
  } catch (err) {
    console.error('Failed to fetch notification detail', err);
  }
}


async function markAsRead(id) {
  try {
    console.log(id)
    let user = await getUser();
    await fetch(`https://localhost:7246/api/NotificationRecipient/notificationId/userId?notificationId=${id}&userId=${user.id}`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    renderNotificationList();
  } catch (err) {
    console.error('Error marking as read', err);
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
      loadNotifications();
    } else {
      alert("Failed to mark all as read.");
    }
  } catch (err) {
    console.error(err);
    alert("Error marking all as read.");
  }
}

function closeDetails() {
  detailBox.classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', loadNotifications);
