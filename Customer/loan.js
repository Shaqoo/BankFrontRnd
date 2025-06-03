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
    })
};


const loanOffers = [
  { type: 'Personal Loan', amount: 10000, interest: 5, term: 12 },
  { type: 'Home Loan', amount: 50000, interest: 3, term: 24 },
];


function displayLoanOffers() {
  const container = document.getElementById('loanOffers');
  container.innerHTML = '';

  loanOffers.forEach(offer => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${offer.type}</strong><br>
      Amount: $${offer.amount}, Interest: ${offer.interest}%, Term: ${offer.term} Months
      <button onclick='applyForLoan(${JSON.stringify(offer)})'>Apply</button>
    `;
    container.appendChild(div);
  });
}

async function applyForLoan(offer) {
  let account = await fetchAccountData();
  return fetch('https://localhost:7246/api/Loan/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      "amount": offer.amount,
      "interestRate": offer.interest,
      "termInMonths": offer.term,
      "accountId": account.id
    })
  })
    .then(res => res.json())
    .then(data => {
      Swal.fire({
        icon: 'success',
        title: 'Loan Application Sent!',
        text: data.message,
        showConfirmButton: false,
        timer: 2500
      });
    })
    .catch(err => {
      console.error('Error applying for loan:', err);
      Swal.fire({
        icon: 'error',
        title: 'Application Failed',
        text: 'Unable to apply for loan.',
        confirmButtonColor: '#d33'
      });
    });
}


displayLoanOffers();

async function fetchAllLoans() {
  try {
    const customer = await fetchCustomerData();
    const response = await fetch(`https://localhost:7246/api/Loan/customer/${customer.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const loans = await response.json();
    const list = document.getElementById('loanList');
    list.innerHTML = '';

    if (!loans.data || loans.data.length === 0) {
      list.innerHTML = `<p>No loans added.</p>`;
      return;
    }

    loans.data.forEach(loan => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>Status:</strong> ${statusInString(loan.status)}<br>
        <strong>Amount Loaned:</strong> $${loan.amount}<br>
        <strong>Repayment Amount:</strong> $${loan.totalAmountWithInterest}<br>
        <strong>Duration:</strong> ${loan.termInMonths} Months<br>
        <strong>Date Of Loan Application:</strong> ${new Date(loan.startDate).toLocaleString()}<br>
        ${(loan.status === 1 || loan.status === 3) ? `<strong>Outstanding Balance:</strong> $${loan.remainingBalance ?? loan.totalAmountWithInterest}<br>` : ''}
        ${(loan.status === 1 || loan.status === 3) ? `<button onclick="showRepayments('${loan.id}')">Show Repayments (${loan.id})</button>` : ''}
        ${(loan.status === 1) ? `<button onclick="submitRepayment('${loan.id}')">Submit Repayment (${loan.id})</button>` : ''}
        <hr>
      `;
      list.appendChild(div);
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
  }
}


let statusInString = (data) => {
  if (data === 0) {
    return "Pending";
  }
  else if (data === 1) {
    return "Approved";
  }
  else if (data === 2) {
    return "Rejected";
  }
  else {
    return "Paid"
  }
}

 

   

  async function submitRepayment(loanId) {
  const { value: amount } = await Swal.fire({
    title: 'Enter Repayment Amount',
    input: 'number',
    inputLabel: 'Amount',
    inputPlaceholder: 'Enter amount',
    showCancelButton: true,
    confirmButtonText: 'Submit',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  });

  if (!amount || isNaN(amount)) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Input',
      text: 'Please enter a valid numeric amount.'
    });
    return;
  }

  try {
    const response = await fetch('https://localhost:7246/api/Loan/repay', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "repaymentAmount": amount,
        "loanId": loanId
      })
    });

    const result = await response.json();

    Swal.fire({
      icon: 'success',
      title: 'Repayment Successful',
      text: result.message || 'Repayment submitted!'
    });
  } catch (err) {
    console.error('Repayment error:', err);
    Swal.fire({
      icon: 'error',
      title: 'Repayment Failed',
      text: 'Something went wrong. Please try again later.'
    });
  }
}





async function showRepayments(loanId) {
  try {
    const response = await fetch(`https://localhost:7246/api/Loan/${loanId}/repayments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`
      }
    });

    const repayments = await response.json();

    if (!repayments.data || repayments.data.length === 0) {
      return Swal.fire({
        title: 'No Repayments Found',
        text: 'This loan has no repayment history.',
        icon: 'info'
      });
    }

    const formatted = repayments.data.map(r =>
      `• $${r.repaymentAmount} on ${new Date(r.repaymentDate).toLocaleString()} (Remaining: $${r.remainingBalance})`
    ).join('<br>');

    Swal.fire({
      title: 'Repayment History',
      html: formatted,
      icon: 'info',
      width: 600,
      confirmButtonText: 'Close'
    });

  } catch (error) {
    console.error('Error fetching repayments:', error);
    Swal.fire({
      title: 'Error',
      text: 'Could not load repayments.',
      icon: 'error'
    });
  }
}
