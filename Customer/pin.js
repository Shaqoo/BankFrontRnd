const data = JSON.parse(localStorage.getItem("transactionData"));

const token = localStorage.getItem('token');

function decodeJWT(token) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const payload = parts[1];

  const decodedPayload = JSON.parse(atob(payload));
  console.log(decodedPayload);

  return decodedPayload;
}

const decodedToken = decodeJWT(token);
console.log(decodedToken);
const email = decodedToken['Email'];

let getAccountByNumber = async (number) => {
  try {
    const response = await fetch(`https://localhost:7246/api/Account/accountNumber?accountNumber=${String(number)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log("Fetched data:", data);
    return data.data;
  } catch (error) {
    console.error("Error occurred:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch account by number.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }
};

console.log(data);

if (data.type === "transfer") {
  let displayAccount = async () => {
    let acc = await getAccountByNumber(data.toAccount);
    let bank = await getBank(acc.bankId);
    const container = document.querySelector('#show');
    container.innerHTML += `Recipient Account: ${acc.accountName} Bank: ${bank.name}`;
  };
  displayAccount();
} else {
  document.querySelector('#show').style.display = "none";
}

async function fetchCustomerData() {
  try {
    const response = await fetch(`https://localhost:7246/api/Customer?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

    const data = await response.json();
    console.log("Fetched data:", data);
    return data.data;
  } catch (error) {
    console.error("Error occurred:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch customer data.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }
}

async function getBank(id) {
  try {
    const response = await fetch(`https://localhost:7246/api/Bank/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

    const data = await response.json();
    console.log("Fetched data:", data);
    return data.data;
  } catch (error) {
    console.error("Error occurred:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch bank data.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }
}

async function fetchAccountData() {
  try {
    let customer = await fetchCustomerData();
    const response = await fetch(`https://localhost:7246/api/Account/customerId?customerId=${customer.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

    const data = await response.json();
    console.log("Fetched data:", data);
    return data.data;
  } catch (error) {
    console.error("Error occurred:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch account data.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }
}

async function submitWithPin() {
  const pin = document.getElementById("pin").value;
  let account = await fetchAccountData();

  if (!pin || pin.length !== 4) {
    return Swal.fire({
      icon: 'warning',
      title: 'Invalid PIN',
      text: 'Please enter a valid 4-digit PIN.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  // Uncomment below if you want to validate PIN locally:
  // if (parseInt(pin) !== account.transactionPin) {
  //   return Swal.fire('Invalid PIN', 'The PIN you entered is incorrect.', 'error');
  // }

  // Confirmation dialog before submitting transaction
  const confirmation = await Swal.fire({
    title: 'Confirm Transaction',
    text: 'Are you sure you want to proceed?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    showClass: { popup: 'animate__animated animate__fadeInDown' },
    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
  });

  if (!confirmation.isConfirmed) {
    return Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'Transaction not processed.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  if (data.type === "deposit") {
    try {
      const res = await fetch(`https://localhost:7246/api/Transaction/${pin}?amount=${data.amount}&accountNumber=${account.accountNumber}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const result = await res.json();

      await Swal.fire({
        icon: result.success ? 'success' : 'success',
        title: result.success ? 'Success' : 'success',
        text: result.message || (result.success ? 'Transaction complete!' : 'Transaction failed.'),
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      });

      if (result.success) {
        localStorage.removeItem("transactionData");
        window.location.href = "http://127.0.0.1:5500/Customer/transaction.html";
      }

    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Transaction failed.',
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      });
      window.location.href = "http://127.0.0.1:5500/Customer/transaction.html";
    }
  } else {
    try {
      const res = await fetch(`https://localhost:7246/api/Transaction`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "accountId": account.id,
          "narration": data.description,
          "recipientAccountNumber": String(data.toAccount),
          "amount": data.amount,
          "pin": pin
        })
      });

      const result = await res.json();

      await Swal.fire({
        icon: result.success ? 'success' : 'success',
        title: result.success ? 'Success' : 'Success',
        text: result.message || (result.success ? 'Transaction complete!' : 'Transaction failed.'),
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      });

      if (result.success) {
        localStorage.removeItem("transactionData");
        window.location.href = "http://127.0.0.1:5500/Customer/transaction.html";
      }

    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Transaction failed.',
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      });
      window.location.href = "http://127.0.0.1:5500/Customer/transaction.html";
    }
  }
}
