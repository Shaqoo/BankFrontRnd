const token = localStorage.getItem('token');

function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
}

const decodedToken = decodeJWT(token);
const email = decodedToken['Email'];

async function fetchCustomerData() {
    try {
        const response = await fetch(`https://localhost:7246/api/Customer?email=${encodeURIComponent(email)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire('Error', 'Failed to fetch customer data.', 'error');
    }
}

async function fetchAccountData() {
    try {
        const customer = await fetchCustomerData();
        const response = await fetch(`https://localhost:7246/api/Account/customerId?customerId=${customer.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire('Error', 'Failed to fetch account data.', 'error');
    }
}

async function GetAccountBalance() {
    try {
        const account = await fetchAccountData();
        const response = await fetch(`https://localhost:7246/api/Transaction/accountNumber?accountNumber=${account.accountNumber}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire('Error', 'Failed to fetch account balance.', 'error');
    }
}

const getAccountByNumber = async (number) => {
    try {
        const response = await fetch(`https://localhost:7246/api/Account/accountNumber?accountNumber=${number}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error occurred:", error);
        Swal.fire('Error', 'Failed to fetch account by number.', 'error');
    }
};

async function proceedToPin(actionType) {
    let payload = {};
    let account = await fetchAccountData();
    let balance = await GetAccountBalance();

    if (actionType === 'deposit') {
        let amount = parseFloat(document.getElementById("depositAmount").value);
        if (isNaN(amount) || amount < 100) {
            return Swal.fire('Invalid Amount', 'Minimum deposit is $100.', 'warning');
        }
        if (amount > 500000) {
            return Swal.fire('Limit Exceeded', 'You cannot deposit more than $500,000 at a time.', 'warning');
        }

        payload = {
            type: "deposit",
            accountNumber: account.accountNumber,
            amount: amount,
        };

    } else if (actionType === 'transfer') {
        const amount = parseFloat(document.getElementById("transferAmount").value);
        const toAccount = await getAccountByNumber(document.getElementById("toAccount").value);

        if (isNaN(amount) || amount < 50) {
            return Swal.fire('Invalid Amount', 'Minimum transfer is $50.', 'warning');
        }
        if (amount > balance) {
            return Swal.fire('Insufficient Balance', 'Your balance is too low for this transfer.', 'error');
        }
        if (amount > 3000000) {
            return Swal.fire('Limit Exceeded', 'You cannot transfer more than $3,000,000.', 'warning');
        }
        if (!toAccount) {
            return Swal.fire('Account Not Found', 'No account matches the number you entered.', 'error');
        }

        payload = {
            type: "transfer",
            accountId: account.id,
            toAccount: document.getElementById("toAccount").value,
            amount: amount,
            description: document.getElementById("transferDescription").value
        };
    }

    // Confirmation before proceeding
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Please confirm to continue with the transaction.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });

    if (result.isConfirmed) {
        localStorage.setItem("transactionData", JSON.stringify(payload));
        window.location.href = "http://127.0.0.1:5500/Customer/enter-pin.html";
    } else {
        Swal.fire('Cancelled', 'Transaction not processed.', 'info');
    }
}

function showTransfer() {
    document.querySelector('#deposit').style.display = "none";
    document.querySelector('#transfer').style.display = "block";
}

function showDeposit() {
    document.querySelector('#transfer').style.display = "none";
    document.querySelector('#deposit').style.display = "block";
}
