function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function searchDashboard() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  if (!query) return alert("Please enter a search term");


  const links = document.querySelectorAll(".menu a");
  let found = false;

  links.forEach(link => {
    if (link.textContent.toLowerCase().includes(query)) {
      link.scrollIntoView({ behavior: "smooth", block: "center" });
      link.style.backgroundColor = "#f9f9f9";
      found = true;
      setTimeout(() => (link.style.backgroundColor = ""), 2000);
   }
 })};


      


const debit = 3500;
const credit = 3500;

const total = debit + credit;
const debitPercent = (debit / total) * 100;
const creditPercent = 100 - debitPercent;

const debitCircle = document.getElementById("debitSlice");
debitCircle.setAttribute("stroke-dasharray", `${debitPercent} ${creditPercent}`);


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
let unReadNotificaion = async () =>{
     let user = await getUser();
    return await fetch(`https://localhost:7246/api/NotificationRecipient/${user.id}`,{
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }).then((res) => {
      if(!res.ok){
        throw new Error(`Error: ${res.status} - ${res.statusText}`);
      }
      return res.json();
    }).then(data => {
      console.log("Fetched data:", data);
      return data.data
  })
  .catch(error => {
      console.error("Error occurred:", error);  
  })};

 
  
  let updateBadge = async () => {
    let unreadData = await unReadNotificaion();
    console.log(unreadData.length)
    if (unreadData.length < 0) return;
  
    let unreadCount = unreadData.length; 
    let hasUnread = unreadCount > 0;
  
    if (hasUnread) {
      const badge = document.getElementById("notif-badge");
      badge.style.display = "inline";
      badge.textContent = unreadCount;
    }
  };
  
  updateBadge();

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
        })}; 

       
async function GetAccountBalance() {
          let account = await fetchAccountData();
          return  await fetch(`https://localhost:7246/api/Transaction/accountNumber?accountNumber=${account.accountNumber}`, {
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
      

let displayUser = async () =>
{
  let customer = await fetchCustomerData();
  let user = await getUser();
  let balance = await GetAccountBalance();
  const container = document.querySelector('.user-info');
  container.innerHTML += `<img class="avatar" src="${customer.imageUrl == null?'http://127.0.0.1:5500/prof2.jpeg' : 'https://localhost:7246'+customer.imageUrl}" alt="">
            <span class="sidebar-text">${customer.email}</span>`
  let container2 = document.querySelector('#message');
  container2.innerHTML += `<div id="login"><h4>Welcome ${user.userName}</h4>
                <h4>Last Logged In At ${new Date(user.lastLoggedIn).toLocaleString()}</h4></div>
            <div id="account">
                <h4>AccountBalance</h4>
                 <h2>$${balance.toLocaleString()}</h2>
            </div>`          
  
}
displayUser();

let displayChart = async() =>
  {
  let accId = await fetchAccountData()
  return await fetch(`https://localhost:7246/api/Transaction/accountId/monthlydata?accountId=${accId.id}`,{
    method: "GET",
    headers:{
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
        .then(res => res.json())
        .then(response => {
          const ctx = document.getElementById('spendingChart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: response.data.labels,
              datasets: [
                {
                  label: 'Money Spent',
                  data: response.data.moneySpent,
                  borderColor: '#E74C3C', 
                  fill: false,
                  tension: 0.3
                },
                {
                  label: 'Money Received',
                  data: response.data.moneyReceived,
                  borderColor: '#2ECC71', 
                  fill: false,
                  tension: 0.3
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: '#333'
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { color: '#333' }
                },
                x: {
                  ticks: { color: '#333' }
                }
              }
            }
          });
        })};
  displayChart();


let transactions = async () =>
{
    let account = await fetchAccountData();
    return await fetch(`https://localhost:7246/api/Transaction/accountId/request/paging?accountId=${account.id}`,{
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }).then(response => {
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

  
let getAccountByNumber = async (number) =>{
      return await fetch(`https://localhost:7246/api/Transaction/accountNumber?accountNumber=${number}`,{
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }).then(response => {
        return response.json(); 
    })
    .then(data => {
        console.log("Fetched data:", data);
        return data.data
    })
    .catch(error => {
        console.error("Error occurred:", error);  
    })};      

      
         
let displayTransaction =async () =>
{
  let transac = await transactions();

  let count = 0;
  const container = document.querySelector('#lists');
  if(transac.length === 0 || transac == [])
  {
      container.innerHTML = "<li>No Transaction Made</li>"
      return;
  }
  
  for (const tran of transac) {
    const li = document.createElement('li');
    
    if (tran.transactionType === 'Debit') {
      li.innerText = `${tran.amount} Received At ${new Date(tran.transactionDate).toLocaleString()}`;
    } else {
      li.innerText = `${tran.amount} Transferred At ${new Date(tran.transactionDate).toLocaleString()}`;
    }
  
    container.appendChild(li);
  
    count++;
    if (count === 5) break;
  }
  

}    
displayTransaction();