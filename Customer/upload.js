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
let form = document.getElementById('upload');
form.addEventListener('submit',async (e) =>
{
    e.preventDefault()
    let file = document.querySelector('#pic');
    if(!file || file.files.length < 1)
    {
        alert("File Is Empty");
        return;
    }
    const formData = new FormData();
    
    formData.append('ImageUrl',file.files[0]);
    formData.append('Email',email)

    const response = await fetch('https://localhost:7246/api/Customer', {
        method: 'PATCH',
        body: formData,
        headers: {
            "Authorization" : `Bearer ${token}`
        }
    }).catch(e => {
        console.error("Error occurred:", e);
    });

    if (!response.ok) {
        const error = await response.json();
        alert(error.message);
        return;
    }

    const result = await response.json();
    alert(result.message);
    window.location.href = 'http://127.0.0.1:5500/Customer/profile.html';

})
