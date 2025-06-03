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


    let displayUser = async () =>
    {
        let user = await getUser();
        let customer = await fetchCustomerData();
        const container1 = document.querySelector('.user-info');
        container1.innerHTML += `<img class="avatar" src="${customer.imageUrl === null?'http://127.0.0.1:5500/prof2.jpeg' : 'https://localhost:7246'+customer.imageUrl}" alt="">
                  <span class="sidebar-text">${customer.email}</span>`
        const container = document.querySelector('.profile');
        container.innerHTML += `<i class="fas fa-camera camera-icon" onclick="window.location.href='http://127.0.0.1:5500/Customer/Upload.html'"></i>
          <div id="imageContainer">
          <img class="avatar" src="${customer.imageUrl === null?'http://127.0.0.1:5500/prof2.jpeg' : `https://localhost:7246${customer.imageUrl}`}" alt="Profile Picture">
          </div>
          <h3>${customer.fullName}</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Username:</strong> ${user.userName}</p>
          <p><strong>Phone:</strong> +${customer.phone}</p>
          <p><strong>Location:</strong> ${customer.address}</p>
          <p><strong>Age:</strong> ${customer.age} Years</p>
          <p><strong>Gender:</strong> ${gender(customer.gender)}</p>
          <p><strong>Last Logged In:</strong> ${new Date(user.lastLoggedIn).toLocaleString()}</p>
          <p><strong>Role:</strong> ${user.roleName}</p>
          `
    }
    displayUser();


let gender = (data) => {
  switch(data)
  {
    case 0: 
    return "Male";
     case 1:
      return 'Female';
     default:
      break;
  }
}