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