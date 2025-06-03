window.onload = function () {
    document.getElementById("year").textContent = new Date().getFullYear();
  }

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
  const container = document.querySelector('.user-info');
  container.innerHTML += `<img class="avatar" src="${customer.imageUrl == null ? 'http://127.0.0.1:5500/prof2.jpeg' : 'https://localhost:7246'+customer.imageUrl}" alt="">
                <span class="sidebar-text">${customer.email}</span>`
}
displayUser();



  
 async function searchAccount() {
    const accNum = document.getElementById("accountSearch").value;
    const loader = document.getElementById("loader");
    const accountInfo = document.getElementById("account-info");

    if (!accNum.trim()) {
      alert("Please enter an account number.");
      return;
    }

    loader.style.display = "block";
    accountInfo.style.opacity = "0.5";
    let account = await getAccountByNumber(accNum);
    console.log(account);
    setTimeout(async () => {
      loader.style.display = "none";
      accountInfo.style.opacity = "1";
    
      if(account){
        let accountType = await getAccountType(account.accountTypeId);
        let bank = await getBank(account.bankId);
        document.getElementById("acc-holder").textContent = account.accountName;
        document.getElementById("acc-number").textContent = account.accountNumber;
        document.getElementById("acc-type").textContent = accountType.name;
        document.getElementById("acc-branch").textContent = bank.name;
        document.getElementById("balance").style.display = "none"
        document.getElementById("acc-status").textContent = "Active";
         
      }
       else {
        accountInfo.innerHTML = '<p style="color:red;">Account not found.</p>';
      }
    }, 1000);
  }

  let displayDetails = async () =>
  {
    let account = await fetchAccountData();
    let accountType = await getAccountType(account.accountTypeId);
    let bank = await await getBank(account.bankId);
    let balance = await await GetAccountBalance();

    let accountInfo = document.querySelector("#account-info");
    accountInfo.innerHTML += `<div class="info-row"><strong>Account Holder:</strong> <span id="acc-holder">${account.accountName}</span></div>
        <div class="info-row"><strong>Account Number:</strong> <span id="acc-number">${account.accountNumber}</span></div>
        <div class="info-row"><strong>Account Type:</strong> <span id="acc-type">${accountType.name}</span></div>
        <div class="info-row"><strong>Bank Branch:</strong> <span id="acc-branch">${bank.name}</span></div>
        <div class="info-row" id="balance"><strong>Balance:</strong> <span id="acc-balance">$${balance.toLocaleString()}</span></div>
        <div class="info-row"><strong>Status:</strong> <span id="acc-status">Active</span></div>`
  }
displayDetails();

 

  let getAccountByNumber = async (number) =>{
    return await fetch(`https://localhost:7246/api/Account/accountNumber?accountNumber=${String(number)}`,{
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

            async function getAccountType(id) {
              return  await fetch(`https://localhost:7246/api/AccountType/id?id=${id}`, {
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
              
              async function getBank(id) {
                return  await fetch(`https://localhost:7246/api/Bank/${id}`, {
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
  
