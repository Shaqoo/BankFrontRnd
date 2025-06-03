function toggleOptions() {
    const optionsList = document.getElementById("optionsList");
    optionsList.style.display = optionsList.style.display === "block" ? "none" : "block";
}

const getAccountTypes = async () => {
    let accountTypes = await fetch('https://localhost:7246/api/AccountType');
    return accountTypes.json();
}

function ChangeToInt(value) {
    if (value === 'Male') {
        return 0;
    }
    return 1;
}

const accounTypeDropDown = document.querySelector('#accountTypes');
let displayAccountTypes = async () => {
    let accountTypes = await getAccountTypes();
    console.log(accountTypes);
    accountTypes.data.forEach(accountType => {
        const option = document.createElement("option");
        option.value = accountType.id;
        option.textContent = accountType.name;
        accounTypeDropDown.appendChild(option);
    });
}
displayAccountTypes();

const getBanks = async () => {
    let banks = await fetch('https://localhost:7246/api/Bank');
    return banks.json();
}

let bankDropdown = document.querySelector('#optionsList');
console.log(bankDropdown);
let displayBanks = async () => {
    let banks = await getBanks();
    console.log(banks);
    banks.data.forEach(bank => {
        console.log(bank.logoUrl)
        bankDropdown.innerHTML += `<div class="option" data-name="${bank.name}" data-img="https://localhost:7246${bank.logoUrl}">
                    <img src="https://localhost:7246${bank.logoUrl}" alt="Officer" />
                    <span>${bank.name}</span>
                  </div>`
    });

    document.querySelectorAll(".option").forEach(option => {
        option.addEventListener("click", function () {
            const name = this.getAttribute("data-name");
            const img = this.getAttribute("data-img");

            document.querySelector(".selected-option span").innerText = name;
            document.querySelector(".selected-option img").src = img;
            document.getElementById("selectedProfile").value = name;

            document.getElementById("optionsList").style.display = "none";
        });
    });
}
displayBanks();

async function getBank(name) {
    const response = await fetch(`https://localhost:7246/api/Bank/${name}`);
    if (response.ok) {
        const result = await response.json();
        return result.data;
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function () {
    let formTag = document.querySelector('#signupbox4');

    formTag.addEventListener("submit", async (e) => {
        e.preventDefault();

        let bank = document.querySelector("#selectedProfile");
        let accountType = document.querySelector('#accountTypes');
        const pin = document.querySelector('#pin');

        if (accountType.value === '' || bank.value === '') {
            return Swal.fire({
                icon: 'warning',
                title: 'Incomplete Details',
                text: 'Fill in every detail before submitting.',
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
        }

        if (pin.value < 1000 || pin.value > 9999 || isNaN(pin.value)) {
            return Swal.fire({
                icon: 'error',
                title: 'Invalid PIN',
                text: 'Enter a valid four-digit PIN.',
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
        }

        const bankData = await getBank(bank.value);
        if (!bankData) {
            return Swal.fire({
                icon: 'error',
                title: 'Invalid Bank',
                text: 'Invalid bank selected.',
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
        }

        const formData = new FormData();
        formData.append("Gender", ChangeToInt(localStorage.getItem('Gender')));
        formData.append("AccountTypeId", accountType.value);
        formData.append("Phone", localStorage.getItem('Phone'));
        formData.append("NIN", localStorage.getItem('NIN'));
        formData.append("Address", localStorage.getItem('Address'));
        formData.append("UserName", localStorage.getItem('Username'));
        formData.append("BankId", bankData.id);
        formData.append("TransactionPin", pin.value);
        formData.append("DateOfBirth", localStorage.getItem('Date'));
        formData.append("FullName", localStorage.getItem('Fullname'));
        formData.append("BVN", localStorage.getItem('BVN'));
        formData.append("ConfirmPassword", localStorage.getItem('ConfirmPassword'));
        formData.append("Password", localStorage.getItem('Password'));
        formData.append("Email", localStorage.getItem('Email'));

        const imageInput = document.querySelector('#image');
        if (imageInput && imageInput.files.length > 0) {
            formData.append('ImageUrl', imageInput.files[0]);
        } else {
            formData.append('ImageUrl', '');
        }

        try {
            const response = await fetch('https://localhost:7246/api/Account', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                return Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: error.message || 'Something went wrong.',
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                });
            }

            const result = await response.json();

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: result.message || 'Account created successfully!',
                timer: 2000,
                showConfirmButton: false,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            }).then(() => {
                window.location.href = 'Verify.html';
            });

        } catch (error) {
            console.error("Error occurred:", error);
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'An error occurred while submitting the form.',
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
        }
    });
});
