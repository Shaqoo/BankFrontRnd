let form3 = document.querySelector('#signupbox3');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');
const gender = document.querySelector('#gender');

form3.addEventListener('submit', (e) => {
    e.preventDefault();

    if (gender.value === '') {
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Gender',
            text: 'Choose a valid gender.',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });
    }

    if (password.value === '' || confirmPassword.value === '') {
        return Swal.fire({
            icon: 'warning',
            title: 'Incomplete Form',
            text: 'Fill in every detail before going to the next page.',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });
    }

    // Password regex:
    // - at least 8 characters
    // - at least one uppercase letter
    // - at least one lowercase letter
    // - at least one digit
    // - at least one special character
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?\/-]).{8,}$/;

    if (!regex.test(password.value)) {
        return Swal.fire({
            icon: 'error',
            title: 'Weak Password',
            html: 'Password must be at least 8 characters long, with:<br>- One uppercase letter<br>- One lowercase letter<br>- One digit<br>- One special character',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });
    }

    if (password.value !== confirmPassword.value) {
        return Swal.fire({
            icon: 'error',
            title: 'Password Mismatch',
            text: 'Password and Confirm Password do not match.',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });
    }

    localStorage.setItem("Gender", gender.value);
    localStorage.setItem("Password", password.value);
    localStorage.setItem("ConfirmPassword", confirmPassword.value);

    Swal.fire({
        icon: 'success',
        title: 'Details saved!',
        text: 'Redirecting to next page...',
        timer: 1500,
        showConfirmButton: false,
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    }).then(() => {
        window.location.href = "Page4.html";
    });
});
